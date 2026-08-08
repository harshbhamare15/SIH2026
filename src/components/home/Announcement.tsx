'use client';

import React from 'react';

export const Announcement: React.FC = () => {
  const alerts = [
    'Welcome to the GeM-CPPP portal. Re-designed for higher performance, security, and accessibility.',
    'ALERT: Standard Bidding Documents (SBDs) for Works, Goods, and Services have been updated for the current Financial Year.',
    'Debarment list updated as of today. Check the Debarment Search page for revoked/active bidders.',
    'Onboarding manuals and training schedules on eProcurement and Web-learning sessions are now available.',
  ];

  return (
    <div className="w-full bg-slate-100 border-b border-slate-200 py-2 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center">
        {/* Title Tag Label */}
        <div className="flex items-center gap-1.5 bg-primary text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded shadow-sm flex-shrink-0 z-10 mr-4">
          <svg className="w-3.5 h-3.5 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z"/>
          </svg>
          <span>Announcements</span>
        </div>

        {/* Scrolling text container */}
        <div className="relative overflow-hidden w-full h-6 flex items-center">
          <div className="absolute flex whitespace-nowrap gap-12 animate-ticker text-xs font-semibold text-slate-700">
            {alerts.map((alert, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{alert}</span>
              </span>
            ))}
            {/* Duplicate for seamless looping */}
            {alerts.map((alert, idx) => (
              <span key={`dup-${idx}`} className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>{alert}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
