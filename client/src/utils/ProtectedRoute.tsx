import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

/**
 * ProtectedRoute — guards authenticated routes.
 *
 * Auth state is managed by `useFetchUserQuery` in AppContent (App.tsx).
 * By the time this component renders, the session check is complete
 * (App.tsx waits for isLoading before rendering routes).
 * So we can safely redirect based on isAuthenticated here.
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();

  // If auth state is still settling, render nothing (spinner shown in App.tsx)
  if (loading) return null;

  if (!isAuthenticated) {
    const isAdminRoute = location.pathname.startsWith("/admin");
    const redirectTo =
      isAdminRoute || user?.role === "ADMIN" ? "/admin/login" : "/login";
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
