import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { loginUser } from "../features/auth/authSlice";
import Footer from "../components/Footer";

const inputClass =
  "w-full border border-[#d8dfd6] bg-[#fbfcfa] p-3 rounded-md mb-4 outline-none focus:border-[#47745d] focus:ring-2 focus:ring-[#47745d]/15";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  useEffect(() => {
    if (user) {
      toast.success("Login successful");
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f4] text-[#202722]">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg border border-[#dfe6dc] shadow-sm w-full max-w-md"
        >
          <h2 className="text-3xl font-semibold mb-6 text-center">Login</h2>

          {error && <p className="text-[#8a3b2f] mb-4">{error}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
          />

          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={inputClass}
          />

          <label className="mb-4 flex items-center gap-2 text-sm text-[#4f5f54]">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 accent-[#315c48]"
            />
            Show password
          </label>

          <button
            type="submit"
            className="w-full bg-[#315c48] hover:bg-[#274a3a] text-white p-3 rounded-md transition"
          >
            {loading ? "Loading..." : "Login"}
          </button>

          <p className="mt-4 text-center text-[#66736a]">
            Don't have an account?
            <Link to="/register" className="text-[#315c48] font-medium ml-2">
              Register
            </Link>
          </p>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
