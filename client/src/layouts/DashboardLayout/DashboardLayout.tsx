import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Sidebar */}
      <aside className="hidden">
        Sidebar
      </aside>

      {/* Main Content */}
      <main>
        {/* Navbar */}
        <header>
          Navbar
        </header>

        {/* Page */}
        <section className="p-6">
          <Outlet />
        </section>
      </main>

    </div>
  );
};

export default DashboardLayout;