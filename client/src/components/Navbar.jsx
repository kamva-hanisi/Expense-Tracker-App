import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../features/auth/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const profile = user?.user || user;
  const username = profile?.username || profile?.name || "there";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <>
      <nav className="bg-[#23352d] text-white px-6 py-4 flex items-center justify-between shadow-sm">
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

      <section className="border-b border-[#dfe6dc] bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <p className="text-base font-semibold text-[#23352d]">
            Welcome, {username}
          </p>
          <p className="mt-1 max-w-2xl text-sm text-[#66736a]">
            Add your income and expenses, then review your balance and spending
            summary.
          </p>
        </div>
      </section>
    </>
  );
};

export default Navbar;
