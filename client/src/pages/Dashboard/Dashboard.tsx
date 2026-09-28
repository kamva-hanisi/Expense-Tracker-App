import { useEffect, useRef, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowDownRight, ArrowUpRight, Download, Plus, ReceiptText, WalletCards, X } from "lucide-react";

import type { AppDispatch, RootState } from "../../app/store";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import { categories } from "../../constants/categories";
import { addTransaction, getTransactions, type Transaction } from "../../features/transactions/transactionSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

type DashboardTransaction = Transaction & {
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
  createdAt?: string;
};

type TransactionDraft = {
  title: string;
  amount: string;
  category: string;
  type: "income" | "expense";
  date: string;
};

const createEmptyDraft = (): TransactionDraft => {
  const today = new Date();
  return {
    title: "",
    amount: "",
    category: categories[0] ?? "Other",
    type: "expense",
    date: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
  };
};

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const hasRequested = useRef(false);
  const transactionState = useSelector((state: RootState) => state.transactions);
  const transactions = transactionState.transactions as DashboardTransaction[];
  const user = useSelector((state: RootState) => state.auth.user);
  const currency = user?.defaultCurrency ?? "ZAR";
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [draft, setDraft] = useState<TransactionDraft>(createEmptyDraft);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;
    void dispatch(getTransactions());
  }, [dispatch]);

  const income = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const balance = income - expenses;
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("en-ZA", { month: "short" }).format(date),
      income: 0,
      expenses: 0,
    };
  });
  const monthLookup = new Map(months.map((month) => [month.key, month]));
  transactions.forEach((transaction) => {
    const month = monthLookup.get(transaction.date.slice(0, 7));
    if (!month) return;
    if (transaction.type === "income") month.income += transaction.amount;
    else month.expenses += transaction.amount;
  });
  const chartMaximum = Math.max(1, ...months.flatMap((month) => [month.income, month.expenses]));
  const categorySpending = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
      return totals;
    }, {});
  const topCategories = Object.entries(categorySpending)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);
  const recentTransactions = [...transactions]
    .sort((left, right) => new Date(right.createdAt ?? right.date).getTime() - new Date(left.createdAt ?? left.date).getTime())
    .slice(0, 5);

  const exportTransactions = () => {
    if (transactions.length === 0) return;
    const rows = [
      ["Date", "Description", "Category", "Type", "Amount"],
      ...transactions.map((transaction) => [
        transaction.date,
        transaction.title,
        transaction.category,
        transaction.type,
        transaction.amount.toFixed(2),
      ]),
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

  const handleAddTransaction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await dispatch(addTransaction({
        title: draft.title.trim(),
        amount: Number(draft.amount),
        category: draft.category,
        type: draft.type,
        date: draft.date,
        completed: false,
      })).unwrap();
      setDraft(createEmptyDraft());
      setShowTransactionForm(false);
    } catch (error) {
      setFormError(typeof error === "string" ? error : "Unable to save this transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Financial overview"
        description="Track your cash flow, spending, and recent transactions."
        actions={
          <>
            <Button variant="secondary" onClick={exportTransactions} disabled={transactions.length === 0}>
              <Download size={18} /> Export
            </Button>
            <Button onClick={() => setShowTransactionForm(true)}><Plus size={18} /> Add transaction</Button>
          </>
        }
      />

      {transactionState.error && (
        <p className="mb-4 text-sm text-red-600" role="alert">{transactionState.error}</p>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Current balance", value: formatCurrency(balance, currency), icon: WalletCards, tone: "bg-emerald-100 text-emerald-700", detail: "Net from all recorded activity" },
          { label: "Income", value: formatCurrency(income, currency), icon: ArrowUpRight, tone: "bg-sky-100 text-sky-700", detail: "Total recorded income" },
          { label: "Expenses", value: formatCurrency(expenses, currency), icon: ArrowDownRight, tone: "bg-rose-100 text-rose-700", detail: "Total recorded expenses" },
          { label: "Transactions", value: String(transactions.length), icon: ReceiptText, tone: "bg-violet-100 text-violet-700", detail: "Across all recorded activity" },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{item.label}</p>
                <span className={`rounded-lg p-2 ${item.tone}`}><Icon size={18} /></span>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-950">{item.value}</p>
              <p className="mt-1 text-sm text-slate-500">{transactionState.loading ? "Loading your activity..." : item.detail}</p>
            </Card>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div>
            <h2 className="text-lg font-bold text-slate-950">Monthly cash flow</h2>
            <p className="text-sm text-slate-500">Income compared with expenses.</p>
          </div>

          <div className="relative mt-6 flex h-72 items-end gap-3 overflow-hidden">
            {months.map((month) => (
              <div key={month.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-56 w-full items-end justify-center gap-1.5">
                  <div className="w-4 rounded-t bg-emerald-500" style={{ height: `${(month.income / chartMaximum) * 100}%` }} title={`Income ${formatCurrency(month.income, currency)}`} />
                  <div className="w-4 rounded-t bg-slate-300" style={{ height: `${(month.expenses / chartMaximum) * 100}%` }} title={`Expenses ${formatCurrency(month.expenses, currency)}`} />
                </div>
                <span className="text-xs font-medium text-slate-500">{month.label}</span>
              </div>
            ))}
            {!transactionState.loading && transactions.length === 0 && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-slate-500">Your monthly activity will appear here.</p>
            )}
          </div>
          <div className="mt-2 flex justify-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Income</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-slate-300" />Expenses</span>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Spending by category</h2>
          {topCategories.length ? (
            <div className="mt-5 space-y-5">
              {topCategories.map(([category, amount]) => {
                const percent = expenses > 0 ? (amount / expenses) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-800">{category}</p>
                      <p className="text-sm text-slate-500">{formatCurrency(amount, currency)} · {Math.round(percent)}%</p>
                    </div>
                    <ProgressBar value={percent} barClassName="bg-emerald-500" />
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">Expense categories will appear after you record an expense.</p>
          )}
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-950">Accounts</h2>
          <p className="mt-4 text-sm text-slate-500">Account balances are not connected to this transaction ledger yet.</p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Recent transactions</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            {recentTransactions.length ? recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 border-b border-slate-100 p-4 last:border-b-0">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{transaction.title}</p>
                  <p className="text-sm text-slate-500">{transaction.category} · {formatDate(transaction.date)}</p>
                </div>
                <p className={`shrink-0 font-bold ${transaction.type === "income" ? "text-emerald-600" : "text-slate-950"}`}>
                  {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount, currency)}
                </p>
              </div>
            )) : (
              <p className="p-4 text-sm text-slate-500">{transactionState.loading ? "Loading transactions..." : "No transactions recorded yet."}</p>
            )}
          </div>
        </Card>
      </section>

      <section className="mt-6">
        <Card>
          <h2 className="text-lg font-bold text-slate-950">Savings goals</h2>
          <p className="mt-3 text-sm text-slate-500">Savings goals are not connected to saved account data yet.</p>
        </Card>
      </section>

      {showTransactionForm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setShowTransactionForm(false); }}
        >
          <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="new-transaction-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="new-transaction-title" className="text-xl font-bold text-slate-950">Add transaction</h2>
                <p className="mt-1 text-sm text-slate-500">Record income or spending in your ledger.</p>
              </div>
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label="Close" onClick={() => setShowTransactionForm(false)}>
                <X size={18} />
              </button>
            </div>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleAddTransaction}>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Description</span>
                <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" autoFocus maxLength={150} required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Amount</span>
                <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" type="number" min="0.01" max="999999999999.99" step="0.01" required value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Type</span>
                <select className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as TransactionDraft["type"] })}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Category</span>
                <select className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-emerald-500" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Date</span>
                <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" type="date" required value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
              </label>
              {formError && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{formError}</p>}
              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="secondary" onClick={() => setShowTransactionForm(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save transaction"}</Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
