import { WalletCards } from "lucide-react";

const Logo = () => {
  return (
    <div className="flex items-center gap-3 px-6 py-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
        <WalletCards size={22} />
      </div>

      <div>
        <h1 className="text-lg font-bold text-slate-900">Expense Tracker Pro</h1>
        <p className="text-xs text-slate-500">Smart Finance Manager</p>
      </div>
    </div>
  );
};

export default Logo;
