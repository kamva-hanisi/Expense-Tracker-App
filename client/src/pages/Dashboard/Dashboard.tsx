import { ArrowDownRight, ArrowUpRight, Plus, WalletCards } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import {
  accountCards,
  budgets,
  formatCurrency,
  formatDate,
  monthlyTrend,
  savingGoals,
  totalExpenses,
  totalIncome,
  totalSaved,
  transactions,
} from "../../data/financeData";

const Dashboard = () => {
  const balance = totalIncome - totalExpenses;

  return (
    <div>
      <PageHeader
        title="Financial overview"
        description="Track your cash flow, budgets, savings goals, and recent spending from one clean workspace."
        actions={
          <>
            <Button variant="secondary">Export</Button>
            <Button><Plus size={18} /> Add transaction</Button>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Current balance", value: balance, icon: WalletCards, tone: "bg-emerald-100 text-emerald-700" },
          { label: "Income", value: totalIncome, icon: ArrowUpRight, tone: "bg-sky-100 text-sky-700" },
          { label: "Expenses", value: totalExpenses, icon: ArrowDownRight, tone: "bg-rose-100 text-rose-700" },
          { label: "Saved", value: totalSaved, icon: WalletCards, tone: "bg-violet-100 text-violet-700" },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">{item.label}</p>
                <span className={`rounded-lg p-2 ${item.tone}`}><Icon size={18} /></span>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-950">{formatCurrency(item.value)}</p>
              <p className="mt-1 text-sm text-emerald-700">+8.4% vs last month</p>
            </Card>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Monthly cash flow</h2>
              <p className="text-sm text-slate-500">Income compared with expenses.</p>
            </div>
          </div>

          <div className="mt-6 flex h-72 items-end gap-3 overflow-hidden">
            {monthlyTrend.map((item) => {
              const incomeHeight = (item.income / 50000) * 100;
              const expenseHeight = (item.expenses / 50000) * 100;

              return (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-56 w-full items-end justify-center gap-1.5">
                    <div className="w-4 rounded-t bg-emerald-500" style={{ height: `${incomeHeight}%` }} />
                    <div className="w-4 rounded-t bg-slate-300" style={{ height: `${expenseHeight}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{item.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Budget pulse</h2>
          <div className="mt-5 space-y-5">
            {budgets.slice(0, 4).map((budget) => {
              const percent = (budget.spent / budget.limit) * 100;
              const Icon = budget.icon;

              return (
                <div key={budget.name}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-slate-100 p-2 text-slate-700"><Icon size={18} /></span>
                      <p className="font-semibold text-slate-800">{budget.name}</p>
                    </div>
                    <p className="text-sm text-slate-500">{Math.round(percent)}%</p>
                  </div>
                  <ProgressBar value={percent} barClassName={budget.color} />
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-950">Accounts</h2>
          <div className="mt-4 space-y-3">
            {accountCards.map((account) => {
              const Icon = account.icon;

              return (
                <div key={account.name} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="rounded-lg bg-white p-2 text-emerald-700"><Icon size={18} /></span>
                    <div>
                      <p className="font-semibold text-slate-900">{account.name}</p>
                      <p className="text-xs text-slate-500">{account.detail}</p>
                    </div>
                  </div>
                  <p className="font-bold text-slate-950">{formatCurrency(account.value)}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Recent transactions</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between gap-4 border-b border-slate-100 p-4 last:border-b-0">
                <div>
                  <p className="font-semibold text-slate-900">{transaction.merchant}</p>
                  <p className="text-sm text-slate-500">{transaction.category} - {formatDate(transaction.date)}</p>
                </div>
                <p className={`font-bold ${transaction.type === "income" ? "text-emerald-600" : "text-slate-950"}`}>
                  {transaction.type === "income" ? "+" : "-"}{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {savingGoals.map((goal) => {
          const percent = (goal.saved / goal.target) * 100;

          return (
            <Card key={goal.name}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-950">{goal.name}</h3>
                <span className="text-xs font-semibold text-slate-500">{goal.deadline}</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">{formatCurrency(goal.saved)} of {formatCurrency(goal.target)}</p>
              <ProgressBar value={percent} className="mt-3" barClassName={goal.color} />
            </Card>
          );
        })}
      </section>
    </div>
  );
};

export default Dashboard;
