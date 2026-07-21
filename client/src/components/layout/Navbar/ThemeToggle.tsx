import { Moon } from "lucide-react";

const ThemeToggle = () => {
  return (
    <button
      className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100"
      title="Theme"
    >
      <Moon size={20} />
    </button>
  );
};

export default ThemeToggle;
