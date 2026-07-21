import NavbarSearch from "./NavbarSearch";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:min-h-20 lg:px-8">
      <div>
        <h1 className="text-lg font-bold text-slate-950 sm:text-2xl">Dashboard</h1>
        <p className="hidden text-sm text-slate-500 sm:block">
          Welcome back. Your money snapshot is ready.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 lg:gap-4">
        <NavbarSearch />
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
};

export default Navbar;
