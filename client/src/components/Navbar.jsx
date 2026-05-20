import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../features/auth/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="bg-[#23352d] text-white px-6 py-4 flex justify-between items-center shadow-sm">
      <h1 className="text-2xl font-semibold tracking-normal">
        Expense Tracker
      </h1>

      <button
        onClick={handleLogout}
        className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md border border-white/15 transition"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
