import { LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { AppDispatch } from "../../../app/store";
import { logout } from "../../../features/auth/authSlice";
import { ROUTES } from "../../../constants/routes";

const SidebarFooter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  return (
    <button
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-500 transition hover:bg-red-50"
      onClick={() => {
        dispatch(logout());
        navigate(ROUTES.LOGIN, { replace: true });
      }}
    >
      <LogOut size={20} />
      Logout
    </button>
  );
};

export default SidebarFooter;