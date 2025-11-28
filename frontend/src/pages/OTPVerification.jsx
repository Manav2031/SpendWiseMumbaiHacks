import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const inputsRef = useRef([]);
  const nav = useNavigate();
  const email = localStorage.getItem("emailForOtp");

  if (!email) nav("/auth");

  useEffect(() => {
    const otpExpiry = localStorage.getItem("otpExpiry");
    if (otpExpiry) {
      const remaining = Math.floor((parseInt(otpExpiry) - Date.now()) / 1000);
      setTimer(remaining > 0 ? remaining : 0);
    } else {
      const expiry = Date.now() + 60 * 1000;
      localStorage.setItem("otpExpiry", expiry.toString());
      setTimer(60);
    }
  }, []);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e, idx) => {
    const value = e.target.value.replace(/\D/, "");
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < otp.length - 1) inputsRef.current[idx + 1].focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      toast.error("Please enter the full 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`,
        { email, otp: enteredOtp }
      );

      if (res.data?.verified) {
        toast.success("✅ Email verified! Redirecting to login...");
        localStorage.removeItem("emailForOtp");
        localStorage.removeItem("otpExpiry");
        setTimeout(() => nav("/auth"), 2000);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/resend-otp`,
        { email }
      );
      if (res.data?.otpSent) {
        toast.success("✨ OTP resent successfully!");
        const expiry = Date.now() + 60 * 1000;
        localStorage.setItem("otpExpiry", expiry.toString());
        setTimer(60);
      }
    } catch (err) {
      toast.error("Failed to resend OTP. Try again later.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      className="
      flex items-center justify-center min-h-screen 
      bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 
      dark:from-[#0A0E27] dark:via-[#111533] dark:to-[#1A1C3A]
      mt-[70px]
    "
    >
      <div
        className="
        bg-white dark:bg-[#0F112B]
        p-8 rounded-2xl shadow-xl 
        border border-purple-200 dark:border-purple-500/30 
        w-full max-w-md
        "
      >
        <h2
          className="
          text-3xl font-bold text-center mb-6
          bg-gradient-to-r from-purple-600 to-purple-400 
          bg-clip-text text-transparent
        "
        >
          Verify Your Email
        </h2>

        <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
          Enter the 6-digit OTP sent to{" "}
          <span className="font-semibold">{email}</span>
        </p>

        <form
          onSubmit={handleVerify}
          className="flex justify-center gap-2 mb-4"
        >
          {otp.map((digit, idx) => (
            <input
              key={idx}
              type="text"
              maxLength="1"
              value={digit}
              ref={(el) => (inputsRef.current[idx] = el)}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="
                w-12 h-12 text-center border rounded-lg text-lg font-semibold
                bg-white dark:bg-[#1A1C3A]
                text-black dark:text-white
                border-gray-300 dark:border-gray-600
                focus:ring-2 focus:ring-purple-400 
                outline-none transition
              "
            />
          ))}
        </form>

        <button
          onClick={handleVerify}
          className="
            w-full px-4 py-3 text-white font-semibold rounded-lg
            bg-purple-600 hover:bg-purple-700 
            shadow-md hover:shadow-lg transition-all mb-4
          "
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center">
          <button
            onClick={handleResend}
            className="
              text-purple-600 dark:text-purple-400 
              font-semibold hover:underline
            "
            disabled={timer > 0 || resendLoading}
          >
            {resendLoading
              ? "Resending..."
              : timer > 0
              ? `Resend OTP in ${timer}s`
              : "Resend OTP"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 dark:text-red-400 mt-4 text-center">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-600 dark:text-green-400 mt-4 text-center">
            {success}
          </p>
        )}
      </div>
    </div>
  );
}
