import logo from "../../../assets/logo.png";
import globeAnimation from "../../../assets/animations/globe-animation.webm";
import { Icon } from "@iconify/react";
import Toggle from "../../../components/Toggle";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../authApi";
import { Roles } from "../authTypes";
import { CircularProgress, Link, Typography } from "@mui/material";
import { toast } from "react-toastify";

const Register = () => {
  const [isRememberMe, setIsRememberMe] = useState<boolean>(false);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const navigate = useNavigate();
  const [password, setPassword] = useState<string>("");

  const [register, { isLoading }] = useRegisterMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await register({ email, password, role: Roles.USER }).unwrap();
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="w-full h-screen flex flex-1  items-center px-5">
      {/* Left animation */}
      <div className="w-full h-[90%] flex-[0.6] rounded-[20px]">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover rounded-[20px]"
        >
          <source src={globeAnimation} type="video/webm" />
        </video>
      </div>

      {/* Right animation */}
      <div className="w-full h-[90%] flex-[0.4] flex items-center justify-center">
        <div className="w-3/4">
          <img
            src={logo}
            alt="E360 logo"
            className="w-[163px] object-contain"
          />

          <div className="flex flex-col mt-14  mb-7 space-y-2">
            <p className="text-neutrals-400">Nice to see you!</p>
            <h1 className="text-2xl text-neutrals-950">
              Sign up to create your account
            </h1>
          </div>

          {/* Input fields for email and password */}
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col w-full space-y-4">
              <p className="text-neutrals-950 text-xs px-4">Register</p>
              <input
                type="text"
                placeholder="Email or phone number"
                className="w-full px-4 py-3 bg-neutrals-50 rounded-lg outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col w-full space-y-4">
              <p className="text-neutrals-950 text-xs px-4">Password</p>

              <div className="w-full flex items-center bg-neutrals-50 rounded-lg pr-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-3  outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-600 hover:text-black"
                >
                  <Icon
                    icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                    width="24"
                    height="24"
                  />
                </button>{" "}
              </div>
            </div>
          </div>

          {/* remember me and forgot password buttons */}
          <div className="my-7 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Toggle isToggled={isRememberMe} setIsToggled={setIsRememberMe} />
              <p className="text-neutrals-950 text-xs">Remember me</p>
            </div>

            {/* <button className="text-xs text-neutrals-400 cursor-pointer">
              Forgot password
            </button> */}
          </div>

          <button
            className={`w-full py-3 rounded-[20px] cursor-pointer active:scale-95 transition-transform flex justify-center items-center ${
              isLoading ? "bg-gray-400" : "bg-golden-yellow-400"
            }`}
            onClick={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Sign Up"
            )}
          </button>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{
              mt: 2,
              color: "textSecondary",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              sx={{
                fontWeight: "bold",
                color: "#3D0EA9",
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default Register;
