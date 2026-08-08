'use client';

import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200 py-4 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left Side: National Emblem + Text Branding */}
        <div className="flex items-center gap-4 select-none">
          {/* Stylized Indian National Emblem Emblem SVG */}
          <div className="w-12 h-16 text-primary flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 130" className="w-full h-full fill-current">
              {/* Simplified Emblem Path representing Satyameva Jayate Pillar */}
              <path d="M50 5 L55 20 L60 20 L58 35 L65 35 L62 55 L70 55 L65 80 L58 80 L62 95 L50 92 L38 95 L42 80 L35 80 L30 55 L38 55 L35 35 L42 35 L40 20 L45 20 Z" />
              <rect x="42" y="98" width="16" height="5" rx="1" />
              <rect x="35" y="106" width="30" height="3" rx="0.5" />
              <path d="M 45 112 L 40 125 L 60 125 L 55 112 Z" />
              {/* Ashoka Chakra in mini form */}
              <circle cx="50" cy="102" r="2.5" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>
          
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-gray-700 tracking-wide uppercase">
              Government of India
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
              Central Public Procurement Portal
            </h1>
            <span className="text-[10px] md:text-xs text-gray-500 font-medium italic mt-0.5">
              Ministry of Finance | Department of Expenditure
            </span>
          </div>
        </div>

        {/* Right Side: GeM-CPPP Unified Logo & Platform Metadata */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary-light border border-primary/20 rounded">
              Unified Portal
            </span>
            <span className="text-[10px] text-gray-400 mt-1">GeM & CPPP Integration</span>
          </div>

          <div className="relative hover:scale-102 transition-transform duration-200">
            {/* We will draw a premium fallback text logo representing GeM | CPPP */}
            <div className="flex items-center border-l-2 border-primary/30 pl-4 h-12">
              <span className="text-2xl font-black tracking-tighter text-amber-500 mr-1.5">GeM</span>
              <span className="text-2xl font-extrabold text-primary tracking-tight border-l border-gray-300 pl-2">CPPP</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
