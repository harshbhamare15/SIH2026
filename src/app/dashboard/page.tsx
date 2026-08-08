'use client';

// Force re-build clean swc cache
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FooterSimple from '@/components/FooterSimple';

interface UserProfile {
  fullName: string;
  email: string;
  mobile: string;
  orgName: string;
  orgType?: string;
  address?: string;
}

interface TenderItem {
  id: string;
  title: string;
  dept: string;
  location: string;
  value: string;
  deadline: string;
  match: 'High Match' | 'Medium Match';
  status: 'active' | 'submitted';
  myBid?: string;
}

interface ArenaAuctionItem {
  id: string;
  title: string;
  lowestBid: number;
  type: 'arena' | 'sub';
  timeLeft: string;
  status: 'active' | 'placed';
  myBid?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'tender' | 'auction'>('tender');
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar interactive states
  const [filterSubmittedOnly, setFilterSubmittedOnly] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [reverseArenaBidOpen, setReverseArenaBidOpen] = useState(false);
  const [reverseBidInput, setReverseBidInput] = useState('');

  // Reverse Arena Timer: countdown from 3 minutes 45 seconds (225s)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(225);

  // Modals state
  const [selectedTender, setSelectedTender] = useState<TenderItem | null>(null);
  const [bidValue, setBidValue] = useState('');

  // Mock states for Tenders (aligned with user's target cards layout)
  const [tenders, setTenders] = useState<TenderItem[]>([
    {
      id: 'NHAI/009123',
      title: 'National Highway Expansion - Package 7',
      dept: 'National Highways Authority',
      location: 'Maharashtra',
      value: '₹550 Crores',
      deadline: '4 Days (22 Oct 2026)',
      match: 'High Match',
      status: 'active'
    },
    {
      id: 'AIIMS/004812',
      title: 'Supply of High-Resolution Medical Monitors',
      dept: 'AIIMS New Delhi',
      location: 'Delhi NCR',
      value: '₹12.30 Crores',
      deadline: '12 Days (03 Sep 2026)',
      match: 'High Match',
      status: 'active'
    },
    {
      id: 'NIC/007391',
      title: 'IT Infrastructure Servers & Network Upgrade',
      dept: 'National Informatics Centre',
      location: 'Karnataka',
      value: '₹5.80 Crores',
      deadline: '8 Days (18 Aug 2026)',
      match: 'Medium Match',
      status: 'active'
    },
    {
      id: 'IITD/005231',
      title: 'Rooftop Solar Power Plant Commission (500kW)',
      dept: 'IIT Delhi Engineering Wing',
      location: 'Delhi',
      value: '₹2.10 Crores',
      deadline: '6 Days (16 Aug 2026)',
      match: 'High Match',
      status: 'active'
    },
  ]);

  // Mock state for Arena Auctions (supporting functional search filtering)
  const [auctions, setAuctions] = useState<ArenaAuctionItem[]>([
    {
      id: 'OSD/7734',
      title: 'Office Stationery Supply',
      lowestBid: 12500,
      type: 'arena',
      timeLeft: '03:45',
      status: 'active'
    },
    {
      id: 'RA-9012',
      title: 'Heavy Machinery',
      lowestBid: 90012,
      type: 'sub',
      timeLeft: '03 | 04:00 | 05',
      status: 'active'
    },
    {
      id: 'RA-8855',
      title: 'Steel Beam Procurement',
      lowestBid: 34950,
      type: 'sub',
      timeLeft: '08 | 05:24 | 05',
      status: 'active'
    }
  ]);

  // Count active bids
  const activeBidsCount = tenders.filter(t => t.status === 'submitted').length;

