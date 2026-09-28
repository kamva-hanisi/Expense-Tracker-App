import { User } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { RootState } from "../../../app/store";
import { ROUTES } from "../../../constants/routes";

const UserMenu = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  return (
    <button
      className="flex items-center gap-3 rounded-lg border border-slate-200 px-2 py-2 transition hover:bg-slate-100 lg:px-4"
      type="button"
      aria-label="Open profile"
      onClick={() => navigate(ROUTES.PROFILE)}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white">
        {user?.avatarData
          ? <img src={user.avatarData} alt="" className="h-full w-full rounded-full object-cover" />
          : <User size={18} />}
      </div>

      <div className="hidden text-left lg:block">
        <h3 className="font-semibold text-slate-950">{user?.name?.split(/\s+/)[0] || "Account"}</h3>
        <p className="text-xs text-slate-500">Personal Account</p>
      </div>
    </button>
  );
};

export default UserMenu;
