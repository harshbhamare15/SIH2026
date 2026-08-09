'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FooterSimple from '@/components/FooterSimple';

interface AdminUser {
  fullName: string;
  email: string;
  role: string;
  simulated?: boolean;
}

interface Tender {
  id: string;
  title: string;
  client: string;
  location: string;
  value: string;
  closingDate: string;
  matchType: string;
}

interface Auction {
  id: string;
  title: string;
  client: string;
  location: string;
  startingValue: string;
  duration: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [activeTab, setActiveTab] = useState<'tender' | 'auction'>('tender');

  // Dynamic Lists for Tenders and Auctions (initialized with mock data matching user views)
  const [tenders, setTenders] = useState<Tender[]>([
    {
      id: 'NHAI/009123',
      title: 'National Highway Expansion - Package 7',
      client: 'National Highways Authority of India',
      location: 'Maharashtra',
      value: '₹550 Crores',
      closingDate: '4 Days (22 Oct 2026)',
      matchType: 'High Match'
    },
    {
      id: 'AIIMS/004812',
      title: 'Supply of High-Resolution Medical Monitors',
      client: 'AIIMS New Delhi',
      location: 'Delhi NCR',
      value: '₹12.30 Crores',
      closingDate: '12 Days (03 Sep 2026)',
      matchType: 'High Match'
    }
  ]);

  const [auctions, setAuctions] = useState<Auction[]>([
    {
      id: 'OSD/7734',
      title: 'Office Stationery Supply',
      client: 'Ministry of Commerce',
      location: 'Delhi NCR',
      startingValue: '₹12,500',
      duration: '03:43 mins',
      status: 'Live'
    },
    {
      id: 'HEAVY/9921',
      title: 'Steel Beam Procurement',
      client: 'National Infrastructure Dev',
      location: 'Gujarat',
      startingValue: '₹4,50,000',
      duration: '14:20 mins',
      status: 'Live'
    }
  ]);

  // Form Coordinates for Adding Tenders
  const [tenderId, setTenderId] = useState('');
  const [tenderTitle, setTenderTitle] = useState('');
  const [tenderClient, setTenderClient] = useState('');
  const [tenderLocation, setTenderLocation] = useState('');
  const [tenderValue, setTenderValue] = useState('');
  const [tenderClosing, setTenderClosing] = useState('');
  const [tenderMatch, setTenderMatch] = useState('High Match');

  // Form Coordinates for Adding Auctions
  const [auctionId, setAuctionId] = useState('');
  const [auctionTitle, setAuctionTitle] = useState('');
  const [auctionClient, setAuctionClient] = useState('');
  const [auctionLocation, setAuctionLocation] = useState('');
  const [auctionValue, setAuctionValue] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('');

  // Validate session on mount
  // Normalizers to convert user dashboard schema schemas to Admin dashboard schemas
  const normalizeAdminTenders = (raw: any[]): Tender[] => {
    return raw.map(item => ({
      id: item.id,
      title: item.title,
      client: item.client || item.dept || '',
      location: item.location || '',
      value: item.value || '',
      closingDate: item.closingDate || item.deadline || '',
      matchType: item.matchType || item.match || 'High Match'
    }));
  };

  const normalizeAdminAuctions = (raw: any[]): Auction[] => {
    return raw.map(item => ({
      id: item.id,
      title: item.title,
      client: item.client || '',
      location: item.location || '',
      startingValue: item.startingValue || `₹${(item.lowestBid || 12500).toLocaleString()}`,
      duration: item.duration || item.timeLeft || '03:45 mins',
      status: item.status === 'active' || item.status === 'placed' ? 'Live' : (item.status || 'Live')
    }));
  };

  // Validate session & load listings on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('logged-in-admin');
      if (!stored) {
        alert('Access denied. Please log in as an administrator.');
        router.push('/admin/login');
      } else {
        setAdmin(JSON.parse(stored));
      }

      // Load persistent listings
      const savedTenders = localStorage.getItem('user-tenders');
      if (savedTenders) {
        try {
          setTenders(normalizeAdminTenders(JSON.parse(savedTenders)));
        } catch (e) {
          console.error(e);
        }
      }
      const savedAuctions = localStorage.getItem('user-auctions');
      if (savedAuctions) {
        try {
          setAuctions(normalizeAdminAuctions(JSON.parse(savedAuctions)));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('logged-in-admin');
    alert('Admin session terminated.');
    router.push('/admin/login');
  };

  // Add Tender handler
  const handleAddTender = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenderId || !tenderTitle || !tenderClient || !tenderLocation || !tenderValue || !tenderClosing) {
      alert('Please fill out all fields in the Tender form.');
      return;
    }

