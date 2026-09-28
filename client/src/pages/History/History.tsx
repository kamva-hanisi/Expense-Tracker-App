import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Download, Pencil, Search, Trash2, X } from "lucide-react";

import type { AppDispatch, RootState } from "../../app/store";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { deleteTransaction, getTransactions, updateTransaction, type Transaction } from "../../features/transactions/transactionSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

type HistoryTransaction = Transaction & {
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
};

type DateFilter = "this-month" | "last-month" | "this-year" | "all-time";

const getLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
};

const History = () => {
  const dispatch = useDispatch<AppDispatch>();
  const hasRequested = useRef(false);
  const { transactions, loading, error } = useSelector((state: RootState) => state.transactions);
  const currency = useSelector((state: RootState) => state.auth.user?.defaultCurrency ?? "ZAR");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("this-month");
  const [editing, setEditing] = useState<HistoryTransaction | null>(null);
  const [editValues, setEditValues] = useState({ title: "", amount: "", category: "", type: "expense" as "income" | "expense", date: "" });
  const [deleting, setDeleting] = useState<HistoryTransaction | null>(null);
  const [actionError, setActionError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;
    void dispatch(getTransactions());
  }, [dispatch]);

  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const filteredTransactions = (transactions as HistoryTransaction[]).filter((transaction) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || transaction.title.toLowerCase().includes(query) || transaction.category.toLowerCase().includes(query);
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const date = getLocalDate(transaction.date);
    const matchesDate = dateFilter === "all-time"
      || (dateFilter === "this-month" && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth())
      || (dateFilter === "last-month" && date.getFullYear() === lastMonth.getFullYear() && date.getMonth() === lastMonth.getMonth())
      || (dateFilter === "this-year" && date.getFullYear() === now.getFullYear());
    return matchesSearch && matchesType && matchesDate;
  });

  const exportCsv = () => {
    if (!filteredTransactions.length) return;
    const rows = [
      ["Date", "Description", "Category", "Type", "Amount"],
      ...filteredTransactions.map((transaction) => [transaction.date, transaction.title, transaction.category, transaction.type, transaction.amount.toFixed(2)]),
    ];
    const csv = rows.map((row) => row.map((value) => {
      const text = String(value).replaceAll('"', '""');
      const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText}"`;
    }).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const beginEdit = (transaction: HistoryTransaction) => {
    setEditing(transaction);
    setEditValues({
      title: transaction.title,
      amount: String(transaction.amount),
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
    });
    setActionError("");
  };

  const saveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setActionError("");
    try {
      await dispatch(updateTransaction({
        id: editing.id,
        updatedData: {
          title: editValues.title.trim(),
          amount: Number(editValues.amount),
          category: editValues.category.trim(),
          type: editValues.type,
          date: editValues.date,
        },
      })).unwrap();
      setEditing(null);
    } catch (saveError) {
      setActionError(typeof saveError === "string" ? saveError : "Unable to update this transaction");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setSaving(true);
    setActionError("");
    try {
      await dispatch(deleteTransaction(deleting.id)).unwrap();
      setDeleting(null);
    } catch (deleteError) {
      setActionError(typeof deleteError === "string" ? deleteError : "Unable to delete this transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Transaction history"
        description="Review and manage your recorded income and expenses."
        actions={<Button variant="secondary" onClick={exportCsv} disabled={!filteredTransactions.length}><Download size={18} /> Export CSV</Button>}
      />

      <Card className="mb-6">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
            <Search size={18} className="text-slate-400" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Search description or category" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <select aria-label="Filter by type" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}>
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select aria-label="Filter by date" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none" value={dateFilter} onChange={(event) => setDateFilter(event.target.value as DateFilter)}>
            <option value="this-month">This month</option>
            <option value="last-month">Last month</option>
            <option value="this-year">This year</option>
            <option value="all-time">All time</option>
          </select>
        </div>
      </Card>

      {error && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}
      <p className="mb-3 text-sm text-slate-500">{loading ? "Loading transactions..." : `${filteredTransactions.length} transaction${filteredTransactions.length === 1 ? "" : "s"}`}</p>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-190 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Description</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4 text-right">Amount</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-950">{transaction.title}</td>
                  <td className="px-5 py-4 text-slate-600">{transaction.category}</td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(transaction.date)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${transaction.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {transaction.type === "income" ? "Income" : "Expense"}
                    </span>
                  </td>
                  <td className={`px-5 py-4 text-right font-bold ${transaction.type === "income" ? "text-emerald-600" : "text-slate-950"}`}>
                    {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount, currency)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label={`Edit ${transaction.title}`} onClick={() => beginEdit(transaction)}><Pencil size={16} /></button>
                      <button className="rounded-lg p-2 text-red-600 hover:bg-red-50" type="button" aria-label={`Delete ${transaction.title}`} onClick={() => { setDeleting(transaction); setActionError(""); }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredTransactions.length === 0 && (
                <tr><td className="px-5 py-12 text-center text-slate-500" colSpan={6}>{transactions.length ? "No transactions match these filters." : "No transactions recorded yet."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
          <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="edit-transaction-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="edit-transaction-title" className="text-xl font-bold text-slate-950">Edit transaction</h2>
                <p className="mt-1 text-sm text-slate-500">Update the saved transaction details.</p>
              </div>
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label="Close" onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={saveEdit}>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Description</span>
                <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" maxLength={150} required value={editValues.title} onChange={(event) => setEditValues({ ...editValues, title: event.target.value })} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Amount</span>
                <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" type="number" min="0" step="0.01" required value={editValues.amount} onChange={(event) => setEditValues({ ...editValues, amount: event.target.value })} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Type</span>
                <select className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" value={editValues.type} onChange={(event) => setEditValues({ ...editValues, type: event.target.value as typeof editValues.type })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Category</span>
                <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" maxLength={100} required value={editValues.category} onChange={(event) => setEditValues({ ...editValues, category: event.target.value })} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Date</span>
                <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" type="date" required value={editValues.date} onChange={(event) => setEditValues({ ...editValues, date: event.target.value })} />
              </label>
              {actionError && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{actionError}</p>}
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleting(null); }}>
          <section className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-xl" role="alertdialog" aria-modal="true" aria-labelledby="delete-transaction-title">
            <h2 id="delete-transaction-title" className="text-lg font-bold text-slate-950">Delete transaction?</h2>
            <p className="mt-2 text-sm text-slate-600">{deleting.title} will be permanently removed from your history.</p>
            {actionError && <p className="mt-3 text-sm text-red-600" role="alert">{actionError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
              <Button type="button" variant="danger" disabled={saving} onClick={() => void confirmDelete()}>{saving ? "Deleting..." : "Delete"}</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default History;
