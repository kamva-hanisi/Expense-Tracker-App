import { Search } from "lucide-react";

const NavbarSearch = () => {
  return (
    <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2 lg:flex">
      <Search className="text-slate-400" size={18} />
      <input
        type="text"
        placeholder="Search transactions"
        className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  );
};

export default NavbarSearch;
