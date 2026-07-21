import { Link } from "react-router-dom";
import { LockKeyhole, Mail, WalletCards } from "lucide-react";

import Button from "../../components/ui/Button";

const Login = () => {
  return (
    <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[1fr_1.1fr]">
      <div className="bg-emerald-700 p-8 text-white sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/15">
          <WalletCards size={26} />
        </div>
        <h1 className="mt-8 text-3xl font-bold">Expense Tracker</h1>
        <p className="mt-3 text-emerald-50">
          Keep spending, budgets, receipts, and goals organized in one calm dashboard.
        </p>
        <div className="mt-10 grid gap-3 text-sm text-emerald-50">
          <p>Monthly cash-flow summary</p>
          <p>Budget progress by category</p>
          <p>Receipt and transaction history</p>
        </div>
      </div>

      <form className="p-8 sm:p-10" onSubmit={(event) => event.preventDefault()}>
        <h2 className="text-2xl font-bold text-slate-950">Sign in</h2>
        <p className="mt-2 text-sm text-slate-500">Use your account to continue tracking your money.</p>

        <label className="mt-8 block">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <span className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
            <Mail size={18} className="text-slate-400" />
            <input type="email" className="w-full outline-none" placeholder="you@example.com" />
          </span>
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-slate-700">Password</span>
          <span className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
            <LockKeyhole size={18} className="text-slate-400" />
            <input type="password" className="w-full outline-none" placeholder="Password" />
          </span>
        </label>

        <div className="mt-5 flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" className="h-4 w-4 accent-emerald-600" />
            Remember me
          </label>
          <button className="font-semibold text-emerald-700" type="button">Forgot password?</button>
        </div>

        <Button className="mt-8 w-full" type="submit">Sign in</Button>
        <p className="mt-6 text-center text-sm text-slate-500">
          New here? <Link className="font-semibold text-emerald-700" to="/register">Create an account</Link>
        </p>
      </form>
    </section>
  );
};

export default Login;
