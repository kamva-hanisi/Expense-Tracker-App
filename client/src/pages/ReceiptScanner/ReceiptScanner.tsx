import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AxiosError } from "axios";
import { Camera, FileImage, FileUp, Image, LoaderCircle, ScanLine, Trash2, X } from "lucide-react";

import type { AppDispatch, RootState } from "../../app/store";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { categories } from "../../constants/categories";
import { getTransactions } from "../../features/transactions/transactionSlice";
import API from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

type SavedReceipt = {
  id: string;
  fileName: string;
  merchant: string;
  amount: number;
  category: string;
  date: string;
  transactionId: string;
  createdAt: string;
};

type ReceiptDraft = { merchant: string; amount: string; category: string; date: string };

const today = () => new Date().toISOString().slice(0, 10);

const parseMoney = (value: string) => {
  let normalized = value.replace(/[R$€£\s]/gi, "");
  if (normalized.includes(",") && normalized.includes(".")) normalized = normalized.replaceAll(",", "");
  else if (normalized.includes(",")) normalized = normalized.replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
};

const extractReceiptDetails = (text: string, fileName: string) => {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const merchant = lines.find((line) =>
    line.length >= 2 && line.length <= 80 && !/^(tax\s+invoice|receipt|invoice|cashier|tel|www\.|http)/i.test(line),
  )?.replace(/\s{2,}/g, " ") ?? fileName.replace(/\.[^.]+$/, "");

  const moneyPattern = /(?:R\s*|\$\s*|€\s*|£\s*)?(\d{1,3}(?:[ ,]\d{3})+(?:[.,]\d{2})?|\d+(?:[.,]\d{2})?)/gi;
  const totalLines = lines.filter((line) => /grand\s+total|amount\s+due|balance\s+due|total\s+due|\btotal\b/i.test(line));
  const amountsFrom = (candidateLines: string[]) => candidateLines.flatMap((line) =>
    Array.from(line.matchAll(moneyPattern), (match) => parseMoney(match[1]!)).filter((amount): amount is number => amount !== null),
  );
  const totalAmounts = amountsFrom(totalLines);
  const allAmounts = amountsFrom(lines);
  const amount = totalAmounts.at(-1) ?? (allAmounts.length ? Math.max(...allAmounts) : null);

  let date = today();
  const isoDate = text.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  const dayFirstDate = text.match(/\b(\d{1,2})[/.\-](\d{1,2})[/.\-](20\d{2}|\d{2})\b/);
  if (isoDate) {
    date = `${isoDate[1]}-${isoDate[2]!.padStart(2, "0")}-${isoDate[3]!.padStart(2, "0")}`;
  } else if (dayFirstDate) {
    const year = dayFirstDate[3]!.length === 2 ? `20${dayFirstDate[3]}` : dayFirstDate[3];
    date = `${year}-${dayFirstDate[2]!.padStart(2, "0")}-${dayFirstDate[1]!.padStart(2, "0")}`;
  }

  const normalizedText = text.toLowerCase();
  const category = normalizedText.match(/grocery|grocer|supermarket|market/) ? "Groceries"
    : normalizedText.match(/fuel|petrol|uber|taxi|transport/) ? "Transport"
      : normalizedText.match(/restaurant|cafe|coffee|dining|takeaway/) ? "Dining"
        : normalizedText.match(/pharmacy|medical|clinic|health/) ? "Health"
          : normalizedText.match(/flight|hotel|travel|airline/) ? "Travel"
            : normalizedText.match(/electricity|water|utility|mobile|data/) ? "Utilities"
              : normalizedText.match(/clothing|shopping|retail|store/) ? "Shopping"
                : "Other";

  return { merchant, amount, category, date, text };
};

const compressReceiptImage = async (file: File) => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1440 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare this receipt image");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const makeBlob = (quality: number) => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not compress this receipt image")), "image/jpeg", quality);
  });
  let blob = await makeBlob(0.76);
  if (blob.size > 850_000) blob = await makeBlob(0.58);
  if (blob.size > 850_000) throw new Error("Image is too large to save. Choose a smaller receipt photo.");

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read this receipt image"));
    reader.onerror = () => reject(new Error("Could not read this receipt image"));
    reader.readAsDataURL(blob);
  });
};

