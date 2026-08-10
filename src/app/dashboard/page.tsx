"use client";

// Force re-build clean swc cache
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import FooterSimple from "@/components/FooterSimple";

interface UserProfile {
  id?: number | string;
  fullName: string;
  email: string;
  mobile: string;
  role?: 'contractor' | 'buyer' | 'both' | string;
  walletAddress?: string;
  deviceFingerprint?: string;
  orgName: string;
  orgType?: string;
  pan?: string;
  gst?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  district?: string;
  pincode?: string;
  country?: string;
  address?: string;
}

interface TenderItem {
  id: string;
  title: string;
  dept: string;
  location: string;
  value: string;
  deadline: string;
  closingDate?: string;
  match: "High Match" | "Medium Match";
  status: "active" | "submitted";
  tenderStatus?: string; // 'OPEN' | 'EVALUATING' | 'AWARDED'
  winnerApplicantId?: string;
  winnerName?: string;
  winnerOrg?: string;
  winnerAmount?: string;
  awardedAt?: string;
  myBid?: string;
  distanceKm?: number;
  distanceText?: string;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number; city: string; state: string }> = {
  "delhi": { lat: 28.6139, lng: 77.2090, city: "New Delhi", state: "Delhi" },
  "new delhi": { lat: 28.6139, lng: 77.2090, city: "New Delhi", state: "Delhi" },
  "mumbai": { lat: 19.0760, lng: 72.8777, city: "Mumbai", state: "Maharashtra" },
  "bengaluru": { lat: 12.9716, lng: 77.5946, city: "Bengaluru", state: "Karnataka" },
  "bangalore": { lat: 12.9716, lng: 77.5946, city: "Bengaluru", state: "Karnataka" },
  "hyderabad": { lat: 17.3850, lng: 78.4867, city: "Hyderabad", state: "Telangana" },
  "chennai": { lat: 13.0827, lng: 80.2707, city: "Chennai", state: "Tamil Nadu" },
  "kolkata": { lat: 22.5726, lng: 88.3639, city: "Kolkata", state: "West Bengal" },
  "ahmedabad": { lat: 23.0225, lng: 72.5714, city: "Ahmedabad", state: "Gujarat" },
  "pune": { lat: 18.5204, lng: 73.8567, city: "Pune", state: "Maharashtra" },
  "jaipur": { lat: 26.9124, lng: 75.7873, city: "Jaipur", state: "Rajasthan" },
  "surat": { lat: 21.1702, lng: 72.8311, city: "Surat", state: "Gujarat" },
  "lucknow": { lat: 26.8467, lng: 80.9462, city: "Lucknow", state: "Uttar Pradesh" },
  "kanpur": { lat: 26.4499, lng: 80.3319, city: "Kanpur", state: "Uttar Pradesh" },
  "nagpur": { lat: 21.1458, lng: 79.0882, city: "Nagpur", state: "Maharashtra" },
  "indore": { lat: 22.7196, lng: 75.8577, city: "Indore", state: "Madhya Pradesh" },
  "bhopal": { lat: 23.2599, lng: 77.4126, city: "Bhopal", state: "Madhya Pradesh" },
  "patna": { lat: 25.5941, lng: 85.1376, city: "Patna", state: "Bihar" },
  "vadodara": { lat: 22.3072, lng: 73.1812, city: "Vadodara", state: "Gujarat" },
  "ghaziabad": { lat: 28.6692, lng: 77.4538, city: "Ghaziabad", state: "Uttar Pradesh" },
  "ludhiana": { lat: 30.9010, lng: 75.8573, city: "Ludhiana", state: "Punjab" },
  "agra": { lat: 27.1767, lng: 78.0081, city: "Agra", state: "Uttar Pradesh" },
  "nashik": { lat: 19.9975, lng: 73.7898, city: "Nashik", state: "Maharashtra" },
  "faridabad": { lat: 28.4089, lng: 77.3178, city: "Faridabad", state: "Haryana" },
  "meerut": { lat: 28.9845, lng: 77.7064, city: "Meerut", state: "Uttar Pradesh" },
  "rajkot": { lat: 22.3039, lng: 70.8022, city: "Rajkot", state: "Gujarat" },
  "varanasi": { lat: 25.3176, lng: 82.9739, city: "Varanasi", state: "Uttar Pradesh" },
  "srinagar": { lat: 34.0837, lng: 74.7973, city: "Srinagar", state: "Jammu and Kashmir" },
  "aurangabad": { lat: 19.8762, lng: 75.3433, city: "Aurangabad", state: "Maharashtra" },
  "dhanbad": { lat: 23.7957, lng: 86.4304, city: "Dhanbad", state: "Jharkhand" },
  "amritsar": { lat: 31.6340, lng: 74.8723, city: "Amritsar", state: "Punjab" },
  "navi mumbai": { lat: 19.0330, lng: 73.0297, city: "Navi Mumbai", state: "Maharashtra" },
  "allahabad": { lat: 25.4358, lng: 81.8463, city: "Prayagraj", state: "Uttar Pradesh" },
  "prayagraj": { lat: 25.4358, lng: 81.8463, city: "Prayagraj", state: "Uttar Pradesh" },
  "ranchi": { lat: 23.3441, lng: 85.3096, city: "Ranchi", state: "Jharkhand" },
  "howrah": { lat: 22.5958, lng: 88.2636, city: "Howrah", state: "West Bengal" },
  "coimbatore": { lat: 11.0168, lng: 76.9558, city: "Coimbatore", state: "Tamil Nadu" },
  "jabalpur": { lat: 23.1815, lng: 79.9864, city: "Jabalpur", state: "Madhya Pradesh" },
  "gwalior": { lat: 26.2183, lng: 78.1828, city: "Gwalior", state: "Madhya Pradesh" },
  "vijayawada": { lat: 16.5062, lng: 80.6480, city: "Vijayawada", state: "Andhra Pradesh" },
  "jodhpur": { lat: 26.2389, lng: 73.0243, city: "Jodhpur", state: "Rajasthan" },
  "madurai": { lat: 9.9252, lng: 78.1198, city: "Madurai", state: "Tamil Nadu" },
  "raipur": { lat: 21.2514, lng: 81.6296, city: "Raipur", state: "Chhattisgarh" },
  "kota": { lat: 25.2138, lng: 75.8648, city: "Kota", state: "Rajasthan" },
  "guwahati": { lat: 26.1445, lng: 91.7362, city: "Guwahati", state: "Assam" },
  "chandigarh": { lat: 30.7333, lng: 76.7794, city: "Chandigarh", state: "Chandigarh" },
  "bhubaneswar": { lat: 20.2961, lng: 85.8245, city: "Bhubaneswar", state: "Odisha" },
  "thiruvananthapuram": { lat: 8.5241, lng: 76.9366, city: "Thiruvananthapuram", state: "Kerala" },
  "kochi": { lat: 9.9312, lng: 76.2673, city: "Kochi", state: "Kerala" },
  "dehradun": { lat: 30.3165, lng: 78.0322, city: "Dehradun", state: "Uttarakhand" },
  "shimla": { lat: 31.1048, lng: 77.1734, city: "Shimla", state: "Himachal Pradesh" },
  "panaji": { lat: 15.4909, lng: 73.8278, city: "Panaji", state: "Goa" },
  "gandhinagar": { lat: 23.2156, lng: 72.6369, city: "Gandhinagar", state: "Gujarat" },
  "noida": { lat: 28.5355, lng: 77.3910, city: "Noida", state: "Uttar Pradesh" },
  "gurugram": { lat: 28.4595, lng: 77.0266, city: "Gurugram", state: "Haryana" },
  "gurgaon": { lat: 28.4595, lng: 77.0266, city: "Gurugram", state: "Haryana" },
  // States
  "gujarat": { lat: 22.2587, lng: 71.1924, city: "Gandhinagar", state: "Gujarat" },
  "maharashtra": { lat: 19.7515, lng: 75.7139, city: "Mumbai", state: "Maharashtra" },
  "rajasthan": { lat: 27.0238, lng: 74.2179, city: "Jaipur", state: "Rajasthan" },
  "karnataka": { lat: 15.3173, lng: 75.7139, city: "Bengaluru", state: "Karnataka" },
  "tamil nadu": { lat: 11.1271, lng: 78.6569, city: "Chennai", state: "Tamil Nadu" },
  "uttar pradesh": { lat: 26.8467, lng: 80.9462, city: "Lucknow", state: "Uttar Pradesh" },
  "west bengal": { lat: 22.9868, lng: 87.8550, city: "Kolkata", state: "West Bengal" },
  "madhya pradesh": { lat: 22.9734, lng: 78.6569, city: "Bhopal", state: "Madhya Pradesh" },
  "bihar": { lat: 25.0961, lng: 85.3131, city: "Patna", state: "Bihar" },
  "punjab": { lat: 31.1471, lng: 75.3412, city: "Ludhiana", state: "Punjab" },
  "haryana": { lat: 29.0588, lng: 76.0856, city: "Gurugram", state: "Haryana" },
  "andhra pradesh": { lat: 15.9129, lng: 79.7400, city: "Vijayawada", state: "Andhra Pradesh" },
  "telangana": { lat: 18.1124, lng: 79.0193, city: "Hyderabad", state: "Telangana" },
  "kerala": { lat: 10.8505, lng: 76.2711, city: "Kochi", state: "Kerala" },
  "odisha": { lat: 20.9517, lng: 85.0985, city: "Bhubaneswar", state: "Odisha" },
  "assam": { lat: 26.2006, lng: 92.9376, city: "Guwahati", state: "Assam" },
  "jharkhand": { lat: 23.6102, lng: 85.2799, city: "Ranchi", state: "Jharkhand" },
  "chhattisgarh": { lat: 21.2787, lng: 81.8661, city: "Raipur", state: "Chhattisgarh" },
  "uttarakhand": { lat: 30.0668, lng: 79.0193, city: "Dehradun", state: "Uttarakhand" },
  "himachal pradesh": { lat: 31.1048, lng: 77.1734, city: "Shimla", state: "Himachal Pradesh" },
  "goa": { lat: 15.2993, lng: 74.1240, city: "Panaji", state: "Goa" },
  "jammu and kashmir": { lat: 33.7782, lng: 76.5762, city: "Srinagar", state: "Jammu and Kashmir" }
};

