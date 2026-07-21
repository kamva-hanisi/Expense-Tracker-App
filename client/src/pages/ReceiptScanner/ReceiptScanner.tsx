import { Camera, FileUp, ScanLine } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { formatCurrency, receipts } from "../../data/financeData";

const ReceiptScanner = () => {
  return (
    <div>
      <PageHeader
        title="Receipt scanner"
        description="Upload receipt images, review extracted totals, and match them to transactions."
        actions={<Button><FileUp size={18} /> Upload receipt</Button>}
      />

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="flex min-h-96 flex-col items-center justify-center border-dashed text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Camera size={30} />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-950">Drop a receipt here</h2>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            JPG, PNG, or PDF receipts can be reviewed before saving to history.
          </p>
          <Button className="mt-6" variant="secondary"><ScanLine size={18} /> Start scan</Button>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Recent scans</h2>
          <div className="mt-5 space-y-4">
            {receipts.map((receipt) => {
              const Icon = receipt.icon;

              return (
                <div key={receipt.merchant} className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-white p-2 text-emerald-700"><Icon size={20} /></span>
                    <div>
                      <p className="font-semibold text-slate-950">{receipt.merchant}</p>
                      <p className="text-sm text-slate-500">{receipt.items} extracted items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-950">{formatCurrency(receipt.total)}</p>
                    <span className={`text-xs font-semibold ${receipt.status === "Matched" ? "text-emerald-700" : "text-amber-700"}`}>
                      {receipt.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default ReceiptScanner;
