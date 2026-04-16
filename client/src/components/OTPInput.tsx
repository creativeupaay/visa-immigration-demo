import React, { useState, useRef, useEffect } from "react";
import { CircularProgress } from "@mui/material";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResendOTP?: () => void;
  isLoading?: boolean;
  error?: string;
  email?: string;
  className?: string;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onResendOTP,
  isLoading = false,
  error,
  email,
  className = "",
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next input if current field is filled
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all fields are filled
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === length) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      
      if (otp[index]) {
        // Clear current field
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move to previous field and clear it
        inputRefs.current[index - 1]?.focus();
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedDigits = pastedData.replace(/\D/g, "").slice(0, length);
    
    if (pastedDigits.length === length) {
      const newOtp = pastedDigits.split("");
      setOtp(newOtp);
      onComplete(pastedDigits);
    }
  };

  const handleResendOTP = () => {
    if (resendTimer === 0 && onResendOTP) {
      onResendOTP();
      setResendTimer(60); // 60 seconds timer
      setOtp(new Array(length).fill("")); // Clear OTP inputs
      inputRefs.current[0]?.focus(); // Focus first input
    }
  };

  return (
    <div className={`flex flex-col space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col space-y-2 text-center">
        <h2 className="text-2xl font-semibold text-neutrals-950">
          Verify Your Email
        </h2>
        <p className="text-neutrals-400 text-sm">
          We've sent a 6-digit verification code to
        </p>
        {email && (
          <p className="text-neutrals-600 font-medium text-sm">{email}</p>
        )}
      </div>

      {/* OTP Input Fields */}
      <div className="flex justify-center space-x-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={index === 0 ? handlePaste : undefined}
            className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg outline-none transition-colors
              ${error 
                ? "border-red-400 bg-red-50" 
                : digit 
                ? "border-golden-yellow-400 bg-golden-yellow-50" 
                : "border-neutrals-200 bg-neutrals-50"
              }
              focus:border-golden-yellow-400 focus:bg-golden-yellow-50
            `}
            disabled={isLoading}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      {/* Resend OTP */}
      <div className="text-center">
        <p className="text-neutrals-400 text-sm mb-2">
          Didn't receive the code?
        </p>
        <button
          onClick={handleResendOTP}
          disabled={resendTimer > 0 || isLoading}
          className={`text-sm font-medium transition-colors ${
            resendTimer > 0 || isLoading
              ? "text-neutrals-300 cursor-not-allowed"
              : "text-golden-yellow-400 hover:text-golden-yellow-500 cursor-pointer"
          }`}
        >
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center">
          <CircularProgress size={24} sx={{ color: "#F59E0B" }} />
        </div>
      )}
    </div>
  );
};

export default OTPInput;
