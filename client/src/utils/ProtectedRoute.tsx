import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useSelector(
    (state: any) => state.auth
  );
  const location = useLocation();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) {
    const isAdminRoute = location.pathname.startsWith("/admin");

    return (
      <Navigate
        to={isAdminRoute || user?.role === "ADMIN" ? "/admin/login" : "/login"}
        replace
      />
    );
  }
  return <>{children}</>;
};

export default ProtectedRoute;
