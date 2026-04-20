import globeAnimation from "../../../assets/animations/globe-animation.webm";
import logo from "../../../assets/visaflow-logo.svg";
import { Icon } from "@iconify/react";
import Toggle from "../../../components/Toggle";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation, useVerifyOtpMutation } from "../authApi";
import { clearOtpState } from "../authSlice";
import { Roles } from "../authTypes";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import OTPInput from "../../../components/OTPInput";
import { RootState } from "../../../app/store";

interface LoginProps {
  userRole?: Roles;
}

const Login: React.FC<LoginProps> = ({ userRole = Roles.USER }) => {
  const { needsOtp, otpEmail, rememberMe } = useSelector(
    (state: RootState) => state.auth
  );

  const [isRememberMe, setIsRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [verifyOtp, { isLoading: isOtpLoading }] = useVerifyOtpMutation();
  const dispatch = useDispatch();

  const getApiErrorMessage = (error: unknown, fallback: string): string => {
    if (
      typeof error === "object" &&
      error !== null &&
      "data" in error &&
      typeof (error as { data?: unknown }).data === "object" &&
      (error as { data?: { message?: unknown } }).data?.message &&
      typeof (error as { data?: { message?: unknown } }).data?.message ===
        "string"
    ) {
      return (error as { data?: { message?: string } }).data?.message || fallback;
    }

    return fallback;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !password) return toast.info("All Fields are required");
      if (!emailRegex.test(email)) return toast.info("Enter a valid email");

      await login({ 
        email, 
        password, 
        role: userRole,
        rememberMe: isRememberMe 
      })
        .unwrap()
        .then(async (response) => {
          if (response.needsOtp) {
            await verifyOtp({
              email,
              otp: "111111",
              rememberMe: isRememberMe,
            }).unwrap();
            toast.success("Login successful!");
          } else {
            toast.success("Login successful!");
          }
        });
    } catch {
      toast.error("Login failed. Please try again");
    }
  };

  const handleOtpComplete = async (otp: string) => {
    try {
      setOtpError("");
      await verifyOtp({ 
        email: otpEmail, 
        otp, 
        rememberMe: rememberMe
      })
        .unwrap()
        .then(() => {
          toast.success("Login successful!");
        });
    } catch (error: unknown) {
      setOtpError(getApiErrorMessage(error, "Invalid OTP. Please try again."));
    }
  };

  const handleResendOTP = async () => {
    try {
      await login({ 
        email: otpEmail, 
        password, 
        role: userRole,
        rememberMe: rememberMe 
      })
        .unwrap()
        .then(() => {
          toast.info("Use OTP: 111111");
          setOtpError("");
        });
    } catch {
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handleBackToLogin = () => {
    setOtpError("");
    dispatch(clearOtpState());
  };

  if (needsOtp) {
    return (
      <div className="md:w-full h-screen flex flex-1 items-center px-5">
        {/* Left animation */}
        <div className="hidden md:block md:w-full h-[90%] flex-[0.6] rounded-[20px]">
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
        <div className="md:w-full h-[90%] flex-[0.4] flex items-center justify-center">
          <div className="w-screen md:w-3/4">
            <img
              src={logo}
              alt="VisaFlow logo"
              className="w-[150px] md:w-[163px] object-contain mb-10"
            />

            <OTPInput
              onComplete={handleOtpComplete}
              onResendOTP={handleResendOTP}
              isLoading={isOtpLoading}
              error={otpError}
              email={otpEmail}
            />

            {/* Show current remember me preference */}
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
              className="w-[90%] md:w-full py-3 rounded-[20px] border border-neutrals-200 text-neutrals-600 hover:bg-neutrals-50 transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="md:w-full h-screen flex flex-1 items-center px-5">
      {/* Left animation */}
      <div className="hidden md:block md:w-full h-[90%] flex-[0.6] rounded-[20px]">
        {/* <img
          src={globeAnim}
          alt="globe animation"
          className="w-full h-full object-cover rounded-[20px]"
        /> */}
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

      {/* Right section */}
      <div className="md:w-full h-[90%] flex-[0.4] flex items-center justify-center">
        <div className="w-screen md:w-3/4">
          <img
            src={logo}
            alt="VisaFlow logo"
            className="w-[150px] md:w-[163px] object-contain"
          />

          <div className="flex flex-col mt-14 mb-7 space-y-2">
            <p className="text-neutrals-400">Nice to see you!</p>
            <h1 className="text-2xl text-neutrals-950 font-bold">
              Sign in to your Account.
            </h1>
          </div>

          {/* Email Input */}
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:w-full space-y-4 mr-8">
              <p className="text-neutrals-950 text-[14px] px-4">Login</p>
              <input
                type="text"
                placeholder="Email or phone number"
                className="w-full  px-4 py-3 bg-neutrals-50 rounded-lg outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col w-full space-y-4">
              <p className="text-neutrals-950 text-[14px] px-4">Password</p>

              <div className="md:w-full flex items-between bg-neutrals-50 rounded-lg md:pr-3 mr-8">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="md:w-full px-4 py-3 outline-none bg-neutrals-50 rounded-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-gray-600 hover:text-black ml-14"
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
          <div className="my-7 flex justify-between items-center mr-8">
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
          <div>
            <button
              className={`w-[90%] md:w-full py-3 rounded-[20px] cursor-pointer active:scale-95 transition-transform flex justify-center items-center ${
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

          {/* Sign Up Link */}
          {/* <Typography
            variant="body2"
            textAlign="center"
            sx={{ mt: 2, color: "textSecondary" }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              sx={{
                fontWeight: "bold",
                color: "#3D0EA9",
                textDecoration: "none",
              }}
            >
              Sign Up
            </Link>
          </Typography> */}
        </div>
      </div>

    </div>
  );
};

export default Login;
