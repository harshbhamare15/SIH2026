'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRegister() {
  const router = useRouter();
  
  // Registration State Coordinates
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      alert('Please fill out all registration fields.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match. Please verify.');
      return;
    }

    if (!agreed) {
      alert('Please accept the compliance auditing guidelines.');
      return;
    }

    try {
      setIsSubmitting(true);
      const adminPayload = {
        fullName,
        email,
        mobile,
        password,
      };

      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Admin registration failed. Please try again.');
        return;
      }

      localStorage.setItem('admin-profile', JSON.stringify(data.admin || adminPayload));
      alert('Admin registration successful! Redirecting to login page...');
      router.push('/admin/login?registered=true');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      alert('Admin registration error: ' + msg);
    } finally {
      setIsSubmitting(false);
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
            Register Administrative Credentials
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm">
            Set up an authorized administrator account to manage tender notice publications, publish live auctions, and audit bidder registrations.
          </p>

          <div className="space-y-4 pt-4 text-xs font-semibold text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</div>
              <span>Authority Action Audit Checks</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</div>
              <span>Live Procurement Operations Control</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">✓</div>
              <span>System Parameter Configuration Access</span>
            </div>
          </div>
        </div>

        {/* Bottom: Compliance Footer */}
        <div className="relative z-10 border-t border-white/10 pt-6 text-[11px] text-white/60 leading-relaxed">
          <p className="font-semibold text-amber-400 mb-1">Administrative Compliance</p>
          <p>Registration requires complete institutional compliance credentials. All transactions are logged and auditable.</p>
        </div>
      </div>

      {/* Right side: Clean Compact Form Area */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-4 md:p-6 bg-[#f8fafc]">
        <div className="max-w-md w-full bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-4">
          
          {/* Header Typography */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-800 tracking-tight">Admin Registration</h1>
              <span className="bg-amber-100 text-amber-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">CREDENTIALS</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Create secure administrative access credentials to manage Axiom tools.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-3" onSubmit={handleRegister}>
            
            {/* Full Name */}
            <div>
              <label className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">
                Full Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1b4e7e] focus:ring-4 focus:ring-[#1b4e7e]/5 transition-all"
                  placeholder="e.g. Administrator"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">
                Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1b4e7e] focus:ring-4 focus:ring-[#1b4e7e]/5 transition-all"
                  placeholder="e.g. admin@gmail.com"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">
                Mobile Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1b4e7e] focus:ring-4 focus:ring-[#1b4e7e]/5 transition-all"
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                  </svg>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1b4e7e] focus:ring-4 focus:ring-[#1b4e7e]/5 transition-all"
                  placeholder="Create strong admin password"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z" />
                  </svg>
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white rounded-xl py-2 pl-9 pr-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#1b4e7e] focus:ring-4 focus:ring-[#1b4e7e]/5 transition-all"
                  placeholder="Re-enter password to verify"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start gap-2 pt-0.5">
              <input
                type="checkbox"
                id="admin-agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-3.5 h-3.5 text-[#1b4e7e] border-slate-300 rounded focus:ring-[#1b4e7e] cursor-pointer mt-0.5"
              />
              <label htmlFor="admin-agree" className="text-[10px] leading-relaxed text-slate-500 select-none cursor-pointer">
                I agree to comply with procurement compliance policies, administrative auditing rules, and security guidelines.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#1b4e7e] hover:bg-[#133c62] text-white text-xs font-bold py-2.5 rounded-xl cursor-pointer transition-all shadow-md active:scale-[0.99] mt-2"
            >
              Register Administrator
            </button>

            {/* Link to Login */}
            <div className="text-center pt-3 border-t border-slate-100 mt-4 text-xs font-semibold">
              <span className="text-slate-400">Already have an admin account? </span>
              <button
                type="button"
                onClick={() => router.push('/admin/login')}
                className="text-[#1b4e7e] hover:underline font-bold cursor-pointer"
              >
                Sign In Here
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  );
}
