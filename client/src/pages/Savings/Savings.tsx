import { useEffect, useState, type FormEvent } from "react";
import { useSelector } from "react-redux";
import { AxiosError } from "axios";
import { Pencil, PiggyBank, Plus, Trash2, X } from "lucide-react";

import type { RootState } from "../../app/store";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import ProgressBar from "../../components/ui/ProgressBar";
import { savingGoals as exampleGoals } from "../../data/financeData";
import API from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";

type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string | null;
};

type GoalMode = "example" | "fresh" | null;

const exampleDates: Record<string, string> = {
  "Emergency fund": "2026-12-31",
  "Cape Town trip": "2026-10-31",
  "New laptop": "2026-11-30",
};

const formatTargetDate = (date: string | null) => date
  ? new Intl.DateTimeFormat("en-ZA", { month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`))
  : "No target date";

const Savings = () => {
  const currency = useSelector((state: RootState) => state.auth.user?.defaultCurrency ?? "ZAR");
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"choice" | "fresh" | "contribution" | "edit" | "delete" | null>(null);
  const [mode, setMode] = useState<GoalMode>(null);
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [contribution, setContribution] = useState("");

  const loadGoals = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get<SavingsGoal[]>("/savings-goals");
      setGoals(data);
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to load savings goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadGoals(); }, []);

  const totalSaved = goals.reduce((sum, goal) => sum + goal.savedAmount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const progress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const examples = exampleGoals.map((goal) => ({
    name: goal.name,
    savedAmount: goal.saved,
    targetAmount: goal.target,
    targetDate: exampleDates[goal.name] ?? null,
    color: goal.color,
  }));

  const openNewGoal = () => {
    setModal("choice");
    setMode(null);
    setActiveGoal(null);
    setName("");
    setTargetAmount("");
    setTargetDate("");
    setError("");
  };

  const closeModal = () => {
    setModal(null);
    setMode(null);
    setActiveGoal(null);
    setError("");
  };

  const saveExamplePlan = async () => {
    setSaving(true);
    setError("");
    try {
      const { data } = await API.put<SavingsGoal[]>("/savings-goals", {
        goals: examples.map(({ name: goalName, targetAmount: goalTarget, targetDate: goalDate }) => ({
          name: goalName,
          targetAmount: goalTarget,
          targetDate: goalDate,
        })),
      });
      setGoals(data);
      closeModal();
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to save the example plan");
    } finally {
      setSaving(false);
    }
  };

  const saveGoal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { name: name.trim(), targetAmount: Number(targetAmount), targetDate: targetDate || null };
      const { data } = activeGoal
        ? await API.put<SavingsGoal[]>(`/savings-goals/${activeGoal.id}`, payload)
        : await API.post<SavingsGoal[]>("/savings-goals", payload);
      setGoals(data);
      closeModal();
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to save this goal");
    } finally {
      setSaving(false);
    }
  };

  const addContribution = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeGoal) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await API.post<SavingsGoal[]>(`/savings-goals/${activeGoal.id}/contributions`, { amount: Number(contribution) });
      setGoals(data);
      closeModal();
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to add this contribution");
    } finally {
      setSaving(false);
    }
  };

  const deleteGoal = async () => {
    if (!activeGoal) return;
    setSaving(true);
    setError("");
    try {
      await API.delete(`/savings-goals/${activeGoal.id}`);
      setGoals((current) => current.filter((goal) => goal.id !== activeGoal.id));
      closeModal();
    } catch (requestError) {
      const axiosError = requestError as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Unable to delete this goal");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Savings goals"
        description="Save towards personal targets and follow your progress."
        actions={<Button onClick={openNewGoal}><Plus size={18} /> Add goal</Button>}
      />

      {error && !modal && <p className="mb-4 text-sm text-red-600" role="alert">{error}</p>}

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-slate-500">Total saved</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{formatCurrency(totalSaved, currency)}</h2>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Target value</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{formatCurrency(totalTarget, currency)}</h2>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Overall progress</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">{progress}%</h2>
        </Card>
      </section>

      {loading ? (
        <p className="mt-8 py-12 text-center text-sm text-slate-500">Loading savings goals...</p>
      ) : goals.length ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          {goals.map((goal, index) => {
            const percent = goal.targetAmount > 0 ? (goal.savedAmount / goal.targetAmount) * 100 : 0;
            const color = exampleGoals[index % exampleGoals.length]?.color ?? "bg-emerald-500";
            return (
              <Card key={goal.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <PiggyBank size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label={`Edit ${goal.name}`} onClick={() => { setActiveGoal(goal); setName(goal.name); setTargetAmount(String(goal.targetAmount)); setTargetDate(goal.targetDate ?? ""); setModal("edit"); setError(""); }}><Pencil size={16} /></button>
                    <button className="rounded-lg p-2 text-red-600 hover:bg-red-50" type="button" aria-label={`Delete ${goal.name}`} onClick={() => { setActiveGoal(goal); setModal("delete"); setError(""); }}><Trash2 size={16} /></button>
                  </div>
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-950">{goal.name}</h2>
                <p className="mt-1 text-sm text-slate-500">Target: {formatTargetDate(goal.targetDate)}</p>
                <div className="mt-6">
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-700">{formatCurrency(goal.savedAmount, currency)} saved</span>
                    <span className="text-slate-500">{formatCurrency(goal.targetAmount, currency)}</span>
                  </div>
                  <ProgressBar value={Math.min(100, percent)} barClassName={color} />
                  <p className={`mt-2 text-xs font-semibold ${percent >= 100 ? "text-emerald-700" : "text-slate-500"}`}>
                    {percent >= 100 ? "Goal reached" : `${Math.round(percent)}% complete · ${formatCurrency(Math.max(0, goal.targetAmount - goal.savedAmount), currency)} to go`}
                  </p>
                </div>
                <Button className="mt-5 w-full" variant="secondary" onClick={() => { setActiveGoal(goal); setContribution(""); setModal("contribution"); setError(""); }}>Add contribution</Button>
              </Card>
            );
          })}
        </section>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-slate-950">Example goals · not saved</h2>
              <p className="text-sm text-slate-500">Sample progress for reference. New goals start with zero saved.</p>
            </div>
          </div>
          <section className="mt-4 grid gap-4 lg:grid-cols-3">
            {examples.map((goal) => {
              const percent = (goal.savedAmount / goal.targetAmount) * 100;
              return (
                <Card key={goal.name}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><PiggyBank size={24} /></div>
                  <h2 className="mt-5 text-xl font-bold text-slate-950">{goal.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">Example target: {formatTargetDate(goal.targetDate)}</p>
                  <div className="mt-6">
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="font-semibold text-slate-700">{formatCurrency(goal.savedAmount, currency)}</span>
                      <span className="text-slate-500">{formatCurrency(goal.targetAmount, currency)}</span>
                    </div>
                    <ProgressBar value={percent} barClassName={goal.color} />
                  </div>
                  <span className="mt-4 inline-block rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">Example</span>
                </Card>
              );
            })}
          </section>
        </>
      )}

      {modal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-xl" role={modal === "delete" ? "alertdialog" : "dialog"} aria-modal="true" aria-labelledby="savings-modal-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="savings-modal-title" className="text-xl font-bold text-slate-950">
                  {modal === "contribution" ? "Add contribution" : modal === "edit" ? "Edit savings goal" : modal === "delete" ? "Delete savings goal?" : "Add savings goal"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modal === "choice" ? "Use the example goals or make a goal of your own." : modal === "contribution" ? `Add savings towards ${activeGoal?.name}.` : modal === "delete" ? `${activeGoal?.name} and its saved progress will be removed.` : "Choose a target and an optional date."}
                </p>
              </div>
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" type="button" aria-label="Close" onClick={closeModal}><X size={18} /></button>
            </div>

            {modal === "choice" && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-emerald-500 hover:bg-emerald-50" type="button" onClick={() => { setMode("example"); }}>
                  <span className="font-semibold text-slate-950">Use the example</span>
                  <span className="mt-1 block text-sm text-slate-500">Copy three example goals with nothing saved yet.</span>
                </button>
                <button className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-emerald-500 hover:bg-emerald-50" type="button" onClick={() => { setMode("fresh"); setName(""); setTargetAmount(""); setTargetDate(""); setModal("fresh"); }}>
                  <span className="font-semibold text-slate-950">Start fresh</span>
                  <span className="mt-1 block text-sm text-slate-500">Create a new goal with your own target.</span>
                </button>
              </div>
            )}

            {mode === "example" && modal === "choice" && (
              <div className="mt-5">
                <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 px-4">
                  {examples.map((goal) => <div key={goal.name} className="flex justify-between gap-4 py-3 text-sm"><span className="font-semibold text-slate-700">{goal.name}</span><span className="text-slate-500">{formatCurrency(goal.targetAmount, currency)} target</span></div>)}
                </div>
                <p className="mt-3 text-xs text-slate-500">The example progress shown on this page will not be copied. These goals start with zero saved.</p>
                <div className="mt-5 flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setMode(null)}>Back</Button>
                  <Button type="button" disabled={saving} onClick={() => void saveExamplePlan()}>{saving ? "Saving..." : "Save example goals"}</Button>
                </div>
              </div>
            )}

            {(modal === "fresh" || modal === "edit") && (
              <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={saveGoal}>
                <label className="block sm:col-span-2"><span className="text-sm font-semibold text-slate-700">Goal name</span><input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" maxLength={120} required value={name} onChange={(event) => setName(event.target.value)} /></label>
                <label className="block"><span className="text-sm font-semibold text-slate-700">Target amount</span><input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" type="number" min="0.01" max="999999999999.99" step="0.01" required value={targetAmount} onChange={(event) => setTargetAmount(event.target.value)} /></label>
                <label className="block"><span className="text-sm font-semibold text-slate-700">Target date (optional)</span><input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} /></label>
                {error && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{error}</p>}
                <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : modal === "edit" ? "Save changes" : "Save goal"}</Button></div>
              </form>
            )}

            {modal === "contribution" && (
              <form className="mt-6 grid gap-4" onSubmit={addContribution}>
                <label className="block"><span className="text-sm font-semibold text-slate-700">Contribution amount</span><input className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-emerald-500" type="number" min="0.01" max="999999999999.99" step="0.01" required value={contribution} onChange={(event) => setContribution(event.target.value)} /></label>
                {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
                <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? "Saving..." : "Add contribution"}</Button></div>
              </form>
            )}

            {modal === "delete" && (
              <div className="mt-5 flex justify-end gap-2">
                {error && <p className="mr-auto text-sm text-red-600" role="alert">{error}</p>}
                <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                <Button type="button" variant="danger" disabled={saving} onClick={() => void deleteGoal()}>{saving ? "Deleting..." : "Delete goal"}</Button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Savings;
