import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

import type { RootState } from "../../app/store";
import { ROUTES } from "../../constants/routes";

const PublicRoute = () => {
	const token = useSelector((state: RootState) => state.auth.user?.token);

	return typeof token === "string" && token.length > 0
		? <Navigate to={ROUTES.HOME} replace />
		: <Outlet />;
};

export default PublicRoute;
