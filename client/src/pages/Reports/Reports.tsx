import { Download } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import { budgets, categories, formatCurrency, monthlyTrend } from "../../data/financeData";

const Reports = () => {
  const highestBudget = [...budgets].sort((a, b) => b.spent - a.spent)[0];

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Understand trends, category concentration, and month-end pressure at a glance."
        actions={<Button variant="secondary"><Download size={18} /> Download report</Button>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Top expense budget</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">{highestBudget.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{formatCurrency(highestBudget.spent)} spent</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Savings rate</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">31%</h2>
          <p className="mt-1 text-sm text-emerald-700">Healthy range</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Forecast</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">Under budget</h2>
          <p className="mt-1 text-sm text-slate-500">Projected by R2,780</p>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <h2 className="text-lg font-bold text-slate-950">Six month trend</h2>
          <div className="mt-6 space-y-4">
            {monthlyTrend.map((item) => (
              <div key={item.month} className="grid grid-cols-[44px_1fr_auto] items-center gap-3">
                <span className="text-sm font-semibold text-slate-500">{item.month}</span>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(item.expenses / item.income) * 100}%` }} />
                </div>
                <span className="text-sm font-semibold text-slate-700">{formatCurrency(item.income - item.expenses)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold text-slate-950">Category breakdown</h2>
          <div className="mt-5 space-y-4">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-lg p-2 ${category.tone}`}><Icon size={18} /></span>
                    <span className="font-semibold text-slate-800">{category.name}</span>
                  </div>
                  <span className="font-bold text-slate-950">{formatCurrency(category.amount)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Reports;
