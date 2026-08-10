'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterComponent() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [orgType, setOrgType] = useState('');
  const [orgName, setOrgName] = useState('');
  const [pan, setPan] = useState('');
  const [gst, setGst] = useState('');

  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');

  const generateCaptchaCode = () => {
    const chars = '0123456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptchaCode());
  const [agreed, setAgreed] = useState(false);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode());
  };

  const [isContractor, setIsContractor] = useState(true);
  const [isBuyer, setIsBuyer] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletNetwork, setWalletNetwork] = useState('');
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState('');

  // Generate robust hardware & browser device fingerprint
  const generateDeviceFingerprint = async (): Promise<string> => {
    if (typeof window === 'undefined') return '';
    try {
      const nav = window.navigator;
      const screen = window.screen;

      const components: string[] = [
        nav.userAgent || '',
        nav.language || '',
        (nav.languages || []).join(','),
        nav.platform || '',
        String(nav.hardwareConcurrency || 4),
        String((nav as any).deviceMemory || 8),
        `${screen.width}x${screen.height}x${screen.colorDepth}`,
        String(window.devicePixelRatio || 1),
        Intl.DateTimeFormat().resolvedOptions().timeZone || '',
        String(new Date().getTimezoneOffset()),
        String(nav.maxTouchPoints || 0),
      ];

      // Canvas 2D fingerprint entropy
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.textBaseline = 'top';
          ctx.font = '14px "Arial"';
          ctx.fillStyle = '#f60';
          ctx.fillRect(125, 1, 62, 20);
          ctx.fillStyle = '#069';
          ctx.fillText('AxiomProcureSecurity,🔒@#$', 2, 15);
          ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
          ctx.fillText('AxiomProcureSecurity,🔒@#$', 4, 17);
          components.push(canvas.toDataURL());
        }
      } catch {
        components.push('canvas_fallback');
      }

      // WebGL GPU renderer fingerprint
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            components.push(vendor || '');
            components.push(renderer || '');
          }
        }
      } catch {
        components.push('webgl_fallback');
      }

      const rawString = components.join('|||');
      const msgBuffer = new TextEncoder().encode(rawString);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      return `dfp_${hashHex.slice(0, 32)}`;
    } catch (err) {
      console.error('Device fingerprint generation error:', err);
      return `dfp_${Math.random().toString(36).substring(2, 18)}`;
    }
  };

  // Compute device fingerprint on mount
  React.useEffect(() => {
    generateDeviceFingerprint().then((fp) => {
      setDeviceFingerprint(fp);
    });
  }, []);

  const connectMetaMask = async () => {
    if (typeof window === 'undefined') return;
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      alert('MetaMask browser extension not detected. Please install MetaMask to register as a Buyer for Ganache GUI transactions.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      setIsConnectingWallet(true);
      const accounts: string[] = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);

        try {
          const chainIdHex: string = await ethereum.request({
            method: 'eth_chainId',
          });
          const chainId = parseInt(chainIdHex, 16);
          if (chainId === 1337 || chainId === 5777) {
            setWalletNetwork('Ganache GUI Network (Localhost RPC)');
          } else {
            setWalletNetwork(`Chain ID: ${chainId} (Ganache Network Recommended)`);
          }
        } catch {
          setWalletNetwork('Connected');
        }

        if (ethereum.on) {
          ethereum.on('accountsChanged', (newAccounts: string[]) => {
            if (newAccounts && newAccounts.length > 0) {
              setWalletAddress(newAccounts[0]);
            } else {
              setWalletAddress('');
            }
          });

          ethereum.on('chainChanged', (newChainIdHex: string) => {
            const newChainId = parseInt(newChainIdHex, 16);
            if (newChainId === 1337 || newChainId === 5777) {
              setWalletNetwork('Ganache GUI Network (Localhost RPC)');
            } else {
              setWalletNetwork(`Chain ID: ${newChainId}`);
            }
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'MetaMask connection rejected';
      alert('MetaMask error: ' + msg);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const switchWallet = async () => {
    if (typeof window === 'undefined') return;
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      alert('MetaMask browser extension not detected.');
      return;
    }

    try {
      setIsConnectingWallet(true);
      // Request MetaMask account chooser modal via EIP-2255 permissions request
      try {
        await ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch {
        // If user rejects permission modal, fallback to eth_requestAccounts
      }

      const accounts: string[] = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (err: unknown) {
      console.log('Account switch handled:', err);
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (captchaInput !== captchaCode) {
      alert('Invalid Captcha. Please enter the correct code.');
      return;
    }
    if (!agreed) {
      alert('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    if (!isContractor && !isBuyer) {
      alert('Please select at least one account type: Contractor, Buyer, or Both.');
      return;
    }

    if (isBuyer && (!walletAddress || !walletAddress.trim().startsWith('0x'))) {
      alert('Please connect your MetaMask wallet before registering with a Buyer account for Ganache transactions.');
      return;
    }

    const selectedRole = isContractor && isBuyer ? 'both' : isBuyer ? 'buyer' : 'contractor';

    try {
      setIsSubmitting(true);
      const userProfile = {
        fullName,
        email,
        mobile,
        password,
        role: selectedRole,
        walletAddress: isBuyer ? walletAddress.trim() : null,
        deviceFingerprint: isContractor ? (deviceFingerprint || null) : null,
        orgType,
        orgName,
        pan,
        gst,
        address1,
        address2,
        city,
        state,
        district,
        pincode,
        country,
        address: `${address1}, ${address2 ? address2 + ', ' : ''}${city}, ${state}, ${pincode}, ${country}`
      };

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userProfile),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Registration failed. Please try again.');
        return;
      }

      // Save profile details to localStorage to wire up login authentication
      localStorage.setItem('user-profile', JSON.stringify(data.user || userProfile));
      alert('Registration Successful! Redirecting to login page...');
      
      // Automatically redirect to the login page
      router.push('/login?registered=true');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      alert('Registration error: ' + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statesList = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
  ];

  return (
    <div className="w-full bg-[#f8fafc] py-8 px-4 font-sans transition-colors duration-200">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden text-left">
        
        {/* Dark Blue Header Banner Card */}
        <div className="bg-primary text-white p-8 relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col items-start gap-1 relative z-10">
            <span className="bg-amber-500 text-slate-900 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-2">
              Register
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              Create Your Account
            </h2>
            <p className="text-white/80 text-xs mt-0.5">
              Register on the Central Public Procurement Portal to get started.
            </p>
          </div>
          {/* User profile outline icon overlay */}
          <div className="text-white/10 w-20 h-20 md:w-24 md:h-24 absolute right-6 bottom-4 select-none pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-full h-full fill-none stroke-current" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0zM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
            </svg>
          </div>
        </div>

        {/* Form Body */}
        <form className="p-8 space-y-8" onSubmit={handleRegister}>

          {/* 0. Multi-Account Registration Role Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black">
                  1
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                    Registration Account Types
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Select one or both account roles (Multiple account types supported)
                  </p>
                </div>
              </div>

              {isContractor && isBuyer && (
                <span className="text-[10px] font-black uppercase bg-gradient-to-r from-emerald-600 to-amber-600 text-white px-2.5 py-1 rounded-full shadow-xs">
                  Dual Role: Contractor + Buyer
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contractor Card Option */}
              <div
                onClick={() => setIsContractor(!isContractor)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                  isContractor
                    ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isContractor}
                  onChange={(e) => {
                    e.stopPropagation();
                    setIsContractor(e.target.checked);
                  }}
                  className="mt-1 w-4 h-4 text-primary focus:ring-primary rounded border-slate-300 cursor-pointer shrink-0"
                />
                <div className="space-y-1 select-none">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">
                      Register as Contractor
                    </span>
                    <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      Bidder
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Submit commercial bids, attach verified compliance credentials, and participate in reverse auction arenas.
                  </p>
                </div>
              </div>

              {/* Buyer Card Option */}
              <div
                onClick={() => {
                  const nextBuyerState = !isBuyer;
                  setIsBuyer(nextBuyerState);
                  if (nextBuyerState && !walletAddress) {
                    connectMetaMask();
                  }
                }}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                  isBuyer
                    ? 'border-[#f6851b] bg-amber-50/60 shadow-xs ring-1 ring-[#f6851b]/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isBuyer}
                  onChange={(e) => {
                    e.stopPropagation();
                    const checked = e.target.checked;
                    setIsBuyer(checked);
                    if (checked && !walletAddress) {
                      connectMetaMask();
                    }
                  }}
                  className="mt-1 w-4 h-4 text-[#f6851b] focus:ring-[#f6851b] rounded border-slate-300 cursor-pointer shrink-0"
                />
                <div className="space-y-1 select-none">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">
                      Register as Buyer
                    </span>
                    <span className="text-[9px] font-black uppercase bg-[#f6851b]/10 text-[#e2761b] px-2 py-0.5 rounded flex items-center gap-1">
                      Web3 Escrow
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Procuring agency representative to publish tenders, evaluate contractor bids & manage smart contract escrow settlements.
                  </p>
                </div>
              </div>
            </div>

            {/* MetaMask Connection Panel when Buyer is selected */}
            {isBuyer && (
              <div className="p-4 bg-gradient-to-r from-amber-50/90 to-orange-50/70 border-2 border-[#f6851b]/40 rounded-xl space-y-3 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-white p-1.5 shadow-xs border border-amber-200 flex items-center justify-center shrink-0">
                      {/* MetaMask Fox SVG */}
                      <svg className="w-6 h-6" viewBox="0 0 318.6 318.6" fill="none">
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
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Digital Escrow & Settlement Wallet (MetaMask Web3)
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Required for cryptographic tender escrow, smart contract bidding & transparent financial settlement.
                      </p>
                    </div>
                  </div>

                  {walletAddress ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/90 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Connected
                      </span>
                      <button
                        type="button"
                        disabled={isConnectingWallet}
                        onClick={switchWallet}
                        className="text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-300 hover:border-slate-400 shadow-2xs transition-colors cursor-pointer"
                      >
                        {isConnectingWallet ? 'Switching...' : 'Switch Account'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isConnectingWallet}
                      onClick={connectMetaMask}
                      className="px-4 py-2 bg-[#f6851b] hover:bg-[#e2761b] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {isConnectingWallet ? 'Connecting...' : 'Connect MetaMask Wallet'}
                    </button>
                  )}
                </div>

                {walletAddress ? (
                  <div className="bg-white/90 border border-amber-200/80 rounded-lg p-2.5 text-xs">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Connected MetaMask Account</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px] block truncate mt-0.5">
                      {walletAddress}
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] text-amber-800 bg-amber-100/50 p-2 rounded border border-amber-200/50">
                    💡 Click <strong>Connect MetaMask Wallet</strong> to authorize your blockchain account for smart contract escrow transactions.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 1. Personal Information */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                  placeholder="Enter 10 digit mobile number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-2.2-2.2-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-2.2-2.2-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Organization Details */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Organization Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Organization Type <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                >
                  <option value="">Select Organization Type</option>
                  <option value="private">Private Limited Company</option>
                  <option value="public">Public Sector Undertaking (PSU)</option>
                  <option value="proprietorship">Partnership / Proprietorship</option>
                  <option value="individual">Individual Consultant</option>
                  <option value="government">Government Department</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                  placeholder="Enter organization name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  PAN Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800 uppercase font-mono"
                  placeholder="Enter PAN number"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                GST Number
              </label>
              <input
                type="text"
                maxLength={15}
                value={gst}
                onChange={(e) => setGst(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800 uppercase font-mono"
                placeholder="Enter GST number (Optional)"
              />
            </div>
          </div>

          {/* 3. Address Details */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"/>
                </svg>
              </div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Address Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                  placeholder="Enter address line 1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                  placeholder="Enter address line 2 (Optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                >
                  <option value="">Select State</option>
                  {statesList.map((st, i) => (
                    <option key={i} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  District <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                  placeholder="Enter district"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                  placeholder="Enter pincode"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                >
                  <option value="India">India</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Verification */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z"/>
                </svg>
              </div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Verification
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter Captcha Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs bg-white text-slate-800"
                  placeholder="Enter captcha code"
                />
              </div>

              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-2.5 rounded-lg h-10 select-none">
                <span className="font-mono text-base font-extrabold tracking-widest text-slate-800 border border-slate-300 bg-white px-4 py-0.5 rounded shadow-inner italic line-through">
                  {captchaCode.split('').join(' ')}
                </span>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="p-1 text-slate-500 hover:text-primary hover:bg-slate-200/50 rounded transition-colors cursor-pointer"
                  title="Refresh Captcha"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                required
                id="agree-rules"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary focus:ring-primary/30 rounded border-slate-200 cursor-pointer"
              />
              <label htmlFor="agree-rules" className="text-xs text-slate-600 select-none cursor-pointer leading-relaxed">
                I agree to the <a href="#terms" className="text-primary font-semibold hover:underline">Terms & Conditions</a> and <a href="#privacy" className="text-primary font-semibold hover:underline">Privacy Policy</a> <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="w-full sm:w-auto px-10 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-extrabold rounded-md shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-center"
            >
              Register
            </button>
            <span className="text-xs text-slate-500">
              Already have an account?{' '}
              <a href="/login" className="font-bold text-primary hover:underline">
                Login
              </a>
            </span>
          </div>

        </form>

      </div>
    </div>
  );
}
