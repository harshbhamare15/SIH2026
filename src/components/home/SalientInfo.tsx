'use client';

import React from 'react';

interface InfoItem {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export const SalientInfo: React.FC = () => {
  const items: InfoItem[] = [
    {
      title: 'Multilateral Bank Certification',
      description: 'Guidelines and certification by the World Bank / ADB.',
      href: '#bank-docs',
      icon: (
        <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5M4.5 21V10.5M12 3v1.5M12 8.25v1.5m-6.75 3h13.5"/>
        </svg>
      ),
    },
    {
      title: 'Model Tender Documents',
      description: 'Standardized procurement templates and forms.',
      href: '#standard-biddingdocs',
      icon: (
        <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25M9 16.5v.008H9.008V16.5H9zm0-3v.008H9.008V13.5H9zm0-3v.008H9.008V10.5H9zm-3.375.375h.008v.008H5.625v-.008zm0 3h.008v.008H5.625v-.008zm0 3h.008v.008H5.625v-.008zm1.875-9.375h.008v.008H7.5v-.008zm0 3h.008v.008H7.5v-.008zm0 3h.008v.008H7.5v-.008zm0 3h.008v.008H7.5v-.008zm9-9h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm-1.875-3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm2.25-6h.008v.008H18v-.008zm0 3h.008v.008H18V12z"/>
        </svg>
      ),
    },
    {
      title: 'MSME Order Benefits',
      description: 'Procurement policy and benefits mapped for MSME vendors.',
      href: '#msme-order',
      icon: (
        <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72L4.318 3.44A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75z"/>
        </svg>
      ),
    },
    {
      title: 'Make In India Policy',
      description: 'Purchase preference clauses for local manufacturers.',
      href: '#india-order',
      icon: (
        <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.048 8.287 8.287 0 0 0 9 9.6a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18z"/>
        </svg>
      ),
    },
    {
      title: 'Newsletters & Statistics',
      description: 'Quarterly bulletins on procurement volumes and values.',
      href: '#newsletterdisp',
      icon: (
        <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3z"/>
        </svg>
      ),
    },
    {
      title: 'Portal Downloads',
      description: 'System offline utilities, templates, and help videos.',
      href: '#downloaddisp',
      icon: (
        <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>
        </svg>
      ),
    },
    {
      title: 'Capacity Building',
      description: 'Training schedules and web learning registration.',
      href: '#trainingdisp',
      icon: (
        <svg className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A5.905 5.905 0 0 1 8 3.443m12.738 6.704a50.57 50.57 0 0 1 2.658-.813A5.906 5.906 0 0 0 16 3.443m-.518 4.497A48.618 48.618 0 0 0 12 7.5a48.62 48.62 0 0 0-3.482.44M12 7.5v8.25m0-8.25a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5z"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-slate-50 py-8 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-primary pl-3">
          Salient Information & Policies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="bg-white hover:border-primary border border-gray-200 rounded-lg p-5 flex gap-4 transition-all duration-300 hover:shadow group text-left cursor-pointer"
            >
              <div className="flex-shrink-0 bg-primary-light w-12 h-12 rounded-lg flex items-center justify-center border border-primary/10">
                {item.icon}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
