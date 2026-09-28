import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Download } from "lucide-react";

import type { AppDispatch, RootState } from "../../app/store";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { getTransactions, type Transaction } from "../../features/transactions/transactionSlice";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

type ReportTransaction = Transaction & {
  title: string;
  amount: number;
  category: string;
  type: "income" | "expense";
  date: string;
};

type Period = "this-month" | "last-month" | "this-year" | "last-six-months" | "all-time";

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
};

const getPeriodStart = (period: Period, now: Date) => {
  if (period === "this-month") return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === "last-month") return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  if (period === "this-year") return new Date(now.getFullYear(), 0, 1);
  if (period === "last-six-months") return new Date(now.getFullYear(), now.getMonth() - 5, 1);
  return null;
};

const Reports = () => {
  const dispatch = useDispatch<AppDispatch>();
  const hasRequested = useRef(false);
  const { transactions: rawTransactions, loading, error } = useSelector((state: RootState) => state.transactions);
  const currency = useSelector((state: RootState) => state.auth.user?.defaultCurrency ?? "ZAR");
  const [period, setPeriod] = useState<Period>("last-six-months");

  useEffect(() => {
    if (hasRequested.current) return;
    hasRequested.current = true;
    void dispatch(getTransactions());
  }, [dispatch]);

  const now = new Date();
  const start = getPeriodStart(period, now);
  const end = period === "last-month" ? new Date(now.getFullYear(), now.getMonth(), 1) : null;
  const transactions = (rawTransactions as ReportTransaction[]).filter((transaction) => {
    const date = parseLocalDate(transaction.date);
    return (!start || date >= start) && (!end || date < end);
  });
  const income = transactions.filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const expenses = transactions.filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const net = income - expenses;
  const savingsRate = income > 0 ? (net / income) * 100 : null;
  const categories = transactions.filter((transaction) => transaction.type === "expense")
    .reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.category] = (totals[transaction.category] ?? 0) + transaction.amount;
      return totals;
    }, {});
  const categoryRows = Object.entries(categories).sort((left, right) => right[1] - left[1]);
  const topCategory = categoryRows[0];

  const monthlyTrend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthTransactions = (rawTransactions as ReportTransaction[]).filter((transaction) => {
      const transactionDate = parseLocalDate(transaction.date);
      return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
    });
    return {
      label: new Intl.DateTimeFormat("en-ZA", { month: "short" }).format(date),
      income: monthTransactions.filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      expenses: monthTransactions.filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    };
  });
  const maxMonthlyAmount = Math.max(1, ...monthlyTrend.flatMap((item) => [item.income, item.expenses]));

  const exportReport = () => {
    if (!transactions.length) return;
    const rows = [
      ["Date", "Description", "Category", "Type", "Amount"],
      ...transactions.map((transaction) => [transaction.date, transaction.title, transaction.category, transaction.type, transaction.amount.toFixed(2)]),
    ];
    const csv = rows.map((row) => row.map((value) => {
      const text = String(value).replaceAll('"', '""');
      const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText}"`;
    }).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `financial-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Review income, spending trends, and category breakdowns from your recorded activity."
        actions={<Button variant="secondary" onClick={exportReport} disabled={!transactions.length}><Download size={18} /> Download report</Button>}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{loading ? "Loading report data..." : `${transactions.length} transactions in this period`}</p>
        <select aria-label="Report period" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none" value={period} onChange={(event) => setPeriod(event.target.value as Period)}>
          <option value="this-month">This month</option>
          <option value="last-month">Last month</option>
          <option value="this-year">This year</option>
          <option value="last-six-months">Last six months</option>
          <option value="all-time">All time</option>
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Income</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(income, currency)}</h2>
          <p className="mt-1 text-sm text-slate-500">Recorded in selected period</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Expenses</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(expenses, currency)}</h2>
          <p className="mt-1 text-sm text-slate-500">Recorded in selected period</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Savings rate</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{savingsRate === null ? "—" : `${Math.round(savingsRate)}%`}</h2>
          <p className={`mt-1 text-sm ${net >= 0 ? "text-emerald-700" : "text-red-600"}`}>{savingsRate === null ? "Add income to calculate" : `${formatCurrency(net, currency)} net cash flow`}</p>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-950">Six month trend</h2>
          <p className="mt-1 text-sm text-slate-500">Monthly income and expenses from recorded transactions.</p>
          <div className="mt-6 space-y-4">
            {monthlyTrend.map((item) => (
              <div key={item.label} className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
                <span className="text-sm font-semibold text-slate-500">{item.label}</span>
                <div className="space-y-1.5">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100" title={`Income ${formatCurrency(item.income, currency)}`}>
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(item.income / maxMonthlyAmount) * 100}%` }} />
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100" title={`Expenses ${formatCurrency(item.expenses, currency)}`}>
                    <div className="h-full rounded-full bg-rose-400" style={{ width: `${(item.expenses / maxMonthlyAmount) * 100}%` }} />
                  </div>
                </div>
                <span className={`text-sm font-semibold ${item.income - item.expenses >= 0 ? "text-slate-700" : "text-red-600"}`}>
                  {formatCurrency(item.income - item.expenses, currency)}
                </span>
              </div>
            ))}
            {!loading && rawTransactions.length === 0 && <p className="pt-2 text-sm text-slate-500">Your monthly trend will appear after you record transactions.</p>}
          </div>
          <div className="mt-5 flex justify-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />Income</span>
            <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-400" />Expenses</span>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Category breakdown</h2>
          {categoryRows.length ? (
            <div className="mt-5 space-y-4">
              {categoryRows.map(([category, amount]) => (
                <div key={category}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-800">{category}</span>
                    <span className="font-bold text-slate-950">{formatCurrency(amount, currency)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${expenses ? (amount / expenses) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">Expense categories will appear after you record an expense in this period.</p>
          )}
          {topCategory && <p className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">Top category: <span className="font-semibold text-slate-800">{topCategory[0]}</span></p>}
        </Card>
      </section>
    </div>
  );
};

export default Reports;
