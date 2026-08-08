'use client';

import React from 'react';

interface StatItem {
  title: string;
  count: string;
  central: string;
  state: string;
  icon: React.ReactNode;
  color: string;
  link: string;
}

export const StatsDashboard: React.FC = () => {
  const stats: StatItem[] = [
    {
      title: 'Active Tenders',
      count: '268,485',
      central: '124,312',
      state: '144,173',
      color: 'border-primary',
      link: '#active-tenders',
      icon: (
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z"/>
        </svg>
      ),
    },
    {
      title: 'Tenders Opening Today',
      count: '3,412',
      central: '1,280',
      state: '2,132',
      color: 'border-amber-500',
      link: '#opening-today',
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"/>
        </svg>
      ),
    },
    {
      title: 'Tenders Closing Today',
      count: '2,854',
      central: '1,114',
      state: '1,740',
      color: 'border-rose-500',
      link: '#closing-today',
      icon: (
        <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
        </svg>
      ),
    },
    {
      title: 'Active GeM Bids',
      count: '49,835',
      central: '49,835',
      state: 'Unified (All)',
      color: 'border-amber-600',
      link: '#gem-bids',
      icon: (
        <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5M5.25 7.5h13.5m-12 3h10.5m-12 3h13.5m-15 3h16.5"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-white py-8 px-4 transition-colors duration-200" id="main-content">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-primary pl-3">
          Tender Count Statistics
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`relative bg-slate-50 hover:bg-white border-t-4 ${stat.color} rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden border border-slate-100`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                    {stat.title}
                  </h3>
                  <div className="text-2xl font-extrabold text-slate-800 mt-1 select-none">
                    {stat.count}
                  </div>
                </div>
                <div className="bg-white group-hover:bg-primary-light p-2 rounded-lg transition-colors border border-slate-100">
                  {stat.icon}
                </div>
              </div>

              {/* Collapsible/Hover breakdown panel */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-gray-600 transition-all duration-300">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-gray-400 uppercase text-[9px] tracking-wider">Central</span>
                  <span className="font-extrabold text-gray-700">{stat.central}</span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div className="flex flex-col gap-0.5 items-end">
                  <span className="font-semibold text-gray-400 uppercase text-[9px] tracking-wider">State</span>
                  <span className="font-extrabold text-gray-700">{stat.state}</span>
                </div>
              </div>

              {/* View detail trigger absolute link icon overlay */}
              <a
                href={stat.link}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-primary"
                title={`View details for ${stat.title}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/>
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
