import { useEffect, useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { AxiosError } from "axios";
import { Pencil, Plus, Trash2, WalletCards, X } from "lucide-react";

import type { RootState } from "../../app/store";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import { budgets as exampleBudgets } from "../../data/financeData";
import { categories } from "../../constants/categories";
import API from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

type BudgetRecord = {
  id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
};

type BudgetMode = "example" | "fresh" | null;

const Budgets = () => {
  const currency = useSelector((state: RootState) => state.auth.user?.defaultCurrency ?? "ZAR");
  const [savedBudgets, setSavedBudgets] = useState<BudgetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<BudgetMode>(null);
  const [category, setCategory] = useState(categories[0] ?? "Housing");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [editingBudget, setEditingBudget] = useState<BudgetRecord | null>(null);

  const loadBudgets = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get<BudgetRecord[]>("/budgets");
      setSavedBudgets(data);
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to load your budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadBudgets(); }, []);

  const totalSpent = savedBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalLimit = savedBudgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0);
  const exampleSpent = exampleBudgets.reduce((sum, budget) => sum + budget.spent, 0);
  const exampleLimit = exampleBudgets.reduce((sum, budget) => sum + budget.limit, 0);
  const budgetsToDisplay = savedBudgets.length ? savedBudgets : exampleBudgets.map((budget) => ({
    id: `example-${budget.name}`,
    category: budget.name,
    monthlyLimit: budget.limit,
    spent: budget.spent,
  }));

  const openModal = () => {
    setModalOpen(true);
    setMode(null);
    setEditingBudget(null);
    setCategory(categories[0] ?? "Housing");
    setMonthlyLimit("");
    setError("");
  };

  const closeModal = () => {
    setModalOpen(false);
    setMode(null);
    setEditingBudget(null);
    setError("");
  };

  const saveExample = async () => {
    setSaving(true);
    setError("");
    try {
      const { data } = await API.put<BudgetRecord[]>("/budgets", {
        budgets: exampleBudgets.map((budget) => ({ category: budget.name, monthlyLimit: budget.limit })),
      });
      setSavedBudgets(data);
      closeModal();
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to save this budget example");
    } finally {
      setSaving(false);
    }
  };

  const saveFreshBudget = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await API.post<BudgetRecord[]>("/budgets", {
        category: category.trim(),
        monthlyLimit: Number(monthlyLimit),
      });
      setSavedBudgets(data);
      closeModal();
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to save this budget");
    } finally {
      setSaving(false);
    }
  };

  const editBudget = (budget: BudgetRecord) => {
    setEditingBudget(budget);
    setCategory(budget.category);
    setMonthlyLimit(String(budget.monthlyLimit));
    setMode("fresh");
    setModalOpen(true);
    setError("");
  };

  const removeBudget = async (budget: BudgetRecord) => {
    setError("");
    try {
      await API.delete(`/budgets/${budget.id}`);
      setSavedBudgets((current) => current.filter((item) => item.id !== budget.id));
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to remove this budget");
    }
  };

  return (
    <div>
      <PageHeader
        title="Budgets"
        description="Set monthly category limits and compare them with your recorded expenses."
        actions={<Button onClick={openModal}><Plus size={18} /> New budget</Button>}
      />

      {error && !modalOpen && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}

      {savedBudgets.length > 0 ? (
        <>
          <Card className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Monthly budget usage</p>
                <h2 className="mt-1 text-3xl font-bold text-slate-950">
                  {formatCurrency(totalSpent, currency)} / {formatCurrency(totalLimit, currency)}
                </h2>
              </div>
              <div className="md:w-80">
                <div className="mb-2 flex justify-between text-sm text-slate-500">
                  <span>Used</span>
                  <span>{totalLimit ? Math.round((totalSpent / totalLimit) * 100) : 0}%</span>
                </div>
                <ProgressBar value={totalLimit ? (totalSpent / totalLimit) * 100 : 0} />
              </div>
            </div>
          </Card>
          <h2 className="mb-4 text-lg font-bold text-slate-950">Your budgets</h2>
        </>
      ) : (
        <Card className="mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Example plan · not saved</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-950">
                {formatCurrency(exampleSpent, currency)} / {formatCurrency(exampleLimit, currency)}
              </h2>
              <p className="mt-1 text-sm text-slate-500">Sample monthly spending and category limits.</p>
            </div>
            <div className="md:w-80">
              <div className="mb-2 flex justify-between text-sm text-slate-500">
                <span>Example used</span>
                <span>{Math.round((exampleSpent / exampleLimit) * 100)}%</span>
              </div>
              <ProgressBar value={(exampleSpent / exampleLimit) * 100} />
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="py-12 text-center text-sm text-slate-500">Loading budgets...</p>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {budgetsToDisplay.map((budget) => {
            const example = budget.id.startsWith("example-");
            const template = exampleBudgets.find((item) => item.name === budget.category);
            const Icon = template?.icon ?? WalletCards;
            const color = template?.color ?? "bg-emerald-500";
            const percent = budget.monthlyLimit > 0 ? (budget.spent / budget.monthlyLimit) * 100 : 0;
            const remaining = budget.monthlyLimit - budget.spent;

            return (
              <Card key={budget.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="rounded-lg bg-slate-100 p-3 text-slate-700"><Icon size={20} /></span>
                    <div className="min-w-0">
                      <h2 className="truncate font-bold text-slate-950">{budget.category}</h2>
                      <p className="text-sm text-slate-500">{example ? "Example" : remaining >= 0 ? `${formatCurrency(remaining, currency)} remaining` : `${formatCurrency(Math.abs(remaining), currency)} over limit`}</p>
                    </div>
                  </div>
                  {example ? (
                    <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">Example</span>
                  ) : (
                    <div className="flex gap-1">
                      <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label={`Edit ${budget.category} budget`} onClick={() => editBudget(budget)}>
                        <Pencil size={16} />
                      </button>
                      <button className="rounded-lg p-2 text-red-600 hover:bg-red-50" type="button" aria-label={`Delete ${budget.category} budget`} onClick={() => void removeBudget(budget)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">{formatCurrency(budget.spent, currency)}</span>
                    <span className="text-slate-500">{formatCurrency(budget.monthlyLimit, currency)}</span>
                  </div>
                  <ProgressBar value={percent} barClassName={color} />
                </div>
                {!example && (
                  <p className={`mt-3 text-xs font-semibold ${percent >= 100 ? "text-red-600" : percent >= 85 ? "text-amber-600" : "text-emerald-700"}`}>
                    {percent >= 100 ? "Over limit" : percent >= 85 ? "Near limit" : "On track"} · {Math.round(percent)}% used
                  </p>
                )}
              </Card>
            );
          })}
        </section>
      )}

      {savedBudgets.length === 0 && !loading && (
        <p className="mt-4 text-sm text-slate-500">Example amounts are for reference only. Choose New budget to save this plan or build your own.</p>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="budget-dialog-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="budget-dialog-title" className="text-xl font-bold text-slate-950">{editingBudget ? "Edit budget" : "New budget"}</h2>
                <p className="mt-1 text-sm text-slate-500">{editingBudget ? "Update this category's monthly limit." : "Start with the example or create a budget from scratch."}</p>
              </div>
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label="Close" onClick={closeModal}><X size={18} /></button>
            </div>

            {!mode && !editingBudget && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-emerald-500 hover:bg-emerald-50" type="button" onClick={() => setMode("example")}>
                  <span className="font-semibold text-slate-950">Use the example</span>
                  <span className="mt-1 block text-sm text-slate-500">Start with the six sample category limits.</span>
                </button>
                <button className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-emerald-500 hover:bg-emerald-50" type="button" onClick={() => setMode("fresh")}>
                  <span className="font-semibold text-slate-950">Start fresh</span>
                  <span className="mt-1 block text-sm text-slate-500">Choose one category and set your own limit.</span>
                </button>
              </div>
            )}

            {mode === "example" && (
              <div className="mt-6">
                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 px-4">
                  {exampleBudgets.map((budget) => (
                    <div key={budget.name} className="flex items-center justify-between gap-4 py-3 text-sm">
                      <span className="font-semibold text-slate-700">{budget.name}</span>
                      <span className="text-slate-600">{formatCurrency(budget.limit, currency)} monthly</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-slate-500">Saving this example replaces your current budget plan. Spending totals will be calculated from your own transactions.</p>
                <div className="mt-5 flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setMode(null)}>Back</Button>
                  <Button type="button" disabled={saving} onClick={() => void saveExample()}>{saving ? "Saving..." : "Save example plan"}</Button>
                </div>
              </div>
            )}

            {mode === "fresh" && (
              <form className="mt-6 grid gap-4" onSubmit={saveFreshBudget}>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Category</span>
                  <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" maxLength={100} required value={category} disabled={Boolean(editingBudget)} onChange={(event) => setCategory(event.target.value)} />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Monthly limit</span>
                  <input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" type="number" min="0.01" max="999999999999.99" step="0.01" required value={monthlyLimit} onChange={(event) => setMonthlyLimit(event.target.value)} />
                </label>
                {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
                <div className="flex justify-end gap-2">
                  {!editingBudget && <Button type="button" variant="secondary" onClick={() => setMode(null)}>Back</Button>}
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : editingBudget ? "Save changes" : "Save budget"}</Button>
                </div>
              </form>
            )}

            {error && mode === "example" && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
          </section>
        </div>
      )}
    </div>
  );
};

export default Budgets;
