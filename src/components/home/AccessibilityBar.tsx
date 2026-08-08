"use client";

import React from "react";
import { useAccessibility } from "./AccessibilityContext";
import { useRouter } from "next/navigation";

export const AccessibilityBar: React.FC = () => {
  const router = useRouter();
  const { fontSize, setFontSize, highContrast, setHighContrast } =
    useAccessibility();
  const [loggedInUser, setLoggedInUser] = React.useState<any>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("logged-in-user");
      if (stored) {
        setLoggedInUser(JSON.parse(stored));
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("logged-in-user");
    setLoggedInUser(null);
    alert("Logged out successfully.");
    router.push("/");
  };

  const handleLanguageToggle = () => {
    alert("Language switching to हिन्दी / English is simulated.");
  };

  return (
    <div className="w-full bg-primary text-white border-b border-white/10 text-xs py-2 px-4 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
        {/* Left Side: Social & Support */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <div className="flex items-center gap-3 border-r border-white/20 pr-4">
            <a
              href="#"
              className="hover:opacity-80 transition-opacity"
              title="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </a>
            <a
              href="#"
              className="hover:opacity-80 transition-opacity"
              title="Twitter"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              className="hover:opacity-80 transition-opacity"
              title="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href="mailto:support-eproc@nic.in"
              className="flex items-center gap-1.5 hover:text-white/80 transition-colors"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              <span>support-eproc(at)nic(dot)in</span>
            </a>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.502-5.18-3.858-6.682-6.682l1.293-.97c.362-.271.528-.733.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z"
                />
              </svg>
              <span>
                +91 0120-4001002 | +91 0120-4001005 | +91 0120-4493395
              </span>
            </span>
          </div>
        </div>

        {/* Right Side: Accessibility Actions */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {loggedInUser ? (
            <>
              <span className="text-white/85 text-[10px] sm:text-[11px] font-medium">
                Welcome, <span className="font-extrabold text-amber-400">{loggedInUser.fullName}</span>
              </span>
              <span className="text-white/20">|</span>
              <button
                onClick={() => router.push("/profile")}
                className="bg-white text-[#1b4e7e] px-2.5 py-0.5 rounded font-bold hover:bg-slate-100 transition-all text-[10px] sm:text-[11px] shadow-sm cursor-pointer border border-transparent"
              >
                My Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-rose-600 text-white px-2.5 py-0.5 rounded font-bold hover:bg-rose-700 transition-all text-[10px] sm:text-[11px] shadow-sm cursor-pointer border border-rose-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="bg-white text-primary px-2.5 py-0.5 rounded font-bold hover:bg-slate-100 transition-colors text-[10px] sm:text-[11px] shadow-sm cursor-pointer"
              >
                Login
              </a>
              <a
                href="/register"
                className="bg-amber-500 text-slate-900 px-2.5 py-0.5 rounded font-bold hover:bg-amber-600 transition-colors text-[10px] sm:text-[11px] shadow-sm cursor-pointer"
              >
                Register
              </a>
            </>
          )}
          <span className="text-white/20">|</span>
          <a href="#main-content" className="hover:underline font-medium">
            Skip to Main Content
          </a>
          <span className="text-white/20">|</span>
          <a href="#" className="hover:underline">
            Screen Reader Access
          </a>
          <span className="text-white/20">|</span>
          <button
            onClick={handleLanguageToggle}
            className="hover:underline font-semibold cursor-pointer"
          >
            हिन्दी
          </button>
          <span className="text-white/20">|</span>

          {/* Font resizing widget */}
          <div className="flex items-center bg-white/10 rounded px-1.5 py-0.5 border border-white/20 gap-1.5">
            <button
              onClick={() => setFontSize("small")}
              className={`px-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${fontSize === "small" ? "bg-white text-primary" : "hover:bg-white/20"}`}
              title="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("normal")}
              className={`px-1.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${fontSize === "normal" ? "bg-white text-primary" : "hover:bg-white/20"}`}
              title="Normal Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize("large")}
              className={`px-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${fontSize === "large" ? "bg-white text-primary" : "hover:bg-white/20"}`}
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <span className="text-white/20">|</span>

          {/* Contrast toggler slider-styled switch */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] opacity-90">Contrast</span>
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${highContrast ? "bg-white" : "bg-white/25"}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-primary transition-transform ${highContrast ? "translate-x-4.5 bg-primary" : "translate-x-1 bg-white"}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
