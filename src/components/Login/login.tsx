'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginComponent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Show a visual success notification if redirected from successful registration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('registered') === 'true') {
        setSuccessMessage('Registration successful! Please login with your credentials.');
      }
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Login failed. Please check your credentials.');
        return;
      }

      // Store authenticated user profile in localStorage
      localStorage.setItem('logged-in-user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      alert('Login error: ' + msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] py-12 px-4 font-sans transition-colors duration-200">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-left">
        
        {/* Dark Blue Header Banner Card */}
        <div className="bg-primary text-white p-8 relative flex flex-col justify-between items-start gap-4">
          <div className="flex flex-col items-start gap-1 relative z-10">
            <span className="bg-amber-500 text-slate-900 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-2">
              Login
            </span>
            <h2 className="text-xl font-bold tracking-tight">
              Login to Your Account
            </h2>
            <p className="text-white/80 text-[11px] mt-0.5">
              Secure gateway access to the Axiom Public Procurement Portal.
            </p>
          </div>
          {/* User lock outline icon overlay */}
          <div className="text-white/10 w-20 h-20 absolute right-6 bottom-4 select-none pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-full h-full fill-none stroke-current" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
            </svg>
          </div>
        </div>

        {/* Form Body */}
        <form className="p-8 space-y-5" onSubmit={handleLogin}>
          
          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email ID Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email ID <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
              placeholder="Enter email address"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Password <span className="text-red-500">*</span>
              </label>
              <a href="#forgot" className="text-[10px] font-bold text-primary hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="relative rounded-md shadow-sm">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-2.2-2.2-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="w-full sm:w-auto px-10 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-md shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center"
            >
              Login
            </button>
            <span className="text-xs text-slate-500">
              Don't have an account?{' '}
              <a href="/register" className="font-bold text-primary hover:underline">
                Register
              </a>
            </span>
          </div>

        </form>

      </div>
    </div>
  );
}