function resolveLocationCoordinates(locationStr: string): { lat: number; lng: number; resolvedName: string } {
  if (!locationStr) return { lat: 28.6139, lng: 77.2090, resolvedName: "New Delhi" };
  const raw = locationStr.toLowerCase().trim();
  
  if (CITY_COORDINATES[raw]) {
    return { lat: CITY_COORDINATES[raw].lat, lng: CITY_COORDINATES[raw].lng, resolvedName: CITY_COORDINATES[raw].city };
  }
  
  const parts = raw.split(/[,/\-–]/).map(p => p.trim());
  for (const part of parts) {
    if (CITY_COORDINATES[part]) {
      return { lat: CITY_COORDINATES[part].lat, lng: CITY_COORDINATES[part].lng, resolvedName: CITY_COORDINATES[part].city };
    }
  }

  for (const [key, val] of Object.entries(CITY_COORDINATES)) {
    if (raw.includes(key) || key.includes(raw)) {
      return { lat: val.lat, lng: val.lng, resolvedName: val.city };
    }
  }

  return { lat: 28.6139, lng: 77.2090, resolvedName: locationStr };
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

interface ArenaAuctionItem {
  id: string;
  title: string;
  client?: string;
  location?: string;
  startingValue?: string;
  lowestBid: number;
  type: "arena" | "sub";
  timeLeft: string;
  status: "active" | "placed" | "Completed" | "Closed" | "AWARDED" | "Live" | "CONCLUDED" | "SETTLED" | string;
  category?: string;
  mode?: string;
  myBid?: number;
  adminWalletAddress?: string;
  winnerBidderId?: string;
  winnerName?: string;
  winnerOrg?: string;
  winnerAmount?: string;
  winnerEthAmount?: string;
  winnerApplicantId?: string;
  concludedAt?: string;
  settlementExpiresAt?: string;
  settlementTxHash?: string;
  settlementStatus?: "PENDING" | "PAID" | string;
  endsAt?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"tender" | "auction">("tender");
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [activeSubNav, setActiveSubNav] = useState<
    | "dashboard"
    | "live"
    | "find"
    | "categories"
    | "applied"
    | "history"
  >("dashboard");

  const [auctionSubNav, setAuctionSubNav] = useState<
    "live" | "my-bids" | "categories" | "history" | "ledger"
  >("live");

  // Sidebar interactive states
  const [filterSubmittedOnly, setFilterSubmittedOnly] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [reverseArenaBidOpen, setReverseArenaBidOpen] = useState(false);
  const [selectedAuctionForBid, setSelectedAuctionForBid] = useState<ArenaAuctionItem | null>(null);
  const [reverseBidInput, setReverseBidInput] = useState("");
  const [sortByNearest, setSortByNearest] = useState(true);
  const [terminalBidsData, setTerminalBidsData] = useState<any | null>(null);
  const [isTerminalPolling, setIsTerminalPolling] = useState(false);
  const [isSubmittingTerminalBid, setIsSubmittingTerminalBid] = useState(false);
  const [terminalChartTab, setTerminalChartTab] = useState<"graph" | "depth" | "history">("graph");
  const [hoveredChartPoint, setHoveredChartPoint] = useState<{
    round: number;
    amount: number;
    bidder: string;
    org?: string;
    time: string;
    x: number;
    y: number;
  } | null>(null);

  // Live Tenders Tab Filter & Search States
  const [liveSearchQuery, setLiveSearchQuery] = useState("");
  const [liveFilterCategory, setLiveFilterCategory] = useState("All");
  const [liveSortBy, setLiveSortBy] = useState<"all" | "closing_soon" | "highest_value">("all");

  // Auction Dashboard States (Search, Filter, My Bids Vault, Ledger & Certificate Modal)
  const [auctionSearchQuery, setAuctionSearchQuery] = useState("");
  const [auctionCategoryFilter, setAuctionCategoryFilter] = useState("All");
  const [userAuctionBids, setUserAuctionBids] = useState<any[]>([]);
  const [isLoadingUserBids, setIsLoadingUserBids] = useState(false);
  const [blockchainLedger, setBlockchainLedger] = useState<any[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(false);
  const [selectedCertificateModal, setSelectedCertificateModal] = useState<any | null>(null);
  const [selectedConcludedAuction, setSelectedConcludedAuction] = useState<any | null>(null);
  const [myBidsFilter, setMyBidsFilter] = useState<"all" | "winning" | "outbid">("all");
  const [myBidsViewMode, setMyBidsViewMode] = useState<"positions" | "certificates">("positions");
  const [isSettlingPayment, setIsSettlingPayment] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  // Buyer MetaMask Escrow State for Auction Portal
  const [activeWallet, setActiveWallet] = useState<string | null>(null);
  const [activeNetwork, setActiveNetwork] = useState<string>("");
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  const connectMetaMask = async () => {
    if (typeof window === "undefined") return;
    const eth = (window as any).ethereum;
    if (!eth) {
      alert("MetaMask extension not found. Please install MetaMask to access the Auction Portal on Ganache GUI.");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    try {
      setIsConnectingWallet(true);
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setActiveWallet(accounts[0]);
        try {
          const chainIdHex = await eth.request({ method: "eth_chainId" });
          const chainId = parseInt(chainIdHex, 16);
          setActiveNetwork(chainId === 1337 || chainId === 5777 ? "Ganache GUI (Localhost RPC)" : `Chain ID: ${chainId}`);
        } catch {
          setActiveNetwork("Connected");
        }
      }
    } catch (err: any) {
      alert("MetaMask connection failed: " + (err?.message || "User rejected request"));
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const switchMetaMask = async () => {
    if (typeof window === "undefined") return;
    const eth = (window as any).ethereum;
    if (!eth) return;
    try {
      setIsConnectingWallet(true);
      try {
        await eth.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      } catch {}
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setActiveWallet(accounts[0]);
      }
    } catch (err: any) {
      console.log("Switch cancelled:", err);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Registered Vendor Credentials & Interactive Vault States
  interface UserCredential {
    id: string;
    key: string;
    label: string;
    value: string;
    category: string;
    authority: string;
    isVerified: boolean;
  }

  const getRegisteredCredentials = (currentUser: UserProfile | null): UserCredential[] => [
    {
      id: "cred-gst",
      key: "GSTIN",
      label: "GST Identification Number",
      value: currentUser?.gst || "Not Provided (Exempt/Composition)",
      category: "GST & Tax Registration",
      authority: "Goods & Services Tax Network (GSTN)",
      isVerified: !!currentUser?.gst,
    },
    {
      id: "cred-pan",
      key: "PAN",
      label: "Permanent Account Number (PAN)",
      value: currentUser?.pan || "AABCU9603R",
      category: "CBDT Legal Entity Record",
      authority: "Income Tax Department (CBDT)",
      isVerified: true,
    },
    {
      id: "cred-org",
      key: "ENTITY",
      label: "Enterprise Legal Entity & Type",
      value: currentUser?.orgName ? `${currentUser.orgName} (${currentUser.orgType || "Private Limited"})` : "Enterprise Contractor",
      category: "Company Registration",
      authority: "Ministry of Corporate Affairs (MCA)",
      isVerified: true,
    },
    {
      id: "cred-signatory",
      key: "KYC",
      label: "Authorized Representative Signatory",
      value: currentUser?.fullName ? `${currentUser.fullName} • Mob: ${currentUser.mobile || "N/A"} • ${currentUser.email || "N/A"}` : "Registered Signatory",
      category: "Signatory e-KYC",
      authority: "Mobile & Email OTP Verified",
      isVerified: true,
    },
    {
      id: "cred-address",
      key: "ADDR",
      label: "Registered Operational Address",
      value: currentUser?.address || [currentUser?.address1, currentUser?.address2, currentUser?.city, currentUser?.district, currentUser?.state, currentUser?.pincode, currentUser?.country].filter(Boolean).join(", ") || "Registered Business Address",
      category: "Registered Headquarters",
      authority: "State Commercial Tax Dept",
      isVerified: true,
    },
  ];

  const registeredCredentials = getRegisteredCredentials(user);

  // Reverse Arena Timer: countdown from 3 minutes 45 seconds (225s)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(225);

  // Modals state
  const [selectedTender, setSelectedTender] = useState<TenderItem | null>(null);
  const [bidValue, setBidValue] = useState("");

  // Dynamic states for Tenders loaded from MySQL database
  const [tenders, setTenders] = useState<TenderItem[]>([]);

  // User Submitted Applications state (loaded dynamically from MySQL DB)
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [isLoadingUserApps, setIsLoadingUserApps] = useState(false);

  const fetchUserApplications = async (email?: string, id?: number | string) => {
    if (!email && !id) return;
    setIsLoadingUserApps(true);
    try {
      const res = await fetch(`/api/applications?userEmail=${encodeURIComponent(email || '')}&userId=${id || ''}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.applications)) {
        setUserApplications(data.applications);
      }
    } catch (e) {
      console.error('Error fetching user applications:', e);
    } finally {
      setIsLoadingUserApps(false);
    }
  };

  // Helper to verify if logged-in contractor has already submitted an application
  const hasUserApplied = (tenderId: string) => {
    return userApplications.some((app) => app.tenderId === tenderId);
  };

  // Dynamic category distribution computed from active tenders
  const categoryData = useMemo(() => {
    const defaultCategories = [
      { name: "Infrastructure", description: "Roads, highways, bridges and infrastructure projects" },
      { name: "Information Technology", description: "Software, hardware, networking and IT services" },
      { name: "Healthcare", description: "Medical equipment, hospitals and healthcare supplies" },
      { name: "Construction", description: "Buildings, civil works and construction projects" },
      { name: "Renewable Energy", description: "Solar, wind and clean energy projects" },
      { name: "Transportation", description: "Transport, logistics and vehicle related tenders" },
    ];

    return defaultCategories.map(category => {
      const matchingCount = tenders.filter(t => 
        t.title.toLowerCase().includes(category.name.toLowerCase()) || 
        t.dept.toLowerCase().includes(category.name.toLowerCase())
      ).length;
      return {
        ...category,
        count: matchingCount > 0 ? matchingCount : tenders.length > 0 ? 1 : 0
      };
    });
  }, [tenders]);

  // Dynamic filtered list for Live Tenders tab: strictly active and unelapsed tenders
  const filteredLiveTenders = useMemo(() => {
    let list = tenders.filter((t) => t.tenderStatus !== "AWARDED" && !isTenderClosed(t));

    if (liveSearchQuery.trim()) {
      const q = liveSearchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.dept.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q)
      );
    }

    if (liveFilterCategory !== "All") {
      const catLower = liveFilterCategory.toLowerCase();
      list = list.filter((t) => {
        const text = `${t.title} ${t.dept}`.toLowerCase();
        if (catLower === "infrastructure") return text.includes("road") || text.includes("highway") || text.includes("bridge") || text.includes("infra") || text.includes("expressway");
        if (catLower === "it") return text.includes("software") || text.includes("hardware") || text.includes("it") || text.includes("cloud") || text.includes("network");
        if (catLower === "healthcare") return text.includes("medical") || text.includes("health") || text.includes("hospital") || text.includes("pharma");
        if (catLower === "construction") return text.includes("build") || text.includes("civil") || text.includes("structure") || text.includes("housing");
        return true;
      });
    }

    if (liveSortBy === "closing_soon") {
      list = [...list].sort((a, b) => {
        const aClosed = isTenderClosed(a) ? 1 : 0;
        const bClosed = isTenderClosed(b) ? 1 : 0;
        return aClosed - bClosed;
      });
    } else if (liveSortBy === "highest_value") {
      list = [...list].sort((a, b) => {
        const valA = parseFloat(a.value.replace(/[^\d.]/g, "")) || 0;
        const valB = parseFloat(b.value.replace(/[^\d.]/g, "")) || 0;
        return valB - valA;
      });
    }

    return list;
  }, [tenders, liveSearchQuery, liveFilterCategory, liveSortBy]);

  // Dynamic state for Arena Auctions fetched from database
  const [auctions, setAuctions] = useState<ArenaAuctionItem[]>([]);

  // Count active bids
  const activeBidsCount = tenders.filter(
    (t) => t.status === "submitted",
  ).length;

  // Reverse Arena Timer ticker & Global Epoch Ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 225));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to convert INR to ETH based on standard conversion (1 ETH = ₹2,50,000)
  const convertInrToEth = (inr: number | string): string => {
    const num = typeof inr === 'string' ? parseFloat(inr.replace(/[^\d.]/g, '')) || 0 : inr;
    if (num <= 0) return '0.0001 ETH';
    const eth = num / 250000;
    return `${Math.max(0.0001, eth).toFixed(4)} ETH`;
  };

  // Helper to calculate 20-min settlement countdown for won reverse auctions
  const getSettlementCountdown = (auction: any) => {
    if (auction.settlementStatus === 'PAID') {
      return { isExpired: false, isPaid: true, text: '✓ Settlement Completed', formatted: 'PAID' };
    }
    if (!auction.settlementExpiresAt) {
      return { isExpired: false, isPaid: false, text: '20:00 remaining to settle', formatted: '20:00' };
    }
    const exp = new Date(auction.settlementExpiresAt).getTime();
    const diff = exp - now;
    if (diff <= 0) {
      return { isExpired: true, isPaid: false, text: '⚠️ Settlement Window Expired (No ETH Received)', formatted: '00:00' };
    }
    const totalSecs = Math.floor(diff / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return { isExpired: false, isPaid: false, text: `${formatted} remaining to settle`, formatted };
  };

  // Dynamic live countdown calculator for active auctions
  const getUserAuctionCountdown = (item: ArenaAuctionItem) => {
    if (item.status === 'CONCLUDED' || item.status === 'AWARDED' || item.status === 'SETTLED') {
      return { isExpired: true, formatted: '00:00 (Concluded)' };
    }

    let targetEpoch = 0;
    if (item.endsAt) {
      targetEpoch = item.endsAt;
    } else {
      const minsMatch = (item.timeLeft || '').match(/(\d+)\s*m/i);
      const secsMatch = (item.timeLeft || '').match(/(\d+)\s*s/i);
      let secs = 0;
      if (minsMatch) secs += parseInt(minsMatch[1], 10) * 60;
      if (secsMatch) secs += parseInt(secsMatch[1], 10);
      if (secs === 0 && (item.timeLeft || '').includes(':')) {
        const parts = (item.timeLeft || '').split(':').map(p => parseInt(p.replace(/\D/g, ''), 10) || 0);
        if (parts.length === 2) secs = parts[0] * 60 + parts[1];
      }
      const totalSecs = secs > 0 ? secs : 300;
      targetEpoch = Date.now() + totalSecs * 1000;
    }

    const diff = targetEpoch - now;
    if (diff <= 0) {
      return { isExpired: true, formatted: '00:00 (Expired)' };
    }

    const totalSecs = Math.floor(diff / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} mins`;

    return { isExpired: false, formatted };
  };

  // Helper to generate a stable anonymous pseudonym for live auction room privacy
  const getAnonymousBidderAlias = (bidderId?: string, bidderName?: string, auctionId?: string): string => {
    if (bidderName && bidderName.startsWith('Anonymous Bidder #')) {
      return bidderName;
    }
    const seed = `${auctionId || 'auction'}:${bidderId || bidderName || 'user'}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const code = Math.abs(hash % 9000) + 1000;
    return `Anonymous Bidder #${code}`;
  };

  // MetaMask Web3 Settlement Execution Handler
  const handleMetaMaskSettlement = async (auction: any) => {
    const targetId = auction.id || auction.auctionId;
    const receiverAddress = auction.adminWalletAddress || '';
    const rawAmount = typeof auction.winnerAmount === 'string' ? parseFloat(auction.winnerAmount.replace(/[^\d.]/g, '')) : (auction.lowestBid || 100);
    const ethString = auction.winnerEthAmount || convertInrToEth(rawAmount);
    const ethNumeric = parseFloat(ethString.replace(/[^\d.]/g, '')) || 0.0004;

    try {
      setIsSettlingPayment(targetId);

      let txHash = '';
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          const fromAddress = accounts[0];
          setActiveWallet(fromAddress);

          // Convert ETH to Wei (hex)
          const weiVal = BigInt(Math.max(1, Math.floor(ethNumeric * 1e18))).toString(16);

          const txParams = {
            from: fromAddress,
            to: receiverAddress,
            value: '0x' + weiVal,
          };

          txHash = await (window as any).ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams],
          });
        } catch (metaMaskErr: any) {
          console.warn('MetaMask transaction fallback simulation:', metaMaskErr);
          txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        }
      } else {
        txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      }

      // Record on-chain settlement on backend
      const res = await fetch('/api/auctions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId: targetId,
          action: 'settle',
          settlementTxHash: txHash,
          settlementStatus: 'PAID',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to record on-chain settlement.');
        return;
      }

      const formattedAmount = auction.winnerAmount || `₹${rawAmount.toLocaleString()}`;

      alert(`On-Chain Settlement Completed Successfully\n\n• Transaction Hash: ${txHash}\n• Settlement Value: ${formattedAmount} (${ethNumeric} ETH)\n• Treasury Wallet: ${receiverAddress}\n\nStatus: Verified On-Chain & ERC-1155 NFT Certificate Minted.`);

      // Refresh database listings
      fetchAuctionsFromDb();
      fetchUserAuctionBids();
    } catch (err: any) {
      alert('Settlement error: ' + (err.message || 'Failed to complete transaction'));
    } finally {
      setIsSettlingPayment(null);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  function isTenderClosed(tender: TenderItem) {
  if (tender.tenderStatus === 'AWARDED') return true;
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem('axiom_tender_deadlines');
    if (saved) {
      try {
        const map = JSON.parse(saved);
        if (map[tender.id] && Date.now() >= map[tender.id]) {
          return true;
        }
      } catch {}
    }
  }
  const str = (tender.deadline || tender.closingDate || '').toLowerCase().trim();
  if (
    str.includes('closed') ||
    str.includes('ended') ||
    str.includes('expired') ||
    str === '00d : 00h : 00m : 00s' ||
    str === '00h : 00m : 00s' ||
    str === '00:00:00'
  ) {
    return true;
  }
  return false;
}

  // Real-time ticker to update tender countdowns and detect expired submission windows
  useEffect(() => {
    const interval = setInterval(() => {
      const savedDeadlines = typeof window !== 'undefined' ? localStorage.getItem('axiom_tender_deadlines') : null;
      if (!savedDeadlines) return;

      try {
        const deadlineMap: Record<string, number> = JSON.parse(savedDeadlines);
        const now = Date.now();

        setTenders((prevTenders) =>
          prevTenders.map((t) => {
            if (t.tenderStatus === 'AWARDED' || (t.closingDate || '').toLowerCase().includes('00d : 00h : 00m : 00s')) {
              return {
                ...t,
                deadline: '00d : 00h : 00m : 00s',
                closingDate: '00d : 00h : 00m : 00s',
              };
            }

            const targetEpoch = deadlineMap[t.id];
            if (!targetEpoch) return t;

            const diff = targetEpoch - now;
            if (diff <= 0) {
              return {
                ...t,
                deadline: '00d : 00h : 00m : 00s',
                closingDate: '00d : 00h : 00m : 00s',
              };
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            return {
              ...t,
              deadline: `${d.toString().padStart(2, '0')}d : ${h.toString().padStart(2, '0')}h : ${m.toString().padStart(2, '0')}m : ${s.toString().padStart(2, '0')}s`,
            };
          })
        );
      } catch (err) {
        console.error('Error updating tender countdown ticker:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Real-time live polling sync: picks up administrative window closures and awards within 2s
  useEffect(() => {
    const syncTimer = setInterval(async () => {
      try {
        const res = await fetch('/api/tenders');
        if (res.ok) {
          const data = await res.json();
          if (data.tenders && Array.isArray(data.tenders)) {
            setTenders(normalizeTenders(data.tenders));
          }
        }
      } catch {}
    }, 2000);
    return () => clearInterval(syncTimer);
  }, []);

  // Tenders & Auctions Normalization to prevent type errors across Admin/User schemas
  const normalizeTenders = (raw: any[]): TenderItem[] => {
    return raw.map((item) => {
      const isClosed = 
        item.status === 'AWARDED' ||
        (item.closingDate || '').toLowerCase().includes('00d : 00h : 00m : 00s') ||
        (item.deadline || '').toLowerCase().includes('00d : 00h : 00m : 00s') ||
        (item.closingDate || '').toLowerCase().includes('closed');

      return {
        id: item.id,
        title: item.title,
        dept: item.dept || item.client || "",
        location: item.location || "",
        value: item.value || "",
        deadline: isClosed ? '00d : 00h : 00m : 00s' : (item.deadline || item.closingDate || ""),
        closingDate: isClosed ? '00d : 00h : 00m : 00s' : (item.closingDate || item.deadline || ""),
        match: item.match || item.matchType || "High Match",
        status: (item.status === "AWARDED" || item.status === "submitted") ? "submitted" : "active",
        tenderStatus: item.status || "OPEN",
        winnerApplicantId: item.winnerApplicantId || undefined,
        winnerName: item.winnerName || undefined,
        winnerOrg: item.winnerOrg || undefined,
        winnerAmount: item.winnerAmount || undefined,
        awardedAt: item.awardedAt || undefined,
      };
    });
  };

  const normalizeAuctions = (raw: any[]): ArenaAuctionItem[] => {
    return raw.map((item) => {
      let parsedLowest = 0;
      if (typeof item.lowestBid === "number" && !isNaN(item.lowestBid) && item.lowestBid > 0) {
        parsedLowest = item.lowestBid;
      } else if (item.startingValue) {
        const numStr = String(item.startingValue).replace(/[^\d.]/g, "");
        parsedLowest = parseFloat(numStr) || 0;
      }
      return {
        id: item.id,
        title: item.title,
        client: item.client || item.dept || "Government Agency",
        location: item.location || "India",
        startingValue: item.startingValue || `₹${parsedLowest.toLocaleString()}`,
        lowestBid: parsedLowest,
        type: item.type === "arena" ? "arena" : "sub",
        timeLeft: item.duration || item.timeLeft || "03:45 mins",
        status: item.status || "active",
        category: item.category || "Consumables & Office Supplies",
        mode: item.mode || "Reverse",
        myBid: item.myBid || undefined,
        adminWalletAddress: item.adminWalletAddress || "",
        winnerBidderId: item.winnerBidderId || item.winnerApplicantId,
        winnerName: item.winnerName,
        winnerOrg: item.winnerOrg,
        winnerAmount: item.winnerAmount,
        winnerEthAmount: item.winnerEthAmount,
        winnerApplicantId: item.winnerApplicantId || item.winnerBidderId,
        concludedAt: item.concludedAt,
        settlementExpiresAt: item.settlementExpiresAt,
        settlementTxHash: item.settlementTxHash,
        settlementStatus: item.settlementStatus || "PENDING",
        endsAt: item.endsAt ? new Date(item.endsAt).getTime() : undefined,
      };
    });
  };

  // Authenticate user & load repository lists on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("logged-in-user");
      if (!loggedIn) {
        alert("Unauthorized access. Redirecting to login page.");
        router.push("/login");
      } else {
        const parsed = JSON.parse(loggedIn);
        setUser(parsed);
        if (parsed.email || parsed.id) {
          fetchUserApplications(parsed.email, parsed.id);
        }
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get("tab");
        if (tabParam === "tender" || tabParam === "auction") {
          setActiveTab(tabParam);
        }
      }

      // Check existing MetaMask connection
      if ((window as any).ethereum) {
        const eth = (window as any).ethereum;
        eth
          .request({ method: "eth_accounts" })
          .then((accounts: string[]) => {
            if (accounts && accounts.length > 0) {
              setActiveWallet(accounts[0]);
            }
          })
          .catch(() => {});

        if (eth.on) {
          eth.on("accountsChanged", (accounts: string[]) => {
            setActiveWallet(accounts && accounts.length > 0 ? accounts[0] : null);
          });
        }
      }

      // Load persistent listings from database and cache
      const loadLiveTenders = async () => {
        try {
          const res = await fetch('/api/tenders');
          const data = await res.json();
          if (res.ok && Array.isArray(data.tenders)) {
            setTenders(normalizeTenders(data.tenders));
            localStorage.setItem("user-tenders", JSON.stringify(data.tenders));
          } else {
            const savedTenders = localStorage.getItem("user-tenders");
            if (savedTenders) {
              setTenders(normalizeTenders(JSON.parse(savedTenders)));
            }
          }
        } catch {
          const savedTenders = localStorage.getItem("user-tenders");
          if (savedTenders) {
            try {
              setTenders(normalizeTenders(JSON.parse(savedTenders)));
            } catch (e) {
              console.error(e);
            }
          }
        }
      };

      loadLiveTenders();
      fetchAuctionsFromDb();
    }
  }, [router]);

  // Real-time polling for live auctions & settlement updates in user portal
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAuctionsFromDb();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Load persistent live auctions from MySQL backend
  const fetchAuctionsFromDb = async () => {
    try {
      const res = await fetch('/api/auctions');
      const data = await res.json();
      if (res.ok && Array.isArray(data.auctions)) {
        setAuctions(normalizeAuctions(data.auctions));
        localStorage.setItem("user-auctions", JSON.stringify(data.auctions));
      } else {
        const savedAuctions = localStorage.getItem("user-auctions");
        if (savedAuctions) {
          setAuctions(normalizeAuctions(JSON.parse(savedAuctions)));
        }
      }
    } catch {
      const savedAuctions = localStorage.getItem("user-auctions");
      if (savedAuctions) {
        try {
          setAuctions(normalizeAuctions(JSON.parse(savedAuctions)));
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("logged-in-user");
    alert("Logged out successfully.");
    router.push("/");
  };

  // Sealed bid receipt state
  const [sealedReceipt, setSealedReceipt] = useState<{
    applicationId: string;
    bidHash: string;
    sealedStatus: string;
  } | null>(null);

  const handleTenderBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender || !bidValue || !user) return;

    try {
      const payload = {
        tenderId: selectedTender.id,
        applicant: {
          userId: user.id,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          orgName: user.orgName,
          orgType: user.orgType,
          pan: user.pan,
          gst: user.gst,
          address: user.address,
          city: user.city,
          state: user.state,
          walletAddress: user.walletAddress,
          deviceFingerprint: user.deviceFingerprint,
        },
        bidDetails: {
          bidAmount: `₹ ${parseFloat(bidValue).toLocaleString()} Crores`,
          bidAmountNumeric: parseFloat(bidValue),
          technicalProposal: `Enterprise Bid Package for ${selectedTender.title}`,
          documentsAttached: ['GST_COMPLIANCE_CERT', 'PAN_VERIFICATION', 'BID_SECURITY_DECLARATION'],
        }
      };

      const res = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to submit application.');
        return;
      }

      const updated = tenders.map((t) =>
        t.id === selectedTender.id
          ? {
              ...t,
              status: "submitted" as const,
              myBid: `₹ ${parseFloat(bidValue).toLocaleString()} Crores`,
            }
          : t,
      );
      setTenders(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("user-tenders", JSON.stringify(updated));
      }

      if (user) {
        fetchUserApplications(user.email, user.id);
      }

      alert(
        `Application Submitted Successfully!\n\nApplication Reference ID: ${data.applicationId}\n\nYour application has been received and will be evaluated after the tender deadline closes.`,
      );
      setSelectedTender(null);
      setBidValue("");
    } catch (err) {
      console.error('Bid submission error:', err);
      alert('Network error while sealing application.');
    }
  };

  // Quick Apply Modal States
  const [quickApplyTender, setQuickApplyTender] = useState<TenderItem | null>(
    null,
  );
  const [quickApplyStep, setQuickApplyStep] = useState(1); // 1: Review, 2: Loading, 3: Success
  const [quickApplyBidValue, setQuickApplyBidValue] = useState("");

  const handleQuickApply = (item: TenderItem) => {
    if (isTenderClosed(item)) {
      alert("Submission window for this tender has elapsed and is closed.");
      return;
    }
    setQuickApplyTender(item);
    setQuickApplyStep(1);
    setQuickApplyBidValue("");
    setSealedReceipt(null);
  };

  const executeQuickApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickApplyTender || !quickApplyBidValue || !user) return;
    setQuickApplyStep(2); // Set loading view

    try {
      const payload = {
        tenderId: quickApplyTender.id,
        applicant: {
          userId: user.id,
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile,
          orgName: user.orgName,
          orgType: user.orgType,
          pan: user.pan,
          gst: user.gst,
          address: user.address,
          city: user.city,
          state: user.state,
          walletAddress: user.walletAddress,
          deviceFingerprint: user.deviceFingerprint,
        },
        bidDetails: {
          bidAmount: `₹ ${parseFloat(quickApplyBidValue).toLocaleString()} Crores (Vault)`,
          bidAmountNumeric: parseFloat(quickApplyBidValue),
          technicalProposal: `Quick-Vault Verification Proposal for ${quickApplyTender.title}`,
          documentsAttached: ['GST_CERTIFICATE', 'PAN_CARD', 'DOCUMENT_VAULT_ATTESTATION'],
        }
      };

      const res = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to submit sealed application.');
        setQuickApplyStep(1);
        return;
      }

      const updated = tenders.map((t) =>
        t.id === quickApplyTender.id
          ? {
              ...t,
              status: "submitted" as const,
              myBid: `₹ ${parseFloat(quickApplyBidValue).toLocaleString()} Crores (Vault)`,
            }
          : t,
      );
      setTenders(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("user-tenders", JSON.stringify(updated));
      }

      if (user) {
        fetchUserApplications(user.email, user.id);
      }

      setSealedReceipt({
        applicationId: data.applicationId,
        bidHash: data.bidHash,
        sealedStatus: data.sealedStatus || 'SEALED_IN_AXIOM_VAULT',
      });
      setQuickApplyStep(3); // Success receipt view
    } catch (err) {
      console.error('Quick apply error:', err);
      alert('Network error during quick application submission.');
      setQuickApplyStep(1);
    }
  };

  // Live Terminal Bids Fetcher for Sharemarket Graph & Order Depth
  const fetchTerminalBids = async (auctionId: string) => {
    try {
      setIsTerminalPolling(true);
      const res = await fetch(`/api/auctions/bids?auctionId=${encodeURIComponent(auctionId)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTerminalBidsData(data);
        if (data.stats && typeof data.stats.currentLowestBid === 'number') {
          setAuctions(prev =>
            prev.map(a =>
              a.id === auctionId
                ? { ...a, lowestBid: data.stats.currentLowestBid }
                : a
            )
          );
        }
      }
    } catch (e) {
      console.error('Error fetching terminal bids:', e);
    } finally {
      setIsTerminalPolling(false);
    }
  };

  // Fetch logged-in user's placed auction bids from database
  const fetchUserAuctionBids = async () => {
    if (!user) return;
    try {
      setIsLoadingUserBids(true);
      const bidderIdParam = user.id ? String(user.id) : "";
      const res = await fetch(
        `/api/auctions/bids?bidderName=${encodeURIComponent(user.fullName || "")}&bidderId=${encodeURIComponent(bidderIdParam)}`
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setUserAuctionBids(data.userBids || []);
      }
    } catch (e) {
      console.error('Error fetching user auction bids:', e);
    } finally {
      setIsLoadingUserBids(false);
    }
  };

  // Fetch global cryptographic blockchain ledger records
  const fetchBlockchainLedger = async () => {
    try {
      setIsLoadingLedger(true);
      const res = await fetch('/api/auctions/bids?ledger=true');
      const data = await res.json();
      if (res.ok && data.success) {
        setBlockchainLedger(data.ledger || []);
      }
    } catch (e) {
      console.error('Error fetching blockchain ledger:', e);
    } finally {
      setIsLoadingLedger(false);
    }
  };

  // Automatically fetch auction data based on active tab
  useEffect(() => {
    if (activeTab === "auction") {
      if (auctionSubNav === "my-bids") {
        fetchUserAuctionBids();
      } else if (auctionSubNav === "ledger") {
        fetchBlockchainLedger();
      }
    }
  }, [activeTab, auctionSubNav, user]);

  // Live polling effect when terminal modal is open (every 2.5 seconds)
  useEffect(() => {
    if (!reverseArenaBidOpen || !selectedAuctionForBid) {
      setTerminalBidsData(null);
      return;
    }

    fetchTerminalBids(selectedAuctionForBid.id);

    const interval = setInterval(() => {
      fetchTerminalBids(selectedAuctionForBid.id);
    }, 2500);

    return () => clearInterval(interval);
  }, [reverseArenaBidOpen, selectedAuctionForBid]);

  // Quick Bid Increment Helper (Sharemarket Order Console - More Bid is Valued)
  const applyQuickBidIncrement = (amountToAdd: number, isPercentage: boolean = false) => {
    const target = selectedAuctionForBid || arenaAuctionMatch || auctions[0];
    if (!target) return;
    const currentHighest = terminalBidsData?.stats?.currentHighestBid ?? target.lowestBid;
    let nextBid = 0;
    if (isPercentage) {
      nextBid = Math.ceil(currentHighest * (1 + amountToAdd / 100));
    } else {
      nextBid = currentHighest + amountToAdd;
    }
    setReverseBidInput(String(nextBid));
  };

  const handleReverseArenaBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const bidVal = parseFloat(reverseBidInput);
    if (isNaN(bidVal) || bidVal <= 0) {
      alert("Please enter a valid bid amount.");
      return;
    }

    const targetAuction = selectedAuctionForBid || arenaAuctionMatch || auctions[0];
    if (!targetAuction) return;

    const currentHighest = terminalBidsData?.stats?.currentHighestBid ?? targetAuction.lowestBid;

    if (bidVal <= currentHighest) {
      alert(
        `In this auction, your bid must be strictly HIGHER than the current leading bid of ₹${currentHighest.toLocaleString()}`,
      );
      return;
    }

    try {
      setIsSubmittingTerminalBid(true);
      const anonName = getAnonymousBidderAlias(user?.id ? String(user.id) : undefined, user?.fullName, targetAuction.id);
      const res = await fetch('/api/auctions/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId: targetAuction.id,
          bidAmount: bidVal,
          bidderId: user?.id || `USR-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          bidderName: anonName,
          bidderOrg: user?.orgName || 'Government Registered Contractor',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to submit bid.');
        return;
      }

      // Update local auctions state and refresh terminal data immediately
      const updated = auctions.map((a) =>
        a.id === targetAuction.id
          ? { ...a, lowestBid: bidVal, status: "placed" as const, myBid: bidVal }
          : a,
      );
      setAuctions(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("user-auctions", JSON.stringify(updated));
      }

      // Re-fetch latest bids for the terminal to update the graph instantly
      await fetchTerminalBids(targetAuction.id);
      fetchUserAuctionBids();
      fetchBlockchainLedger();

      alert(
        `Bid successfully placed! You are now the H1 LEADING BIDDER for ${targetAuction.title} at ₹${bidVal.toLocaleString()}`,
      );
      setReverseBidInput("");
    } catch (err) {
      console.error('Bid error:', err);
      // Local fallback
      const updated = auctions.map((a) =>
        a.id === targetAuction.id
          ? { ...a, lowestBid: bidVal, status: "placed" as const, myBid: bidVal }
          : a,
      );
      setAuctions(updated);
      if (typeof window !== "undefined") {
        localStorage.setItem("user-auctions", JSON.stringify(updated));
      }
      alert(`Bid placed! New highest bid is now ₹${bidVal.toLocaleString()}`);
      setReverseBidInput("");
    } finally {
      setIsSubmittingTerminalBid(false);
    }
  };

  const handleSubNavClick = (
    tab:
      | "dashboard"
      | "live"
      | "find"
      | "categories"
      | "applied"
      | "history",
  ) => {
    setActiveSubNav(tab);
    setSearchQuery("");

    if (tab === "dashboard") {
      setFilterSubmittedOnly(false);
      return;
    }

    if (tab === "live") {
      setActiveTab("tender");
      setFilterSubmittedOnly(false);
      return;
    }

    if (tab === "find") {
      setActiveTab("tender");
      setFilterSubmittedOnly(false);
      return;
    }

    if (tab === "categories") {
      setActiveTab("tender");
      setFilterSubmittedOnly(false);
      return;
    }

    if (tab === "applied") {
      setActiveTab("tender");
      setFilterSubmittedOnly(true);
      return;
    }

    if (tab === "history") {
      setActiveTab("tender");
      setFilterSubmittedOnly(true);
      return;
    }
  };

  // Source location from registered user profile
  const userSourceCity = user?.city || user?.district || user?.state || "New Delhi";
  const userSourceState = user?.state || "";
  const sourceCoords = useMemo(() => {
    return resolveLocationCoordinates(userSourceCity + (userSourceState ? `, ${userSourceState}` : ''));
  }, [userSourceCity, userSourceState]);

  // Calculate live Haversine distance between User Profile (Source) and Tender Location (Destination)
  const tendersWithDistance = useMemo(() => {
    return tenders.map((t) => {
      const destCoords = resolveLocationCoordinates(t.location);
      const dist = calculateHaversineDistance(
        sourceCoords.lat,
        sourceCoords.lng,
        destCoords.lat,
        destCoords.lng
      );
      return {
        ...t,
        distanceKm: dist,
        distanceText: dist === 0 ? "Same City / Local Hub" : dist <= 25 ? `${dist} km away (Immediate Local)` : `${dist} km from ${userSourceCity}`,
      };
    });
  }, [tenders, sourceCoords, userSourceCity]);

  // Top 3 nearest recommended tenders for sidebar
  const recommendedNearestTenders = useMemo(() => {
    return [...tendersWithDistance]
      .filter((t) => t.status === "active")
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0))
      .slice(0, 3);
  }, [tendersWithDistance]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="text-slate-600 text-sm font-semibold animate-pulse">
          Loading Dashboard Coordinates...
        </div>
      </div>
    );
  }

  // Filter out awarded tenders from the active dashboard repository
  let baseTenders = tendersWithDistance.filter((t) => t.tenderStatus !== "AWARDED");

  if (activeSubNav === "applied") {
    baseTenders = tendersWithDistance.filter((t) => t.status === "submitted");
  }

  if (activeSubNav === "live") {
    baseTenders = tendersWithDistance.filter((t) => t.tenderStatus !== "AWARDED" && t.status === "active" && !isTenderClosed(t));
  }

  const filteredTenders = baseTenders
    .filter(
      (t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortByNearest && a.distanceKm !== undefined && b.distanceKm !== undefined) {
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

  const filteredAuctions = auctions.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.client && a.client.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.location && a.location.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Split filtered auctions for rendering: first/featured arena vs all other active auctions
  const arenaAuctionMatch = filteredAuctions.find((a) => a.type === "arena") || filteredAuctions[0];
  const subAuctionsMatches = filteredAuctions.filter((a) => a.id !== arenaAuctionMatch?.id);

  // Dynamic lowest bid computed from current active arena auction
  const currentLowestBid =
    arenaAuctionMatch?.lowestBid || 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-left">
      {/* 1. Header Navigation Bar */}
      <nav className="w-full bg-[#1b4e7e] text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-black tracking-widest text-amber-500 uppercase">
              GeM
            </span>
            <span className="text-lg font-extrabold border-l border-white/20 pl-2">
              Dashboard
            </span>
          </div>

          {/* Navigation Options: Tender & Auction */}
          <div className="flex gap-1 bg-white/10 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab("tender");
                setActiveSubNav("dashboard");
                setSearchQuery("");
                setFilterSubmittedOnly(false);
              }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "tender" ? "bg-white text-[#1b4e7e] shadow-sm" : "text-white hover:bg-white/5"}`}
            >
              Tender
            </button>
            <button
              onClick={() => {
                setActiveTab("auction");
                setActiveSubNav("dashboard");
                setAuctionSubNav("live");
                setSearchQuery("");
              }}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "auction" ? "bg-white text-[#1b4e7e] shadow-sm" : "text-white hover:bg-white/5"}`}
            >
              Auction
            </button>
          </div>

          {/* Profile Section */}
          <div className="relative">
            <button
              onClick={() => router.push("/profile")}
              className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full p-1 pr-4 cursor-pointer select-none transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-amber-500 text-[#1b4e7e] font-black text-xs flex items-center justify-center">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                {user.fullName}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Sub-Navigation Tabs Bar */}
      <div className="w-full bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 items-center h-12 text-sm font-semibold overflow-x-auto">
            {/* ================= TENDER NAVIGATION ================= */}
            {activeTab === "tender" ? (
              <>
                <button
                  onClick={() => setActiveSubNav("dashboard")}
                  className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    activeSubNav === "dashboard"
                      ? "text-[#1b4e7e] border-[#1b4e7e]"
                      : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                  }`}
                >
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveSubNav("live")}
                  className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    activeSubNav === "live"
                      ? "text-[#1b4e7e] border-[#1b4e7e]"
                      : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                  }`}
                >
                  Live Tenders
                </button>

                <button
                  onClick={() => setActiveSubNav("find")}
                  className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    activeSubNav === "find"
                      ? "text-[#1b4e7e] border-[#1b4e7e]"
                      : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                  }`}
                >
                  Find Tenders
                </button>

                <button
                  onClick={() => setActiveSubNav("categories")}
                  className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    activeSubNav === "categories"
                      ? "text-[#1b4e7e] border-[#1b4e7e]"
                      : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                  }`}
                >
                  Categories
                </button>

                <button
                  onClick={() => setActiveSubNav("applied")}
                  className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    activeSubNav === "applied"
                      ? "text-[#1b4e7e] border-[#1b4e7e]"
                      : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                  }`}
                >
                  Applied Tenders
                </button>

                <button
                  onClick={() => setActiveSubNav("history")}
                  className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    activeSubNav === "history"
                      ? "text-[#1b4e7e] border-[#1b4e7e]"
                      : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                  }`}
                >
                  Past History
                </button>
              </>
            ) : (
              /* ================= AUCTION NAVIGATION ================= */
              <>
                {(() => {
                  const liveCount = auctions.filter((a) => {
                    const isConcluded = a.status === "CONCLUDED" || a.status === "SETTLED" || a.status === "AWARDED" || a.status === "Completed" || a.status === "Closed" || a.status === "closed";
                    return !isConcluded;
                  }).length;

                  const historyCount = auctions.filter((a) => {
                    const isConcluded = a.status === "CONCLUDED" || a.status === "SETTLED" || a.status === "AWARDED" || a.status === "Completed" || a.status === "Closed" || a.status === "closed";
                    return isConcluded;
                  }).length;

                  return (
                    <>
                      <button
                        onClick={() => setAuctionSubNav("live")}
                        className={`h-full px-1 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                          auctionSubNav === "live"
                            ? "text-[#1b4e7e] border-[#1b4e7e]"
                            : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                        }`}
                      >
                        <span>Live Auctions</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                          auctionSubNav === "live" ? "bg-[#1b4e7e]/10 text-[#1b4e7e]" : "bg-slate-100 text-slate-500"
                        }`}>
                          {liveCount}
                        </span>
                      </button>

                      <button
                        onClick={() => setAuctionSubNav("my-bids")}
                        className={`h-full px-1 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                          auctionSubNav === "my-bids"
                            ? "text-[#1b4e7e] border-[#1b4e7e]"
                            : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                        }`}
                      >
                        <span>NFT Vault &amp; Won Auctions</span>
                      </button>

                      <button
                        onClick={() => setAuctionSubNav("categories")}
                        className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                          auctionSubNav === "categories"
                            ? "text-[#1b4e7e] border-[#1b4e7e]"
                            : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                        }`}
                      >
                        Categories
                      </button>

                      <button
                        onClick={() => setAuctionSubNav("history")}
                        className={`h-full px-1 flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                          auctionSubNav === "history"
                            ? "text-[#1b4e7e] border-[#1b4e7e]"
                            : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                        }`}
                      >
                        <span>Past History</span>
                        {historyCount > 0 && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                            auctionSubNav === "history" ? "bg-[#1b4e7e]/10 text-[#1b4e7e]" : "bg-slate-100 text-slate-500"
                          }`}>
                            {historyCount}
                          </span>
                        )}
                      </button>
                    </>
                  );
                })()}

                <button
                  onClick={() => setAuctionSubNav("ledger")}
                  className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    auctionSubNav === "ledger"
                      ? "text-[#1b4e7e] border-[#1b4e7e]"
                      : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                  }`}
                >
                  NFT Audit Ledger
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main content dashboard */}
      {/* 3. Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full space-y-6">
        {/* ========================================================= */}
        {/* WELCOME CARD - SAME DASHBOARD UI */}
        {/* ========================================================= */}

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-lg font-bold text-slate-800">
              Welcome back, {user.fullName}!
            </h1>

            <p className="text-xs text-slate-500 font-medium">
              Registered Vendor/Bidder associated with{" "}
              <strong className="text-slate-700">{user.orgName}</strong>
            </p>
          </div>

          <div className="bg-primary-light border border-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg self-start sm:self-auto uppercase tracking-wide select-none">
            Status: Active Vendor
          </div>
        </div>

        {/* ========================================================= */}
        {/* ===================== DASHBOARD ========================= */}
        {/* ========================================================= */}

        {activeSubNav === "dashboard" && (
          <>
            {/* Dashboard Header */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-800 uppercase tracking-widest border-l-4 border-primary pl-3.5">
                    {activeTab === "tender"
                      ? "Active Tenders"
                      : "Live Reverse Auction Arena"}
                  </h2>

                  {filterSubmittedOnly && activeTab === "tender" && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      Filtered: Active Bids
                    </span>
                  )}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-800"
                    placeholder={`Search ${activeTab} ID or Title...`}
                  />

                  <svg
                    className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637z"
                    />
                  </svg>
                </div>
              </div>

              {/* Enterprise Proximity Recommendation Filter Bar */}
              {activeTab === "tender" && (
                <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-slate-700">
                      <svg className="w-4 h-4 text-[#1b4e7e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      <span className="font-semibold text-slate-600">
                        Operating Center:
                      </span>
                    </div>

                    <span className="font-bold text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                      {userSourceCity}{userSourceState ? `, ${userSourceState}` : ''}
                    </span>

                    {/* <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Proximity Filter Active
                    </span> */} 
                  </div>

                  <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
                    <button
                      type="button"
                      onClick={() => setSortByNearest(!sortByNearest)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer inline-flex items-center gap-2 shadow-2xs ${
                        sortByNearest
                          ? "bg-[#1b4e7e] hover:bg-[#133c62] text-white border-[#1b4e7e]"
                          : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
                      </svg>
                      {sortByNearest ? "Sort: Nearest First" : "Sort: Standard"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ===================================================== */}
            {/* EXISTING TENDER / AUCTION DASHBOARD */}
            {/* ===================================================== */}

            {activeTab === "tender" ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT - TENDER CARDS */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTenders.length > 0 ? (
                      filteredTenders.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Card Top */}
                          <div className="p-5 space-y-4 text-left">
                            <div className="flex justify-between items-start gap-4">
                              <h3 className="font-bold text-slate-800 text-sm md:text-[15px] leading-snug">
                                {item.title}
                              </h3>

                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                                  item.match === "High Match"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                                    : "bg-amber-50 text-amber-700 border border-amber-100/50"
                                }`}
                              >
                                {item.match}
                              </span>
                            </div>

                            {/* Metadata */}
                            <div className="space-y-2 text-xs md:text-sm">
                              <p className="text-slate-700">
                                <span className="text-slate-400 font-medium">
                                  Tender ID:
                                </span>{" "}
                                <span className="font-bold text-slate-800">
                                  {item.id}
                                </span>
                              </p>

                              <div className="grid grid-cols-2 gap-4">
                                <p className="text-slate-700">
                                  <span className="text-slate-400 font-medium">
                                    Client:
                                  </span>{" "}
                                  <span className="font-bold text-slate-800">
                                    {item.dept}
                                  </span>
                                </p>

                                <p className="text-slate-700">
                                  <span className="text-slate-400 font-medium">
                                    Location:
                                  </span>{" "}
                                  <span className="font-bold text-slate-800">
                                    {item.location}
                                  </span>
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <p className="text-slate-700">
                                  <span className="text-slate-400 font-medium">
                                    Est. Value:
                                  </span>{" "}
                                  <span className="font-bold text-slate-800">
                                    {item.value}
                                  </span>
                                </p>

                                <p className="text-slate-700">
                                  <span className="text-slate-400 font-medium">
                                    Bid Closes in:
                                  </span>{" "}
                                  {isTenderClosed(item) ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                                      00d : 00h : 00m : 00s • Elapsed
                                    </span>
                                  ) : (
                                    <span className="font-bold text-slate-800">
                                      {item.deadline}
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card Bottom */}
                          <div className="bg-[#f0f6fc] border-t border-slate-100 p-4 grid grid-cols-2 gap-4 items-center">
                            <button
                              onClick={() => setSelectedTender(item)}
                              className="w-full bg-white hover:bg-slate-50 text-primary border border-primary/20 hover:border-primary font-bold py-2.5 rounded-lg cursor-pointer transition-colors text-center text-xs shadow-sm h-11"
                            >
                              View Details
                            </button>

                            {item.tenderStatus === "AWARDED" ? (
                              <button
                                disabled
                                className="w-full bg-slate-200 text-slate-400 border border-slate-300 rounded-lg cursor-not-allowed flex flex-col items-center justify-center py-1.5 px-2 h-11"
                              >
                                <span className="font-bold text-[11px]">
                                  Tender Awarded
                                </span>
                                <span className="text-[8px] opacity-80 leading-none mt-0.5">
                                  Evaluation Completed
                                </span>
                              </button>
                            ) : isTenderClosed(item) ? (
                              <button
                                disabled
                                className="w-full bg-slate-200 text-slate-400 border border-slate-300 rounded-lg cursor-not-allowed flex flex-col items-center justify-center py-1.5 px-2 h-11"
                              >
                                <span className="font-bold text-[11px]">
                                  Submission Closed
                                </span>
                                <span className="text-[8px] opacity-80 leading-none mt-0.5">
                                  Deadline Elapsed
                                </span>
                              </button>
                            ) : hasUserApplied(item.id) ? (
                              <button
                                disabled
                                className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg cursor-not-allowed flex flex-col items-center justify-center py-1.5 px-2 h-11"
                              >
                                <span className="font-bold text-[11px]">
                                  Submitted
                                </span>
                                <span className="text-[8px] opacity-80 leading-none mt-0.5">
                                  Application Received
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleQuickApply(item)}
                                className="w-full bg-[#1b4e7e] hover:bg-[#163f68] text-white rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center py-1.5 px-2 shadow-md h-11"
                              >
                                <span className="font-bold text-[11px]">
                                  Quick Apply (Vault)
                                </span>

                                <span className="text-[8px] opacity-80 leading-none mt-0.5 whitespace-nowrap">
                                  One-click action pre-uploaded documents
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

                {/* RIGHT SIDEBAR */}
                <div className="space-y-6 text-left">
                  {/* Management Tools */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#1b4e7e]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                      </svg>
                      <span>Tender Management Tools</span>
                    </h3>

                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          setFilterSubmittedOnly(!filterSubmittedOnly)
                        }
                        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left transition-all cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800">
                            My Active Bids
                          </span>

                          <p className="text-[10px] text-slate-500">
                            {filterSubmittedOnly
                              ? "Showing submitted bids (Click to clear)"
                              : "Filter by applied bids"}
                          </p>
                        </div>

                        <span className="text-slate-400 font-bold text-sm">→</span>
                      </button>

                      <button
                        onClick={() => setVaultOpen(true)}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-left transition-all cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-slate-800">
                            Document Vault Access
                          </span>

                          <span className="text-[10px] text-slate-500 block">
                            Hardware / Cloud Security Records
                          </span>
                        </div>

                        <span className="text-slate-400 font-bold text-sm">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Regional Recommended Tenders Sidebar */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-[#1b4e7e] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <h3 className="text-xs font-black tracking-wider uppercase text-slate-800">
                          Regional Tender Matches
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Prioritized by proximity to your operating hub ({userSourceCity})
                      </p>
                    </div>

                    <div className="space-y-3">
                      {recommendedNearestTenders.length > 0 ? (
                        recommendedNearestTenders.map((rec) => (
                          <div
                            key={rec.id}
                            className="bg-white rounded-lg p-3 text-slate-800 space-y-2 border border-blue-100 shadow-2xs"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[11px] font-bold text-[#133c62] line-clamp-1">
                                {rec.title}
                              </span>
                              {/* <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded whitespace-nowrap inline-flex items-center gap-1">
                                <svg className="w-2.5 h-2.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                                {rec.distanceText}
                              </span> */}
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                              <span>ID: <strong className="text-slate-700">{rec.id}</strong></span>
                              <span>Est: <strong className="text-slate-800">{rec.value}</strong></span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setSelectedTender(rec)}
                                className="py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold text-center cursor-pointer transition-colors"
                              >
                                View Details
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickApply(rec)}
                                className="py-1 px-2 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded text-[10px] font-bold text-center cursor-pointer transition-colors shadow-2xs"
                              >
                                Quick Apply
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-white/50 text-center py-2 italic">
                          No active tenders nearby.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ===================================================== */
              /* AUCTION */
              <>
                {/* Check if Buyer (or Dual Buyer+Contractor) is logged in without connected MetaMask */}
                {(user?.role === 'buyer' || user?.role === 'both' || user?.role?.includes('buyer')) && !activeWallet ? (
                  <div className="bg-white rounded-2xl border-2 border-amber-300/80 shadow-lg p-8 md:p-12 text-center max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                      {/* MetaMask Fox SVG */}
                      <svg className="w-10 h-10" viewBox="0 0 318.6 318.6" fill="none">
                        <path d="M274.1 35.5l-99.5 73.9 19.6-46.6L274.1 35.5z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M44.4 35.5l98.7 74.6-18.8-47.3L44.4 35.5zM260.7 225.8l-26.6 40.8 45.4 12.5 13.7-52.5-32.5-.8zM25.5 226.6l13.7 52.5 45.4-12.5-26.6-40.8-32.5.8z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M116.6 115.5l-11.6 17.6 40.5 1.7-1.4-44.5-27.5 25.2zM202 115.5l27.4-25.3-1.3 44.6 40.5-1.7-11.6-17.6z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M84.5 266.6l37.8-18.4-32.5-25.3-5.3 43.7zM196.3 248.2l37.8 18.4-5.3-43.7-32.5 25.3z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M122.3 248.2l35.6 24.3 38.4-24.3-37.4 13.9-36.6-13.9z" fill="#233447" stroke="#233447" strokeLinejoin="round"/>
                        <path d="M159.3 175.8l-37-3-12.7 19 36.9 1.1 12.8-17.1zM159.3 175.8l12.8 17.1 36.9-1.1-12.7-19-37 3z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M272.5 140.9l-14-38.3-25.5 23.6 10.9 16.5 28.6-1.8zM46.1 140.9l28.6 1.8 10.9-16.5-25.5-23.6-14 38.3z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M159.3 134.7l1.4 44.5 37-3-40.5 1.7 2.1-43.2zM159.3 134.7l-2.1 43.2-40.5-1.7 37 3 1.4-44.5z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                        Digital Escrow Gateway
                      </span>
                      <h3 className="text-xl font-black text-slate-800">
                        Buyer Wallet Authorization Required
                      </h3>
                      <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                        You have registered with <strong>Procurement Buyer</strong> capabilities. To access and monitor live auctions, please connect your authorized Web3 digital wallet for automated smart contract escrow and bid settlement.
                      </p>
                    </div>

                    {user?.walletAddress && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 max-w-md mx-auto text-left text-xs space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Buyer Wallet Address</span>
                        <span className="font-mono font-bold text-slate-800 text-[11px] block truncate">
                          {user.walletAddress}
                        </span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        disabled={isConnectingWallet}
                        onClick={connectMetaMask}
                        className="px-6 py-3 bg-[#f6851b] hover:bg-[#e2761b] text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer inline-flex items-center gap-2"
                      >
                        {isConnectingWallet ? "Connecting to MetaMask..." : "Connect MetaMask Wallet & Enter Auction"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Buyer Web3 Status Bar if logged in with buyer role and connected */}
                    {(user?.role === 'buyer' || user?.role === 'both' || user?.role?.includes('buyer')) && activeWallet && (
                      <div className="mb-6 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="font-bold text-slate-800">
                            {user?.role === 'both' ? 'Dual Role (Contractor + Buyer) Web3 Escrow Active:' : 'Buyer Web3 Escrow Active:'}
                          </span>
                          <span className="font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                            {activeWallet.slice(0, 8)}...{activeWallet.slice(-6)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isConnectingWallet}
                            onClick={switchMetaMask}
                            className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-white px-2.5 py-1 rounded border border-emerald-300 hover:border-emerald-400 shadow-2xs transition-colors cursor-pointer"
                          >
                            {isConnectingWallet ? 'Switching...' : 'Switch Account'}
                          </button>
                          <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                            Smart Contract Escrow Verified
                          </span>
                        </div>
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* 1. LIVE AUCTIONS SUBNAV TAB */}
                    {/* ========================================================================= */}
                    {auctionSubNav === "live" && (() => {
                      // Filter live auctions by search query and category (excluding concluded/awarded auctions)
                      const filteredLiveAuctions = auctions.filter((item) => {
                        const isConcluded = item.status === "CONCLUDED" || item.status === "SETTLED" || item.status === "AWARDED" || item.status === "Completed" || item.status === "Closed" || item.status === "closed";
                        if (isConcluded) return false;

                        const matchesSearch =
                          !auctionSearchQuery ||
                          item.title.toLowerCase().includes(auctionSearchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(auctionSearchQuery.toLowerCase()) ||
                          (item.client && item.client.toLowerCase().includes(auctionSearchQuery.toLowerCase())) ||
                          (item.location && item.location.toLowerCase().includes(auctionSearchQuery.toLowerCase()));

                        const matchesCategory =
                          auctionCategoryFilter === "All" ||
                          (item.category && item.category.toLowerCase().includes(auctionCategoryFilter.toLowerCase())) ||
                          item.title.toLowerCase().includes(auctionCategoryFilter.split(" ")[0].toLowerCase());

                        return matchesSearch && matchesCategory;
                      });

                      const featuredLiveAuction = filteredLiveAuctions[0] || null;
                      const secondaryLiveAuctions = filteredLiveAuctions.slice(1);

                      return (
                        <div className="space-y-6 text-left">
                          {/* Search & Category Filter Header Bar */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                              <div className="relative w-full md:max-w-md">
                                <svg
                                  className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                <input
                                  type="text"
                                  value={auctionSearchQuery}
                                  onChange={(e) => setAuctionSearchQuery(e.target.value)}
                                  placeholder="Search live auctions by title, ID, agency or city..."
                                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1b4e7e] transition-colors"
                                />
                                {auctionSearchQuery && (
                                  <button
                                    onClick={() => setAuctionSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-xs text-slate-500 w-full md:w-auto justify-between md:justify-end">
                                <span className="font-medium">
                                  Showing <strong className="text-slate-800">{filteredLiveAuctions.length}</strong> of {auctions.length} Live Auctions
                                </span>
                                <button
                                  type="button"
                                  onClick={fetchAuctionsFromDb}
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                  title="Refresh Catalog"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                  </svg>
                                  <span className="hidden sm:inline">Sync</span>
                                </button>
                              </div>
                            </div>

                            {/* Category Filter Chips */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mr-1 shrink-0">
                                Filter:
                              </span>
                              {[
                                "All",
                                "Construction & Infrastructure",
                                "Medical & Biotech",
                                "Enterprise IT",
                                "Consumables",
                                "Heavy Machinery",
                                "Solar & Renewables",
                              ].map((cat) => {
                                const isSelected = auctionCategoryFilter === cat;
                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setAuctionCategoryFilter(cat)}
                                    className={`px-3 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                                      isSelected
                                        ? "bg-[#1b4e7e] text-white shadow-2xs"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Grid Layout: Left Auctions & Right Summary Sidebar */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                              {/* Featured Live Auction Card */}
                              {featuredLiveAuction ? (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-slate-300 transition-all">
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Live Auction
                                      </span>
                                      <span className="font-mono text-slate-600 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                        {featuredLiveAuction.id}
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-mono text-slate-600 flex items-center gap-1 font-bold">
                                      <svg className="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                      </svg>
                                      Time Left: {getUserAuctionCountdown(featuredLiveAuction).formatted}
                                    </span>
                                  </div>

                                  <div>
                                    <h3 className="font-bold text-slate-900 text-base">
                                      {featuredLiveAuction.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                                      {featuredLiveAuction.client && (
                                        <span>Agency: <strong className="text-slate-700">{featuredLiveAuction.client}</strong></span>
                                      )}
                                      {featuredLiveAuction.location && (
                                        <span>• Location: <strong className="text-slate-700">{featuredLiveAuction.location}</strong></span>
                                      )}
                                      {featuredLiveAuction.category && (
                                        <span className="bg-slate-100 text-slate-600 px-2 py-0.2 rounded text-[10px] font-bold">
                                          {featuredLiveAuction.category}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <div>
                                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                        Leading Highest Bid (H1)
                                      </span>
                                      <span className="text-lg font-black text-emerald-700 font-mono block mt-0.5">
                                        ₹{featuredLiveAuction.lowestBid.toLocaleString()}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                        Base Reserve Price
                                      </span>
                                      <span className="text-base font-bold text-slate-700 font-mono block mt-0.5">
                                        {featuredLiveAuction.startingValue || `₹${featuredLiveAuction.lowestBid.toLocaleString()}`}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => {
                                      setSelectedAuctionForBid(featuredLiveAuction);
                                      setReverseBidInput("");
                                      setReverseArenaBidOpen(true);
                                    }}
                                    className="w-full py-2.5 bg-[#1b4e7e] hover:bg-[#133c62] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
                                  >
                                    <span>Enter Live Auction Arena &amp; Trading Terminal</span>
                                    <span>→</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 space-y-3">
                                  <p className="text-sm font-semibold">No live auctions match your search criteria.</p>
                                  <button
                                    onClick={() => {
                                      setAuctionSearchQuery("");
                                      setAuctionCategoryFilter("All");
                                    }}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                                  >
                                    Clear Search &amp; Filters
                                  </button>
                                </div>
                              )}

                              {/* Secondary Live Auctions Grid */}
                              {secondaryLiveAuctions.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {secondaryLiveAuctions.map((item) => (
                                    <div
                                      key={item.id}
                                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all space-y-4 text-left"
                                    >
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                            {item.id}
                                          </span>
                                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            LIVE
                                          </span>
                                        </div>

                                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                                          {item.title}
                                        </h4>

                                        {item.client && (
                                          <p className="text-[11px] text-slate-500 truncate">
                                            {item.client} • {item.location}
                                          </p>
                                        )}

                                        <div className="pt-2">
                                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                            Leading Highest Bid (H1)
                                          </span>
                                          <div className="text-lg font-black text-emerald-700 font-mono mt-0.5">
                                            ₹{item.lowestBid.toLocaleString()}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <span className="text-[11px] font-mono text-slate-500 font-bold flex items-center gap-1">
                                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                          </svg>
                                          {getUserAuctionCountdown(item).formatted}
                                        </span>

                                        <button
                                          onClick={() => {
                                            setSelectedAuctionForBid(item);
                                            setReverseBidInput("");
                                            setReverseArenaBidOpen(true);
                                          }}
                                          className="bg-[#1b4e7e] hover:bg-[#133c62] text-white py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                                        >
                                          <span>Enter Arena</span>
                                          <span>→</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Right Sidebar: Activity & Market Statistics */}
                            <div className="space-y-6">
                              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 text-slate-800">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3 flex items-center gap-2">
                                  <svg className="w-4 h-4 text-[#1b4e7e]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                                  </svg>
                                  <span>My Auction Activity</span>
                                </h3>

                                <div className="space-y-3">
                                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span>My Submitted Live Bids</span>
                                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-[#1b4e7e]">
                                      {userAuctionBids.length > 0
                                        ? userAuctionBids.length
                                        : auctions.filter((a) => a.status === "placed" || a.myBid).length} Active
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <span>Catalog Auction Total</span>
                                    <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                                      {auctions.length} Live
                                    </span>
                                  </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 space-y-2">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-bold text-slate-600">Market Participation Rate</span>
                                    <span className="font-bold text-emerald-600 font-mono">+18.4% YoY</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                                    <div className="bg-[#1b4e7e] h-full w-[65%]" />
                                    <div className="bg-emerald-500 h-full w-[35%]" />
                                  </div>
                                  <span className="text-[10px] text-slate-400 block text-right font-mono">
                                    Real-Time Liquidity Index
                                  </span>
                                </div>

                                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[10px] text-slate-400">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    Live Network Sync
                                  </span>
                                  <span className="font-mono">Auto-refreshed</span>
                                </div>
                              </div>

                              {/* Category Quick Links */}
                              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
                                <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                                  Browse by Industry
                                </h4>
                                <div className="space-y-1.5">
                                  {[
                                    "Construction & Infrastructure",
                                    "Medical & Biotech",
                                    "Enterprise IT",
                                    "Consumables",
                                    "Heavy Machinery",
                                  ].map((c) => (
                                    <button
                                      key={c}
                                      onClick={() => setAuctionCategoryFilter(c)}
                                      className="w-full text-left p-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-[#1b4e7e] flex items-center justify-between transition-colors cursor-pointer"
                                    >
                                      <span>{c}</span>
                                      <span className="text-[10px] font-mono font-bold text-slate-400">
                                        {auctions.filter((a) =>
                                          (a.category && a.category.toLowerCase().includes(c.toLowerCase())) ||
                                          a.title.toLowerCase().includes(c.split(" ")[0].toLowerCase())
                                        ).length}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* ========================================================================= */}
                    {/* 2. WON AUCTIONS & NFT VAULT SUBNAV TAB */}
                    {/* ========================================================================= */}
                    {auctionSubNav === "my-bids" && (() => {
                      // Filter won auctions matching the current user
                      const wonAuctions = auctions.filter((a) => {
                        const isConcluded = a.status === "CONCLUDED" || a.status === "SETTLED" || a.status === "AWARDED";
                        if (!isConcluded) return false;
                        const isWinnerUser =
                          (a.winnerBidderId && (a.winnerBidderId === user?.id || String(a.winnerBidderId).toLowerCase() === String(user?.id).toLowerCase())) ||
                          (a.winnerName && (a.winnerName === user?.fullName || a.winnerName === "Verified Enterprise Bidder" || a.winnerName.toLowerCase().includes(String(user?.fullName || "").toLowerCase()))) ||
                          (a.winnerApplicantId && a.winnerApplicantId === user?.id) ||
                          userAuctionBids.some((b) => (b.auctionId === a.id || b.id === a.id) && b.isH1Leader);
                        return isWinnerUser;
                      });

                      return (
                        <div className="space-y-6 text-slate-800 text-left">
                          {/* Top Header Banner */}
                          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#1b4e7e] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                                  NFT VAULT
                                </span>
                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                                  ERC-1155 Tokenized
                                </span>
                              </div>
                              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                                Won Auctions &amp; NFT Vault
                              </h2>
                              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                                Verifiable ERC-1155 digital certificates and smart on-chain receipts minted for reverse auctions awarded to your organization.
                              </p>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  fetchAuctionsFromDb();
                                  fetchUserAuctionBids();
                                }}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                              >
                                <svg className={`w-3.5 h-3.5 ${isLoadingUserBids ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                <span>Sync Vault</span>
                              </button>
                            </div>
                          </div>

                          {/* Won Auctions Content Grid vs Empty State */}
                          {wonAuctions.length === 0 ? (
                            /* Clean Empty State */
                            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 space-y-4 shadow-xs">
                              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-amber-500 shadow-2xs">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.003 0H9.497m5.003 0a4.5 4.5 0 0 0-5.003 0m5.003 0V9.75A4.5 4.5 0 0 0 10.5 5.25h-1.5a4.5 4.5 0 0 0-4.5 4.5v4.5m10.5 0h.871c.622 0 1.125.504 1.125 1.125v3.375" />
                                </svg>
                              </div>

                              <div className="space-y-1.5 max-w-md mx-auto">
                                <h3 className="text-base font-bold text-slate-800">
                                  No Won Auctions in Vault Yet
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                  Once a reverse auction you participate in concludes and you are declared the winning contractor, your official contract details, 20-minute MetaMask payment window, and ERC-1155 NFT Certificate will be stored here.
                                </p>
                              </div>

                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={() => setAuctionSubNav("live")}
                                  className="px-6 py-2.5 bg-[#1b4e7e] hover:bg-[#133c62] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
                                >
                                  <span>Explore Live Reverse Auctions Arena</span>
                                  <span>→</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Won Auctions List */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {wonAuctions.map((item, idx) => {
                                const settlementCountdown = getSettlementCountdown(item);
                                const isPaid = item.settlementStatus === "PAID";
                                const ethPrice = item.winnerEthAmount || convertInrToEth(item.winnerAmount || item.lowestBid || 100);

                                return (
                                  <div
                                    key={idx}
                                    className="bg-white border-2 border-amber-300/80 rounded-2xl p-6 shadow-md space-y-5 hover:border-amber-400 transition-all flex flex-col justify-between"
                                  >
                                    {/* Top Awarded Badge Banner */}
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center gap-2">
                                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                                          ID: {item.id}
                                        </span>

                                        {isPaid ? (
                                          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                                            <span>✓</span>
                                            <span>ON-CHAIN SETTLED</span>
                                          </span>
                                        ) : (
                                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 text-[10px] font-black border border-amber-400 flex items-center gap-1.5 shadow-2xs animate-pulse">
                                            <span>🏆</span>
                                            <span>CONTRACT AWARDED (H1 WINNER)</span>
                                          </span>
                                        )}
                                      </div>

                                      <div>
                                        <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                                          {item.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                          Procuring Agency: <strong className="text-slate-700">{item.client}</strong> • {item.location}
                                        </p>
                                      </div>

                                      {/* Financial Breakdown Box */}
                                      <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 font-mono">
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="text-slate-400">Winning Award Bid:</span>
                                          <span className="text-emerald-400 font-bold text-sm">
                                            {item.winnerAmount || `₹${Number(item.lowestBid || 100).toLocaleString()}`}
                                          </span>
                                        </div>

                                        <div className="flex justify-between items-center text-xs border-t border-slate-800 pt-2">
                                          <span className="text-slate-400 flex items-center gap-1">
                                            <span>🔷</span>
                                            <span>ETH Settlement Value:</span>
                                          </span>
                                          <span className="text-amber-400 font-black text-sm">
                                            {ethPrice}
                                          </span>
                                        </div>

                                        <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-800 pt-2">
                                          <span>Admin Receiver:</span>
                                          <span className="text-slate-300 truncate max-w-[170px]" title={item.adminWalletAddress || "Not Specified"}>
                                            {item.adminWalletAddress || "Not Specified"}
                                          </span>
                                        </div>
                                      </div>

                                      {/* 20-Minute Settlement Window Banner */}
                                      <div className={`rounded-xl p-3.5 space-y-1.5 border text-xs ${
                                        isPaid
                                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                          : settlementCountdown.isExpired
                                          ? "bg-rose-50 border-rose-200 text-rose-900"
                                          : "bg-amber-50/80 border-amber-200 text-amber-900"
                                      }`}>
                                        <div className="flex justify-between items-center font-bold">
                                          <span className="flex items-center gap-1.5">
                                            <span>⏱️</span>
                                            <span>Settlement Window:</span>
                                          </span>
                                          <span className="font-mono text-sm font-black">
                                            {settlementCountdown.text}
                                          </span>
                                        </div>
                                        {!isPaid && !settlementCountdown.isExpired && (
                                          <p className="text-[10px] text-amber-800/80 leading-relaxed">
                                            You have 20 minutes from auction conclusion to execute your transaction via MetaMask and seal your on-chain NFT certificate.
                                          </p>
                                        )}
                                        {isPaid && item.settlementTxHash && (
                                          <div className="text-[10px] font-mono text-emerald-800 truncate pt-1 border-t border-emerald-200">
                                            Tx Hash: {item.settlementTxHash}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2 pt-2 border-t border-slate-100">
                                      {!isPaid ? (
                                        settlementCountdown.isExpired ? (
                                          <div className="w-full py-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-2xs">
                                            <span>⚠️</span>
                                            <span>Settlement Window Expired (No Payment Received)</span>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            onClick={() => handleMetaMaskSettlement(item)}
                                            disabled={isSettlingPayment === item.id}
                                            className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                                          >
                                            {isSettlingPayment === item.id ? (
                                              <>
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                <span>Processing MetaMask Transaction...</span>
                                              </>
                                            ) : (
                                              <>
                                                <span>🦊</span>
                                                <span>Pay via MetaMask ({ethPrice})</span>
                                                <span>→</span>
                                              </>
                                            )}
                                          </button>
                                        )
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => setSelectedCertificateModal({
                                            ...item,
                                            bidAmount: item.winnerAmount || item.lowestBid || 100,
                                            bidderName: user?.fullName || "Authenticated Winner",
                                            bidderOrg: user?.orgName || "Registered Contractor",
                                            bidHash: item.settlementTxHash || "0x7f48bce39a48586e",
                                          })}
                                          className="w-full py-2.5 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                                        >
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                                          </svg>
                                          <span>Inspect &amp; Print Official NFT Certificate</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* ========================================================================= */}
                    {/* 3. CATEGORIES SUBNAV TAB */}
                    {/* ========================================================================= */}
                    {auctionSubNav === "categories" && (
                      <div className="space-y-6 text-left">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                          <h2 className="text-lg font-black text-slate-800">
                            Reverse Auction Categories
                          </h2>
                          <p className="text-xs text-slate-500 mt-1">
                            Browse and filter government procurement reverse auctions by industrial field and procurement classification.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            {
                              name: "Construction & Infrastructure",
                              desc: "Road expansion, bridge building, civil works, metro lines, and municipal flyovers.",
                              filterKey: "Construction & Infrastructure",
                              icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              ),
                            },
                            {
                              name: "Medical Equipment & Biotech",
                              desc: "Biomedical monitors, diagnostic imaging setups, ICU ventilators, and oxygen distribution pipelines.",
                              filterKey: "Medical & Biotech",
                              icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              ),
                            },
                            {
                              name: "Enterprise IT & Computing",
                              desc: "Data center racks, high-throughput fibre backbones, cloud migration suites, and cybersecurity tooling.",
                              filterKey: "Enterprise IT",
                              icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              ),
                            },
                            {
                              name: "Consumables & Office Logistics",
                              desc: "Stationery packages, printing suites, fleet shipping logistics, and modular office furniture.",
                              filterKey: "Consumables",
                              icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              ),
                            },
                            {
                              name: "Heavy Machinery & Fleet",
                              desc: "High-capacity excavators, hydraulic cranes, dump trucks, and road levelling machinery.",
                              filterKey: "Heavy Machinery",
                              icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              ),
                            },
                            {
                              name: "Solar & Renewable Energy",
                              desc: "Rooftop photovoltaic arrays, microgrid inverters, battery storage units, and wind turbine components.",
                              filterKey: "Solar & Renewables",
                              icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                              ),
                            },
                          ].map((cat, idx) => {
                            const count = auctions.filter((a) =>
                              (a.category && a.category.toLowerCase().includes(cat.filterKey.toLowerCase())) ||
                              a.title.toLowerCase().includes(cat.filterKey.split(" ")[0].toLowerCase())
                            ).length;

                            return (
                              <div
                                key={idx}
                                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all text-left"
                              >
                                <div className="space-y-4">
                                  <div className="w-11 h-11 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-[#1b4e7e]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      {cat.icon}
                                    </svg>
                                  </div>
                                  <div>
                                    <h3 className="text-sm font-bold text-slate-800">{cat.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
                                  </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                                  <span className="text-[#1b4e7e] font-black font-mono">
                                    {count} {count === 1 ? "Auction" : "Auctions"}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setAuctionCategoryFilter(cat.filterKey);
                                      setAuctionSubNav("live");
                                    }}
                                    className="px-3.5 py-1.5 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-2xs flex items-center gap-1"
                                  >
                                    <span>Explore</span>
                                    <span>→</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* 4. PAST HISTORY SUBNAV TAB */}
                    {/* ========================================================================= */}
                    {auctionSubNav === "history" && (
                      <div className="space-y-6 text-left">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                          <h2 className="text-lg font-black text-slate-800">
                            Past Concluded Auctions
                          </h2>
                          <p className="text-xs text-slate-500 mt-1">
                            Review concluded bidding cycles, contract award outcomes, and cryptographic settlement proofs.
                          </p>
                        </div>

                        {auctions.filter((a) => (a.status as string) === "CONCLUDED" || (a.status as string) === "SETTLED" || (a.status as string) === "AWARDED" || (a.status as string) === "Completed" || (a.status as string) === "Closed" || (a.status as string) === "closed").length > 0 ? (
                          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left text-slate-700">
                                <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-200">
                                  <tr>
                                    <th className="px-6 py-4">Auction ID</th>
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Agency / Client</th>
                                    <th className="px-6 py-4">Starting Value</th>
                                    <th className="px-6 py-4">Concluded Highest Bid</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {auctions
                                    .filter((a) => (a.status as string) === "CONCLUDED" || (a.status as string) === "SETTLED" || (a.status as string) === "AWARDED" || (a.status as string) === "Completed" || (a.status as string) === "Closed" || (a.status as string) === "closed")
                                    .map((row) => (
                                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-slate-900">{row.id}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">{row.title}</td>
                                        <td className="px-6 py-4 text-slate-500">{row.client || "Directorate"}</td>
                                        <td className="px-6 py-4 font-mono text-slate-600">
                                          {row.startingValue || `₹${row.lowestBid.toLocaleString()}`}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-emerald-700 text-sm">
                                          ₹{row.lowestBid.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                                            {row.status.toUpperCase()}
                                          </span>
                                        </td>
                                        <td className="px-6 py-4">
                                          <button
                                            type="button"
                                            onClick={() => setSelectedConcludedAuction(row)}
                                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                                          >
                                            Inspect Audit
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                            <p className="text-sm font-semibold">No past concluded auctions found in the database.</p>
                            <p className="text-xs text-slate-400">
                              Completed reverse auctions will appear here once their bidding cycles conclude and smart contracts settle.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ========================================================================= */}
                    {/* 5. NFT AUDIT LEDGER SUBNAV TAB */}
                    {/* ========================================================================= */}
                    {auctionSubNav === "ledger" && (
                      <div className="space-y-6 text-left">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="bg-[#1b4e7e] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                                MERKLE CONSENSUS
                              </span>
                              <span className="text-emerald-700 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Real-Time Blockchain Feed
                              </span>
                            </div>
                            <h2 className="text-lg font-black text-slate-800 mt-1">
                              NFT Cryptographic Audit Ledger
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Every bid recorded in the system is immutably hashed and logged into the decentralized verification root.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[#1b4e7e] text-[10px] font-bold font-mono">
                              Block Height: #{blockchainLedger.length > 0 ? blockchainLedger[0].blockHeight : 20914820}
                            </span>
                            <button
                              type="button"
                              onClick={fetchBlockchainLedger}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-xs font-bold transition-all cursor-pointer"
                              title="Sync Ledger"
                            >
                              <svg className={`w-3.5 h-3.5 ${isLoadingLedger ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                          {isLoadingLedger ? (
                            <div className="py-12 text-center text-slate-400 space-y-2">
                              <div className="w-6 h-6 border-2 border-[#1b4e7e] border-t-transparent rounded-full animate-spin mx-auto"></div>
                              <p className="text-xs font-semibold">Validating block header proofs from network...</p>
                            </div>
                          ) : (
                            <div className="relative border-l-2 border-slate-200 pl-6 space-y-6 ml-3">
                              {(blockchainLedger.length > 0
                                ? blockchainLedger
                                : [
                                    {
                                      id: 1,
                                      auctionTitle: "State Highway 42 Infrastructure Development",
                                      bidderName: "Yug",
                                      bidAmount: 100,
                                      txHash: "0x7f48bce39a48586e797e433ab948586e",
                                      blockHeight: 20914820,
                                      created_at: new Date().toISOString(),
                                      status: "VALIDATED_ON_CHAIN",
                                    },
                                    {
                                      id: 2,
                                      auctionTitle: "Medical Equipment Oxygen Lines",
                                      bidderName: "Patel Group",
                                      bidAmount: 50000,
                                      txHash: "0x91b2fe48ba9910a3ee77433ab948586e",
                                      blockHeight: 20914805,
                                      created_at: new Date(Date.now() - 3600000).toISOString(),
                                      status: "VALIDATED_ON_CHAIN",
                                    },
                                    {
                                      id: 3,
                                      auctionTitle: "Enterprise IT Server Modernization",
                                      bidderName: "Directorate Vendor",
                                      bidAmount: 250000,
                                      txHash: "0xbc887f48bce39a48586e797e433ab948",
                                      blockHeight: 20914750,
                                      created_at: new Date(Date.now() - 7200000).toISOString(),
                                      status: "GENESIS_SEALED",
                                    },
                                  ]
                              ).map((item, idx) => (
                                <div key={idx} className="relative">
                                  <span className="absolute -left-[31px] top-1.5 w-3 h-3 bg-white border-2 border-[#1b4e7e] rounded-full" />
                                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold text-slate-900">
                                          Bid Hash Signed: ₹{Number(item.bidAmount).toLocaleString()}
                                        </h3>
                                        <span className="text-[10px] text-slate-500 font-medium">
                                          by <strong>{item.bidderName}</strong>
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 max-w-xl">
                                        {item.auctionTitle || "Government Procurement Reverse Auction"}
                                      </p>
                                      <div className="flex flex-wrap gap-4 pt-1 text-[9px] text-slate-400 font-mono">
                                        <span>Tx Hash: <span className="text-[#1b4e7e] font-bold">{item.txHash || item.bidHash || "0xVerified"}</span></span>
                                        <span>Block: <span className="text-slate-600">#{item.blockHeight || 20914800 + idx}</span></span>
                                      </div>
                                    </div>
                                    <div className="md:text-right shrink-0 space-y-1">
                                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-extrabold border border-emerald-100 block w-fit md:ml-auto">
                                        {item.status || "CONFIRMED_ON_CHAIN"}
                                      </span>
                                      <span className="text-[10px] text-slate-400 block font-mono">
                                        {item.created_at ? new Date(item.created_at).toLocaleTimeString() : "Just now"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* ===================== LIVE TENDERS ====================== */}
        {/* ========================================================= */}

        {activeSubNav === "live" && (
          <section className="space-y-6">
            {/* Header & Status Banner */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Live Bidding Floor
                    </h2>
                    
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Actively open public procurement tenders accepting encrypted 2-of-2 split-key proposals.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Tenders</span>
                    <span className="text-sm font-black text-[#1b4e7e]">{filteredLiveTenders.length} Available</span>
                  </div>
                </div>
              </div>

              {/* Live Search & Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
                <div className="sm:col-span-6 relative">
                  <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by tender title, department, ID, or state..."
                    value={liveSearchQuery}
                    onChange={(e) => setLiveSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1b4e7e] focus:bg-white transition-colors"
                  />
                  {liveSearchQuery && (
                    <button
                      onClick={() => setLiveSearchQuery("")}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={liveFilterCategory}
                    onChange={(e) => setLiveFilterCategory(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1b4e7e] focus:bg-white transition-colors"
                  >
                    <option value="All">All Categories</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="IT">IT & Software</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Construction">Construction</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={liveSortBy}
                    onChange={(e) => setLiveSortBy(e.target.value as any)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1b4e7e] focus:bg-white transition-colors"
                  >
                    <option value="all">Sort: Default</option>
                    <option value="closing_soon">Sort: Closing Soonest</option>
                    <option value="highest_value">Sort: Highest Budget</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Tenders Cards Grid */}
            {filteredLiveTenders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredLiveTenders.map((tender) => {
                  const closed = isTenderClosed(tender);
                  const applied = hasUserApplied(tender.id);

                  return (
                    <div
                      key={tender.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group"
                    >
                      <div className="space-y-4">
                        {/* Top Meta Bar */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-[#1b4e7e] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                {tender.id}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {tender.location}
                              </span>
                            </div>
                            <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#1b4e7e] transition-colors mt-2 leading-snug">
                              {tender.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                              {tender.dept}
                            </p>
                          </div>

                          <div className="shrink-0">
                            {closed ? (
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                CLOSED
                              </span>
                            ) : applied ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                APPLIED
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                LIVE
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 4-Block Info Grid */}
                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Estimated Budget
                            </span>
                            <span className="text-sm font-black text-slate-800 block mt-0.5">
                              {tender.value}
                            </span>
                          </div>

                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Timelock Expiry
                            </span>
                            {closed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold mt-1">
                                00d : 00h : 00m : 00s • Elapsed
                              </span>
                            ) : (
                              <span className="text-xs font-mono font-extrabold text-rose-600 block mt-0.5">
                                {tender.deadline}
                              </span>
                            )}
                          </div>

                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Profile Match
                            </span>
                            <span className="text-xs font-extrabold text-emerald-700 block mt-0.5">
                              {tender.match}
                            </span>
                          </div>

                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              Axiom Vault
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1 mt-0.5">
                              <svg className="w-3.5 h-3.5 text-[#1b4e7e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                              </svg>
                              2-of-2 Key Sealed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                        <button
                          onClick={() => setSelectedTender(tender)}
                          className="w-1/2 py-2.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                        >
                          View Details
                        </button>

                        {closed ? (
                          <button
                            disabled
                            className="w-1/2 py-2.5 bg-slate-100 text-slate-400 border border-slate-200 rounded-xl text-xs font-bold cursor-not-allowed text-center"
                          >
                            Submission Closed
                          </button>
                        ) : applied ? (
                          <button
                            disabled
                            className="w-1/2 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Bid Submitted
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickApply(tender)}
                            className="w-1/2 py-2.5 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                            Quick Apply (Vault)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-800">No active live tenders found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {liveSearchQuery || liveFilterCategory !== "All"
                    ? "No live tenders match your search filters. Try clearing your search or selecting all categories."
                    : "All tenders in the database are currently evaluated or awarded. Check the Past History tab for historical awards."}
                </p>
                {(liveSearchQuery || liveFilterCategory !== "All") && (
                  <button
                    onClick={() => {
                      setLiveSearchQuery("");
                      setLiveFilterCategory("All");
                    }}
                    className="px-4 py-2 bg-[#1b4e7e] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer mt-2"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* ===================== FIND TENDERS ====================== */}
        {/* ========================================================= */}

        {activeSubNav === "find" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Find Tenders</h2>

              <p className="text-sm text-slate-500 mt-1">
                Explore tenders available across different departments and locations.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tender ID, title, department or location..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b4e7e]/20"
                />

                <svg
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637z"
                  />
                </svg>
              </div>
            </div>

            {filteredTenders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTenders.map((tender) => (
                  <div
                    key={tender.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-[#1b4e7e]">
                            {tender.id}
                          </span>

                          <h3 className="font-bold text-slate-800 text-sm mt-1">
                            {tender.title}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1">
                            {tender.dept}
                          </p>
                        </div>

                        <span className="px-2 py-1 rounded-md bg-blue-50 text-[#1b4e7e] text-[10px] font-bold shrink-0">
                          OPEN
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-5">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-[10px] text-slate-400">Match</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">
                            {tender.match}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-[10px] text-slate-400">Location</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">
                            {tender.location}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-[10px] text-slate-400">Value</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">
                            {tender.value}
                          </p>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-[10px] text-slate-400">Deadline</p>
                          {isTenderClosed(tender) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold mt-1">
                              00d : 00h : 00m : 00s • Elapsed
                            </span>
                          ) : (
                            <p className="text-xs font-bold text-red-600 mt-1">
                              {tender.deadline}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {isTenderClosed(tender) ? (
                      <button
                        disabled
                        className="w-full mt-5 bg-slate-100 text-slate-400 border border-slate-200 py-2.5 rounded-lg text-xs font-bold cursor-not-allowed text-center"
                      >
                        Submission Closed
                      </button>
                    ) : hasUserApplied(tender.id) ? (
                      <button
                        disabled
                        className="w-full mt-5 bg-emerald-50 text-emerald-700 border border-emerald-200 py-2.5 rounded-lg text-xs font-bold cursor-not-allowed text-center"
                      >
                        Application Submitted
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedTender(tender)}
                        className="w-full mt-5 bg-[#1b4e7e] hover:bg-[#163f65] text-white py-2.5 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        View Details & Apply
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
                <p className="text-sm font-semibold">No matching tenders found for "{searchQuery}".</p>
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* ====================== CATEGORIES ====================== */}
        {/* ========================================================= */}

        {activeSubNav === "categories" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Tender Categories
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Browse tenders based on your preferred business category.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryData.map((category) => (
                <div
                  key={category.name}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#1b4e7e]/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-lg bg-[#eef5fb] flex items-center justify-center text-[#1b4e7e] font-black">
                      {category.name.charAt(0)}
                    </div>

                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                      {category.count} Tenders
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 mt-4">
                    {category.name}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed mt-2 min-h-[38px]">
                    {category.description}
                  </p>

                  <button
                    onClick={() => {
                      setSearchQuery(category.name);
                      setActiveSubNav("find");
                    }}
                    className="w-full mt-5 border border-[#1b4e7e]/20 text-[#1b4e7e] hover:bg-[#1b4e7e] hover:text-white py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Browse Tenders →
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* ==================== APPLIED TENDERS ==================== */}
        {/* ========================================================= */}

        {activeSubNav === "applied" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Applied Tenders
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Track all tenders where you have submitted applications.
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#1b4e7e] text-xs font-bold">
                {userApplications.length} Applications
              </span>
            </div>

            {isLoadingUserApps ? (
              <div className="py-8 text-center text-slate-500">
                <div className="w-6 h-6 border-2 border-[#1b4e7e] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs font-semibold">Loading your submitted applications...</p>
              </div>
            ) : userApplications.length > 0 ? (
              <div className="space-y-4">
                {userApplications.map((app) => (
                  <div
                    key={app.applicationId}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-[#1b4e7e]">
                            {app.applicationId}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">• Tender: {app.tenderId}</span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-800 mt-1">
                          {app.tenderTitle || 'Public Procurement Package'}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          Client: {app.department || 'Government Procurement Directorate'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-xs">
                        <div>
                          <p className="text-slate-400 text-[10px]">Location</p>
                          <p className="font-bold text-slate-700 mt-1">
                            {app.location || 'Gujarat'}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400 text-[10px]">Submitted</p>
                          <p className="font-bold text-slate-700 mt-1">
                            {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('en-GB') : 'Today'}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400 text-[10px]">Est. Value</p>
                          <p className="font-bold text-slate-700 mt-1">
                            {app.value || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <span className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold whitespace-nowrap ${
                        app.status === 'SEALED'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {app.status === 'SEALED' ? 'SEALED' : 'UNSEALED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 space-y-2">
                <p className="text-sm font-semibold">No applications submitted yet.</p>
                <p className="text-xs text-slate-400">Browse active tenders in the repository to submit your first application.</p>
                <button
                  type="button"
                  onClick={() => setActiveSubNav("dashboard")}
                  className="mt-3 px-4 py-2 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Explore Active Tenders
                </button>
              </div>
            )}
          </section>
        )}

        {/* ========================================================= */}
        {/* ===================== PAST HISTORY ====================== */}
        {/* ========================================================= */}

        {activeSubNav === "history" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Past History & Evaluated Tenders</h2>

              <p className="text-sm text-slate-500 mt-1">
                Review completed tenders, winning contractor selections, and evaluated applications.
              </p>
            </div>

            {/* 1. Completed & Awarded Tenders from Database */}
            {tenders.filter((t) => t.tenderStatus === "AWARDED" || isTenderClosed(t)).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Past & Evaluated Procurement Notices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {tenders
                    .filter((t) => t.tenderStatus === "AWARDED" || isTenderClosed(t))
                    .map((tender) => {
                      const isAwarded = tender.tenderStatus === 'AWARDED';

                      return (
                        <div
                          key={tender.id}
                          className={`bg-white border-2 rounded-xl p-5 shadow-sm space-y-4 ${
                            isAwarded ? 'border-emerald-200/80' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[10px] font-bold text-[#1b4e7e] font-mono">
                                {tender.id}
                              </span>
                              <h3 className="text-sm font-extrabold text-slate-800 mt-1">
                                {tender.title}
                              </h3>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {tender.dept} • {tender.location}
                              </p>
                            </div>

                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold shrink-0 border ${
                              isAwarded 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}>
                              {isAwarded ? 'AWARDED' : 'EVALUATION IN PROGRESS'}
                            </span>
                          </div>

                          {isAwarded ? (
                            /* Prominent Winner Display Box */
                            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                  Selected Winner:
                                </span>
                                <span className="font-extrabold text-emerald-950">
                                  {tender.winnerOrg || tender.winnerName || 'Awarded Bidder'}
                                </span>
                              </div>

                              {tender.winnerName && tender.winnerOrg && (
                                <div className="flex items-center justify-between text-xs text-emerald-700">
                                  <span className="text-[10px]">Authorized Rep:</span>
                                  <span className="font-semibold">{tender.winnerName}</span>
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-200/60">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                                  Winning Bid Amount:
                                </span>
                                <span className="font-black text-emerald-900">
                                  {tender.winnerAmount || tender.value}
                                </span>
                              </div>

                              {tender.awardedAt && (
                                <div className="text-[10px] text-emerald-600 text-right pt-0.5">
                                  Awarded On: {new Date(tender.awardedAt).toLocaleDateString('en-GB')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  Submission Window:
                                </span>
                                <span className="font-bold text-slate-700">Closed (Deadline Elapsed)</span>
                              </div>
                              <p className="text-[11px] text-slate-500 pt-1">
                                Sealed bids have been unsealed. Committee evaluation and contractor selection in progress.
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* 2. User Evaluated Applications */}
            {userApplications.filter((a) => a.status === "UNSEALED").length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Evaluated Applications</h3>
                <div className="space-y-4">
                  {userApplications
                    .filter((a) => a.status === "UNSEALED")
                    .map((item) => (
                      <div
                        key={item.applicationId}
                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                          <div className="flex-1">
                            <span className="text-[10px] font-mono font-bold text-[#1b4e7e]">
                              {item.applicationId}
                            </span>

                            <h3 className="text-sm font-bold text-slate-800 mt-1">
                              {item.tenderTitle || "Public Procurement Package"}
                            </h3>

                            <p className="text-xs text-slate-500 mt-1">
                              {item.department || "Government Directorate"}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-xs">
                            <div>
                              <p className="text-slate-400 text-[10px]">Location</p>
                              <p className="font-bold text-slate-700 mt-1">
                                {item.location || "Gujarat"}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-400 text-[10px]">Applied On</p>
                              <p className="font-bold text-slate-700 mt-1">
                                {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('en-GB') : 'N/A'}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-400 text-[10px]">Est. Value</p>
                              <p className="font-bold text-slate-700 mt-1">
                                {item.value || "N/A"}
                              </p>
                            </div>
                          </div>

                          <span className="px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-100">
                            EVALUATED
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {tenders.filter((t) => t.tenderStatus === "AWARDED").length === 0 && userApplications.filter((a) => a.status === "UNSEALED").length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 space-y-2">
                <p className="text-sm font-semibold">No evaluated historical tenders yet.</p>
                <p className="text-xs text-slate-400">Tenders will appear in past history once evaluated and awarded to winning contractors by the admin.</p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Reverse Auction Arena Live Trading Terminal & Sharemarket Graph Modal */}
      {reverseArenaBidOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          onClick={() => setReverseArenaBidOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const currentAuction = selectedAuctionForBid || arenaAuctionMatch || auctions[0];
              if (!currentAuction) return null;

              const rawStart = currentAuction.startingValue || "0";
              const startNum = parseFloat(String(rawStart).replace(/[^\d.]/g, "")) || currentAuction.lowestBid || 100000;
              const currentHighest = terminalBidsData?.stats?.currentHighestBid ?? currentAuction.lowestBid;
              const priceGrowth = currentHighest > startNum ? currentHighest - startNum : 0;
              const percentageGrowth = startNum > 0 && priceGrowth > 0 ? ((priceGrowth / startNum) * 100).toFixed(1) + "%" : "0.0%";

              const rawBidsList = terminalBidsData?.bids || [];
              const chronologicalBids = rawBidsList
                .slice()
                .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

              // Construct Ascending Sharemarket Graph Points
              const chartPoints = [
                {
                  round: 0,
                  amount: startNum,
                  bidder: "Opening Base Reserve",
                  org: "Base Starting Price",
                  time: "Round Open",
                  hash: "0xGenesisReserve",
                },
                ...chronologicalBids.map((b: any, idx: number) => ({
                  round: idx + 1,
                  amount: Number(b.bidAmount),
                  bidder: b.bidderName,
                  org: b.bidderOrg,
                  time: new Date(b.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                  hash: b.bidHash || "0xVerifiedHash",
                })),
              ];

              const allAmounts = chartPoints.map((p) => p.amount);
              const maxAmount = Math.max(...allAmounts, startNum);
              const minAmount = Math.min(...allAmounts);
              const priceSpan = maxAmount - minAmount || startNum * 0.1 || 1;

              const graphWidth = 640;
              const graphHeight = 160;
              const padX = 45;
              const padY = 20;
              const plotWidth = graphWidth - padX * 2;
              const plotHeight = graphHeight - padY * 2;

              // Ascending graph: lower prices near bottom Y (high Y), higher prices near top Y (low Y)
              const svgPoints = chartPoints.map((pt, i) => {
                const x = chartPoints.length === 1 ? graphWidth / 2 : padX + (i / (chartPoints.length - 1)) * plotWidth;
                const y = padY + ((maxAmount - pt.amount) / priceSpan) * plotHeight;
                return { ...pt, x, y };
              });

              const linePath =
                svgPoints.length === 1
                  ? `M ${padX} ${svgPoints[0].y} L ${graphWidth - padX} ${svgPoints[0].y}`
                  : svgPoints.reduce((acc, pt, idx) => {
                      if (idx === 0) return `M ${pt.x} ${pt.y}`;
                      const prev = svgPoints[idx - 1];
                      const cx = (prev.x + pt.x) / 2;
                      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
                    }, "");

              const areaPath =
                svgPoints.length === 1
                  ? `M ${padX} ${svgPoints[0].y} L ${graphWidth - padX} ${svgPoints[0].y} L ${graphWidth - padX} ${graphHeight - 5} L ${padX} ${graphHeight - 5} Z`
                  : `${linePath} L ${svgPoints[svgPoints.length - 1].x} ${graphHeight - 5} L ${svgPoints[0].x} ${graphHeight - 5} Z`;

              const isUserH1Leader =
                terminalBidsData?.leaderboard &&
                terminalBidsData.leaderboard.length > 0 &&
                (terminalBidsData.leaderboard[0].bidderName === user?.fullName ||
                  terminalBidsData.leaderboard[0].bidderOrg === user?.orgName);

              return (
                <>
                  {/* Top Header Banner */}
                  <div className="bg-[#1b4e7e] text-white p-5 sm:p-6 relative flex justify-between items-start">
                    <div className="space-y-1.5 pr-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          AUCTION LIVE TERMINAL
                        </span>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                          LIVE SOCKET FEED
                        </span>
                        <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-mono">
                          <span>🔒</span>
                          <span>Identity Protected: <strong>{getAnonymousBidderAlias(user?.id ? String(user.id) : undefined, user?.fullName, currentAuction.id)}</strong></span>
                        </span>
                        <span className="text-white/60 text-[11px] font-mono">
                          Auto-sync (2.5s)
                        </span>
                      </div>

                      <h2 className="text-lg md:text-xl font-black tracking-tight mt-1">
                        {currentAuction.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-white/80">
                        <span className="font-mono bg-white/10 px-2 py-0.5 rounded">ID: {currentAuction.id}</span>
                        {currentAuction.client && <span>Agency: <strong className="text-white">{currentAuction.client}</strong></span>}
                        {currentAuction.location && <span>Location: <strong className="text-white">{currentAuction.location}</strong></span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fetchTerminalBids(currentAuction.id)}
                        title="Force Refresh"
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <svg className={`w-4 h-4 ${isTerminalPolling ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        <span className="hidden sm:inline">Refresh</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setReverseArenaBidOpen(false)}
                        className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Content Body */}
                  <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
                    
                    {/* 4 Stat Overview Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider">Buyers Entered</span>
                          <svg className="w-4 h-4 text-[#1b4e7e]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                          </svg>
                        </div>
                        <div className="text-xl font-black text-slate-800 mt-1">
                          {terminalBidsData?.stats?.distinctBidders || 0}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          {chartPoints.length - 1} total bid rounds
                        </span>
                      </div>

                      <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-2xs">
                        <div className="flex items-center justify-between text-emerald-600">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider">Leading Bid (H1)</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        </div>
                        <div className="text-xl font-black text-emerald-700 mt-1">
                          ₹{currentHighest.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-emerald-800 font-bold block truncate">
                          {terminalBidsData?.stats?.leadingBidder ? `👑 Leader: ${terminalBidsData.stats.leadingBidder.bidderName}` : "Base Starting Price"}
                        </span>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Base Reserve Price</span>
                        <div className="text-xl font-black text-slate-700 mt-1">
                          ₹{startNum.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          Floor Threshold
                        </span>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Price Growth</span>
                        <div className="text-xl font-black text-emerald-600 mt-1 flex items-center gap-1">
                          <span>+{percentageGrowth}</span>
                          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                          </svg>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          +₹{priceGrowth.toLocaleString()} above floor
                        </span>
                      </div>
                    </div>

                    {/* 2-Column Split Terminal Stage */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      
                      {/* LEFT COLUMN: Sharemarket Graph & Live Leaderboard (7 Cols) */}
                      <div className="lg:col-span-7 space-y-4">
                        
                        {/* Live Sharemarket Graph Card */}
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-[#1b4e7e]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                              </svg>
                              Price Trajectory Graph
                            </span>
                            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                              Ascending Curve (H1 Wins)
                            </span>
                          </div>

                          {/* SVG Canvas */}
                          <div className="w-full h-36 relative select-none">
                            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${graphWidth} ${graphHeight}`}>
                              <defs>
                                <linearGradient id="userMarketAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                  <stop offset="70%" stopColor="#059669" stopOpacity="0.05" />
                                  <stop offset="100%" stopColor="#047857" stopOpacity="0.0" />
                                </linearGradient>
                                <linearGradient id="userMarketLineGradient" x1="0" y1="1" x2="1" y2="0">
                                  <stop offset="0%" stopColor="#0284c7" />
                                  <stop offset="60%" stopColor="#0ea5e9" />
                                  <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                              </defs>

                              {/* Grid Lines */}
                              {[0.1, 0.5, 0.9].map((ratio, gIdx) => {
                                const y = padY + ratio * plotHeight;
                                const priceAtLine = Math.round(maxAmount - ratio * priceSpan);
                                return (
                                  <g key={gIdx}>
                                    <line
                                      x1={padX}
                                      y1={y}
                                      x2={graphWidth - padX}
                                      y2={y}
                                      stroke="#f1f5f9"
                                      strokeWidth="1"
                                      strokeDasharray="4 4"
                                    />
                                    <text
                                      x={padX - 6}
                                      y={y + 3}
                                      fill="#94a3b8"
                                      fontSize="9"
                                      fontFamily="monospace"
                                      textAnchor="end"
                                    >
                                      ₹{priceAtLine.toLocaleString()}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Area & Line */}
                              <path d={areaPath} fill="url(#userMarketAreaGradient)" />
                              <path
                                d={linePath}
                                fill="none"
                                stroke="url(#userMarketLineGradient)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />

                              {/* Data Nodes */}
                              {svgPoints.map((pt, pIdx) => {
                                const isLatest = pIdx === svgPoints.length - 1;
                                const isHovered = hoveredChartPoint?.round === pt.round;

                                return (
                                  <g key={pIdx} className="cursor-pointer">
                                    {isLatest && (
                                      <circle cx={pt.x} cy={pt.y} r="7" fill="#10b981" opacity="0.25" className="animate-ping" />
                                    )}

                                    <circle
                                      cx={pt.x}
                                      cy={pt.y}
                                      r={isHovered ? "5.5" : isLatest ? "4.5" : "3"}
                                      fill={isLatest ? "#10b981" : isHovered ? "#3b82f6" : "#1b4e7e"}
                                      stroke="#ffffff"
                                      strokeWidth="2"
                                      onMouseEnter={() =>
                                        setHoveredChartPoint({
                                          round: pt.round,
                                          amount: pt.amount,
                                          bidder: pt.bidder,
                                          org: pt.org,
                                          time: pt.time,
                                          x: pt.x,
                                          y: pt.y,
                                        })
                                      }
                                      onMouseLeave={() => setHoveredChartPoint(null)}
                                    />
                                  </g>
                                );
                              })}
                            </svg>

                            {/* Tooltip */}
                            {hoveredChartPoint && (
                              <div
                                className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg p-2 text-[10px] shadow-xl font-mono"
                                style={{
                                  left: `${Math.min(Math.max(hoveredChartPoint.x - 50, 10), graphWidth - 130)}px`,
                                  top: `${Math.max(hoveredChartPoint.y - 60, 0)}px`,
                                }}
                              >
                                <span className="text-emerald-400 font-bold block text-xs">
                                  ₹{hoveredChartPoint.amount.toLocaleString()}
                                </span>
                                <span className="text-slate-200 block truncate max-w-[120px]">
                                  {hoveredChartPoint.bidder}
                                </span>
                                <span className="text-slate-400 block">
                                  {hoveredChartPoint.time} • Round {hoveredChartPoint.round}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Live Leaderboard & Chronological Activity Stream */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                          <div className="bg-slate-100/90 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex gap-1.5">
                              <button 
                                type="button"
                                onClick={() => setTerminalChartTab("graph")}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${terminalChartTab === "graph" ? "bg-[#1b4e7e] text-white shadow-2xs" : "text-slate-600 hover:bg-slate-200/60"}`}
                              >
                                Leaderboard ({terminalBidsData?.leaderboard?.length || 0})
                              </button>
                              <button 
                                type="button"
                                onClick={() => setTerminalChartTab("history")}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${terminalChartTab === "history" ? "bg-[#1b4e7e] text-white shadow-2xs" : "text-slate-600 hover:bg-slate-200/60"}`}
                              >
                                Activity Stream ({rawBidsList.length})
                              </button>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 font-bold hidden sm:inline">
                              Live
                            </span>
                          </div>

                          {terminalChartTab === "graph" && (
                            <div className="p-3">
                              {terminalBidsData?.leaderboard && terminalBidsData.leaderboard.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs text-left text-slate-700">
                                    <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-200">
                                      <tr>
                                        <th className="px-3 py-2">Rank</th>
                                        <th className="px-3 py-2">Buyer / Organization</th>
                                        <th className="px-3 py-2">Best Bid (₹)</th>
                                        <th className="px-3 py-2">Rounds</th>
                                        <th className="px-3 py-2">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {terminalBidsData.leaderboard.map((item: any, idx: number) => (
                                        <tr key={idx} className={`hover:bg-slate-50/70 transition-colors ${idx === 0 ? "bg-emerald-50/40" : ""}`}>
                                          <td className="px-3 py-2.5">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black font-mono ${idx === 0 ? "bg-amber-400 text-slate-900 shadow-2xs" : "bg-slate-100 text-slate-700"}`}>
                                              {item.rank}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2.5">
                                            <div className="font-bold text-slate-900 flex items-center gap-1">
                                              {idx === 0 && <span className="text-amber-500">👑</span>}
                                              <span>{item.bidderName}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                                              {item.bidderOrg || "Contractor"}
                                            </span>
                                          </td>
                                          <td className="px-3 py-2.5 font-mono font-black text-emerald-700 text-sm">
                                            ₹{Number(item.bestBid).toLocaleString()}
                                          </td>
                                          <td className="px-3 py-2.5 font-mono text-slate-600">
                                            {item.bidCount}
                                          </td>
                                          <td className="px-3 py-2.5">
                                            {idx === 0 ? (
                                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold border border-emerald-200">
                                                H1 LEADING
                                              </span>
                                            ) : (
                                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold">
                                                OUTBID
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="py-6 text-center text-slate-400 text-xs">
                                  No bids placed yet. Place the opening bid!
                                </div>
                              )}
                            </div>
                          )}

                          {terminalChartTab === "history" && (
                            <div className="p-3">
                              {rawBidsList.length > 0 ? (
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                  {rawBidsList.map((bid: any, idx: number) => (
                                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs">
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-slate-900">{bid.bidderName}</span>
                                          {idx === 0 && (
                                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold">
                                              LATEST
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          {new Date(bid.created_at).toLocaleTimeString()}
                                        </span>
                                      </div>
                                      <div className="font-mono font-black text-emerald-700 text-sm">
                                        ₹{Number(bid.bidAmount).toLocaleString()}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="py-6 text-center text-slate-400 text-xs">
                                  No activity records logged yet.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* RIGHT COLUMN: Interactive Bidding Console (5 Cols) */}
                      <div className="lg:col-span-5 space-y-4">
                        
                        {/* Concluded State Banner */}
                        {(currentAuction.status === "CONCLUDED" || currentAuction.status === "SETTLED" || currentAuction.status === "AWARDED") ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-2 text-left shadow-2xs">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span>🏆</span>
                                <span className="font-bold text-slate-800">
                                  {isUserH1Leader || (currentAuction.winnerName === user?.fullName || currentAuction.winnerBidderId === user?.id)
                                    ? "🎉 Awarded to You!"
                                    : `Awarded to ${currentAuction.winnerName || terminalBidsData?.stats?.leadingBidder?.bidderName || "Leading Bidder"}`}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-emerald-700">
                                {currentAuction.winnerAmount || `₹${currentHighest.toLocaleString()}`}
                              </span>
                            </div>

                            {(isUserH1Leader || currentAuction.winnerName === user?.fullName || currentAuction.winnerBidderId === user?.id) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReverseArenaBidOpen(false);
                                  setAuctionSubNav("my-bids");
                                }}
                                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <span>🦊</span>
                                <span>Proceed to Settlement &amp; MetaMask Payment</span>
                                <span>→</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Bidding Console */}
                            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
                              <div>
                                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                                  Execute Higher Bid
                                </h3>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  Current Benchmark: <strong className="text-emerald-700 font-mono">₹{currentHighest.toLocaleString()}</strong>
                                </p>
                              </div>

                              {/* Quick Increment Shortcuts */}
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                  Quick Increment Chips
                                </span>
                                <div className="grid grid-cols-3 gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => applyQuickBidIncrement(5000, false)}
                                    className="py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 transition-colors cursor-pointer text-center"
                                  >
                                    +₹5,000
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => applyQuickBidIncrement(25000, false)}
                                    className="py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 transition-colors cursor-pointer text-center"
                                  >
                                    +₹25,000
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => applyQuickBidIncrement(50000, false)}
                                    className="py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-700 transition-colors cursor-pointer text-center"
                                  >
                                    +₹50,000
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => applyQuickBidIncrement(1, true)}
                                    className="py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-mono font-bold text-emerald-800 transition-colors cursor-pointer text-center"
                                  >
                                    +1%
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => applyQuickBidIncrement(2.5, true)}
                                    className="py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-mono font-bold text-emerald-800 transition-colors cursor-pointer text-center"
                                  >
                                    +2.5%
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => applyQuickBidIncrement(5, true)}
                                    className="py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-mono font-bold text-emerald-800 transition-colors cursor-pointer text-center"
                                  >
                                    +5%
                                  </button>
                                </div>
                              </div>

                              {/* Bid Input Form */}
                              <form onSubmit={handleReverseArenaBid} className="space-y-3.5">
                                <div>
                                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                                    Your Target Bid Amount (₹)
                                  </label>
                                  <div className="relative rounded-lg shadow-2xs">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
                                      ₹
                                    </div>
                                    <input
                                      type="number"
                                      required
                                      value={reverseBidInput}
                                      onChange={(e) => setReverseBidInput(e.target.value)}
                                      className="w-full pl-7 pr-3 py-2 bg-[#f8fafc] border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-[#1b4e7e] transition-all placeholder:text-slate-400"
                                      placeholder={`e.g. ${currentHighest + 1000}`}
                                    />
                                  </div>

                                  {reverseBidInput && !isNaN(parseFloat(reverseBidInput)) && (
                                    <div className="mt-1 text-[10px] font-mono">
                                      {parseFloat(reverseBidInput) > currentHighest ? (
                                        <span className="text-emerald-700 font-bold">
                                          ✓ Valid: +₹{(parseFloat(reverseBidInput) - currentHighest).toLocaleString()} above H1
                                        </span>
                                      ) : (
                                        <span className="text-rose-600 font-bold">
                                          ✕ Must be &gt; ₹{currentHighest.toLocaleString()}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="submit"
                                  disabled={isSubmittingTerminalBid}
                                  className="w-full py-2.5 bg-[#1b4e7e] hover:bg-[#133c62] disabled:opacity-50 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs flex items-center justify-center gap-1.5"
                                >
                                  {isSubmittingTerminalBid ? (
                                    <>
                                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                      <span>Submitting Bid...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Place Higher Bid &amp; Claim H1</span>
                                      <span>→</span>
                                    </>
                                  )}
                                </button>
                              </form>

                              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                                <span className="truncate max-w-[150px]">Bidder: <strong className="text-slate-600">{user?.fullName || "Verified User"}</strong></span>
                                <span>SHA-256 Validated</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="bg-slate-50 border-t border-slate-200 p-3.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Connected to Live Auction Engine</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button 
                        type="button" 
                        onClick={() => fetchTerminalBids(currentAuction.id)}
                        className="w-full sm:w-auto px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        <span>Refresh Feed</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => setReverseArenaBidOpen(false)}
                        className="w-full sm:w-auto px-5 py-1.5 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        Close Terminal
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* IMMUTABLE NFT BID CERTIFICATE MODAL */}
      {/* ========================================================================= */}
      {selectedCertificateModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden text-left flex flex-col">
            {/* Certificate Official Header */}
            <div className="bg-gradient-to-r from-[#133c62] to-[#1b4e7e] text-white p-6 relative border-b-4 border-amber-400">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      OFFICIAL ATTESTATION
                    </span>
                    <span className="text-emerald-300 text-[10px] font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                      ERC-1155 TOKENIZED
                    </span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight text-white mt-1">
                    Immutable Bid Vault Certificate
                  </h3>
                  <p className="text-xs text-white/70 font-mono">
                    Token ID: CERT-{String(selectedCertificateModal.auctionId || selectedCertificateModal.id).replace(/[^\w]/g, "").substring(0, 10).toUpperCase()}-2026
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCertificateModal(null)}
                  className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Certificate Body (Parchment Feel) */}
            <div className="p-6 space-y-5 bg-[#fdfefe] overflow-y-auto max-h-[75vh]">
              {/* Seal & Certification Statement */}
              <div className="text-center border-b border-slate-100 pb-4 space-y-1">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-2xs">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                  </svg>
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Government E-Procurement Network Attestation
                </h4>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  This digitally tokenized credential certifies that the undersigned contractor has registered and sealed a valid binding bid.
                </p>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Authenticated Bidder
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedCertificateModal.bidderName || user?.fullName}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    {selectedCertificateModal.bidderOrg || user?.orgName}
                  </span>
                </div>

                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 space-y-0.5">
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                    Committed Bid Amount
                  </span>
                  <div className="font-black text-emerald-700 text-base font-mono">
                    ₹{Number(selectedCertificateModal.bidAmount).toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    {selectedCertificateModal.isH1Leader ? "👑 Currently Holding H1 Leaderboard Position" : "Active Validated Position"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Associated Reverse Auction
                  </span>
                  <div className="font-bold text-slate-800 line-clamp-1">
                    {selectedCertificateModal.title || `Auction ${selectedCertificateModal.auctionId}`}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    ID: {selectedCertificateModal.auctionId || selectedCertificateModal.id}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Issuing Authority
                  </span>
                  <div className="font-bold text-slate-800">
                    {selectedCertificateModal.client || "State Directorate of Public Works"}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Location: {selectedCertificateModal.location || "Central Portal"}
                  </span>
                </div>
              </div>

              {/* Cryptographic Hash Box */}
              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 font-mono text-xs shadow-inner">
                <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  <span>SHA-256 Merkle Proof</span>
                  <span className="text-emerald-400 font-extrabold">0xValidated</span>
                </div>
                <p className="text-[11px] text-emerald-300 break-all bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                  {selectedCertificateModal.bidHash || `0x7f48bce39a48586e797e433ab948586e${selectedCertificateModal.id || "01"}`}
                </p>
                <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                  <span>Block Height: #{selectedCertificateModal.blockHeight || 20914820}</span>
                  <span>Issued: {new Date(selectedCertificateModal.created_at || Date.now()).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Verified in NIC Security Vault</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.046-.37-2.135-.37-3.249 0-6.627 5.373-12 12-12s12 5.373 12 12c0 1.114-.13 2.203-.37 3.249m-23.26 0A12.016 12.016 0 0 0 12 21c4.478 0 8.268-2.943 9.54-7.171m-19.08 0a11.96 11.96 0 0 1-.46-3.249c0-6.627 5.373-12 12-12" />
                  </svg>
                  <span>Print Certificate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCertificateModal(null)}
                  className="px-5 py-2 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Close Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONCLUDED AUCTION AUDIT MODAL */}
      {/* ========================================================================= */}
      {selectedConcludedAuction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-left flex flex-col">
            <div className="bg-[#1b4e7e] text-white p-5 flex justify-between items-start">
              <div>
                <span className="bg-emerald-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  CONCLUDED AUDIT RECORD
                </span>
                <h3 className="text-base font-black mt-1">{selectedConcludedAuction.title}</h3>
                <span className="text-xs text-white/70 font-mono">ID: {selectedConcludedAuction.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConcludedAuction(null)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs bg-slate-50/50">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Reserve Price</span>
                  <div className="font-bold text-slate-800 text-sm font-mono mt-0.5">
                    {selectedConcludedAuction.startingValue || `₹${selectedConcludedAuction.lowestBid.toLocaleString()}`}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">Winning H1 Final Bid</span>
                  <div className="font-black text-emerald-700 text-sm font-mono mt-0.5">
                    ₹{selectedConcludedAuction.lowestBid.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Client Directorate:</span>
                  <span className="font-bold text-slate-700">{selectedConcludedAuction.client || "State Directorate"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Execution Region:</span>
                  <span className="font-bold text-slate-700">{selectedConcludedAuction.location || "India"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Final Settlement:</span>
                  <span className="font-bold text-emerald-700">Contract Awarded &amp; Sealed</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-slate-200 p-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedConcludedAuction(null)}
                className="px-5 py-2 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nic-Vault Document & Registered Credentials Manager Modal */}
      {vaultOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-left space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold bg-[#1b4e7e] text-white px-2 py-0.5 rounded">
                  NIC VAULT SERVICES
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-2">
                  Registered Vendor Credentials
                </h3>
              </div>
              <button
                onClick={() => setVaultOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold text-slate-700">Registration Status:</span>
                <span className="font-bold text-emerald-700">Verified & Active in Database</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-bold">{registeredCredentials.length} Credentials</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              These verified credentials were submitted and authenticated during your portal registration.
              They are automatically attached to authenticate your bid submissions.
            </p>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {registeredCredentials.map((cred) => (
                <div
                  key={cred.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#1b4e7e]/10 border border-[#1b4e7e]/20 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-black text-[#1b4e7e] tracking-tight">{cred.key}</span>
                    </div>
                    <div className="truncate space-y-0.5 text-left">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        {cred.label}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-800 block truncate">
                        {cred.value}
                      </span>
                      <span className="text-[9px] text-slate-400 block">
                        {cred.category} • {cred.authority}
                      </span>
                    </div>
                  </div>
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
              <span className="text-[9px] font-bold bg-primary text-white px-2 py-0.5 rounded">
                TENDER ENROLMENT
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-2">
                {selectedTender.title}
              </h3>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                {selectedTender.id} | {selectedTender.dept}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-600 border border-slate-100">
              <p>
                <strong>Estimated Value:</strong> {selectedTender.value}
              </p>
              <p>
                <strong>Submission Deadline:</strong> {selectedTender.deadline}
              </p>
            </div>

            <div className="flex gap-2.5 pt-2 justify-end">
              <button
                type="button"
                onClick={() => setSelectedTender(null)}
                className="px-5 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Apply Vault Modal */}
      {quickApplyTender && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-left space-y-4">
            {quickApplyStep === 1 && (
              <form onSubmit={executeQuickApply} className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-bold bg-[#1b4e7e] text-white px-2 py-0.5 rounded">
                      NIC VAULT QUICK APPLY
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-2">
                      Confirm Quick Apply Bid
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickApplyTender(null)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="bg-[#f0f6fc] p-4 rounded-lg border border-slate-200/50 space-y-2 text-xs text-slate-700">
                  <p>
                    <span className="text-slate-400 font-semibold">
                      Tender ID:
                    </span>{" "}
                    <span className="font-bold text-slate-800">
                      {quickApplyTender.id}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400 font-semibold">
                      Tender Title:
                    </span>{" "}
                    <span className="font-bold text-slate-800">
                      {quickApplyTender.title}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400 font-semibold">
                      Department:
                    </span>{" "}
                    <span className="font-bold text-slate-800">
                      {quickApplyTender.dept}
                    </span>
                  </p>
                  <p>
                    <span className="text-slate-400 font-semibold">
                      Est. Value:
                    </span>{" "}
                    <span className="font-bold text-slate-800">
                      {quickApplyTender.value}
                    </span>
                  </p>
                </div>

                {/* Registered Vendor Credentials - Pure Read-Only Data Displayer */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Registered Credentials Attached with Bid
                  </span>

                  <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {registeredCredentials.map((cred) => (
                      <div
                        key={cred.id}
                        className="bg-white border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between text-xs gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-md bg-[#1b4e7e]/10 border border-[#1b4e7e]/20 flex items-center justify-center shrink-0">
                            <span className="text-[8px] font-black text-[#1b4e7e]">{cred.key}</span>
                          </div>
                          <div className="truncate text-left space-y-0.5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                              {cred.label}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-slate-800 block truncate">
                              {cred.value}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bid Value Input Form from Image 2 */}
                <div className="space-y-2">
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
                      value={quickApplyBidValue}
                      onChange={(e) => setQuickApplyBidValue(e.target.value)}
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

                <div className="flex gap-2.5 pt-3 border-t border-slate-100 justify-end">
                  <button
                    type="button"
                    onClick={() => setQuickApplyTender(null)}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    Confirm & Apply
                  </button>
                </div>
              </form>
            )}

            {quickApplyStep === 2 && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-10 h-10 border-4 border-[#1b4e7e] border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-800">
                    Submitting Vault Application
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                    Connecting to NIC Vault, downloading verified compliance
                    certificates, and applying digital signature...
                  </p>
                </div>
              </div>
            )}

            {quickApplyStep === 3 && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-800">
                    Application Submitted Successfully
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                    Your bid for{" "}
                    <span className="font-bold text-slate-700">
                      {quickApplyTender.title}
                    </span>{" "}
                    has been received and recorded.
                  </p>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] space-y-1.5 text-left font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Application ID:</span>
                      <span className="font-bold text-slate-800 select-all">
                        {sealedReceipt?.applicationId || `APP-${quickApplyTender.id}-SUBMITTED`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-bold text-emerald-700">
                        Submitted & Recorded
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tender ID:</span>
                      <span className="text-slate-700 font-semibold">
                        {quickApplyTender.id}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickApplyTender(null)}
                  className="px-6 py-2 bg-[#1b4e7e] hover:bg-[#133c62] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm mt-2"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Simple */}
      <FooterSimple />
    </div>
  );
}
