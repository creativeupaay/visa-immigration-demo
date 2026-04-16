import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, loading } = useSelector(
    (state: any) => state.auth
  );

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) {
    return (
      <Navigate
        to={user?.role === "ADMIN" ? "/admin/login" : "/login"}
        replace
      />
    );
  }
  return <>{children}</>;
};

export default ProtectedRoute;
