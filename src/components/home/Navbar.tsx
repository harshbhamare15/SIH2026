"use client";

import React, { useState, useEffect } from "react";

interface MenuItem {
  title: string;
  href?: string;
  badge?: string;
  subMenu?: MenuItem[];
}

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<
    string | null
  >(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("logged-in-user"));
    }
  }, []);

  const menuData: MenuItem[] = [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "About Axiom",
      href: "#about-us",
    },
    {
      title: "Axiom Escrow",
      href: "#axiom-escrow",
    },
    {
      title: "OMs/GOs/Others",
      subMenu: [
        {
          title: "Important Procurement Policies",
          subMenu: [
            {
              title: "Central Policy Guidelines",
              href: "#central-instructions",
            },
            {
              title: "State Policy Guidelines",
              href: "#state-instructions",
              badge: "New",
            },
          ],
        },
        {
          title: "Rules and Procedures",
          subMenu: [
            { title: "Rules & Manuals (GFR/CPWD)", href: "#rules-manuals" },
            { title: "Orders and Circulars (CVC)", href: "#cvc-guidelines" },
            { title: "IT Act Amendments", href: "#it-act" },
            { title: "Earnest Money Deposit (EMD) OMs", href: "#emd-oms" },
          ],
        },
        { title: "Mission & Vision", href: "#mission" },
        { title: "Standard Bidding Document", href: "#standard-bidding" },
      ],
    },
    {
      title: "Search Tender/Bids",
      subMenu: [
        { title: "Latest Active Tenders", href: "#active-tenders" },
        { title: "Active Corrigendums", href: "#corrigendums" },
        { title: "Result of Tenders (AOC)", href: "#tender-results" },
        { title: "Bid / RA Notices (Axiom)", href: "#axiom-notices" },
        { title: "Global Tenders", href: "#global-tenders" },
        { title: "High Value Tenders", href: "#high-value" },
        { title: "Tender Search by Product", href: "#search-product" },
        { title: "Tender Closing Today", href: "#closing-today" },
        { title: "Advanced Tender Search", href: "#advanced-search" },
        { title: "Cancelled Tenders", href: "#cancelled-tenders" },
      ],
    },
    {
      title: "Dashboard",
      subMenu: isLoggedIn
        ? [
            { title: "Active Bid Dashboard", href: "/dashboard" },
            { title: "My Profile", href: "/profile" },
            { title: "Logout Session", href: "#logout-action" },
            { title: "Descriptive Analytics", href: "#descriptive" },
            { title: "Unified Analytics", href: "#unified-analytics" },
            { title: "Key Performance Indicators", href: "#kpi" },
            { title: "Axiom Statistics", href: "#axiom-stats" },
          ]
        : [
            { title: "Descriptive Analytics", href: "#descriptive" },
            { title: "Unified Analytics", href: "#unified-analytics" },
            { title: "Key Performance Indicators", href: "#kpi" },
            { title: "Axiom Statistics", href: "#axiom-stats" },
          ],
    },
    {
      title: "Grievance",
      subMenu: [
        { title: "PPP-MII Order, 2017 Guidelines", href: "#ppp-mii" },
        { title: "Grievance / Suggestions Form", href: "#grievance-form" },
      ],
    },
    {
      title: "Debarment",
      subMenu: [
        { title: "Debarred Bidders Search", href: "#debarment-search" },
        { title: "Debarred List - Archive", href: "#debarment-archive" },
        { title: "Debarred List - Revocated", href: "#debarment-revocation" },
        { title: "Debarment Manual", href: "#debarment-manual" },
      ],
    },
  ];

  const portals = [
    "Axiom Public Procurement Portal",
    "Axiom Timelock Escrow Vault",
    "e-Publishing System",
    "Defence eProcurement Portal",
    "Indian Railways (IREPS)",
    "Delhi eProcurement Portal",
    "Haryana eProcurement",
    "Karnataka e-Procurement",
    "UP eProcurement System",
  ];

  const handleDropdownToggle = (title: string) => {
    if (activeMobileDropdown === title) {
      setActiveMobileDropdown(null);
    } else {
      setActiveMobileDropdown(title);
    }
  };

  return (
    <div className="w-full bg-primary text-white sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-12">
          {/* Main Desktop Navbar Items */}
          <div className="hidden lg:flex items-stretch gap-1 h-12 w-full">
            {menuData.map((item, idx) => (
              <div
                key={idx}
                className="relative group flex-shrink-0 flex items-stretch"
              >
                {item.subMenu ? (
                  <button className="flex items-center gap-1.5 px-4 border-b-2 border-transparent group-hover:border-white group-hover:bg-[#133c62] transition-all cursor-pointer text-white text-xs font-semibold">
                    {item.title}
                    <svg
                      className="w-3.5 h-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>
                ) : (
                  <a
                    href={item.href || "#"}
                    className="flex items-center px-4 border-b-2 border-transparent hover:border-white hover:bg-[#133c62] transition-all text-white text-xs font-semibold"
                  >
                    {item.title}
                  </a>
                )}

                {/* Submenu Hover Overlay */}
                {item.subMenu && (
                  <div className="absolute top-full left-0 mt-0 w-64 bg-white text-gray-800 rounded-b shadow-xl border border-gray-100 hidden group-hover:block transition-all duration-200 z-50">
                    <div className="py-2 flex flex-col">
                      {item.subMenu.map((sub, subIdx) => (
                        <div key={subIdx} className="relative group/sub px-1">
                          {sub.subMenu ? (
                            <div className="flex justify-between items-center px-4 py-2 text-xs font-medium hover:bg-primary-light hover:text-primary rounded cursor-pointer transition-colors">
                              <span>{sub.title}</span>
                              <svg
                                className="w-3 h-3 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                />
                              </svg>
                            </div>
                          ) : (
                            <a
                              href={sub.href || "#"}
                              onClick={(e) => {
                                if (sub.href === "#logout-action") {
                                  e.preventDefault();
                                  localStorage.removeItem("logged-in-user");
                                  window.location.href = "/";
                                }
                              }}
                              className="flex justify-between items-center px-4 py-2.5 text-xs font-medium hover:bg-primary-light hover:text-primary rounded transition-colors text-gray-700"
                            >
                              <span>{sub.title}</span>
                              {sub.badge && (
                                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase leading-none">
                                  {sub.badge}
                                </span>
                              )}
                            </a>
                          )}

                          {/* Nested Third-Level Dropdown */}
                          {sub.subMenu && (
                            <div className="absolute left-full top-0 mt-0 ml-1.5 w-56 bg-white text-gray-800 rounded shadow-xl border border-gray-100 hidden group-hover/sub:block z-50">
                              <div className="py-2 flex flex-col">
                                {sub.subMenu.map((leaf, leafIdx) => (
                                  <a
                                    key={leafIdx}
                                    href={leaf.href || "#"}
                                    className="px-4 py-2 text-xs hover:bg-primary-light hover:text-primary transition-colors font-normal text-gray-600 block"
                                  >
                                    {leaf.title}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Portal Switcher (Desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 ml-auto flex-shrink-0 relative group">
            <button className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1 rounded text-xs font-semibold cursor-pointer text-white">
              <span>Select Portal</span>
              <svg
                className="w-3.5 h-3.5 opacity-70"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
            <div className="absolute top-full right-0 mt-0.5 w-64 bg-white text-gray-800 rounded shadow-xl border border-gray-100 hidden group-hover:block transition-all duration-200 z-50">
              <div className="py-1 flex flex-col max-h-72 overflow-y-auto">
                {portals.map((p, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() =>
                      alert(`Redirecting to ${p} portal (Simulation)`)
                    }
                    className="text-left px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-primary-light hover:text-primary transition-colors cursor-pointer border-b border-gray-50 last:border-b-0"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Hamburguer and Portal Selector Toggle */}
          <div className="flex lg:hidden items-center justify-between w-full">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded hover:bg-white/15 cursor-pointer text-white"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>

            <span className="text-sm font-bold tracking-wider">
              AXIOM PORTAL
            </span>

            <div className="relative group">
              <button className="bg-white/15 px-2.5 py-1 rounded text-xs font-semibold cursor-pointer text-white">
                Portals
              </button>
              <div className="absolute right-0 top-full mt-2 w-52 bg-white text-gray-800 rounded shadow-lg border border-gray-100 hidden group-hover:block z-50">
                <div className="py-1 flex flex-col max-h-60 overflow-y-auto">
                  {portals.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => alert(`Redirecting to ${p} portal`)}
                      className="text-left px-3 py-2 text-xs text-gray-600 hover:bg-primary-light hover:text-primary transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-12 left-0 w-full bg-primary border-t border-white/10 shadow-2xl z-40 transition-all duration-300 ease-in-out max-h-[85vh] overflow-y-auto">
          <div className="p-4 flex flex-col gap-2">
            {menuData.map((item, idx) => (
              <div
                key={idx}
                className="border-b border-white/5 pb-2 last:border-0 last:pb-0"
              >
                {item.subMenu ? (
                  <div>
                    <button
                      onClick={() => handleDropdownToggle(item.title)}
                      className="w-full flex justify-between items-center py-2 text-sm font-semibold hover:text-white/80 cursor-pointer text-white text-left"
                    >
                      <span>{item.title}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${activeMobileDropdown === item.title ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </button>

                    {activeMobileDropdown === item.title && (
                      <div className="pl-4 mt-1 flex flex-col gap-2 bg-black/10 rounded-md p-2">
                        {item.subMenu.map((sub, subIdx) => (
                          <div key={subIdx}>
                            {sub.subMenu ? (
                              <div className="py-1">
                                <span className="text-xs text-white/50 block font-bold uppercase tracking-wider mb-1">
                                  {sub.title}
                                </span>
                                <div className="pl-3 flex flex-col gap-1.5 border-l border-white/10 ml-1">
                                  {sub.subMenu.map((leaf, leafIdx) => (
                                    <a
                                      key={leafIdx}
                                      href={leaf.href || "#"}
                                      className="py-1 text-xs text-white/80 hover:text-white block"
                                      onClick={() => setMobileMenuOpen(false)}
                                    >
                                      {leaf.title}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <a
                                href={sub.href || "#"}
                                className="flex justify-between items-center py-1.5 text-xs font-medium text-white/90 hover:text-white"
                                onClick={(e) => {
                                  setMobileMenuOpen(false);
                                  if (sub.href === "#logout-action") {
                                    e.preventDefault();
                                    localStorage.removeItem("logged-in-user");
                                    window.location.href = "/";
                                  }
                                }}
                              >
                                <span>{sub.title}</span>
                                {sub.badge && (
                                  <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase leading-none">
                                    {sub.badge}
                                  </span>
                                )}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a
                    href={item.href || "#"}
                    className="block py-2 text-sm font-semibold hover:text-white/80 text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.title}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
