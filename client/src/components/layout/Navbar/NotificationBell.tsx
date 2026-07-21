import { Bell } from "lucide-react";

const NotificationBell = () => {
  return (
    <button
      className="relative rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100"
      title="Notifications"
    >
      <Bell size={20} />
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-500" />
    </button>
  );
};

export default NotificationBell;
