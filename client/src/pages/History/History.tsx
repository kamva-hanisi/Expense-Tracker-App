import { Download, Search } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { formatCurrency, formatDate, transactions } from "../../data/financeData";

const History = () => {
  return (
    <div>
      <PageHeader
        title="Transaction history"
        description="Review all activity across accounts with clear status and category labels."
        actions={<Button variant="secondary"><Download size={18} /> Export CSV</Button>}
      />

      <Card className="mb-6">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_160px]">
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
            <Search size={18} className="text-slate-400" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Search by merchant or category" />
          </label>
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
            <option>All types</option>
            <option>Income</option>
            <option>Expense</option>
          </select>
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
            <option>This month</option>
            <option>Last month</option>
            <option>This year</option>
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Merchant</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Account</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-semibold text-slate-950">{transaction.merchant}</td>
                  <td className="px-5 py-4 text-slate-600">{transaction.category}</td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(transaction.date)}</td>
                  <td className="px-5 py-4 text-slate-600">{transaction.account}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${transaction.status === "Cleared" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className={`px-5 py-4 text-right font-bold ${transaction.type === "income" ? "text-emerald-600" : "text-slate-950"}`}>
                    {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default History;
