import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import AuthLayout from "../../layouts/AuthLayout";

import Dashboard from "../../pages/Dashboard";
import History from "../../pages/History";
import ReceiptScanner from "../../pages/ReceiptScanner";
import Budgets from "../../pages/Budgets";
import Savings from "../../pages/Savings";
import Reports from "../../pages/Reports";
import Profile from "../../pages/Profile";
import Settings from "../../pages/Settings";
import Login from "../../pages/Login";
import Register from "../../pages/Register";
import NotFound from "../../pages/NotFound";

import { ROUTES } from "../../constants/routes";

const AppRouter = () => {
  return (
      <Routes>

        {/* Public */}

        <Route element={<AuthLayout />}>

          <Route
            path={ROUTES.LOGIN}
            element={<Login />}
          />

          <Route
            path={ROUTES.REGISTER}
            element={<Register />}
          />

        </Route>

        {/* Private */}

        <Route element={<DashboardLayout />}>

          <Route
            path={ROUTES.HOME}
            element={<Dashboard />}
          />

          <Route
            path={ROUTES.HISTORY}
            element={<History />}
          />

          <Route
            path={ROUTES.RECEIPTS}
            element={<ReceiptScanner />}
          />

          <Route
            path={ROUTES.BUDGETS}
            element={<Budgets />}
          />

          <Route
            path={ROUTES.SAVINGS}
            element={<Savings />}
          />

          <Route
            path={ROUTES.REPORTS}
            element={<Reports />}
          />

          <Route
            path={ROUTES.PROFILE}
            element={<Profile />}
          />

          <Route
            path={ROUTES.SETTINGS}
            element={<Settings />}
          />

          <Route path="*" element={<NotFound />} />

        </Route>

      </Routes>
  );
};

export default AppRouter;