const ReceiptScanner = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currency = useSelector((state: RootState) => state.auth.user?.defaultCurrency ?? "ZAR");
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [savedReceipts, setSavedReceipts] = useState<SavedReceipt[]>([]);
  const [draft, setDraft] = useState<ReceiptDraft>({ merchant: "", amount: "", category: "Other", date: today() });
  const [ocrText, setOcrText] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState("");
  const [loadingReceipts, setLoadingReceipts] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  const loadReceipts = async () => {
    setLoadingReceipts(true);
    try {
      const { data } = await API.get<SavedReceipt[]>("/receipts");
      setSavedReceipts(data);
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to load recent scans");
    } finally {
      setLoadingReceipts(false);
    }
  };

  useEffect(() => { void loadReceipts(); }, []);
  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => () => {
    if (previewImage?.url) URL.revokeObjectURL(previewImage.url);
  }, [previewImage]);

  const setSelectedFile = (selectedFile?: File) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("image/")) {
      setError("Choose a JPG, PNG, or WebP receipt image.");
      return;
    }
    if (selectedFile.size > 12_000_000) {
      setError("Choose an image smaller than 12 MB.");
      return;
    }
    setFile(selectedFile);
    setDraft({ merchant: "", amount: "", category: "Other", date: today() });
    setOcrText("");
    setScanProgress(0);
    setScanStatus("");
    setError("");
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    setSelectedFile(event.dataTransfer.files[0]);
  };

  const scanReceipt = async () => {
    if (!file) return;
    setScanning(true);
    setError("");
    setScanProgress(0);
    setScanStatus("Starting OCR...");
    let terminateWorker: (() => Promise<unknown>) | undefined;
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: ({ status, progress }) => {
          setScanStatus(status);
          setScanProgress(Math.round(progress * 100));
        },
      });
      terminateWorker = () => worker.terminate();
      const result = await worker.recognize(file);
      const extracted = extractReceiptDetails(result.data.text, file.name);
      setOcrText(extracted.text.trim());
      setDraft({
        merchant: extracted.merchant,
        amount: extracted.amount === null ? "" : String(Math.round(extracted.amount * 100) / 100),
        category: extracted.category,
        date: extracted.date,
      });
      if (extracted.amount === null) setError("Could not detect a total. Enter the receipt amount before saving.");
      setScanStatus("Scan complete. Review the extracted fields before saving.");
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Unable to scan this image");
      setScanStatus("");
    } finally {
      await terminateWorker?.();
      setScanning(false);
    }
  };

  const saveReceipt = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const imageData = await compressReceiptImage(file);
      const { data } = await API.post<SavedReceipt>("/receipts", {
        fileName: file.name,
        merchant: draft.merchant.trim(),
        amount: Number(draft.amount),
        category: draft.category,
        date: draft.date,
        imageData,
      });
      setSavedReceipts((current) => [data, ...current]);
      dispatch(getTransactions());
      setFile(null);
      setOcrText("");
      setScanStatus("");
    } catch (saveError) {
      const axiosError = saveError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? (saveError instanceof Error ? saveError.message : "Unable to save this receipt"));
    } finally {
      setSaving(false);
    }
  };

  const previewSavedReceipt = async (receipt: SavedReceipt) => {
    setError("");
    try {
      const { data } = await API.get<Blob>(`/receipts/${receipt.id}/image`, { responseType: "blob" });
      const url = URL.createObjectURL(data);
      setPreviewImage((current) => {
        if (current?.url) URL.revokeObjectURL(current.url);
        return { url, name: receipt.fileName };
      });
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to open this receipt image");
    }
  };

  return (
    <div>
      <PageHeader
        title="Receipt scanner"
        description="Scan a receipt, review the detected details, and save it to your transaction history."
        actions={<Button onClick={() => fileInput.current?.click()}><FileUp size={18} /> Upload receipt</Button>}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
          <Card
            className={`flex min-h-80 flex-col items-center justify-center border-dashed text-center transition ${dragging ? "border-emerald-500 bg-emerald-50" : ""}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Selected receipt preview" className="max-h-64 max-w-full rounded-lg object-contain" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><Camera size={30} /></div>
            )}
            <h2 className="mt-5 text-xl font-bold text-slate-950">{file ? file.name : "Drop a receipt here"}</h2>
            <p className="mt-2 max-w-sm text-sm text-slate-500">JPG, PNG, or WebP images up to 12 MB. Text is scanned locally in your browser.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button type="button" variant="secondary" onClick={() => fileInput.current?.click()}><FileImage size={18} /> Choose image</Button>
              <Button type="button" disabled={!file || scanning} onClick={() => void scanReceipt()}>
                {scanning ? <LoaderCircle size={18} className="animate-spin" /> : <ScanLine size={18} />}
                {scanning ? "Scanning..." : "Start scan"}
              </Button>
            </div>
            {scanning && <div className="mt-4 w-full max-w-xs" role="status"><p className="text-xs text-slate-500">{scanStatus} · {scanProgress}%</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-500 transition-all" style={{ width: `${scanProgress}%` }} /></div></div>}
            {!scanning && scanStatus && <p className="mt-4 text-sm text-emerald-700" role="status">{scanStatus}</p>}
          </Card>

          {(ocrText || error) && (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold text-slate-950">Review scan</h2>
                <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label="Discard scan" onClick={() => { setFile(null); setOcrText(""); setError(""); setScanStatus(""); }}><X size={16} /></button>
              </div>
              <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={saveReceipt}>
                <label className="block sm:col-span-2"><span className="text-sm font-semibold text-slate-700">Merchant / description</span><input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" required maxLength={150} value={draft.merchant} onChange={(event) => setDraft({ ...draft, merchant: event.target.value })} /></label>
                <label className="block"><span className="text-sm font-semibold text-slate-700">Total amount</span><input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" type="number" min="0" max="999999999999.99" step="0.01" required value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} /></label>
                <label className="block"><span className="text-sm font-semibold text-slate-700">Category</span><select className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
                <label className="block"><span className="text-sm font-semibold text-slate-700">Receipt date</span><input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" type="date" required value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></label>
                {error && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{error}</p>}
                <div className="flex justify-end sm:col-span-2"><Button type="submit" disabled={saving || scanning}>{saving ? "Saving receipt..." : `Save receipt and ${formatCurrency(Number(draft.amount) || 0, currency)} expense`}</Button></div>
              </form>
              {ocrText && <details className="mt-4"><summary className="cursor-pointer text-xs font-semibold text-slate-500">Show extracted text</summary><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{ocrText}</pre></details>}
            </Card>
          )}
        </div>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Recent scans</h2>
          {loadingReceipts ? <p className="mt-5 text-sm text-slate-500">Loading scans...</p> : savedReceipts.length ? (
            <div className="mt-5 space-y-3">
              {savedReceipts.map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="rounded-lg bg-white p-2 text-emerald-700"><FileImage size={20} /></span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">{receipt.merchant}</p>
                      <p className="truncate text-xs text-slate-500">{receipt.category} · {formatDate(receipt.date)} · {receipt.fileName}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-right"><span className="block font-bold text-slate-950">{formatCurrency(receipt.amount, currency)}</span><span className="text-xs font-semibold text-emerald-700">Saved</span></span>
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-white" type="button" aria-label={`Preview ${receipt.fileName}`} onClick={() => void previewSavedReceipt(receipt)}><Image size={17} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="mt-5 text-sm text-slate-500">Saved receipt scans will appear here.</p>}
        </Card>
      </section>

      {error && !ocrText && <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>}

      {previewImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) { URL.revokeObjectURL(previewImage.url); setPreviewImage(null); } }}>
          <section className="w-full max-w-3xl rounded-lg bg-white p-4" role="dialog" aria-modal="true" aria-label="Receipt preview">
            <div className="mb-3 flex items-center justify-between gap-3"><h2 className="truncate font-semibold text-slate-950">{previewImage.name}</h2><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label="Close preview" onClick={() => { URL.revokeObjectURL(previewImage.url); setPreviewImage(null); }}><X size={18} /></button></div>
            <img src={previewImage.url} alt={`Receipt ${previewImage.name}`} className="mx-auto max-h-[75vh] max-w-full object-contain" />
          </section>
        </div>
      )}
    </div>
  );
};

export default ReceiptScanner;
