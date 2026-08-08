'use client';

import React from 'react';

interface LinkItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export const QuickLinks: React.FC = () => {
  const links: LinkItem[] = [
    {
      label: 'Search Tenders',
      href: '#search-tenders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637z"/>
        </svg>
      ),
    },
    {
      label: 'Recent Tenders',
      href: '#recent-tenders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
        </svg>
      ),
    },
    {
      label: 'New Corrigendums',
      href: '#corrigendums',
      badge: 'Hot',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.656 48.656 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3M3 12a48.291 48.291 0 0 0-.138 3.662 4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M3 12l-3 3m3-3 3-3"/>
        </svg>
      ),
    },
    {
      label: 'Bid Awards (AOC)',
      href: '#bid-awards',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125v3.375m9 0h-9M9 6h6m-6 3h6m-6 3h6m-7.5-6h9a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 3 12V4.5A1.5 1.5 0 0 1 4.5 3h9"/>
        </svg>
      ),
    },
    {
      label: 'Tender Calendar',
      href: '#tender-calendar',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>
        </svg>
      ),
    },
    {
      label: 'Closing Today',
      href: '#closing-today',
      badge: 'Urgent',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-slate-50 py-8 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-primary pl-3">
          Quick Procurement Access
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {links.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="relative bg-white hover:bg-primary hover:text-white border border-slate-200/60 rounded-lg p-5 flex flex-col items-center text-center justify-center gap-3 transition-all duration-300 hover:shadow-md group cursor-pointer"
            >
              <div className="text-primary group-hover:text-white transition-colors duration-300">
                {link.icon}
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-white transition-colors">
                {link.label}
              </span>
              
              {link.badge && (
                <span className="absolute top-2 right-2 bg-rose-500 text-white text-[8px] font-black px-1 py-0.5 rounded shadow-sm uppercase select-none leading-none">
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
