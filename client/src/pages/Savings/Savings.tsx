import { PiggyBank, Plus } from "lucide-react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import { formatCurrency, savingGoals, totalSaved } from "../../data/financeData";

const Savings = () => {
  const totalTarget = savingGoals.reduce((sum, goal) => sum + goal.target, 0);

  return (
    <div>
      <PageHeader
        title="Savings goals"
        description="Follow every goal from first deposit to finish line with simple progress tracking."
        actions={<Button><Plus size={18} /> Add goal</Button>}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total saved</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{formatCurrency(totalSaved)}</h2>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Target value</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{formatCurrency(totalTarget)}</h2>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Overall progress</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{Math.round((totalSaved / totalTarget) * 100)}%</h2>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {savingGoals.map((goal) => {
          const percent = (goal.saved / goal.target) * 100;

          return (
            <Card key={goal.name}>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <PiggyBank size={24} />
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-950">{goal.name}</h2>
              <p className="mt-1 text-sm text-slate-500">Deadline: {goal.deadline}</p>
              <div className="mt-6">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{formatCurrency(goal.saved)}</span>
                  <span className="text-slate-500">{formatCurrency(goal.target)}</span>
                </div>
                <ProgressBar value={percent} barClassName={goal.color} />
              </div>
              <Button className="mt-5 w-full" variant="secondary">Add contribution</Button>
            </Card>
          );
        })}
      </section>
    </div>
  );
};

export default Savings;
