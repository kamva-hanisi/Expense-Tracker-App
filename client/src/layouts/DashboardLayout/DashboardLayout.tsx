import { Outlet } from "react-router-dom";

import Navbar from "../../components/layout/Navbar";
import Sidebar from "../../components/layout/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:ml-72">
        <Navbar />

        <main className="px-4 py-6 pb-28 sm:px-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
