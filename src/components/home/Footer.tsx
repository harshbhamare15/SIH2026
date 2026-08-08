'use client';

import React from 'react';

export const Footer: React.FC = () => {
  const resourceLinks = [
    { name: 'About Portal', href: '#about-portal' },
    { name: 'Portal Feedback', href: '#feedback' },
    { name: 'Terms of Use', href: '#terms' },
    { name: 'Downloads', href: '#downloads' },
    { name: 'Mission & Vision', href: '#mission' },
    { name: 'Site Map', href: '#sitemap' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Help Doc', href: '#help' },
    { name: 'Help Videos (World Bank)', href: '#wb-videos' },
    { name: 'Web Information Manager', href: '#wim' },
  ];

  return (
    <footer className="w-full bg-[#0f172a] text-slate-300 border-t border-slate-800 transition-colors duration-200">
      
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        
        {/* Col 1: Mobile App & NIC Description */}
        <div className="flex flex-col items-start gap-4">
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3">
              GeM-CPPP Mobile App
            </h4>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <a
                href="https://apps.apple.com/in/app/gepnic/id1330902501"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-3 py-1.5 transition-colors"
              >
                {/* Apple icon */}
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.1.08.2.12.3.12.87 0 1.95-.57 2.51-1.45z"/>
                </svg>
                <div className="text-left leading-tight">
                  <span className="text-[8px] text-slate-400 block uppercase font-medium">Download on</span>
                  <span className="text-[11px] font-bold text-white block">App Store</span>
                </div>
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=gov.nic.eproc&hl=en"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded px-3 py-1.5 transition-colors"
              >
                {/* Play Store icon */}
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M3 5.277v13.446a.3.3 0 0 0 .484.237L18.89 12.36a.3.3 0 0 0 0-.474L3.484 5.04A.3.3 0 0 0 3 5.277z"/>
                </svg>
                <div className="text-left leading-tight">
                  <span className="text-[8px] text-slate-400 block uppercase font-medium">Get it on</span>
                  <span className="text-[11px] font-bold text-white block">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 mt-2">
            {/* Logo NIC Placeholder */}
            <div className="text-lg font-black text-white tracking-wider flex items-center gap-1.5">
              <span className="text-amber-500">NIC</span>
              <span className="text-xs font-semibold text-slate-400 border-l border-slate-700 pl-2">National Informatics Centre</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mt-2 text-left">
              Designed, hosted, and maintained by National Informatics Centre (NIC), in association with the Procurement Policy Division, Dept. of Expenditure, Ministry of Finance, Government of India.
            </p>
          </div>
        </div>

        {/* Col 2: Support & Contact Details */}
        <div className="flex flex-col items-start gap-4">
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-1">
            Contact & Support
          </h4>
          <ul className="flex flex-col gap-3.5 text-xs text-left">
            <li className="flex gap-2 items-start">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.502-5.18-3.858-6.682-6.682l1.293-.97c.362-.271.528-.733.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z"/>
              </svg>
              <div>
                <p className="font-bold text-white">CPPP Helpdesk Numbers:</p>
                <p className="text-slate-400 mt-1 leading-normal">
                  +91 0120-4001002<br />
                  +91 0120-4001005<br />
                  +91 0120-4493395
                </p>
              </div>
            </li>
            <li className="flex gap-2 items-start">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>
              </svg>
              <div>
                <p className="font-bold text-white">E-Mail Queries:</p>
                <a href="mailto:support-eproc@nic.in" className="text-slate-400 hover:text-amber-400 transition-colors">
                  support-eproc(at)nic(dot)in
                </a>
              </div>
            </li>
          </ul>
        </div>

        {/* Col 3: Resources */}
        <div className="flex flex-col items-start gap-4">
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-1">
            Resources & Links
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-left">
            {resourceLinks.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="text-slate-400 hover:text-white transition-colors py-0.5"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>

        {/* Col 4: Certifying Agency */}
        <div className="flex flex-col items-start gap-4 text-left">
          <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-1">
            Certifying Agency
          </h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded border border-slate-800">
              <div className="w-10 h-10 bg-amber-500 rounded text-slate-900 font-extrabold flex items-center justify-center flex-shrink-0 text-xs">
                STQC
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold text-white">STQC Audited</span>
                <span className="text-[9px] text-slate-400 mt-0.5">CPPP Security Certified</span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/40 p-2.5 rounded border border-slate-800">
              <div className="w-10 h-10 bg-blue-500 rounded text-white font-extrabold flex items-center justify-center flex-shrink-0 text-xs">
                EPS
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-bold text-white">EPS STQC Cert</span>
                <span className="text-[9px] text-slate-400 mt-0.5">e-Procurement Secure</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar copyright & version info */}
      <div className="border-t border-slate-800 py-6 px-4 bg-slate-950/40 text-[10px] text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span>Portal Version: <strong className="text-slate-400 font-semibold">GeM-CPPP-portal-ver-2.0</strong></span>
            <span className="hidden md:inline text-slate-800">|</span>
            <span>Last Updated: <strong className="text-slate-400 font-semibold">10-Jan-2024</strong></span>
          </div>
          <p className="text-center md:text-right">
            © {new Date().getFullYear()} National Informatics Centre. All rights reserved. Site best viewed in Google Chrome, Microsoft Edge, Mozilla Firefox.
          </p>
        </div>
      </div>

    </footer>
  );
};
