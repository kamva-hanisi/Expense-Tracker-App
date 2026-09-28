import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import type { RootState } from "../../app/store";
import { ROUTES } from "../../constants/routes";

const ProtectedRoute = () => {
	const token = useSelector((state: RootState) => state.auth.user?.token);
	const location = useLocation();

	if (typeof token !== "string" || token.length === 0) {
		return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
