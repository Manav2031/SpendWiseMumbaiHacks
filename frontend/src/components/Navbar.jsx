import React, { useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Navbar({ theme, setTheme }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="font-noto bg-white dark:bg-gray-900 shadow-sm backdrop-blur-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo (similar to BizBud style) */}
        <Link
          to="/"
          className="font-crimson text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          SpendWise
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-10">
          {user ? (
            <Link
              to="/"
              className="cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
            >
              Home
            </Link>
          ) : (
            <ScrollLink
              to="home"
              smooth={true}
              duration={500}
              offset={-80}
              className="cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
            >
              Home
            </ScrollLink>
          )}

          {/* Logged-in Menu */}
          {user && (
            <>
              <Link
                to="/dashboard"
                className="text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                Dashboard
              </Link>

              <Link
                to="/analytics"
                className="text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                Analytics
              </Link>
            </>
          )}

          {/* Public Menu (shown only when NOT logged in) */}
          {!user && (
            <>
              <ScrollLink
                to="services"
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                Services
              </ScrollLink>

              <ScrollLink
                to="about"
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                About
              </ScrollLink>

              <ScrollLink
                to="testimonials"
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                Testimonials
              </ScrollLink>

              <ScrollLink
                to="contact"
                smooth={true}
                duration={500}
                offset={-80}
                className="cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                Contact
              </ScrollLink>
            </>
          )}
        </div>

        {/* Right Side Buttons */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Hi,{" "}
                {user?.name
                  ? user.name.split(" ")[0]
                  : user?.email?.split("@")[0]}
              </span>

              <button
                onClick={logout}
                className="px-5 py-2 bg-purple-600 text-white text-sm rounded-full shadow-md hover:bg-purple-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="px-6 py-2 bg-purple-600 text-white text-sm rounded-full shadow-md hover:bg-purple-700 transition"
            >
              Sign In
            </button>
          )}

          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-800 dark:text-gray-200"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-900 px-6 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
          {user ? (
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="block cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
            >
              Home
            </Link>
          ) : (
            <ScrollLink
              to="home"
              smooth={true}
              duration={500}
              offset={-80}
              onClick={() => setOpen(false)}
              className="block cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
            >
              Home
            </ScrollLink>
          )}

          {/* Logged-in Menu */}
          {user && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="block text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                Dashboard
              </Link>

              <Link
                to="/analytics"
                onClick={() => setOpen(false)}
                className="block text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                Analytics
              </Link>
            </>
          )}

          {/* Public Menu – only if NOT logged in */}
          {!user && (
            <>
              <ScrollLink
                to="services"
                smooth={true}
                duration={500}
                offset={-80}
                onClick={() => setOpen(false)}
                className="block cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                Services
              </ScrollLink>

              <ScrollLink
                to="about"
                smooth={true}
                duration={500}
                offset={-80}
                onClick={() => setOpen(false)}
                className="block cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                About
              </ScrollLink>

              <ScrollLink
                to="testimonials"
                smooth={true}
                duration={500}
                offset={-80}
                onClick={() => setOpen(false)}
                className="block cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                Testimonials
              </ScrollLink>

              <ScrollLink
                to="contact"
                smooth={true}
                duration={500}
                offset={-80}
                onClick={() => setOpen(false)}
                className="block cursor-pointer text-gray-800 dark:text-gray-200 hover:text-purple-500 transition text-sm font-medium"
              >
                Contact
              </ScrollLink>
            </>
          )}
          {/* Auth + Theme */}
          <div className="pt-4">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full px-5 py-2 bg-purple-600 text-white text-sm rounded-full shadow-md hover:bg-purple-700 transition"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/auth");
                  setOpen(false);
                }}
                className="w-full px-5 py-2 bg-purple-600 text-white text-sm rounded-full shadow-md hover:bg-purple-700 transition"
              >
                Sign In
              </button>
            )}

            <div className="mt-3">
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
