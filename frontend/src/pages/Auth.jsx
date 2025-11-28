import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Loading from "../components/Loading";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const nav = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        { email, password }
      );

      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        toast.success("Logged in successfully!");
        setTimeout(() => nav("/dashboard"), 600);
      } else {
        toast.error("Invalid email or password");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        { name, email, password }
      );

      if (res.data?.otpSent) {
        localStorage.setItem("emailForOtp", email);
        toast.success("OTP sent! Please verify your email.");
        setTimeout(() => nav("/verify-otp"), 600);
      }

      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        toast.success("Account created successfully!");
        setTimeout(() => nav("/dashboard"), 600);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    window.location.href = `${
      import.meta.env.VITE_BACKEND_URL
    }/api/auth/google`;
  };

  if (loading) return <Loading />;

  return (
    <div
      className="
        flex items-center justify-center min-h-screen 
        bg-gradient-to-b from-purple-50 to-purple-100 
        dark:from-[#0A0E27] dark:to-[#1A1C3A]
        mt-[70px]
      "
    >
      <div
        className="
          bg-white dark:bg-[#0F112B] 
          p-8 rounded-2xl shadow-xl border border-purple-200 
          dark:border-purple-500/30
          w-full max-w-md ml-4 mr-4
        "
      >
        <h2
          className="
            text-3xl font-extrabold text-center mb-6
            bg-gradient-to-r from-purple-600 to-purple-400 
            bg-clip-text text-transparent
          "
        >
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.includes("@") || !email.includes(".")) {
              toast.error("Please enter a valid email address");
              return;
            }
            mode === "login" ? handleLogin(e) : handleSignup(e);
          }}
          className="space-y-4"
        >
          {mode === "register" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="
                w-full p-3 border rounded-lg bg-white 
                dark:bg-[#1A1C3A] dark:text-white dark:border-gray-600
                focus:ring-2 focus:ring-purple-400 outline-none
              "
            />
          )}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            type="email"
            className="
              w-full p-3 border rounded-lg bg-white 
              dark:bg-[#1A1C3A] dark:text-white dark:border-gray-600
              focus:ring-2 focus:ring-purple-400 outline-none
            "
            required
          />

          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              className="
                w-full p-3 border rounded-lg bg-white 
                dark:bg-[#1A1C3A] dark:text-white dark:border-gray-600
                focus:ring-2 focus:ring-purple-400 outline-none pr-10
              "
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="
                absolute right-3 top-1/2 transform -translate-y-1/2 
                text-gray-500 dark:text-gray-300 cursor-pointer
              "
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button
            type="submit"
            className="
              w-full px-4 py-3 text-white font-semibold rounded-lg 
              bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg 
              transition-all
            "
          >
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <button
          onClick={handleGoogleSignIn}
          className="
            w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 
            border rounded-lg shadow hover:shadow-md transition-all 
            bg-purple-600 hover:bg-purple-700
          "
        >
          <FcGoogle className="text-2xl" />
          {mode === "login" ? (
            <span className="font-semibold text-white">
              Sign in with Google
            </span>
          ) : (
            <span className="font-semibold text-white">
              Sign up with Google
            </span>
          )}
        </button>

        <p className="text-sm mt-4 text-center text-gray-600 dark:text-gray-300">
          {mode === "login" ? "New here?" : "Already a member?"}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-purple-600 font-semibold hover:underline"
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
