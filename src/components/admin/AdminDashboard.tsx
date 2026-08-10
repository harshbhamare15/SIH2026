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

  // Dynamic Lists for Tenders and Auctions
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isLoadingTenders, setIsLoadingTenders] = useState(false);
  const [isSubmittingTender, setIsSubmittingTender] = useState(false);
  const [selectedAuditTender, setSelectedAuditTender] = useState<Tender | null>(null);
  const [isDeletingTender, setIsDeletingTender] = useState(false);

  // Application & Axiom Cryptographic Engine State
  const [applicationSummary, setApplicationSummary] = useState<Record<string, any>>({});
  const [tenderAppData, setTenderAppData] = useState<any | null>(null);
  const [isLoadingAppData, setIsLoadingAppData] = useState(false);
  const [isUnsealing, setIsUnsealing] = useState(false);

  // Live Countdown & Timelock Engine State
  const [now, setNow] = useState(Date.now());
  const [tenderDeadlines, setTenderDeadlines] = useState<Record<string, number>>({});

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
  const [tenderDays, setTenderDays] = useState('0');
  const [tenderHours, setTenderHours] = useState('0');
  const [tenderMinutes, setTenderMinutes] = useState('2');
  const [tenderSeconds, setTenderSeconds] = useState('0');
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

      // Fetch application counts summary for all tenders
      const loadAppSummary = async () => {
        try {
          const res = await fetch('/api/applications');
          const data = await res.json();
          if (res.ok && data.summary) {
            setApplicationSummary(data.summary);
          }
        } catch (err) {
          console.error('Error fetching application summary:', err);
        }
      };

      // Fetch persistent live tenders from MySQL backend
      const loadTenders = async () => {
        try {
          setIsLoadingTenders(true);
          const res = await fetch('/api/tenders');
          const data = await res.json();
          if (res.ok && Array.isArray(data.tenders)) {
            const normalized = normalizeAdminTenders(data.tenders);
            setTenders(normalized);
            localStorage.setItem('user-tenders', JSON.stringify(data.tenders));

            // Initialize deadlines for tenders if not set
            const savedDeadlines = localStorage.getItem('axiom_tender_deadlines');
            let deadlineMap: Record<string, number> = savedDeadlines ? JSON.parse(savedDeadlines) : {};
            normalized.forEach((t) => {
              if (!deadlineMap[t.id]) {
                const str = t.closingDate || '';
                const num = parseFloat(str);
                if (str.includes('min') || str.includes('sec')) {
                  const mins = !isNaN(num) ? num : 2;
                  deadlineMap[t.id] = Date.now() + mins * 60 * 1000;
                } else {
                  const parsed = new Date(str).getTime();
                  if (!isNaN(parsed) && parsed > Date.now()) {
                    deadlineMap[t.id] = parsed;
                  } else {
                    deadlineMap[t.id] = Date.now() + 3 * 60 * 1000; // Default 3 min demo timer
                  }
                }
              }
            });
            setTenderDeadlines(deadlineMap);
            localStorage.setItem('axiom_tender_deadlines', JSON.stringify(deadlineMap));
          } else {
            const savedTenders = localStorage.getItem('user-tenders');
            if (savedTenders) {
              setTenders(normalizeAdminTenders(JSON.parse(savedTenders)));
            }
          }
        } catch (e) {
          console.error('Error fetching tenders from database:', e);
          const savedTenders = localStorage.getItem('user-tenders');
          if (savedTenders) {
            setTenders(normalizeAdminTenders(JSON.parse(savedTenders)));
          }
        } finally {
          setIsLoadingTenders(false);
        }
      };

      loadTenders();
      loadAppSummary();

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

  // Real-time ticking interval for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown resolver for any tender
  const getTenderCountdown = (t: Tender) => {
    const target = tenderDeadlines[t.id] || (new Date(t.closingDate).getTime() > 0 ? new Date(t.closingDate).getTime() : 0);
    if (!target) return { isExpired: false, text: t.closingDate, diff: 999999, days: '00', hours: '00', mins: '00', secs: '00' };

    const diff = target - now;
    if (diff <= 0) {
      return {
        isExpired: true,
        diff: 0,
        days: '00',
        hours: '00',
        mins: '00',
        secs: '00',
        text: '00d : 00h : 00m : 00s • Deadline Elapsed',
        formatted: '00d : 00h : 00m : 00s',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200'
      };
    }

    const totalSecs = Math.floor(diff / 1000);
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const dStr = days.toString().padStart(2, '0');
    const hStr = hours.toString().padStart(2, '0');
    const mStr = mins.toString().padStart(2, '0');
    const sStr = secs.toString().padStart(2, '0');

    const formatted = `${dStr}d : ${hStr}h : ${mStr}m : ${sStr}s`;

    return {
      isExpired: false,
      diff,
      days: dStr,
      hours: hStr,
      mins: mStr,
      secs: sStr,
      text: `${formatted} remaining`,
      formatted,
      badgeClass: diff < 60000 ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse' : 'bg-amber-50 text-amber-900 border-amber-200'
    };
  };

  // Automated Timelock Unseal: Trigger when deadline countdown reaches 0
  useEffect(() => {
    if (selectedAuditTender && tenderAppData && !tenderAppData.isDeadlinePassed && !isUnsealing) {
      const countdown = getTenderCountdown(selectedAuditTender);
      if (countdown.isExpired) {
        // Automatically reveal & unseal bids without requiring user click!
        handleTriggerUnseal(selectedAuditTender.id, true, true);
      }
    }
  }, [now, selectedAuditTender, tenderAppData, isUnsealing]);

  // Set custom fast-forward test timer for demo
  const setTestTimer = (tenderId: string, seconds: number) => {
    const newTarget = Date.now() + seconds * 1000;
    const updated = { ...tenderDeadlines, [tenderId]: newTarget };
    setTenderDeadlines(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('axiom_tender_deadlines', JSON.stringify(updated));
    }
  };

  // Fetch specific tender applications when audit modal opens
  const fetchTenderApplications = async (tenderId: string, force = false) => {
    setIsLoadingAppData(true);
    try {
      const url = `/api/applications?tenderId=${encodeURIComponent(tenderId)}${force ? '&forceUnseal=true' : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setTenderAppData(data);
      }
    } catch (err) {
      console.error('Error loading tender applications:', err);
    } finally {
      setIsLoadingAppData(false);
    }
  };

  const handleOpenAudit = (t: Tender) => {
    setSelectedAuditTender(t);
    setTenderAppData(null);
    const countdown = getTenderCountdown(t);
    fetchTenderApplications(t.id, countdown.isExpired);
  };

  const handleTriggerUnseal = async (tenderId: string, force = true, isAuto = false) => {
    setIsUnsealing(true);
    try {
      const res = await fetch('/api/applications/unseal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenderId, forceUnseal: force })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (!isAuto) {
          alert(`Application Review Window Open\n\n${data.unsealedCount} applications are now available for evaluation.`);
        }
        fetchTenderApplications(tenderId, true);
        // Refresh summary
        const summaryRes = await fetch('/api/applications');
        const summaryData = await summaryRes.json();
        if (summaryRes.ok && summaryData.summary) {
          setApplicationSummary(summaryData.summary);
        }
      } else if (!isAuto) {
        alert(data.error || 'Failed to retrieve applications.');
      }
    } catch (err) {
      console.error('Unseal error:', err);
    } finally {
      setIsUnsealing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('logged-in-admin');
    alert('Admin session terminated.');
    router.push('/admin/login');
  };

  // Add Tender handler
  const handleAddTender = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenderId || !tenderTitle || !tenderClient || !tenderLocation || !tenderValue) {
      alert('Please fill out all fields in the Tender form.');
      return;
    }

    const d = parseInt(tenderDays) || 0;
    const h = parseInt(tenderHours) || 0;
    const m = parseInt(tenderMinutes) || 0;
    const s = parseInt(tenderSeconds) || 0;
    const totalSec = d * 86400 + h * 3600 + m * 60 + s;
    const durationSeconds = totalSec > 0 ? totalSec : 120;
    const targetEpoch = Date.now() + durationSeconds * 1000;
    const closingString = `${d.toString().padStart(2, '0')}d : ${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`;

    const newTender: Tender = {
      id: tenderId.trim(),
      title: tenderTitle.trim(),
      client: tenderClient.trim(),
      location: tenderLocation.trim(),
      value: tenderValue.trim(),
      closingDate: closingString,
      matchType: tenderMatch || 'High Match'
    };

    try {
      setIsSubmittingTender(true);
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTender)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to publish tender to database.');
        return;
      }

      const publishedTender = data.tender || newTender;
      const updated = [publishedTender, ...tenders.filter(t => t.id !== publishedTender.id)];
      setTenders(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user-tenders', JSON.stringify(updated));
      }

      // Store deadline timestamp
      const updatedDeadlines = { ...tenderDeadlines, [publishedTender.id]: targetEpoch };
      setTenderDeadlines(updatedDeadlines);
      if (typeof window !== 'undefined') {
        localStorage.setItem('axiom_tender_deadlines', JSON.stringify(updatedDeadlines));
      }
      
      // Clear inputs
      setTenderId('');
      setTenderTitle('');
      setTenderClient('');
      setTenderLocation('');
      setTenderValue('');
      setTenderDays('0');
      setTenderHours('0');
      setTenderMinutes('2');
      setTenderSeconds('0');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      alert('Publish tender error: ' + msg);
    } finally {
      setIsSubmittingTender(false);
    }
  };

  // Delete / Revoke Tender handler
  const handleDeleteTender = async (id: string) => {
    if (!confirm(`Are you sure you want to revoke and delete Tender ${id} from the database?`)) return;

    try {
      setIsDeletingTender(true);
      const res = await fetch(`/api/tenders?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to delete tender.');
        return;
      }

      const updated = tenders.filter(t => t.id !== id);
      setTenders(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user-tenders', JSON.stringify(updated));
      }
      setSelectedAuditTender(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      alert('Delete tender error: ' + msg);
    } finally {
      setIsDeletingTender(false);
    }
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
                    <div className="grid grid-cols-4 gap-3 pt-1 text-xs">
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
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block uppercase mb-0.5">Applications</span>
                        <span className="inline-flex items-center gap-1 font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {applicationSummary[t.id]?.totalApplications || 0} Received
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-100 pt-3 gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-slate-400 font-medium text-[11px]">Submission Deadline:</span>
                        {getTenderCountdown(t).isExpired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-medium text-[11px] shadow-2xs">
                            <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span className="font-semibold">Deadline Elapsed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-800 border border-slate-200 shadow-2xs text-[11px]">
                            <svg className="w-3 h-3 text-[#1b4e7e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span className="font-mono font-bold text-slate-900 tracking-tight">
                              {getTenderCountdown(t).formatted}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">remaining</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                          </span>
                        )}
                      </div>

                      <button 
                        type="button"
                        onClick={() => handleOpenAudit(t)}
                        className="text-xs font-bold text-[#1b4e7e] hover:text-[#133c62] bg-[#1b4e7e]/10 hover:bg-[#1b4e7e]/20 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 self-end sm:self-auto"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {getTenderCountdown(t).isExpired ? 'Review Applications' : 'Audit & Applications'} ({applicationSummary[t.id]?.totalApplications || 0})
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
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                      Closing Deadline Timer
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block mb-0.5 text-center">Days</span>
                        <input
                          type="number"
                          min="0"
                          value={tenderDays}
                          onChange={(e) => setTenderDays(e.target.value)}
                          placeholder="0"
                          className="w-full text-center bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block mb-0.5 text-center">Hours</span>
                        <input
                          type="number"
                          min="0"
                          max="23"
                          value={tenderHours}
                          onChange={(e) => setTenderHours(e.target.value)}
                          placeholder="0"
                          className="w-full text-center bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block mb-0.5 text-center">Mins</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={tenderMinutes}
                          onChange={(e) => setTenderMinutes(e.target.value)}
                          placeholder="2"
                          className="w-full text-center bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 block mb-0.5 text-center">Secs</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={tenderSeconds}
                          onChange={(e) => setTenderSeconds(e.target.value)}
                          placeholder="0"
                          className="w-full text-center bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-400 block uppercase mb-1 tracking-wider">Match Priority</label>
                    <select
                      value={tenderMatch}
                      onChange={(e) => setTenderMatch(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#1b4e7e] cursor-pointer mt-3.5"
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

      {/* 3. Audit Details Modal Popup */}
      {selectedAuditTender && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={() => setSelectedAuditTender(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header Banner */}
            <div className="bg-[#1b4e7e] text-white p-6 relative flex justify-between items-start">
              <div className="space-y-1.5 pr-8">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    CPPP AUDIT LOG
                  </span>
                  <span className="text-white/80 text-xs font-mono font-bold">
                    REF: {selectedAuditTender.id}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold tracking-tight text-white line-clamp-1">
                  {selectedAuditTender.title}
                </h2>
                <p className="text-white/80 text-xs">
                  Official Procurement Audit Trail, Integrity Signatures & Database Records
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditTender(null)}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors cursor-pointer flex-shrink-0"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow max-h-[calc(90vh-140px)]">
              {/* Quick Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">State Status</span>
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live in Database
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Match Priority</span>
                  <span className="text-xs font-bold text-[#1b4e7e] bg-[#1b4e7e]/10 px-2.5 py-0.5 rounded-md inline-block">
                    {selectedAuditTender.matchType}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Estimated Value</span>
                  <span className="text-xs font-black text-slate-900">
                    {selectedAuditTender.value}
                  </span>
                </div>
                <div className="bg-blue-50/80 border border-blue-200/80 p-3.5 rounded-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-1">Total Applications</span>
                  <span className="text-xs font-black text-blue-950">
                    {tenderAppData?.totalApplications ?? (applicationSummary[selectedAuditTender.id]?.totalApplications || 0)} Received
                  </span>
                </div>
              </div>

              {/* Applications Section */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-[#133c62] text-white px-4 py-3 text-xs font-extrabold uppercase tracking-wider flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                    </svg>
                    <span>Tender Applications</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    tenderAppData?.isDeadlinePassed ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900'
                  }`}>
                    {tenderAppData?.isDeadlinePassed ? 'SUBMISSION CLOSED' : 'SUBMISSION ACTIVE'}
                  </span>
                </div>

                <div className="p-4 bg-slate-50/50 space-y-4 text-xs">
                  {isLoadingAppData ? (
                    <div className="py-8 text-center text-slate-500 space-y-2">
                      <div className="w-6 h-6 border-2 border-[#1b4e7e] border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="font-semibold">Loading applications...</p>
                    </div>
                  ) : !tenderAppData?.isDeadlinePassed ? (
                    /* BEFORE DEADLINE: Clean Day / Hours / Min / Sec Digital Counter Grid */
                    <div className="space-y-4">
                      {/* Active Window Header */}
                      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                              Submission Window Active
                            </h4>
                          </div>
                        </div>

                        {/* 4-Block Counter Grid (Day / Hours / Min / Sec) */}
                        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 text-center pt-1">
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 shadow-2xs">
                            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 block leading-tight">
                              {getTenderCountdown(selectedAuditTender).days}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mt-1">
                              Days
                            </span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 shadow-2xs">
                            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 block leading-tight">
                              {getTenderCountdown(selectedAuditTender).hours}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mt-1">
                              Hours
                            </span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 shadow-2xs">
                            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 block leading-tight">
                              {getTenderCountdown(selectedAuditTender).mins}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mt-1">
                              Minutes
                            </span>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 shadow-2xs">
                            <span className="text-xl sm:text-2xl font-black font-mono text-blue-900 block leading-tight">
                              {getTenderCountdown(selectedAuditTender).secs}
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mt-1">
                              Seconds
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Administration Action */}
                      <div className="bg-slate-100/60 border border-slate-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold text-slate-700 block">
                            Administrative Action
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Close the active submission window early to begin applicant evaluation.
                          </span>
                        </div>
                        <button
                          type="button"
                          disabled={isUnsealing}
                          onClick={() => handleTriggerUnseal(selectedAuditTender.id, true)}
                          className="px-4 py-2 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-2xs shrink-0"
                        >
                          {isUnsealing ? 'Processing...' : 'Close Submission Window Now'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* AFTER DEADLINE: Unsealed Decrypted Applications */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                        <div>
                          <h4 className="font-extrabold text-emerald-900 text-xs">
                            Submission Closed: {tenderAppData.applications?.length || 0} Applications Received
                          </h4>
                          <p className="text-[10px] text-emerald-700">
                            All applicant profiles and financial proposals are available for review below.
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold text-[10px]">
                          READY FOR EVALUATION
                        </span>
                      </div>

                      {tenderAppData.applications && tenderAppData.applications.length > 0 ? (
                        <div className="space-y-3">
                          {tenderAppData.applications.map((app: any, idx: number) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[10px] font-mono font-bold text-slate-400 block">
                                    APP ID: {app.applicationId}
                                  </span>
                                  <h4 className="text-sm font-extrabold text-slate-800">
                                    {app.payload?.applicant?.orgName || app.payload?.applicant?.fullName}
                                  </h4>
                                  <span className="text-xs text-slate-500">
                                    Contact: {app.payload?.applicant?.fullName} ({app.payload?.applicant?.email})
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Financial Bid</span>
                                  <span className="text-sm font-black text-emerald-700">
                                    {app.payload?.bidDetails?.bidAmount}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-[10px]">
                                <div>
                                  <span className="text-slate-400 block">PAN Number:</span>
                                  <span className="font-mono font-bold text-slate-700">{app.payload?.applicant?.pan || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">GSTIN:</span>
                                  <span className="font-mono font-bold text-slate-700">{app.payload?.applicant?.gst || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">Operating Hub:</span>
                                  <span className="font-bold text-slate-700">{app.payload?.applicant?.city || 'N/A'}, {app.payload?.applicant?.state || ''}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">Verification:</span>
                                  <span className="font-bold text-emerald-700 block">
                                    Verified
                                  </span>
                                </div>
                              </div>

                              {app.payload?.applicant?.walletAddress && (
                                <div className="p-2 bg-slate-50 rounded border border-slate-100 text-[10px] flex items-center justify-between">
                                  <span className="text-slate-500 font-medium">Digital Wallet:</span>
                                  <span className="font-mono text-slate-700 font-semibold">{app.payload.applicant.walletAddress}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-slate-400 italic">
                          No applications were submitted for this tender before closing.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Core Parameters Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Procurement Specification Parameters</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="grid grid-cols-3 p-3.5 hover:bg-slate-50/70 transition-colors">
                    <span className="font-bold text-slate-500">Tender Reference ID</span>
                    <span className="col-span-2 font-mono font-bold text-slate-800">{selectedAuditTender.id}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 hover:bg-slate-50/70 transition-colors">
                    <span className="font-bold text-slate-500">Procuring Client Agency</span>
                    <span className="col-span-2 font-semibold text-slate-800">{selectedAuditTender.client}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 hover:bg-slate-50/70 transition-colors">
                    <span className="font-bold text-slate-500">Jurisdiction & Location</span>
                    <span className="col-span-2 font-semibold text-slate-800">{selectedAuditTender.location}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 hover:bg-slate-50/70 transition-colors">
                    <span className="font-bold text-slate-500">Submission Window</span>
                    <span className="col-span-2 font-semibold text-slate-800">{selectedAuditTender.closingDate}</span>
                  </div>
                  <div className="grid grid-cols-3 p-3.5 hover:bg-slate-50/70 transition-colors">
                    <span className="font-bold text-slate-500">Auditing Administrator</span>
                    <span className="col-span-2 font-semibold text-slate-800">{admin?.fullName || 'System Administrator'} ({admin?.email || 'admin@axiom'})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                disabled={isDeletingTender}
                onClick={() => handleDeleteTender(selectedAuditTender.id)}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeletingTender ? 'Revoking Tender...' : 'Revoke / Delete Tender Notice'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedAuditTender(null)}
                className="w-full sm:w-auto px-8 py-2.5 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Footer Simple */}
      <FooterSimple />

    </div>
  );
}
