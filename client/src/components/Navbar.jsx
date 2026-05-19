import { useDispatch } from "react-redux";

import { logout } from "../features/auth/authSlice";

import { useNavigate } from "react-router-dom";


const Navbar = () => {

  const dispatch = useDispatch();

  const navigate = useNavigate();


  const handleLogout = () => {

    dispatch(logout());

    navigate("/login");
  };


  return (
    <nav className="bg-black text-white px-6 py-4 flex justify-between items-center">

      <h1 className="text-2xl font-bold">
        Expense Tracker 💰
      </h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 px-4 py-2 rounded-lg"
      >
        Logout
      </button>

    </nav>
  );
};

export default Navbar;