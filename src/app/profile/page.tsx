'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FooterSimple from '@/components/FooterSimple';

interface UserProfile {
  fullName: string;
  email: string;
  mobile: string;
  orgType: string;
  orgName: string;
  pan: string;
  gst?: string;
  experience?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  district?: string;
  pincode?: string;
  country?: string;
  address?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedProfile = localStorage.getItem('logged-in-user') || localStorage.getItem('user-profile');
      if (!storedProfile) {
        alert('No registered profile coordinates found. Redirecting to home...');
        router.push('/');
      } else {
        const parsed = JSON.parse(storedProfile);
        
        // Split combined address strings if separate variables are missing
        if (!parsed.address1 && parsed.address) {
          const parts = parsed.address.split(', ');
          parsed.address1 = parts[0] || 'Sector 4, Dwarka';
          parsed.address2 = parts[1] || '';
          parsed.city = parts[2] || 'New Delhi';
          parsed.state = parts[3] || 'Delhi';
          parsed.pincode = parts[4] || '110075';
          parsed.country = parts[5] || 'India';
        }

        setProfile(parsed);
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('logged-in-user');
    alert('Logged out successfully.');
    router.push('/');
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] font-sans">
        <div className="text-slate-600 text-sm font-semibold animate-pulse">Loading Profile Coordinates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex flex-col justify-between font-sans text-left">
      
      {/* 1. Dashboard Style Header Navigation Bar */}
      <nav className="w-full bg-[#1b4e7e] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-widest text-amber-500 uppercase">AXIOM</span>
            <span className="text-lg font-extrabold border-l border-white/20 pl-2">Dashboard</span>
          </div>

          {/* Navigation Options: Tender & Auction */}
          <div className="flex gap-1 bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => router.push('/dashboard?tab=tender')}
              className="px-4 py-1.5 rounded-md text-xs font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Tender
            </button>
            <button
              onClick={() => router.push('/dashboard?tab=auction')}
              className="px-4 py-1.5 rounded-md text-xs font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Auction
            </button>
          </div>

          {/* Profile Section (Redirects back to same page or remains highlighted) */}
          <div className="relative">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2.5 bg-white/20 border border-white/30 rounded-full p-1 pr-4 cursor-pointer select-none transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500 text-[#1b4e7e] font-black text-xs flex items-center justify-center">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white tracking-wide">{profile.fullName}</span>
            </button>
          </div>

        </div>
      </nav>

      {/* 2. Centered Profile Details Card Content */}
      <main className="flex-grow py-12 px-4 flex items-center justify-center">
        <div className="max-w-4xl w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Card Header Banner */}
          <div className="bg-[#1b4e7e] text-white p-8 relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col items-start gap-1 relative z-10">
              <span className="bg-amber-500 text-slate-900 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded mb-2">
                USER PROFILE
              </span>
              <h2 className="text-2xl font-bold tracking-tight">
                My Profile Details
              </h2>
              <p className="text-white/80 text-xs mt-0.5">
                Complete registration coordinates for Axiom Public Procurement.
              </p>
            </div>
            {/* Outline Profile Badge Icon overlay */}
            <div className="text-white/10 w-20 h-20 md:w-24 md:h-24 absolute right-6 bottom-4 select-none pointer-events-none">
              <svg viewBox="0 0 24 24" className="w-full h-full fill-none stroke-current" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
              </svg>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-8 space-y-8">
            
            {/* Section 1: Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="bg-[#1b4e7e] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">Full Name</span>
                  <span className="text-xs font-bold text-slate-700">{profile.fullName}</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">Email Address</span>
                  <span className="text-xs font-bold text-slate-700">{profile.email}</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">Mobile Number</span>
                  <span className="text-xs font-bold text-slate-700">{profile.mobile}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Organization Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="bg-[#1b4e7e] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Organization Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">Org Type</span>
                  <span className="text-xs font-bold text-slate-700 uppercase">{profile.orgType || 'PRIVATE'}</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200 md:col-span-2">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">Organization Name</span>
                  <span className="text-xs font-bold text-slate-700">{profile.orgName}</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">PAN Number</span>
                  <span className="text-xs font-bold text-slate-700 font-mono uppercase">{profile.pan}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200 md:col-span-2">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">GSTIN Number</span>
                  <span className="text-xs font-bold text-slate-700 font-mono uppercase">{profile.gst || 'N/A (Individual / Exempt)'}</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200 md:col-span-2">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">Domain Experience</span>
                  <span className="text-xs font-bold text-slate-700">{profile.experience ? (profile.experience.toLowerCase().includes('year') ? profile.experience : `${profile.experience} Years`) : 'Not Specified'}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Address Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="bg-[#1b4e7e] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs">
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"/>
                  </svg>
                </div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Address Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">Address Line 1</span>
                  <span className="text-xs font-bold text-slate-700">{profile.address1 || 'N/A'}</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">Address Line 2</span>
                  <span className="text-xs font-bold text-slate-700">{profile.address2 || 'N/A (Optional)'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">City</span>
                  <span className="text-xs font-bold text-slate-700">{profile.city || 'N/A'}</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">State</span>
                  <span className="text-xs font-bold text-slate-700">{profile.state || 'N/A'}</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">District</span>
                  <span className="text-xs font-bold text-slate-700">{profile.district || 'N/A'}</span>
                </div>
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">Pincode</span>
                  <span className="text-xs font-bold text-slate-700 font-mono">{profile.pincode || 'N/A'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-[#f8fafc] p-4 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-extrabold text-slate-400 block uppercase mb-1.5 tracking-wide">Country</span>
                  <span className="text-xs font-bold text-slate-700">{profile.country || 'India'}</span>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100 text-xs font-bold">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-1.5 text-primary hover:underline cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
                </svg>
                <span>Back to Dashboard</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-rose-600 hover:underline cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                <span>Logout Session</span>
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* 3. Footer simple */}
      <FooterSimple />
      
    </div>
  );
}
