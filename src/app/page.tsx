'use client';

import React from 'react';
import { AccessibilityBar } from '@/components/home/AccessibilityBar';
import { Header } from '@/components/home/Header';
import { Navbar } from '@/components/home/Navbar';
import { Announcement } from '@/components/home/Announcement';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { StatsDashboard } from '@/components/home/StatsDashboard';
import { SalientInfo } from '@/components/home/SalientInfo';
import { WhyUseGeM } from '@/components/home/WhyUseGeM';
import { QuickLinks } from '@/components/home/QuickLinks';
import { PartnerLogos } from '@/components/home/PartnerLogos';
import { Footer } from '@/components/home/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* 1. Top Accessibility Bar */}
      <AccessibilityBar />

      {/* 2. Official Header */}
      <Header />

      {/* 3. Navigation Menu Bar */}
      <Navbar />

      {/* 4. Scrolling Notifications */}
      <Announcement />

      {/* Main content area */}
      <main id="main-content" className="flex-grow">
        {/* 5. Hero Slide Carousel */}
        <HeroCarousel />

        {/* 6. Dashboard metrics counts */}
        <StatsDashboard />

        {/* 7. Salient Policy grids */}
        <SalientInfo />

        {/* 8. Feature checklist */}
        <WhyUseGeM />

        {/* 9. Quick Actions Links */}
        <QuickLinks />

        {/* 10. Partner Portals */}
        <PartnerLogos />
      </main>

      {/* 11. Footer Section */}
      <Footer />
    </div>
  );
}
