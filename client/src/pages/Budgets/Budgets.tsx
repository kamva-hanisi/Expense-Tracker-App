import { Plus } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import { budgets, formatCurrency } from "../../data/financeData";

const Budgets = () => {
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalLimit = budgets.reduce((sum, budget) => sum + budget.limit, 0);

  return (
    <div>
      <PageHeader
        title="Budgets"
        description="Set category limits, watch usage, and spot areas that need attention before month end."
        actions={<Button><Plus size={18} /> New budget</Button>}
      />

      <Card className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Monthly budget usage</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-950">
              {formatCurrency(totalSpent)} / {formatCurrency(totalLimit)}
            </h2>
          </div>
          <div className="md:w-80">
            <div className="mb-2 flex justify-between text-sm text-slate-500">
              <span>Used</span>
              <span>{Math.round((totalSpent / totalLimit) * 100)}%</span>
            </div>
            <ProgressBar value={(totalSpent / totalLimit) * 100} />
          </div>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {budgets.map((budget) => {
          const Icon = budget.icon;
          const percent = (budget.spent / budget.limit) * 100;
          const remaining = budget.limit - budget.spent;

          return (
            <Card key={budget.name}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-slate-100 p-3 text-slate-700"><Icon size={20} /></span>
                  <div>
                    <h2 className="font-bold text-slate-950">{budget.name}</h2>
                    <p className="text-sm text-slate-500">{formatCurrency(remaining)} remaining</p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${percent > 85 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {percent > 85 ? "Tight" : "On track"}
                </span>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{formatCurrency(budget.spent)}</span>
                  <span className="text-slate-500">{formatCurrency(budget.limit)}</span>
                </div>
                <ProgressBar value={percent} barClassName={budget.color} />
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
};

export default Budgets;