  // Reverse Arena Timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => (prev > 0 ? prev - 1 : 225));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Authenticate user check on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('logged-in-user');
      if (!loggedIn) {
        alert('Unauthorized access. Redirecting to login page.');
        router.push('/login');
      } else {
        const parsed = JSON.parse(loggedIn);
        setUser(parsed);
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam === 'tender' || tabParam === 'auction') {
          setActiveTab(tabParam);
        }
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('logged-in-user');
    alert('Logged out successfully.');
    router.push('/');
  };

  const handleTenderBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender || !bidValue) return;

    setTenders(prev =>
      prev.map(t =>
        t.id === selectedTender.id ? { ...t, status: 'submitted', myBid: `₹ ${parseFloat(bidValue).toLocaleString()} Crores` } : t
      )
    );
    alert(`Bid of ${bidValue} Crores submitted successfully for Tender ${selectedTender.id}!`);
    setSelectedTender(null);
    setBidValue('');
  };

  const handleQuickApply = (item: TenderItem) => {
    setTenders(prev =>
      prev.map(t =>
        t.id === item.id ? { ...t, status: 'submitted', myBid: 'Quick Apply Vault' } : t
      )
    );
    alert(`Quick Apply Vault Submission successful for Tender ${item.id}! Pre-uploaded documents securely fetched and signed.`);
  };

  const handleReverseArenaBid = (e: React.FormEvent) => {
    e.preventDefault();
    const bidVal = parseFloat(reverseBidInput);
    if (isNaN(bidVal)) return;

    const currentLowest = auctions.find(a => a.id === 'OSD/7734')?.lowestBid || 12500;

    if (bidVal >= currentLowest) {
      alert(`In a reverse auction, your bid must be LOWER than the current lowest bid of ₹${currentLowest.toLocaleString()}`);
      return;
    }

    setAuctions(prev =>
      prev.map(a =>
        a.id === 'OSD/7734' ? { ...a, lowestBid: bidVal, status: 'placed', myBid: bidVal } : a
      )
    );
    alert(`Bid placed! New Lowest bid in Arena is now ₹${bidVal.toLocaleString()}`);
    setReverseArenaBidOpen(false);
    setReverseBidInput('');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-slate-600 text-sm font-semibold animate-pulse">Loading Dashboard Coordinates...</div>
      </div>
    );
  }

  // Filter lists based on Search Query
  const baseTenders = filterSubmittedOnly ? tenders.filter(t => t.status === 'submitted') : tenders;
  const filteredTenders = baseTenders.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAuctions = auctions.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split filtered auctions for rendering
  const arenaAuctionMatch = filteredAuctions.find(a => a.type === 'arena');
  const subAuctionsMatches = filteredAuctions.filter(a => a.type === 'sub');

  // Dynamic lowest bid computed from current state array for sync
  const currentLowestBid = auctions.find(a => a.id === 'OSD/7734')?.lowestBid || 12500;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-left">
      
      {/* 1. Header Navigation Bar */}
      <nav className="w-full bg-[#1b4e7e] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-widest text-amber-500 uppercase">GeM</span>
            <span className="text-lg font-extrabold border-l border-white/20 pl-2">Dashboard</span>
          </div>

          {/* Navigation Options: Tender & Auction */}
          <div className="flex gap-1 bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => { setActiveTab('tender'); setSearchQuery(''); setFilterSubmittedOnly(false); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === 'tender' ? 'bg-white text-[#1b4e7e] shadow-sm' : 'text-white hover:bg-white/5'}`}
            >
              Tender
            </button>
            <button
              onClick={() => { setActiveTab('auction'); setSearchQuery(''); }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === 'auction' ? 'bg-white text-[#1b4e7e] shadow-sm' : 'text-white hover:bg-white/5'}`}
            >
              Auction
            </button>
          </div>

          {/* Profile Section */}
          <div className="relative">
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full p-1 pr-4 cursor-pointer select-none transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500 text-[#1b4e7e] font-black text-xs flex items-center justify-center">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white tracking-wide">{user.fullName}</span>
            </button>
          </div>

        </div>
      </nav>

      {/* 2. Main content dashboard */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full space-y-6">
        
        {/* Welcome message */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-slate-800">
              Welcome back, {user.fullName}!
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Registered Vendor/Bidder associated with <strong className="text-slate-700">{user.orgName}</strong>
            </p>
          </div>
          <div className="bg-primary-light border border-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg self-start sm:self-auto uppercase tracking-wide select-none">
            Status: Active Vendor
          </div>
        </div>

        {/* Dynamic Panel Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-widest border-l-4 border-primary pl-3.5">
              {activeTab === 'tender' ? 'Active Tenders' : 'Live Reverse Auction Arena'}
            </h2>
            {filterSubmittedOnly && activeTab === 'tender' && (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                Filtered: Active Bids
              </span>
            )}
          </div>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-800"
              placeholder={`Search ${activeTab} ID or Title...`}
            />
            <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637z"/>
            </svg>
          </div>
        </div>

        {/* Dynamic Panels */}
        {activeTab === 'tender' ? (
          /* Tender Panel with sidebar tools integration */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 columns: Tender Cards Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTenders.length > 0 ? (
                  filteredTenders.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm">
                      
                      {/* Top half: White background */}
                      <div className="p-5 space-y-4 text-left">
                        {/* Title and Match Badge */}
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-bold text-slate-800 text-sm md:text-[15px] leading-snug">
                            {item.title}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${item.match === 'High Match' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' : 'bg-amber-50 text-amber-700 border border-amber-100/50'}`}>
                            {item.match}
                          </span>
                        </div>

                        {/* Metadata Details */}
                        <div className="space-y-2 text-xs md:text-sm">
                          <p className="text-slate-700">
                            <span className="text-slate-400 font-medium">Tender ID:</span> <span className="font-bold text-slate-800">{item.id}</span>
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <p className="text-slate-700">
                              <span className="text-slate-400 font-medium">Client:</span> <span className="font-bold text-slate-800">{item.dept}</span>
                            </p>
                            <p className="text-slate-700">
                              <span className="text-slate-400 font-medium">Location:</span> <span className="font-bold text-slate-800">{item.location}</span>
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <p className="text-slate-700">
                              <span className="text-slate-400 font-medium">Est. Value:</span> <span className="font-bold text-slate-800">{item.value}</span>
                            </p>
                            <p className="text-slate-700">
                              <span className="text-slate-400 font-medium">Bid Closes in:</span> <span className="font-bold text-slate-800">{item.deadline}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom half: light blue shading */}
                      <div className="bg-[#f0f6fc] border-t border-slate-100 p-4 grid grid-cols-2 gap-4 items-center">
                        <button
                          onClick={() => setSelectedTender(item)}
                          className="w-full bg-white hover:bg-slate-50 text-primary border border-primary/20 hover:border-primary font-bold py-2.5 rounded-lg cursor-pointer transition-colors text-center text-xs shadow-sm h-11"
                        >
                          View Details
                        </button>
                        
                        {item.status === 'active' ? (
                          <button
                            onClick={() => handleQuickApply(item)}
                            className="w-full bg-[#1b4e7e] hover:bg-[#163f68] text-white rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center py-1.5 px-2 shadow-md h-11"
                          >
                            <span className="font-bold text-[11px]">Quick Apply (Vault)</span>
                            <span className="text-[8px] opacity-80 leading-none mt-0.5 whitespace-nowrap">One-click action pre-uploaded documents</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-slate-200 text-slate-400 border border-slate-300 rounded-lg cursor-not-allowed flex flex-col items-center justify-center py-1.5 px-2 h-11"
                          >
                            <span className="font-bold text-[11px]">Submitted</span>
                            <span className="text-[8px] opacity-80 leading-none mt-0.5">
                              {item.myBid === 'Quick Apply Vault' ? 'Vault Record Synced' : 'Bid Submitted'}
                            </span>
                          </button>
                        )}
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="col-span-2 bg-white p-8 text-center text-slate-400 italic rounded-xl border border-slate-200">
                    No active tenders found matching search query.
                  </div>
                )}
              </div>
            </div>

            {/* Right 1 column: Sidebar containing the toolcards (Reordered: Auction -> Tools -> Recommended) */}
            <div className="space-y-6 text-left">
              
              {/* 1. Live Reverse Auction Arena (Rendered First) */}
              <div className="bg-[#133c62] text-white rounded-xl shadow-md overflow-hidden p-6 border border-[#1b4e7e] flex flex-col justify-between relative">
                
                {/* Header Title */}
                <div>
                  <h3 className="text-sm font-bold tracking-wider uppercase opacity-90 mb-3 text-left">
                    Live Reverse Auction Arena
                  </h3>

                  {/* Auction ID */}
                  <div className="space-y-0.5 text-left mb-4">
                    <span className="text-[9px] font-bold text-white/40 block uppercase">Auction ID</span>
                    <span className="font-bold text-xs">OSD/7734 - Office Stationery Supply</span>
                  </div>

                  <div className="w-full h-px bg-white/10 mb-4" />

                  {/* Pricing grid */}
                  <div className="grid grid-cols-2 gap-4 text-left mb-4">
                    <div>
                      <span className="text-[9px] font-bold text-white/40 block uppercase">Current Lowest Bid</span>
                      <span className="font-extrabold text-base text-white">₹ {currentLowestBid.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-white/40 block uppercase">Time Left</span>
                      <span className="font-bold text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30 whitespace-nowrap">
                        ⏳ {formatTime(timeLeftSeconds)} mins
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live wave visualization SVG chart */}
                <div className="w-full h-20 mb-6 relative">
                  <svg className="w-full h-full" viewBox="0 0 340 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="waveGradientTenderArenaSide" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f0803c" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#f0803c" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M10,100 L10,80 Q30,65 50,50 T90,90 T130,60 T170,80 T210,40 T250,85 T290,50 T330,60 L330,100 Z"
                      fill="url(#waveGradientTenderArenaSide)"
                    />
                    <path
                      d="M10,80 Q30,65 50,50 T90,90 T130,60 T170,80 T210,40 T250,85 T290,50 T330,60"
                      fill="none"
                      stroke="#f0803c"
                      strokeWidth="2.5"
                    />
                    <circle cx="50" cy="50" r="4.5" fill="#f0803c" stroke="#133c62" strokeWidth="1.5" />
                    <circle cx="130" cy="60" r="4.5" fill="#f0803c" stroke="#133c62" strokeWidth="1.5" />
                    <circle cx="210" cy="40" r="4.5" fill="#f0803c" stroke="#133c62" strokeWidth="1.5" />
                    <circle cx="290" cy="50" r="4.5" fill="#f0803c" stroke="#133c62" strokeWidth="1.5" />
                  </svg>
                </div>

                {/* Orange Action Button */}
                <button
                  onClick={() => setReverseArenaBidOpen(true)}
                  className="w-full py-3 bg-[#e07a5f] hover:bg-[#cf6b50] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center shadow-md select-none"
                >
                  Place Lower Bid Now
                </button>

              </div>

              {/* 2. Tender Management Tools (Rendered Second) */}
              <div className="bg-[#133c62] text-white rounded-xl shadow-md overflow-hidden p-6 border border-[#1b4e7e]">
                <h3 className="text-sm font-bold tracking-wider uppercase opacity-90 border-b border-white/10 pb-3 mb-4">
                  Tender Management Tools
                </h3>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setFilterSubmittedOnly(!filterSubmittedOnly)}
                    className="w-full flex items-center justify-between py-2 text-left group hover:opacity-80 transition-all cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold">My Active Bids ({activeBidsCount})</span>
                      <p className="text-[10px] text-white/50">
                        {filterSubmittedOnly ? 'Showing submitted bids (Click to clear)' : 'Filter by applied bids'}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                    </svg>
                  </button>

                  <div className="w-full h-px bg-white/10" />

                  <button
                    onClick={() => setVaultOpen(true)}
                    className="w-full flex items-center justify-between py-2 text-left group hover:opacity-80 transition-all cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold">Document Vault Access</span>
                      <span className="text-[10px] text-white/50 block">(All Active)</span>
                    </div>
                    <svg className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* 3. Recommended Tenders (Rendered Third) */}
              <div className="bg-[#133c62] text-white rounded-xl shadow-md overflow-hidden p-6 border border-[#1b4e7e]">
                <h3 className="text-sm font-bold tracking-wider uppercase opacity-90 mb-4 text-left">
                  Recommended Tenders
                </h3>
                
                {/* White Inner Card */}
                <div className="bg-white rounded-lg p-4 text-slate-800 flex items-center justify-between gap-4 border border-white/10 shadow-inner">
                  <div className="text-left space-y-1">
                    <span className="text-[11px] font-extrabold text-[#133c62] block leading-tight">
                      Recommended Tenders
                    </span>
                    <span className="text-[10px] text-slate-600 font-semibold block leading-relaxed">
                      OSD/7734 - Office Stationery Supply
                    </span>
                  </div>
                  
                  {/* Verified profile avatar box */}
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center shrink-0 relative">
                    <svg className="w-6 h-6 text-[#1b4e7e]/70" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    {/* Green check icon overlay */}
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border border-white rounded-full flex items-center justify-center shadow-sm select-none">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* ----------------- AUCTION TAB ----------------- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 columns: Active Arena large card and lower grid cards */}
            <div className="lg:col-span-2 space-y-6 text-left">
              
              {/* 1. Large Header Card - OSD/7734 Arena */}
              {arenaAuctionMatch ? (
                <div className="bg-[#133c62] text-white rounded-xl shadow-md overflow-hidden p-6 border border-[#1b4e7e] relative">
                  
                  {/* Header Row */}
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-extrabold text-sm md:text-base tracking-wide">
                      {arenaAuctionMatch.id} - {arenaAuctionMatch.title}
                    </h3>
                    {/* Digital ticking counters */}
                    <div className="flex gap-1 select-none">
                      {['03', '04', '02', '05'].map((num, idx) => (
                        <span key={idx} className="bg-slate-900/60 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-white/5">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Subtitle / Details row */}
                  <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
                    <div>
                      <span className="text-[10px] text-white/50 block uppercase tracking-wider font-semibold">Current Lowest Bid</span>
                      <span className="text-lg md:text-xl font-black text-white">₹ {arenaAuctionMatch.lowestBid.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-white/50 block uppercase tracking-wider font-semibold">Time Left</span>
                      <span className="text-sm md:text-base font-bold text-white font-mono">{formatTime(timeLeftSeconds)} mins</span>
                    </div>
                  </div>

                  {/* Live wave SVG curve */}
                  <div className="w-full h-24 mb-6 relative">
                    <svg className="w-full h-full" viewBox="0 0 340 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f0803c" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#f0803c" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M10,100 L10,80 Q30,65 50,50 T90,90 T130,60 T170,80 T210,40 T250,85 T290,50 T330,60 L330,100 Z"
                        fill="url(#waveGradient)"
                      />
                      <path
                        d="M10,80 Q30,65 50,50 T90,90 T130,60 T170,80 T210,40 T250,85 T290,50 T330,60"
                        fill="none"
                        stroke="#f0803c"
                        strokeWidth="2.5"
                      />
                      <circle cx="50" cy="50" r="4.5" fill="#f0803c" stroke="#133c62" strokeWidth="1.5" />
                      <circle cx="130" cy="60" r="4.5" fill="#f0803c" stroke="#133c62" strokeWidth="1.5" />
                      <circle cx="210" cy="40" r="4.5" fill="#f0803c" stroke="#133c62" strokeWidth="1.5" />
                      <circle cx="290" cy="50" r="4.5" fill="#f0803c" stroke="#133c62" strokeWidth="1.5" />
                    </svg>
                    <span className="absolute bottom-1 right-2 text-[9px] text-white/50 font-bold uppercase tracking-wider select-none">
                      Bid trends Last 5 minutes
                    </span>
                  </div>

                  {/* Orange main bid trigger */}
                  <button
                    onClick={() => setReverseArenaBidOpen(true)}
                    className="w-full py-3 bg-[#e07a5f] hover:bg-[#cf6b50] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center shadow-md select-none"
                  >
                    Place Lower Bid Now
                  </button>

                </div>
              ) : (
                searchQuery && (
                  <div className="bg-[#133c62]/40 text-white/60 rounded-xl p-6 text-center italic border border-[#1b4e7e]/50 text-xs">
                    Main Stationery Arena Auction hidden by search filter.
                  </div>
                )
              )}

              {/* 2. Subgrid of Smaller Active Auctions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subAuctionsMatches.length > 0 ? (
                  subAuctionsMatches.map((item) => (
                    <div key={item.id} className="bg-[#133c62] text-white rounded-xl shadow-md overflow-hidden border border-[#1b4e7e] flex flex-col justify-between p-5 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-bold text-xs md:text-sm">{item.title} ({item.id})</h4>
                        <span className="bg-amber-500/20 text-amber-300 text-[8px] font-bold px-2 py-0.5 rounded border border-amber-500/30 uppercase">
                          Active Auctions
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-white/50 uppercase font-semibold">Current Lowest Bid</p>
                        <p className="text-sm font-extrabold">Current Lowest: ₹{item.lowestBid.toLocaleString()}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/10 text-[10px]">
                        <div className="flex gap-1 bg-slate-900/40 p-1 rounded select-none">
                          <span className="font-mono">{item.timeLeft}</span>
                        </div>
                        <button
                          onClick={() => alert(`Placing bid for ${item.title} (${item.id})`)}
                          className="bg-white/10 hover:bg-white/20 border border-white/20 py-1 px-3 rounded text-[9px] font-bold transition-all cursor-pointer"
                        >
                          Bid Now
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  searchQuery && subAuctionsMatches.length === 0 && (
                    <div className="col-span-2 bg-[#133c62]/40 text-white/60 rounded-xl p-6 text-center italic border border-[#1b4e7e]/50 text-xs">
                      No matching secondary active auctions.
                    </div>
                  )
                )}
              </div>

              {/* General Empty State */}
              {filteredAuctions.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 italic text-xs">
                  No active auctions found matching search query "{searchQuery}".
                </div>
              )}

            </div>

            {/* Right 1 column: Sidebar containing "My Auction Activity" */}
            <div className="space-y-6 text-left">
              
              {/* Card: My Auction Activity */}
              <div className="bg-[#133c62] text-white rounded-xl shadow-md overflow-hidden p-6 border border-[#1b4e7e] space-y-5">
                
                {/* 1. Header & Live Bids Row */}
                <div>
                  <h3 className="text-sm font-bold tracking-wider uppercase opacity-90 border-b border-white/10 pb-3 mb-4">
                    My Auction Activity
                  </h3>
                  <div className="flex items-center justify-between hover:opacity-85 cursor-pointer py-1 select-none">
                    <span className="text-xs font-bold">Live Bids (2)</span>
                    <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
                    </svg>
                  </div>
                </div>

                <div className="w-full h-px bg-white/10" />

                {/* 2. Auction Watchlist Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold">Auction Watchlist</h4>
                    <div className="flex gap-2 text-[9px] font-bold text-white/50 select-none">
                      <span className="text-white border-b border-white pb-0.5">Live Bids (2)</span>
                      <span>Watchlist</span>
                    </div>
                  </div>
                  
                  {/* Data Row */}
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-wide">
                    <span className="opacity-60">BID</span>
                    <div className="flex gap-3">
                      <span>1.94</span>
                      <span>29.06</span>
                      <span className="text-emerald-400 font-extrabold">+2.78%</span>
                    </div>
                  </div>

                  {/* Bicolor Slider bar red/green */}
                  <div className="space-y-1">
                    <div className="relative w-full h-1.5 rounded-full overflow-hidden flex">
                      <div className="w-1/2 h-full bg-rose-500" />
                      <div className="w-1/2 h-full bg-emerald-500" />
                      {/* Indicator node dot overlay */}
                      <span className="absolute top-1/2 -translate-y-1/2 left-[68%] w-3 h-3 bg-yellow-300 border-2 border-[#133c62] rounded-full shadow" />
                    </div>
                    <div className="flex justify-between text-[9px] text-white/40 font-bold">
                      <span>Low</span>
                      <span>1</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-white/10" />

                {/* 3. Market Sentiment indicator */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold">Market Sentiment</h4>
                  
                  <div className="space-y-2 text-[10px] font-bold tracking-wide">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400">Capital</span>
                      <div className="flex gap-2 items-center">
                        <span className="text-emerald-400">+0.20%</span>
                        <span className="text-emerald-400 font-black">▲ 6.89%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Sentiment</span>
                      <span className="text-emerald-400">+0.20%</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-white/10" />

                {/* 4. Bottom ticking status */}
                <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 select-none">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                  <span>Updating...</span>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* 3. Modal Forms overlay popup */}
      
      {/* Reverse Auction Arena Modal */}
      {reverseArenaBidOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-left space-y-4">
            <div>
              <span className="text-[9px] font-bold bg-[#e07a5f] text-white px-2 py-0.5 rounded">REVERSE ARENA BID</span>
              <h3 className="text-base font-bold text-slate-800 mt-2">
                {auctions.find(a => a.id === 'OSD/7734')?.id} - {auctions.find(a => a.id === 'OSD/7734')?.title}
              </h3>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
              <p><strong>Current Lowest Bidded Amount:</strong><br /><span className="text-sm font-bold text-slate-800">₹ {(auctions.find(a => a.id === 'OSD/7734')?.lowestBid || 12500).toLocaleString()}</span></p>
            </div>

            <form onSubmit={handleReverseArenaBid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                  Enter Lower Bid Amount (₹)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                    ₹
                  </div>
                  <input
                    type="number"
                    required
                    value={reverseBidInput}
                    onChange={(e) => setReverseBidInput(e.target.value)}
                    className="w-full pl-7 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-800"
                    placeholder={`Must be below ₹${(auctions.find(a => a.id === 'OSD/7734')?.lowestBid || 12500).toLocaleString()}`}
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setReverseArenaBidOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#e07a5f] hover:bg-[#cf6b50] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Place Lower Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nic-Vault Document Manager Modal */}
      {vaultOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-left space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold bg-[#1b4e7e] text-white px-2 py-0.5 rounded">NIC VAULT SERVICES</span>
                <h3 className="text-base font-bold text-slate-800 mt-2">Document Vault Access</h3>
              </div>
              <button
                onClick={() => setVaultOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              These pre-uploaded documents are securely signed and automatically verified by the government certifying authority (NIC-CA) for immediate bid submissions.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {[
                { name: 'GSTIN_Registration_Certificate.pdf', size: '1.2 MB', desc: 'GST Registration Certificate - Form REG-06' },
                { name: 'PAN_Corporate_Card_Verification.pdf', size: '820 KB', desc: 'Enterprise PAN Verification Record' },
                { name: 'Contractor_Class-I_License.pdf', size: '2.4 MB', desc: 'Class-I Contractor License (NIC-Gov)' },
                { name: 'Latest_ITR_Form-5_AY24.pdf', size: '3.1 MB', desc: 'Income Tax Return statement' }
              ].map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs gap-3">
                  <div className="truncate space-y-0.5">
                    <span className="font-bold text-slate-700 block truncate">{doc.name}</span>
                    <span className="text-[10px] text-slate-400 block">{doc.desc} ({doc.size})</span>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full uppercase shrink-0">
                    Verified
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-100 justify-end">
              <button
                type="button"
                onClick={() => setVaultOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tender Bid Modal */}
      {selectedTender && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-left space-y-4">
            <div>
              <span className="text-[9px] font-bold bg-primary text-white px-2 py-0.5 rounded">TENDER ENROLMENT</span>
              <h3 className="text-base font-bold text-slate-800 mt-2">{selectedTender.title}</h3>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">{selectedTender.id} | {selectedTender.dept}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-600 border border-slate-100">
              <p><strong>Estimated Value:</strong> {selectedTender.value}</p>
              <p><strong>Submission Deadline:</strong> {selectedTender.deadline}</p>
            </div>

            <form onSubmit={handleTenderBidSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                  Enter Your Bid Value (in Crores)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-xs">
                    ₹
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={bidValue}
                    onChange={(e) => setBidValue(e.target.value)}
                    className="w-full pl-7 pr-16 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-800"
                    placeholder="e.g. 45.80"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-bold text-[10px] uppercase">
                    Crores
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  Provide competitive bids below the estimated tender value.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTender(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  Submit Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Simple */}
      <FooterSimple />

    </div>
  );
}
