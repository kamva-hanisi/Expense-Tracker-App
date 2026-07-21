import { Link } from "react-router-dom";
import { LockKeyhole, Mail, User, WalletCards } from "lucide-react";

import Button from "../../components/ui/Button";

const RegisterPage = () => {
  return (
    <section className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <WalletCards size={24} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Create account</h1>
          <p className="text-sm text-slate-500">Start your personal finance workspace.</p>
        </div>
      </div>

      <form className="mt-8 space-y-4" onSubmit={(event) => event.preventDefault()}>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Full name</span>
          <span className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
            <User size={18} className="text-slate-400" />
            <input className="w-full outline-none" placeholder="Kamva Hanisi" />
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <span className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
            <Mail size={18} className="text-slate-400" />
            <input type="email" className="w-full outline-none" placeholder="you@example.com" />
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Password</span>
          <span className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
            <LockKeyhole size={18} className="text-slate-400" />
            <input type="password" className="w-full outline-none" placeholder="Create a password" />
          </span>
        </label>

        <Button className="w-full" type="submit">Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered? <Link className="font-semibold text-emerald-700" to="/login">Sign in</Link>
      </p>
    </section>
  );
};

export default RegisterPage;
