'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('registered') === 'true') {
        setSuccessMessage('Admin account created successfully! Please log in below.');
      }
    }
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert('Please fill out login credentials.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Admin login failed. Please verify administrative credentials.');
        return;
      }

      localStorage.setItem('logged-in-admin', JSON.stringify(data.admin));
      alert('Authentication successful! Opening Admin Dashboard...');
      router.push('/admin/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      alert('Admin login error: ' + msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] font-sans text-left">
      
      {/* Left side: Premium Branding Panel (Visible on Desktop) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#1b4e7e] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#133c62] to-[#1b4e7e] opacity-95 z-0"></div>
        
        {/* Top: Logo & Title */}
        <div className="relative z-10 flex items-center gap-3">
          <span className="text-xl font-black tracking-wider text-amber-500 uppercase">AXIOM</span>
          <span className="text-lg font-bold border-l border-white/20 pl-2.5">Admin Console</span>
        </div>

        {/* Center: Console Context */}
        <div className="relative z-10 space-y-6">
          <div className="bg-white/10 p-2 py-1 rounded text-[10px] font-black tracking-wider uppercase text-amber-400 w-fit">
            ADMINISTRATIVE CONSOLE
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Secure Gateway Access
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm">
            Access secure administrative controls to manage active public tenders, audit bidder compliance directories, and monitor live reverse auction arenas.
          </p>

          <div className="space-y-4 pt-4 text-xs font-semibold text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</div>
              <span>Auditable Tender Actions</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</div>
              <span>Live Reverse Auction Management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</div>
              <span>Portal Operations Monitoring</span>
            </div>
          </div>
        </div>

        {/* Bottom: Compliance Footer */}
        <div className="relative z-10 border-t border-white/10 pt-6 text-[11px] text-white/60 leading-relaxed">
          <p className="font-semibold text-amber-400 mb-1">Authorized Access Only</p>
          <p>This is a monitored portal. All transactions, publishes, and operational audit logs are securely recorded.</p>
        </div>
      </div>

      {/* Right side: Clean Minimalist Form Area */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 md:p-8 bg-[#f8fafc]">
        <div className="max-w-md w-full bg-white p-8 md:p-10 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
          
          {/* Header Typography */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Admin Sign In</h1>
              <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">CONSOLE</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Enter your Axiom administrative credentials to unlock operations.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            
            {/* Success Banner */}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-lg flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wider">
                Admin Email ID
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1b4e7e] focus:ring-4 focus:ring-[#1b4e7e]/5 transition-all"
                  placeholder="e.g. admin@eprocure.gov.in"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-2.5 pl-9 pr-10 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1b4e7e] focus:ring-4 focus:ring-[#1b4e7e]/5 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.863 7.863 3 3m-3-3-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#1b4e7e] hover:bg-[#133c62] text-white text-xs font-bold py-3 rounded-xl cursor-pointer transition-all shadow-md active:scale-[0.99]"
            >
              Sign In to Console
            </button>

            {/* Link to Register */}
            <div className="text-center pt-4 border-t border-slate-100 mt-6 text-xs font-semibold">
              <span className="text-slate-400">Need a new admin registration? </span>
              <button
                type="button"
                onClick={() => router.push('/admin/register')}
                className="text-[#1b4e7e] hover:underline font-bold cursor-pointer"
              >
                Register Credentials
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
}
