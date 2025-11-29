import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import { Navbar } from "./components/Navbar";
import OTPVerification from "./pages/OTPVerification";
import { useAuth } from "./context/AuthContext";
import GoogleSuccess from "./components/GoogleSuccess";
import { Toaster } from "react-hot-toast";

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const { user, loading } = useAuth();
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100">
      <Toaster position="top-center" />
      <Navbar theme={theme} setTheme={setTheme} />
      <main className="max-w-8xl bg-white dark:bg-black">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/google-success" element={<GoogleSuccess />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route
            path="/dashboard"
            element={
              isLoggedIn ? <Dashboard theme={theme} /> : <Navigate to="/auth" />
            }
          />
          <Route
            path="/analytics"
            element={
              isLoggedIn ? <Analytics theme={theme} /> : <Navigate to="/auth" />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
