'use client';

import React from 'react';

export const WhyUseGeM: React.FC = () => {
  const features = [
    {
      title: 'High Content Availability',
      desc: 'Redundant hosting clusters to ensure high uptime and zero downtime during key tender closings.',
    },
    {
      title: 'Role-Based Access Control',
      desc: 'Granular security policies for Bidders, Approvers, Openers, and System Auditors.',
    },
    {
      title: 'Multi-Device Compatibility',
      desc: 'Completely responsive interface that works perfectly across computers, tablets, and smartphones.',
    },
    {
      title: 'SSL/TLS Encrypted Data',
      desc: 'All packet transits are encrypted to prevent intermediate sniffing and protect commercial bid bids.',
    },
    {
      title: 'Periodic STQC Security Audits',
      desc: 'System regularly audited and certified by the Standardization Testing and Quality Certification agency.',
    },
    {
      title: 'NTP Time Synchronization',
      desc: 'Uses verified Network Time Protocol servers to ensure correct timestamps for bid submission closings.',
    },
  ];

  return (
    <section className="w-full bg-white py-8 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto bg-slate-50 border border-slate-100 rounded-xl p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Big Title Card */}
          <div className="lg:col-span-4 flex flex-col items-start text-left gap-2 border-b lg:border-b-0 lg:border-r border-slate-200 pb-6 lg:pb-0 lg:pr-8">
            <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded uppercase tracking-wider">
              Benefits
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight mt-1">
              Why use GeM-CPPP?
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mt-2">
              The unified Central Public Procurement Portal ensures maximum transparency, ease, and security in government bidding.
            </p>
          </div>

          {/* Right Column: Checklist Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-1 rounded-full flex-shrink-0 mt-0.5 border border-emerald-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <h3 className="text-sm font-bold text-slate-800">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
