import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminRoutes from "./pages/admin/AdminRoutes";
import CustomerRoutes from "./pages/customer/CustomerRoutes";
import ProtectedRoute from "./utils/ProtectedRoute";
import AuthPage from "./pages/auth/AuthPage";
import AdminLogin from "./pages/admin/AdminLogin";
import ForgotPassword from "./features/auth/components/ForgotPassword";
import ResetPassword from "./features/auth/components/ResetPasword";
import ClientPaymentComponent from "./components/ClientPaymentComponent";
import DemoLeadFormPage from "./pages/public/DemoLeadFormPage";
import DemoReadinessPage from "./pages/public/DemoReadinessPage";
import MockCalendlyPage from "./pages/public/MockCalendlyPage";
import MockPaymentPage from "./pages/public/MockPaymentPage";
import MockInvoicePage from "./pages/public/MockInvoicePage";
import { useFetchUserQuery } from "./features/auth/authApi";
import { RootState } from "./app/store";
import { useSelector } from "react-redux";
import { CircularProgress } from "@mui/material";
import DemoHelpButton from "./components/DemoHelpButton";

/**
 * PUBLIC_PATHS: routes where we skip the fetchUser query.
 * This prevents unnecessary 401 errors on the login page
 * which would otherwise spam the console and potentially trigger
 * the refresh flow on pages that don't need auth.
 */
const PUBLIC_PATHS = [
  "/login",
  "/admin/login",
  "/forgot-password",
  "/reset-password",
  "/demo",
  "/mock",
  "/payments",
];

const AppContent = () => {
  const location = useLocation();
  const isPublicRoute = PUBLIC_PATHS.some((p) =>
    location.pathname.startsWith(p)
  );

  // Skip fetchUser on public pages — avoids 401 spam on the login screen.
  // On protected pages, this runs once on mount to restore session from cookie.
  const { isLoading } = useFetchUserQuery(undefined, {
    skip: isPublicRoute,
  });
  const { loading } = useSelector((state: RootState) => state.auth);

  // Only block rendering while the session check is in-flight (first load on protected page)
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <DemoHelpButton />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage mode="SIGN_IN" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/payments/:leadId" element={<ClientPaymentComponent />} />
        <Route path="/demo/lead-form" element={<DemoLeadFormPage />} />
        <Route path="/demo/readiness" element={<DemoReadinessPage />} />
        <Route path="/mock/calendly" element={<MockCalendlyPage />} />
        <Route path="/mock/payment" element={<MockPaymentPage />} />
        <Route path="/mock/invoice" element={<MockInvoicePage />} />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />

        {/* Protected Customer routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <CustomerRoutes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
