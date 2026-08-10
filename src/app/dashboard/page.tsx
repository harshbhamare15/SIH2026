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
  match: "High Match" | "Medium Match";
  status: "active" | "submitted";
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
  lowestBid: number;
  type: "arena" | "sub";
  timeLeft: string;
  status: "active" | "placed";
  myBid?: number;
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
    | "upcoming"
  >("dashboard");

  const [auctionSubNav, setAuctionSubNav] = useState<
    "live" | "my-bids" | "categories" | "history" | "ledger"
  >("live");

  // Sidebar interactive states
  const [filterSubmittedOnly, setFilterSubmittedOnly] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [reverseArenaBidOpen, setReverseArenaBidOpen] = useState(false);
  const [reverseBidInput, setReverseBidInput] = useState("");
  const [sortByNearest, setSortByNearest] = useState(true);

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

  const liveTenderData = [
    {
      id: "LT/2026/00124",
      title: "National Highway Expansion - Package 7",
      department: "National Highways Authority",
      category: "Infrastructure",
      location: "Maharashtra",
      value: "₹550 Crores",
      deadline: "22 Oct 2026",
      status: "Live",
      match: "High Match",
    },
    {
      id: "LT/2026/00125",
      title: "Supply of High-Resolution Medical Monitors",
      department: "AIIMS New Delhi",
      category: "Medical Equipment",
      location: "Delhi",
      value: "₹12.30 Crores",
      deadline: "03 Sep 2026",
      status: "Live",
      match: "High Match",
    },
    {
      id: "LT/2026/00126",
      title: "IT Infrastructure Servers & Network Upgrade",
      department: "National Informatics Centre",
      category: "Information Technology",
      location: "Karnataka",
      value: "₹5.80 Crores",
      deadline: "18 Aug 2026",
      status: "Live",
      match: "Medium Match",
    },
    {
      id: "LT/2026/00127",
      title: "Rooftop Solar Power Plant Commission",
      department: "IIT Delhi Engineering Wing",
      category: "Renewable Energy",
      location: "Delhi",
      value: "₹2.10 Crores",
      deadline: "30 Aug 2026",
      status: "Live",
      match: "High Match",
    },
  ];

  const findTenderData = [
    {
      id: "FT/2026/00401",
      title: "Construction of Government Residential Complex",
      department: "Public Works Department",
      category: "Construction",
      location: "Pune, Maharashtra",
      value: "₹85 Crores",
      deadline: "15 Sep 2026",
    },
    {
      id: "FT/2026/00402",
      title: "Cloud Infrastructure & Data Center Services",
      department: "Ministry of Electronics",
      category: "IT Services",
      location: "Bengaluru, Karnataka",
      value: "₹24 Crores",
      deadline: "28 Sep 2026",
    },
    {
      id: "FT/2026/00403",
      title: "Supply of Hospital Furniture",
      department: "Health Department",
      category: "Healthcare",
      location: "Mumbai, Maharashtra",
      value: "₹7.5 Crores",
      deadline: "10 Sep 2026",
    },
    {
      id: "FT/2026/00404",
      title: "Solar Street Lighting Project",
      department: "Energy Department",
      category: "Renewable Energy",
      location: "Ahmedabad, Gujarat",
      value: "₹18 Crores",
      deadline: "05 Oct 2026",
    },
  ];

  const categoryData = [
    {
      name: "Infrastructure",
      count: 24,
      description: "Roads, highways, bridges and infrastructure projects",
    },
    {
      name: "Information Technology",
      count: 18,
      description: "Software, hardware, networking and IT services",
    },
    {
      name: "Healthcare",
      count: 15,
      description: "Medical equipment, hospitals and healthcare supplies",
    },
    {
      name: "Construction",
      count: 21,
      description: "Buildings, civil works and construction projects",
    },
    {
      name: "Renewable Energy",
      count: 12,
      description: "Solar, wind and clean energy projects",
    },
    {
      name: "Transportation",
      count: 9,
      description: "Transport, logistics and vehicle related tenders",
    },
  ];

  const appliedTenderData = [
    {
      id: "AT/2026/00101",
      title: "Medical Equipment Supply - Phase II",
      department: "AIIMS New Delhi",
      category: "Medical Equipment",
      submittedOn: "02 Aug 2026",
      bidAmount: "₹11.85 Crores",
      status: "Under Evaluation",
    },
    {
      id: "AT/2026/00102",
      title: "IT Infrastructure Upgrade",
      department: "National Informatics Centre",
      category: "Information Technology",
      submittedOn: "30 Jul 2026",
      bidAmount: "₹5.45 Crores",
      status: "Technical Evaluation",
    },
    {
      id: "AT/2026/00103",
      title: "Solar Power Plant Installation",
      department: "Energy Department",
      category: "Renewable Energy",
      submittedOn: "25 Jul 2026",
      bidAmount: "₹1.95 Crores",
      status: "Under Evaluation",
    },
  ];

  const pastHistoryData = [
    {
      id: "PH/2026/00041",
      title: "Government Office Furniture Supply",
      department: "General Administration",
      category: "Furniture",
      appliedOn: "12 Jun 2026",
      bidAmount: "₹2.40 Crores",
      result: "Not Selected",
    },
    {
      id: "PH/2026/00042",
      title: "Road Maintenance Package - 4",
      department: "PWD Maharashtra",
      category: "Infrastructure",
      appliedOn: "05 Jun 2026",
      bidAmount: "₹8.20 Crores",
      result: "Awarded",
    },
    {
      id: "PH/2026/00043",
      title: "Computer Hardware Procurement",
      department: "Government IT Department",
      category: "Information Technology",
      appliedOn: "20 May 2026",
      bidAmount: "₹1.15 Crores",
      result: "Not Selected",
    },
  ];

  const upcomingTenderData = [
    {
      id: "UP/2026/00301",
      title: "Mumbai Metro Electrical Infrastructure",
      department: "Metro Rail Corporation",
      category: "Infrastructure",
      location: "Mumbai",
      openingDate: "18 Aug 2026",
      value: "₹120 Crores",
    },
    {
      id: "UP/2026/00302",
      title: "AI-Based Hospital Management System",
      department: "Health Department",
      category: "Information Technology",
      location: "Gujarat",
      openingDate: "22 Aug 2026",
      value: "₹16 Crores",
    },
    {
      id: "UP/2026/00303",
      title: "Solar Rooftop Installation - Phase III",
      department: "Renewable Energy Corporation",
      category: "Renewable Energy",
      location: "Rajasthan",
      openingDate: "27 Aug 2026",
      value: "₹42 Crores",
    },
  ];

  // Dynamic states for Tenders loaded from MySQL database
  const [tenders, setTenders] = useState<TenderItem[]>([]);

  // Mock state for Arena Auctions (supporting functional search filtering)
  const [auctions, setAuctions] = useState<ArenaAuctionItem[]>([
    {
      id: "OSD/7734",
      title: "Office Stationery Supply",
      lowestBid: 12500,
      type: "arena",
      timeLeft: "03:45",
      status: "active",
    },
    {
      id: "RA-9012",
      title: "Heavy Machinery",
      lowestBid: 90012,
      type: "sub",
      timeLeft: "03 | 04:00 | 05",
      status: "active",
    },
    {
      id: "RA-8855",
      title: "Steel Beam Procurement",
      lowestBid: 34950,
      type: "sub",
      timeLeft: "08 | 05:24 | 05",
      status: "active",
    },
  ]);

  const liveAuctionData = [
    {
      id: "AUC/REV/2026/00412",
      title: "Live Reverse Auction for Supply of 500 Enterprise Laptops",
      tenderRef: "MeitY/IT/2026/8912",
      type: "Reverse Procurement (L1 Price Drops)",
      lowestBid: "₹2,15,00,000",
      bidder: "Bidder #804",
      rank: "Rank 2 (L2)",
      decrement: "₹50,000",
      time: "00:03:45",
      settlement: "ERC-721 Work Order NFT",
      settlementInfo: "Minted to L1 Winner on Close",
      mode: "Reverse",
    },
    {
      id: "AUC/FWD/2026/00189",
      title: "Commercial Land Lease Rights & Scrap Equipment Auction",
      issuingBody: "Industrial Development Corporation",
      type: "Forward Asset Sale (H1 Price Rises)",
      nftBadge: "ERC-721 Property Deed NFT #8901",
      nftInfo: "IPFS Verified Title & Lease Metadata",
      basePrice: "₹1.50 Crores",
      highestBid: "₹2.10 Crores",
      bidder: "Bidder #109",
      increment: "₹1,000",
      time: "01 Hours 12 Minutes",
      mode: "Forward",
    },
  ];

  const myAuctionBids = [
    {
      id: "AUC/REV/2026/00388",
      title: "Live Reverse Auction for Highway Paving Contract",
      price: "₹11,40,00,000",
      status: "OUTBID — ACTION REQUIRED",
      rank: "Your Rank: L2",
      escrow: "10.0 Test-ETH Locked in Smart Contract Escrow",
      hash: "0x4f8c21a990e72...",
      settlement: "Work Order NFT #2026-NHAI",
      type: "active",
    },
    {
      id: "AUC/REV/2026/00412",
      title: "Supply of 500 Enterprise Laptops",
      price: "₹2,15,00,000",
      status: "AUCTION WON",
      rank: "L1 Winner",
      escrow: "Settlement Ready",
      hash: "0x91a73bc2219f...",
      settlement: "Tender Contract NFT",
      type: "won",
    },
  ];

  const auctionCategories = [
    {
      title: "Reverse Procurement Auctions (e-RA)",
      count: "180 Active Rounds",
      description: "Settlement with milestone-based procurement contracts.",
      settlement: "ERC-721 Work Order NFTs",
      icon: "↘",
    },
    {
      title: "Government Land, Real Estate & Mining Rights",
      count: "42 Active Rounds",
      description: "Legal lease deeds with geo-mapped metadata.",
      settlement: "ERC-721 Property Deed NFTs",
      icon: "⌂",
    },
    {
      title: "Surplus Industrial Machinery & Heavy Equipment",
      count: "95 Active Rounds",
      description: "Digital ownership receipts and machinery history.",
      settlement: "ERC-721 Asset Title NFTs",
      icon: "⚙",
    },
    {
      title: "Vehicles & Transport Fleet Liquidation",
      count: "60 Active Rounds",
      description: "Vehicle identification and digital registration.",
      settlement: "ERC-721 Fleet Ownership NFTs",
      icon: "▣",
    },
  ];

  const auctionHistory = [
    {
      id: "AUC/REV/2025/00912",
      title: "Reverse Auction for Medical ICU Monitor Supply",
      status: "CLOSED — CONTRACT AWARDED (L1)",
      winner: "Precision Health Tech Ltd (Bidder #402)",
      price: "₹11.80 Crores",
      saving: "Base Price: ₹12.30 Cr — Saved ₹50 Lakhs",
      hash: "0x7b11a288c001...",
      contract: "0x3a291f...89f",
      type: "Reverse Auction — Work Order NFT",
    },
    {
      id: "AUC/FWD/2025/00411",
      title: "Commercial Plot Lease Allotment (Plot 44, GIDC)",
      status: "CLOSED — ASSET TRANSFERRED (H1)",
      winner: "Apex Logistics Corp (Bidder #103)",
      price: "₹3.45 Crores",
      saving: "Final Winning Price (H1)",
      hash: "ERC-721 Property NFT #8901",
      contract: "Transferred to 0x103...91a",
      type: "Forward Auction — Property Deed NFT",
    },
  ];

  // Count active bids
  const activeBidsCount = tenders.filter(
    (t) => t.status === "submitted",
  ).length;

  // Reverse Arena Timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev > 0 ? prev - 1 : 225));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Tenders & Auctions Normalization to prevent type errors across Admin/User schemas
  const normalizeTenders = (raw: any[]): TenderItem[] => {
    return raw.map((item) => ({
      id: item.id,
      title: item.title,
      dept: item.dept || item.client || "",
      location: item.location || "",
      value: item.value || "",
      deadline: item.deadline || item.closingDate || "",
      match: item.match || item.matchType || "High Match",
      status: item.status || "active",
      myBid: item.myBid || undefined,
    }));
  };

  const normalizeAuctions = (raw: any[]): ArenaAuctionItem[] => {
    return raw.map((item) => {
      let parsedLowest = 12500;
      if (typeof item.lowestBid === "number") {
        parsedLowest = item.lowestBid;
      } else if (item.startingValue) {
        const numStr = item.startingValue.replace(/[^\d]/g, "");
        parsedLowest = parseInt(numStr, 10) || 12500;
      }
      return {
        id: item.id,
        title: item.title,
        lowestBid: parsedLowest,
        type: item.type || "arena",
        timeLeft: item.timeLeft || item.duration || "03:45",
        status: item.status === "Live" ? "active" : item.status || "active",
        myBid: item.myBid || undefined,
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

      const savedAuctions = localStorage.getItem("user-auctions");
      if (savedAuctions) {
        try {
          setAuctions(normalizeAuctions(JSON.parse(savedAuctions)));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("logged-in-user");
    alert("Logged out successfully.");
    router.push("/");
  };

  const handleTenderBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender || !bidValue) return;

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
    alert(
      `Bid of ${bidValue} Crores submitted successfully for Tender ${selectedTender.id}!`,
    );
    setSelectedTender(null);
    setBidValue("");
  };

  // Quick Apply Modal States
  const [quickApplyTender, setQuickApplyTender] = useState<TenderItem | null>(
    null,
  );
  const [quickApplyStep, setQuickApplyStep] = useState(1); // 1: Review, 2: Loading, 3: Success
  const [quickApplyBidValue, setQuickApplyBidValue] = useState("");

  const handleQuickApply = (item: TenderItem) => {
    setQuickApplyTender(item);
    setQuickApplyStep(1);
    setQuickApplyBidValue("");
  };

  const executeQuickApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickApplyTender || !quickApplyBidValue) return;
    setQuickApplyStep(2); // Set loading view

    setTimeout(() => {
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
      setQuickApplyStep(3); // Set success view
    }, 1800);
  };

  const handleReverseArenaBid = (e: React.FormEvent) => {
    e.preventDefault();
    const bidVal = parseFloat(reverseBidInput);
    if (isNaN(bidVal)) return;

    const currentLowest =
      auctions.find((a) => a.id === "OSD/7734")?.lowestBid || 12500;

    if (bidVal >= currentLowest) {
      alert(
        `In a reverse auction, your bid must be LOWER than the current lowest bid of ₹${currentLowest.toLocaleString()}`,
      );
      return;
    }

    const updated = auctions.map((a) =>
      a.id === "OSD/7734"
        ? { ...a, lowestBid: bidVal, status: "placed" as const, myBid: bidVal }
        : a,
    );
    setAuctions(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("user-auctions", JSON.stringify(updated));
    }
    alert(
      `Bid placed! New Lowest bid in Arena is now ₹${bidVal.toLocaleString()}`,
    );
    setReverseArenaBidOpen(false);
    setReverseBidInput("");
  };

  const handleSubNavClick = (
    tab:
      | "dashboard"
      | "live"
      | "find"
      | "categories"
      | "applied"
      | "history"
      | "upcoming",
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

    if (tab === "upcoming") {
      setActiveTab("tender");
      setFilterSubmittedOnly(false);
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

  let baseTenders = tendersWithDistance;

  if (activeSubNav === "applied" || activeSubNav === "history") {
    baseTenders = tendersWithDistance.filter((t) => t.status === "submitted");
  }

  if (activeSubNav === "live" || activeSubNav === "upcoming") {
    baseTenders = tendersWithDistance.filter((t) => t.status === "active");
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
      a.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Split filtered auctions for rendering
  const arenaAuctionMatch = filteredAuctions.find((a) => a.type === "arena");
  const subAuctionsMatches = filteredAuctions.filter((a) => a.type === "sub");

  // Dynamic lowest bid computed from current state array for sync
  const currentLowestBid =
    auctions.find((a) => a.id === "OSD/7734")?.lowestBid || 12500;

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

                <button
                  onClick={() => setActiveSubNav("upcoming")}
                  className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    activeSubNav === "upcoming"
                      ? "text-[#1b4e7e] border-[#1b4e7e]"
                      : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                  }`}
                >
                  Upcoming
                </button>
              </>
            ) : (
              /* ================= AUCTION NAVIGATION ================= */
              <>
                <button
                  onClick={() => setAuctionSubNav("live")}
                  className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    auctionSubNav === "live"
                      ? "text-[#1b4e7e] border-[#1b4e7e]"
                      : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                  }`}
                >
                  Live Auctions
                </button>

                <button
                  onClick={() => setAuctionSubNav("my-bids")}
                  className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    auctionSubNav === "my-bids"
                      ? "text-[#1b4e7e] border-[#1b4e7e]"
                      : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                  }`}
                >
                  My Bids & NFT Vault
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
                  className={`h-full px-1 flex items-center whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                    auctionSubNav === "history"
                      ? "text-[#1b4e7e] border-[#1b4e7e]"
                      : "text-slate-500 border-transparent hover:text-[#1b4e7e]"
                  }`}
                >
                  Past History
                </button>

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
                                  <span className="font-bold text-slate-800">
                                    {item.deadline}
                                  </span>
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

                            {item.status === "active" ? (
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
                            ) : (
                              <button
                                disabled
                                className="w-full bg-slate-200 text-slate-400 border border-slate-300 rounded-lg cursor-not-allowed flex flex-col items-center justify-center py-1.5 px-2 h-11"
                              >
                                <span className="font-bold text-[11px]">
                                  Submitted
                                </span>

                                <span className="text-[8px] opacity-80 leading-none mt-0.5">
                                  {item.myBid?.includes("Vault")
                                    ? "Vault Record Synced"
                                    : "Bid Submitted"}
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
                  <div className="bg-[#133c62] text-white rounded-xl shadow-md overflow-hidden p-6 border border-[#1b4e7e]">
                    <h3 className="text-sm font-bold tracking-wider uppercase opacity-90 border-b border-white/10 pb-3 mb-4">
                      Tender Management Tools
                    </h3>

                    <div className="space-y-4">
                      <button
                        onClick={() =>
                          setFilterSubmittedOnly(!filterSubmittedOnly)
                        }
                        className="w-full flex items-center justify-between py-2 text-left group hover:opacity-80 transition-all cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold">
                            My Active Bids ({activeBidsCount})
                          </span>

                          <p className="text-[10px] text-white/50">
                            {filterSubmittedOnly
                              ? "Showing submitted bids (Click to clear)"
                              : "Filter by applied bids"}
                          </p>
                        </div>

                        <span className="text-white/40 text-lg">→</span>
                      </button>

                      <div className="w-full h-px bg-white/10" />

                      <button
                        onClick={() => setVaultOpen(true)}
                        className="w-full flex items-center justify-between py-2 text-left group hover:opacity-80 transition-all cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold">
                            Document Vault Access
                          </span>

                          <span className="text-[10px] text-white/50 block">
                            (All Active)
                          </span>
                        </div>

                        <span className="text-white/40 text-lg">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Regional Recommended Tenders Sidebar */}
                  <div className="bg-[#133c62] text-white rounded-xl shadow-md overflow-hidden p-5 border border-[#1b4e7e] space-y-4">
                    <div className="border-b border-white/10 pb-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-sky-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <h3 className="text-xs font-bold tracking-wider uppercase opacity-95">
                          Regional Tender Matches
                        </h3>
                      </div>
                      <p className="text-[10px] text-white/70 mt-1">
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

                    {auctionSubNav === "live" && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                          {arenaAuctionMatch ? (
                            <div className="bg-[#133c62] text-white rounded-xl shadow-md overflow-hidden p-6 border border-[#1b4e7e]">
                              <div className="flex justify-between items-start gap-4">
                                <h3 className="font-extrabold text-sm md:text-base">
                                  {arenaAuctionMatch.id} - {arenaAuctionMatch.title}
                                </h3>

                            <div className="flex gap-1">
                              {["03", "04", "02", "05"].map((num, idx) => (
                                <span
                                  key={idx}
                                  className="bg-slate-900/60 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                                >
                                  {num}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4 mb-5">
                            <div>
                              <span className="text-[10px] text-white/50 block uppercase">
                                Current Lowest Bid
                              </span>

                              <span className="text-xl font-black">
                                ₹ {arenaAuctionMatch.lowestBid.toLocaleString()}
                              </span>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-white/50 block uppercase">
                                Time Left
                              </span>

                              <span className="text-base font-bold font-mono">
                                {formatTime(timeLeftSeconds)}
                              </span>
                            </div>
                          </div>

                          <div className="w-full h-20 mb-5">
                            <svg
                              className="w-full h-full"
                              viewBox="0 0 340 100"
                              preserveAspectRatio="none"
                            >
                              <path
                                d="M10,80 Q30,65 50,50 T90,90 T130,60 T170,80 T210,40 T250,85 T290,50 T330,60"
                                fill="none"
                                stroke="#f0803c"
                                strokeWidth="2.5"
                              />
                            </svg>
                          </div>

                          <button
                            onClick={() => setReverseArenaBidOpen(true)}
                            className="w-full py-3 bg-[#e07a5f] hover:bg-[#cf6b50] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Place Lower Bid Now
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
                          No auction found.
                        </div>
                      )}

                      {/* Small Auctions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subAuctionsMatches.map((item) => (
                          <div
                            key={item.id}
                            className="bg-[#133c62] text-white rounded-xl shadow-md p-5 border border-[#1b4e7e]"
                          >
                            <div className="flex justify-between gap-3">
                              <h4 className="font-bold text-sm">{item.title}</h4>

                              <span className="bg-amber-500/20 text-amber-300 text-[8px] font-bold px-2 py-0.5 rounded h-fit">
                                ACTIVE
                              </span>
                            </div>

                            <div className="mt-5">
                              <p className="text-[10px] text-white/50 uppercase">
                                Current Lowest Bid
                              </p>

                              <p className="text-lg font-extrabold mt-1">
                                ₹{item.lowestBid.toLocaleString()}
                              </p>
                            </div>

                            <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/10">
                              <span className="text-[10px] font-mono">
                                {item.timeLeft}
                              </span>

                              <button
                                onClick={() =>
                                  alert(
                                    `Placing bid for ${item.title} (${item.id})`,
                                  )
                                }
                                className="bg-white/10 hover:bg-white/20 border border-white/20 py-1.5 px-4 rounded text-[9px] font-bold"
                              >
                                Bid Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Auction Activity */}
                    <div className="space-y-6">
                      <div className="bg-[#133c62] text-white rounded-xl shadow-md p-6 border border-[#1b4e7e] space-y-5">
                        <h3 className="text-sm font-bold uppercase border-b border-white/10 pb-3">
                          My Auction Activity
                        </h3>

                        <div className="flex justify-between text-xs font-bold">
                          <span>Live Bids (2)</span>

                          <span>→</span>
                        </div>

                        <div className="w-full h-px bg-white/10" />

                        <div>
                          <h4 className="text-xs font-bold mb-3">
                            Auction Watchlist
                          </h4>

                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="opacity-60">BID</span>

                            <span className="text-emerald-400">+2.78%</span>
                          </div>

                          <div className="relative w-full h-1.5 mt-3 rounded-full overflow-hidden flex">
                            <div className="w-1/2 bg-rose-500" />

                            <div className="w-1/2 bg-emerald-500" />

                            <span className="absolute left-[68%] top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-300 border-2 border-[#133c62] rounded-full" />
                          </div>
                        </div>

                        <div className="w-full h-px bg-white/10" />

                        <div>
                          <h4 className="text-xs font-bold mb-3">
                            Market Sentiment
                          </h4>

                          <div className="flex justify-between text-[10px]">
                            <span className="text-emerald-400">Capital</span>

                            <span className="text-emerald-400">▲ 6.89%</span>
                          </div>
                        </div>

                        <div className="w-full h-px bg-white/10" />

                        <div className="flex items-center gap-2 text-[9px] text-white/40">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                          Updating...
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MY BIDS & NFT VAULT PANEL */}
                {auctionSubNav === "my-bids" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-800">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-left">
                        <h2 className="text-lg font-bold text-slate-800">
                          NFT Bid Vault
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Secure tokenized bid records locked cryptographically in your hardware/browser security module.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-[#1b4e7e] font-bold">
                              CERT-7734-98
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-extrabold border border-emerald-100">
                              SECURED
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">
                              Office Stationery Supply Certificate
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Associated with Bid: OSD/7734
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Token Standard:</span>
                              <span className="font-semibold text-slate-700">ERC-1155</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Smart Contract:</span>
                              <span className="font-mono text-[#1b4e7e] truncate max-w-[120px]">
                                0x3a4fbc8c1992de0018a1bc
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Hash Signature:</span>
                              <span className="font-mono text-slate-700 truncate max-w-[120px]">
                                8f9b7c2d1e0a4fbc8c1992d
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setAuctionSubNav("ledger")}
                            className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-bold text-[11px] transition-colors cursor-pointer text-center"
                          >
                            Inspect Audit Trail
                          </button>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-[#1b4e7e] font-bold">
                              CERT-9012-14
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-extrabold border border-emerald-100">
                              SECURED
                            </span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">
                              Heavy Machinery Tender Certificate
                            </h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Associated with Bid: RA-9012
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Token Standard:</span>
                              <span className="font-semibold text-slate-700">ERC-1155</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Smart Contract:</span>
                              <span className="font-mono text-[#1b4e7e] truncate max-w-[120px]">
                                0x91b2fe48ba9910a3ee77
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Hash Signature:</span>
                              <span className="font-mono text-slate-700 truncate max-w-[120px]">
                                2a9910a3ed9c4483bd53e69
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setAuctionSubNav("ledger")}
                            className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-bold text-[11px] transition-colors cursor-pointer text-center"
                          >
                            Inspect Audit Trail
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-[#133c62] text-white rounded-xl shadow-md p-6 border border-[#1b4e7e] space-y-4">
                        <h3 className="text-sm font-bold uppercase border-b border-white/10 pb-3">
                          My Placed Bids
                        </h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                            <span className="text-[9px] font-bold text-amber-400 block uppercase">
                              OSD/7734 - Stationery
                            </span>
                            <span className="text-sm font-black block mt-0.5">
                              ₹ {currentLowestBid.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-white/50 block mt-1">
                              Status: Leading Bid (Lowest)
                            </span>
                          </div>

                          <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                            <span className="text-[9px] font-bold text-amber-400 block uppercase">
                              RA-9012 - Heavy Machinery
                            </span>
                            <span className="text-sm font-black block mt-0.5">
                              ₹ 90,012
                            </span>
                            <span className="text-[9px] text-white/50 block mt-1">
                              Status: Position Standard
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CATEGORIES PANEL */}
                {auctionSubNav === "categories" && (
                  <div className="space-y-6 text-left">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                      <h2 className="text-lg font-bold text-slate-800">
                        Auction Categories
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Filter reverse auctions by procurement sectors and industrial fields.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          name: "Construction & Infrastructure",
                          desc: "Road expansion, bridge building, solar installations",
                          count: 3,
                          icon: (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          )
                        },
                        {
                          name: "Medical Equipment & Biotech",
                          desc: "Biomedical monitors, diagnostic setups, oxygen lines",
                          count: 2,
                          icon: (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          )
                        },
                        {
                          name: "Enterprise IT & Computing",
                          desc: "Fibre lines, server racks, cloud migration suites",
                          count: 4,
                          icon: (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          )
                        },
                        {
                          name: "Consumables & Office Supplies",
                          desc: "Stationery packages, logistics, furniture updates",
                          count: 1,
                          icon: (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          )
                        },
                        {
                          name: "Heavy Machinery & Fleet",
                          desc: "Road rollers, excavators, high-capacity loaders",
                          count: 2,
                          icon: (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          )
                        }
                      ].map((cat, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                          <div className="space-y-4">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-[#1b4e7e]">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {cat.icon}
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-800">{cat.name}</h3>
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{cat.desc}</p>
                            </div>
                          </div>
                          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                            <span className="text-[#1b4e7e] font-bold">{cat.count} Auctions</span>
                            <button
                              onClick={() => {
                                setAuctionSubNav("live");
                                setSearchQuery(cat.name.split(" ")[0]);
                              }}
                              className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-600 font-bold text-[10px] cursor-pointer"
                            >
                              Explore
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PAST HISTORY PANEL */}
                {auctionSubNav === "history" && (
                  <div className="space-y-6 text-left">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                      <h2 className="text-lg font-bold text-slate-800">
                        Past Concluded Auctions
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Review bidding histories and contract savings records of completed auctions.
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs md:text-sm text-left text-slate-700">
                          <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase tracking-wider font-extrabold border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-4">Auction ID</th>
                              <th className="px-6 py-4">Title</th>
                              <th className="px-6 py-4">Client</th>
                              <th className="px-6 py-4">Starting Value</th>
                              <th className="px-6 py-4">Concluded Lowest Bid</th>
                              <th className="px-6 py-4">Savings</th>
                              <th className="px-6 py-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {[
                              {
                                id: "NIC/0052",
                                title: "Enterprise Cloud Suite",
                                client: "Ministry of IT",
                                start: "₹45,00,000",
                                end: "₹38,20,000",
                                savings: "15.1%",
                                status: "Completed"
                              },
                              {
                                id: "MCD/8821",
                                title: "Waste Management Systems",
                                client: "MCD Delhi",
                                start: "₹25,00,000",
                                end: "₹21,50,000",
                                savings: "14.0%",
                                status: "Completed"
                              },
                              {
                                id: "NHAI/9010",
                                title: "Toll Plaza Automations",
                                client: "NHAI",
                                start: "₹80,00,000",
                                end: "₹74,30,000",
                                savings: "7.1%",
                                status: "Completed"
                              }
                            ].map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-mono font-bold text-slate-900">{row.id}</td>
                                <td className="px-6 py-4 font-semibold text-slate-800">{row.title}</td>
                                <td className="px-6 py-4 text-slate-500">{row.client}</td>
                                <td className="px-6 py-4 font-mono text-slate-600">{row.start}</td>
                                <td className="px-6 py-4 font-mono font-bold text-[#1b4e7e]">{row.end}</td>
                                <td className="px-6 py-4 font-bold text-emerald-600">{row.savings}</td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* NFT AUDIT LEDGER PANEL */}
                {auctionSubNav === "ledger" && (
                  <div className="space-y-6 text-left">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">
                          NFT Cryptographic Audit Ledger
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                          Immutable block chain validation records securing reverse auctions.
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[#1b4e7e] text-[10px] font-bold font-mono w-fit">
                        Block Height: #20914820
                      </span>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                      <div className="relative border-l-2 border-slate-200 pl-6 space-y-8 ml-3">
                        {[
                          {
                            event: "Bid Certificate Hash Signed",
                            desc: "Cryptographic confirmation hash matching Stationery Bid (OSD/7734) committed to distributed state ledger.",
                            tx: "0x7f48bce39a48586e797e433ab948586e",
                            block: "#20914820",
                            time: "10 mins ago",
                            badge: "VALIDATED"
                          },
                          {
                            event: "DSC Vault Token ERC-1155 Minted",
                            desc: "Hardware certificate credentials tokenized and stored in the secure bidder wallet profile.",
                            tx: "0x91b2fe48ba9910a3ee77433ab948586e",
                            block: "#20914805",
                            time: "12 mins ago",
                            badge: "MINTER_CONFIRMED"
                          },
                          {
                            event: "Reverse Auction Arena Initialized",
                            desc: "Reverse pricing curve guidelines and starting value parameter vectors locked into decentralized VM consensus.",
                            tx: "0xbc887f48bce39a48586e797e433ab948",
                            block: "#20914750",
                            time: "45 mins ago",
                            badge: "VM_VERIFIED"
                          },
                          {
                            event: "Tender Contract Genesis Sealed",
                            desc: "Tender authorization cert and client public key handshake registered into Genesis block state root.",
                            tx: "0xde512a9910a3ed9c4483bd53e692f846",
                            block: "#20914700",
                            time: "1 hour ago",
                            badge: "GENESIS"
                          }
                        ].map((item, idx) => (
                          <div key={idx} className="relative">
                            <span className="absolute -left-[31px] top-1.5 w-3 h-3 bg-white border-2 border-[#1b4e7e] rounded-full" />
                            
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="space-y-1">
                                <h3 className="text-xs font-bold text-slate-800">{item.event}</h3>
                                <p className="text-[11px] text-slate-500 max-w-xl leading-relaxed">{item.desc}</p>
                                <div className="flex flex-wrap gap-4 pt-2 text-[9px] text-slate-400 font-mono">
                                  <span>Tx Hash: <span className="text-[#1b4e7e]">{item.tx}</span></span>
                                  <span>Block: <span className="text-slate-600">{item.block}</span></span>
                                </div>
                              </div>
                              <div className="md:text-right shrink-0 space-y-1.5">
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-100 block w-fit md:ml-auto">
                                  {item.badge}
                                </span>
                                <span className="text-[10px] text-slate-400 block">{item.time}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />

                  <h2 className="text-xl font-bold text-slate-800">
                    Live Tenders
                  </h2>
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  Currently active tenders available for bidding
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                {liveTenderData.length} Live Tenders
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {liveTenderData.map((tender) => (
                <div
                  key={tender.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-[#1b4e7e]">
                        {tender.id}
                      </span>

                      <h3 className="text-sm font-bold text-slate-800 mt-1">
                        {tender.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {tender.department}
                      </p>
                    </div>

                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      LIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400">Category</p>

                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {tender.category}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400">Location</p>

                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {tender.location}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400">Tender Value</p>

                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {tender.value}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400">Deadline</p>

                      <p className="text-xs font-bold text-red-600 mt-1">
                        {tender.deadline}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setSelectedTender({
                        id: tender.id,
                        title: tender.title,
                        dept: tender.department,
                        location: tender.location,
                        value: tender.value,
                        deadline: tender.deadline,
                        match: tender.match as "High Match" | "Medium Match",
                        status: "active",
                      })
                    }
                    className="w-full mt-5 bg-[#1b4e7e] hover:bg-[#163f65] text-white py-2.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    View & Apply
                  </button>
                </div>
              ))}
            </div>
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
                Explore tenders available across different departments and
                locations.
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {findTenderData
                .filter(
                  (tender) =>
                    tender.title
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    tender.id
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    tender.department
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    tender.location
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()),
                )
                .map((tender) => (
                  <div
                    key={tender.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-[#1b4e7e]">
                          {tender.id}
                        </span>

                        <h3 className="font-bold text-slate-800 text-sm mt-1">
                          {tender.title}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1">
                          {tender.department}
                        </p>
                      </div>

                      <span className="px-2 py-1 rounded-md bg-blue-50 text-[#1b4e7e] text-[10px] font-bold">
                        OPEN
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-[10px] text-slate-400">Category</p>
                        <p className="text-xs font-bold text-slate-700 mt-1">
                          {tender.category}
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
                        <p className="text-xs font-bold text-red-600 mt-1">
                          {tender.deadline}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedTender({
                          id: tender.id,
                          title: tender.title,
                          dept: tender.department,
                          location: tender.location,
                          value: tender.value,
                          deadline: tender.deadline,
                          match: "High Match",
                          status: "active",
                        })
                      }
                      className="w-full mt-5 bg-[#1b4e7e] hover:bg-[#163f65] text-white py-2.5 rounded-lg text-xs font-bold"
                    >
                      View Details & Apply
                    </button>
                  </div>
                ))}
            </div>
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
                    className="w-full mt-5 border border-[#1b4e7e]/20 text-[#1b4e7e] hover:bg-[#1b4e7e] hover:text-white py-2.5 rounded-lg text-xs font-bold transition-colors"
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
                  Track all tenders where you have submitted a bid.
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#1b4e7e] text-xs font-bold">
                {appliedTenderData.length} Applications
              </span>
            </div>

            <div className="space-y-4">
              {appliedTenderData.map((tender) => (
                <div
                  key={tender.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-[#1b4e7e]">
                        {tender.id}
                      </span>

                      <h3 className="text-sm font-bold text-slate-800 mt-1">
                        {tender.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {tender.department}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-xs">
                      <div>
                        <p className="text-slate-400 text-[10px]">Category</p>
                        <p className="font-bold text-slate-700 mt-1">
                          {tender.category}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400 text-[10px]">Submitted</p>
                        <p className="font-bold text-slate-700 mt-1">
                          {tender.submittedOn}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400 text-[10px]">Bid Amount</p>
                        <p className="font-bold text-slate-700 mt-1">
                          {tender.bidAmount}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold whitespace-nowrap">
                      {tender.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* ===================== PAST HISTORY ====================== */}
        {/* ========================================================= */}

        {activeSubNav === "history" && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Past History</h2>

              <p className="text-sm text-slate-500 mt-1">
                Review your previous tender applications and results.
              </p>
            </div>

            <div className="space-y-4">
              {pastHistoryData.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-[#1b4e7e]">
                        {item.id}
                      </span>

                      <h3 className="text-sm font-bold text-slate-800 mt-1">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {item.department}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 text-xs">
                      <div>
                        <p className="text-slate-400 text-[10px]">Category</p>
                        <p className="font-bold text-slate-700 mt-1">
                          {item.category}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400 text-[10px]">Applied On</p>
                        <p className="font-bold text-slate-700 mt-1">
                          {item.appliedOn}
                        </p>
                      </div>

                      <div>
                        <p className="text-slate-400 text-[10px]">Bid Amount</p>
                        <p className="font-bold text-slate-700 mt-1">
                          {item.bidAmount}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap ${
                        item.result === "Awarded"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}
                    >
                      {item.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* ======================= UPCOMING ======================== */}
        {/* ========================================================= */}

        {activeSubNav === "upcoming" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Upcoming Tenders
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Tenders that will be opening soon.
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold border border-violet-100">
                {upcomingTenderData.length} Upcoming
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcomingTenderData.map((tender) => (
                <div
                  key={tender.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-[#1b4e7e]">
                        {tender.id}
                      </span>

                      <h3 className="text-sm font-bold text-slate-800 mt-1">
                        {tender.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {tender.department}
                      </p>
                    </div>

                    <span className="px-2 py-1 rounded-md bg-violet-50 text-violet-700 text-[10px] font-bold">
                      UPCOMING
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400">Category</p>

                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {tender.category}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400">Location</p>

                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {tender.location}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400">Tender Value</p>

                      <p className="text-xs font-bold text-slate-700 mt-1">
                        {tender.value}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400">Opening Date</p>

                      <p className="text-xs font-bold text-[#1b4e7e] mt-1">
                        {tender.openingDate}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      alert(
                        `${tender.title} will open on ${tender.openingDate}`,
                      );
                    }}
                    className="w-full mt-5 border border-[#1b4e7e]/20 text-[#1b4e7e] hover:bg-[#1b4e7e] hover:text-white py-2.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    View Tender Information
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 3. Modal Forms overlay popup */}

      {/* Reverse Auction Arena Modal */}
      {reverseArenaBidOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-left space-y-4">
            <div>
              <span className="text-[9px] font-bold bg-[#e07a5f] text-white px-2 py-0.5 rounded">
                REVERSE ARENA BID
              </span>
              <h3 className="text-base font-bold text-slate-800 mt-2">
                {auctions.find((a) => a.id === "OSD/7734")?.id} -{" "}
                {auctions.find((a) => a.id === "OSD/7734")?.title}
              </h3>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
              <p>
                <strong>Current Lowest Bidded Amount:</strong>
                <br />
                <span className="text-sm font-bold text-slate-800">
                  ₹{" "}
                  {(
                    auctions.find((a) => a.id === "OSD/7734")?.lowestBid ||
                    12500
                  ).toLocaleString()}
                </span>
              </p>
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
                    placeholder={`Must be below ₹${(auctions.find((a) => a.id === "OSD/7734")?.lowestBid || 12500).toLocaleString()}`}
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
                    Enter Your Bid Value (in Lakhs)
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
                      lakhs
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
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-800">
                    Application Submitted!
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                    Your bid for{" "}
                    <span className="font-bold text-slate-700">
                      {quickApplyTender.title}
                    </span>{" "}
                    has been published successfully.
                  </p>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 text-[10px] text-slate-400 font-mono select-all">
                    Bid Sync Token: GeM-VAULT-228749
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickApplyTender(null)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm mt-2"
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
