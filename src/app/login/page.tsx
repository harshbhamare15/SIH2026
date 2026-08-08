'use client';

import React from 'react';
import { AccessibilityBar } from '@/components/home/AccessibilityBar';
import { Header } from '@/components/home/Header';
import { Navbar } from '@/components/home/Navbar';
import { Announcement } from '@/components/home/Announcement';
import LoginComponent from '@/components/Login/login';
import FooterSimple from '@/components/FooterSimple';

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Accessibility Bar */}
      <AccessibilityBar />

      {/* Official Header */}
      <Header />

      {/* Navigation Menu Bar */}
      <Navbar />

      {/* Scrolling Notifications */}
      <Announcement />

      {/* Main content area */}
      <main id="main-content" className="flex-grow bg-[#f8fafc]">
        <LoginComponent />
      </main>

      {/* Footer Section */}
      <FooterSimple />
    </div>
  );
}
