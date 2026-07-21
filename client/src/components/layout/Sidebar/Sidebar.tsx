import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";
import SidebarItem from "./SidebarItem";

import { navigation } from "../../../constants/navigation";

const Sidebar = () => {
  return (
    <aside className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white lg:bottom-auto lg:right-auto lg:top-0 lg:flex lg:h-screen lg:w-72 lg:flex-col lg:border-r lg:border-t-0">
      <SidebarHeader />

      <nav className="flex items-center gap-1 overflow-x-auto p-2 lg:block lg:flex-1 lg:overflow-y-auto lg:p-4">
        {navigation.map((item) => (
          <SidebarItem key={item.path} item={item} />
        ))}
      </nav>

      <div className="hidden border-t border-slate-200 p-4 lg:block">
        <SidebarFooter />
      </div>
    </aside>
  );
};

export default Sidebar;
