// import { Roles } from "@/features/auth/authTypes";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Roles } from "../../features/auth/authTypes";
import { RootState } from "../../app/store";
// import Login from "../admin/Login";
import Register from "../../features/auth/components/Register";
import Login from "../../features/auth/components/Login";

const AuthPage = ({ mode }: { mode: "SIGN_IN" | "SIGN_UP" }) => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === Roles.USER) {
      navigate("/dashboard");
    }
    if (user?.role === Roles.ADMIN) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, user]);

  return (
    <div>
      {mode === "SIGN_IN" ? (
        <Login />
      ) : mode === "SIGN_UP" ? (
        <Register />
      ) : null}
    </div>
  );
};

export default AuthPage;