    const newTender: Tender = {
      id: tenderId,
      title: tenderTitle,
      client: tenderClient,
      location: tenderLocation,
      value: tenderValue,
      closingDate: tenderClosing,
      matchType: tenderMatch
    };

    const updated = [newTender, ...tenders];
    setTenders(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-tenders', JSON.stringify(updated));
    }
    alert('Tender added successfully!');
    
    // Clear inputs
    setTenderId('');
    setTenderTitle('');
    setTenderClient('');
    setTenderLocation('');
    setTenderValue('');
    setTenderClosing('');
  };

  // Add Auction handler
  const handleAddAuction = (e: React.FormEvent) => {
    e.preventDefault();

    if (!auctionId || !auctionTitle || !auctionClient || !auctionLocation || !auctionValue || !auctionDuration) {
      alert('Please fill out all fields in the Auction form.');
      return;
    }

    const newAuction: Auction = {
      id: auctionId,
      title: auctionTitle,
      client: auctionClient,
      location: auctionLocation,
      startingValue: auctionValue,
      duration: auctionDuration,
      status: 'Live'
    };

    const updated = [newAuction, ...auctions];
    setAuctions(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-auctions', JSON.stringify(updated));
    }
    alert('Auction added successfully!');

    // Clear inputs
    setAuctionId('');
    setAuctionTitle('');
    setAuctionClient('');
    setAuctionLocation('');
    setAuctionValue('');
    setAuctionDuration('');
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f9] font-sans">
        <div className="text-slate-600 text-sm font-semibold animate-pulse">Accessing Admin Console...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f9] flex flex-col justify-between font-sans text-left">
      
      {/* 1. Admin Header Bar */}
      <nav className="w-full bg-[#1b4e7e] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-widest text-amber-500 uppercase">GeM</span>
            <span className="text-lg font-extrabold border-l border-white/20 pl-2">Admin Dashboard</span>
          </div>

          {/* Tab Switchers */}
          <div className="flex gap-1 bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('tender')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === 'tender' ? 'bg-white text-[#1b4e7e] shadow-sm' : 'text-white hover:bg-white/5'}`}
            >
              Tenders Panel
            </button>
            <button
              onClick={() => setActiveTab('auction')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === 'auction' ? 'bg-white text-[#1b4e7e] shadow-sm' : 'text-white hover:bg-white/5'}`}
            >
              Auctions Panel
            </button>
          </div>

          {/* Profile Name Display & Logout */}
          <div className="flex items-center gap-3">
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-3 py-1 rounded-full text-xs font-bold hidden md:block">
              Role: System Administrator
            </div>
            <button
              onClick={handleLogout}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              Logout
            </button>
          </div>

        </div>
      </nav>

      {/* 2. Main Dashboard Layout Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        
        {/* Welcome Section */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Welcome back, {admin.fullName}!
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              You are signed in as <span className="underline font-bold text-slate-600">{admin.email}</span>. You can manage Tenders and Auctions below.
            </p>
          </div>
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full">
            Console Connected
          </div>
        </div>

        {/* Tenders Section */}
        {activeTab === 'tender' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Active Tenders List View */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span>Active Tenders Repository</span>
                <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">{tenders.length}</span>
              </h2>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
                {tenders.map((t, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">TENDER ID: {t.id}</span>
                        <h3 className="text-sm font-bold text-slate-800 mt-1 line-clamp-1">{t.title}</h3>
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${t.matchType === 'High Match' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {t.matchType}
                      </span>
                    </div>

                    {/* Meta parameters */}
                    <div className="grid grid-cols-3 gap-4 pt-1 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Client</span>
                        <span className="font-semibold text-slate-700 line-clamp-1">{t.client}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Location</span>
                        <span className="font-semibold text-slate-700">{t.location}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Estimated Value</span>
                        <span className="font-bold text-slate-800">{t.value}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-xs">
                      <span className="text-slate-500 font-medium">Closes in: <span className="font-bold text-slate-700">{t.closingDate}</span></span>
                      <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-not-allowed" disabled>
                        Audit Details
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Right: Add New Tender Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-fit">
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1b4e7e]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Add New Tender</span>
              </h2>

              <form onSubmit={handleAddTender} className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Tender ID</label>
                  <input
                    type="text"
                    required
                    value={tenderId}
                    onChange={(e) => setTenderId(e.target.value)}
                    placeholder="e.g. MHR/2026/009124"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Tender Title</label>
                  <input
                    type="text"
                    required
                    value={tenderTitle}
                    onChange={(e) => setTenderTitle(e.target.value)}
                    placeholder="e.g. Procurement of Steel Beams for Bridge Construction"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Client Agency Name</label>
                  <input
                    type="text"
                    required
                    value={tenderClient}
                    onChange={(e) => setTenderClient(e.target.value)}
                    placeholder="e.g. Department of Infrastructure"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Location</label>
                    <input
                      type="text"
                      required
                      value={tenderLocation}
                      onChange={(e) => setTenderLocation(e.target.value)}
                      placeholder="e.g. Gujarat"
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Est. Value</label>
                    <input
                      type="text"
                      required
                      value={tenderValue}
                      onChange={(e) => setTenderValue(e.target.value)}
                      placeholder="e.g. ₹180 Crores"
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Closing Date</label>
                    <input
                      type="text"
                      required
                      value={tenderClosing}
                      onChange={(e) => setTenderClosing(e.target.value)}
                      placeholder="e.g. 10 Days (15 Nov 2026)"
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Match Priority</label>
                    <select
                      value={tenderMatch}
                      onChange={(e) => setTenderMatch(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] cursor-pointer"
                    >
                      <option value="High Match">High Match</option>
                      <option value="Medium Match">Medium Match</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1b4e7e] hover:bg-[#133c62] text-white text-xs font-bold py-2.5 rounded-lg cursor-pointer transition-colors shadow mt-2"
                >
                  Publish Tender Notice
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Auctions Section */}
        {activeTab === 'auction' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Active Auctions List View */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span>Active Reverse Auctions Arena</span>
                <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">{auctions.length}</span>
              </h2>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 no-scrollbar">
                {auctions.map((a, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-slate-300 transition-colors">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">AUCTION ID: {a.id}</span>
                        <h3 className="text-sm font-bold text-slate-800 mt-1 line-clamp-1">{a.title}</h3>
                      </div>
                      <span className="bg-rose-50 text-rose-700 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                        <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span>
                        {a.status}
                      </span>
                    </div>

                    {/* Meta parameters */}
                    <div className="grid grid-cols-3 gap-4 pt-1 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Agency Client</span>
                        <span className="font-semibold text-slate-700 line-clamp-1">{a.client}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Location</span>
                        <span className="font-semibold text-slate-700">{a.location}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Current Lowest Bid</span>
                        <span className="font-bold text-slate-800">{a.startingValue}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center border-t border-slate-100 pt-3 text-xs">
                      <span className="text-slate-500 font-medium">Bidding Closes in: <span className="font-bold text-[#1b4e7e]">{a.duration}</span></span>
                      <button className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-not-allowed" disabled>
                        Monitor Arena
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Right: Add New Auction Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-fit">
              <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#1b4e7e]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Add New Auction</span>
              </h2>

              <form onSubmit={handleAddAuction} className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Auction ID</label>
                  <input
                    type="text"
                    required
                    value={auctionId}
                    onChange={(e) => setAuctionId(e.target.value)}
                    placeholder="e.g. RA/OSD/7735"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Auction Item Title</label>
                  <input
                    type="text"
                    required
                    value={auctionTitle}
                    onChange={(e) => setAuctionTitle(e.target.value)}
                    placeholder="e.g. Supply of Office Stationery - Phase II"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Client Agency Name</label>
                  <input
                    type="text"
                    required
                    value={auctionClient}
                    onChange={(e) => setAuctionClient(e.target.value)}
                    placeholder="e.g. All India Institute of Medical Sciences"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Location</label>
                    <input
                      type="text"
                      required
                      value={auctionLocation}
                      onChange={(e) => setAuctionLocation(e.target.value)}
                      placeholder="e.g. Delhi NCR"
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Start Price</label>
                    <input
                      type="text"
                      required
                      value={auctionValue}
                      onChange={(e) => setAuctionValue(e.target.value)}
                      placeholder="e.g. ₹15,000"
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Arena Duration</label>
                  <input
                    type="text"
                    required
                    value={auctionDuration}
                    onChange={(e) => setAuctionDuration(e.target.value)}
                    placeholder="e.g. 05:00 mins"
                    className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1b4e7e] hover:bg-[#133c62] text-white text-xs font-bold py-2.5 rounded-lg cursor-pointer transition-colors shadow mt-2"
                >
                  Initiate Reverse Auction
                </button>
              </form>
            </div>

          </div>
        )}

      </main>

      {/* 3. Footer Simple */}
      <FooterSimple />

    </div>
  );
}
