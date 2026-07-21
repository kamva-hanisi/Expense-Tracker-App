import { LogOut } from "lucide-react";

const SidebarFooter = () => {
  return (
    <button
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-500 transition hover:bg-red-50"
    >
      <LogOut size={20} />
      Logout
    </button>
  );
};

export default SidebarFooter;