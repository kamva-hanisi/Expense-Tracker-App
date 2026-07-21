import { NavLink } from "react-router-dom";
import type { NavigationItem } from "../../../constants/navigation";

interface SidebarItemProps {
  item: NavigationItem;
}

const SidebarItem = ({ item }: SidebarItemProps) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex min-w-16 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs transition-all duration-200 lg:mb-2 lg:min-w-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-3 lg:text-sm ${
          isActive
            ? "bg-emerald-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100"
        }`
      }
    >
      <Icon size={20} />
      <span className="max-w-16 truncate font-medium lg:max-w-none">{item.label}</span>
    </NavLink>
  );
};

export default SidebarItem;
