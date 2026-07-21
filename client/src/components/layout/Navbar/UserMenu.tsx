import { User } from "lucide-react";

const UserMenu = () => {
  return (
    <button className="flex items-center gap-3 rounded-lg border border-slate-200 px-2 py-2 transition hover:bg-slate-100 lg:px-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
        <User size={18} />
      </div>

      <div className="hidden text-left lg:block">
        <h3 className="font-semibold text-slate-950">Kamva</h3>
        <p className="text-xs text-slate-500">Personal Account</p>
      </div>
    </button>
  );
};

export default UserMenu;
