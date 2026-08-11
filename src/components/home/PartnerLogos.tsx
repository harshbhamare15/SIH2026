'use client';

import React from 'react';

interface Partner {
  name: string;
  desc: string;
  tag: string;
  color: string;
}

export const PartnerLogos: React.FC = () => {
  const partners: Partner[] = [
    { name: 'Axiom Vault', desc: 'Cryptographic Procurement Engine', tag: 'Web3 & Escrow', color: 'border-l-indigo-600' },
    { name: 'Digital India', desc: 'Power To Empower Program', tag: 'National Initiative', color: 'border-l-blue-500' },
    { name: 'India.gov.in', desc: 'National Portal of India', tag: 'Single Windows Gateway', color: 'border-l-orange-500' },
    { name: 'Data.gov.in', desc: 'Open Government Data Platform', tag: 'Informatics Shared', color: 'border-l-teal-500' },
    { name: 'CPGRAMS', desc: 'Public Grievance Redressal System', tag: 'Citizen Centric', color: 'border-l-rose-500' },
    { name: 'MyGov', desc: 'Citizen Engagement Platform', tag: 'Collaborative Governance', color: 'border-l-purple-500' },
    { name: 'gepNIC', desc: 'NIC Government eProcurement', tag: 'System Engine', color: 'border-l-primary' },
    { name: 'G20 India', desc: 'Vasudhaiva Kutumbakam', tag: 'Global Cooperation', color: 'border-l-emerald-500' },
    { name: '75 Independence', desc: 'Azadi Ka Amrit Mahotsav', tag: 'Nation Centenary', color: 'border-l-red-500' },
  ];

  return (
    <section className="w-full bg-white py-8 px-4 border-t border-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-l-4 border-primary pl-3">
          Associated Government Portals
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
          {partners.map((p, idx) => (
            <div
              key={idx}
              className={`bg-slate-50 border-l-4 ${p.color} border border-slate-100 rounded p-3.5 hover:shadow transition-all duration-300 hover:bg-white flex flex-col justify-between text-left group cursor-default`}
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors">
                  {p.name}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5 leading-snug">
                  {p.desc}
                </span>
              </div>
              <span className="text-[8px] font-bold text-slate-500/80 bg-slate-200/50 rounded px-1.5 py-0.5 self-start mt-3 select-none">
                {p.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
