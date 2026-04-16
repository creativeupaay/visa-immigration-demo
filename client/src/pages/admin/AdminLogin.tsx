import globeAnimation from "../../assets/animations/globe-animation.webm";
import logo from "../../assets/logo.png";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { CircularProgress } from "@mui/material";
import { RootState } from "../../app/store";
import { Roles } from "../../features/auth/authTypes";
import { useLoginMutation, useVerifyOtpMutation } from "../../features/auth/authApi";
import { clearOtpState } from "../../features/auth/authSlice";
import Toggle from "../../components/Toggle";
import OTPInput from "../../components/OTPInput";
import { toast } from "react-toastify";

const AdminLogin = () => {
  const { user, isAuthenticated, needsOtp, otpEmail, rememberMe } = useSelector(
    (state: RootState) => state.auth
  );

  const [isRememberMe, setIsRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyOtp, { isLoading: isOtpLoading }] = useVerifyOtpMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.role === Roles.USER) {
      navigate("/dashboard");
    }
    if (user?.role === Roles.ADMIN) {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !password) return toast.info("All Fields are required");
      if (!emailRegex.test(email)) return toast.error("Enter a valid email");

      await login({ email, password, role: Roles.ADMIN, rememberMe: isRememberMe })
        .unwrap()
        .then((response) => {
          if (response.needsOtp) {
            toast.info("OTP sent to your email");
          } else {
            toast.success("Login successful! Welcome Admin");
          }
        });
    } catch (error: any) {
      toast.error(error?.data?.message || "Login failed.");
    }
  };

  const handleOtpComplete = async (otp: string) => {
    try {
      setOtpError("");
      await verifyOtp({ 
        email: otpEmail, 
        otp, 
        rememberMe: rememberMe // Use the stored rememberMe preference
      })
        .unwrap()
        .then(() => {
          toast.success("Login successful! Welcome Admin");
        });
    } catch (error: any) {
      setOtpError(error?.data?.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    try {
      await login({ email: otpEmail, password, role: Roles.ADMIN, rememberMe: rememberMe })
        .unwrap()
        .then(() => {
          toast.info("OTP resent to your email");
          setOtpError("");
        });
    } catch (error: any) {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handleBackToLogin = () => {
    // Reset OTP state and go back to login form
    setOtpError("");
    dispatch(clearOtpState());
  };

  if (needsOtp) {
    return (
      <div className="w-full h-screen flex flex-col md:flex-row items-center justify-center px-5">
        {/* Left animation - hidden on small screens */}
        <div className="hidden md:flex md:w-full h-[90%] flex-[0.6] rounded-[20px]">
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

        {/* Right section - OTP verification */}
        <div className="w-full h-full md:h-[90%] md:flex-[0.4] flex items-center justify-center">
          <div className="w-full sm:w-4/5 md:w-3/4 max-w-[400px]">
            <img
              src={logo}
              alt="E360 logo"
              className="w-[130px] md:w-[163px] object-contain mb-10"
            />

            <OTPInput
              onComplete={handleOtpComplete}
              onResendOTP={handleResendOTP}
              isLoading={isOtpLoading}
              error={otpError}
              email={otpEmail}
            />

            {/* Remember Me for trusted device - show current preference */}
            <div className="my-6 flex justify-center items-center">
              <div className="flex items-center space-x-2">
                <Toggle isToggled={rememberMe} setIsToggled={() => {}} />
                <p className="text-neutrals-950 text-xs">
                  {rememberMe ? "Will remember this device" : "Won't remember this device"}
                </p>
              </div>
            </div>

            {/* Back to Login */}
            <button
              onClick={handleBackToLogin}
              className="w-full py-3 rounded-[20px] border border-neutrals-200 text-neutrals-600 hover:bg-neutrals-50 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col md:flex-row items-center justify-center px-5">
      {/* Left animation - hidden on small screens */}
      <div className="hidden md:flex md:w-full h-[90%] flex-[0.6] rounded-[20px]">
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

      {/* Right section - full width on mobile */}
      <div className="w-full h-full md:h-[90%] md:flex-[0.4] flex items-center justify-center">
        <div className="w-full sm:w-4/5 md:w-3/4 max-w-[400px]">
          <img
            src={logo}
            alt="E360 logo"
            className="w-[130px] md:w-[163px] object-contain"
          />

          <div className="flex flex-col mt-10 md:mt-14 mb-7 space-y-2">
            <p className="text-neutrals-400">Nice to see you!</p>
            <h1 className="text-2xl text-neutrals-950">
              Sign in to your Account
            </h1>
          </div>

          {/* Email Input */}
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-4">
              <p className="text-neutrals-950 text-xs px-2">Login</p>
              <input
                type="text"
                placeholder="Email or phone number"
                className="w-full px-4 py-3 bg-neutrals-50 rounded-lg outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col space-y-4">
              <p className="text-neutrals-950 text-xs px-2">Password</p>
              <div className="w-full flex items-center bg-neutrals-50 rounded-lg pr-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-4 py-3 outline-none bg-neutrals-50"
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
                </button>
              </div>
            </div>
          </div>

          {/* Remember Me + Forgot Password */}
          <div className="my-6 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Toggle isToggled={isRememberMe} setIsToggled={setIsRememberMe} />
              <p className="text-neutrals-950 text-xs">Remember me</p>
            </div>
            <a href="/forgot-password">
              <button className="text-xs text-neutrals-400 cursor-pointer">
                Forgot password
              </button>
            </a>
          </div>

          {/* Sign In Button */}
          <button
            className={`w-full py-3 rounded-[20px] cursor-pointer active:scale-95 transition-transform flex justify-center items-center ${
              isLoginLoading ? "bg-gray-400" : "bg-golden-yellow-400"
            }`}
            onClick={handleLogin}
            disabled={isLoginLoading}
          >
            {isLoginLoading ? (
              <CircularProgress size={22} sx={{ color: "#fff" }} />
            ) : (
              "Sign In"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
