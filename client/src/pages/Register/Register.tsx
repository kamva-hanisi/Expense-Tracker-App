import { useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, RefreshCw, User, WalletCards } from "lucide-react";

import type { AppDispatch, RootState } from "../../app/store";
import Button from "../../components/ui/Button";
import { registerUser } from "../../features/auth/authSlice";
import { ROUTES } from "../../constants/routes";

const passwordGroups = [
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "abcdefghijkmnopqrstuvwxyz",
  "23456789",
  "!@#$%&*?",
];
const passwordCharacters = passwordGroups.join("");

const randomIndex = (length: number) =>
  crypto.getRandomValues(new Uint32Array(1))[0]! % length;

const generatePassword = () => {
  const characters = passwordGroups.map((group) => group[randomIndex(group.length)]!);
  while (characters.length < 16) {
    characters.push(passwordCharacters[randomIndex(passwordCharacters.length)]!);
  }
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex]!, characters[index]!];
  }
  return characters.join("");
};

const getPasswordStrength = (value: string) => {
  if (!value) return null;
  const score = [
    value.length >= 8,
    value.length >= 12,
    /[a-z]/.test(value),
    /[A-Z]/.test(value),
    /\d/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", textColor: "text-red-600", bars: 1 };
  if (score <= 4) return { label: "Medium", color: "bg-orange-500", textColor: "text-orange-600", bars: 2 };
  return { label: "Strong", color: "bg-emerald-600", textColor: "text-emerald-700", bars: 3 };
};

const RegisterPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.auth.loading);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    try {
      await dispatch(registerUser({ name, email, password })).unwrap();
      navigate(ROUTES.HOME, { replace: true });
    } catch (error) {
      setFormError(typeof error === "string" ? error : "Unable to create your account. Please try again.");
    }
  };

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

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Full name</span>
          <span className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
            <User size={18} className="text-slate-400" />
            <input
              className="w-full outline-none"
              placeholder="Kamva Hanisi"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <span className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
            <Mail size={18} className="text-slate-400" />
            <input
              type="email"
              className="w-full outline-none"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Password</span>
          <span className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
            <LockKeyhole size={18} className="text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full outline-none"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="text-slate-400 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>

        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-[10px] font-semibold leading-3 text-emerald-700 hover:text-emerald-800"
              style={{ fontSize: "10px", lineHeight: "12px", padding: 0 }}
              onClick={() => setPassword(generatePassword())}
            >
              <RefreshCw size={11} />
              Generate password
            </button>
            {passwordStrength && (
              <span className={`text-[10px] font-semibold leading-3 ${passwordStrength.textColor}`} aria-live="polite">
                {passwordStrength.label}
              </span>
            )}
          </div>
          {passwordStrength && (
            <div
              className="grid grid-cols-3 gap-1"
              role="meter"
              aria-label="Password strength"
              aria-valuemin={1}
              aria-valuemax={3}
              aria-valuenow={passwordStrength.bars}
              aria-valuetext={passwordStrength.label}
            >
              {[1, 2, 3].map((bar) => (
                <span
                  key={bar}
                  className={`h-0.5 rounded-full ${bar <= passwordStrength.bars ? passwordStrength.color : "bg-slate-200"}`}
                />
              ))}
            </div>
          )}
        </div>

        {formError && <p className="text-sm text-red-600" role="alert">{formError}</p>}
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered? <Link className="font-semibold text-emerald-700" to="/login">Sign in</Link>
      </p>
    </section>
  );
};

export default RegisterPage;
