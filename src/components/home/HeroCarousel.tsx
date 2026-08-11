'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Slide {
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  gradient: string;
}

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const slides: Slide[] = [
    {
      title: 'Unified e-Procurement Portal',
      subtitle: 'Axiom Timelock & Sealed-Bid Architecture',
      description: 'Decentralized cryptographic access for public procurements across all Central and State government organizations in India. Designed to facilitate fair and tamper-proof bidding.',
      tag: 'SECURITY & TRUST',
      gradient: 'from-[#1b4e7e] to-[#2a6b9f]',
    },
    {
      title: 'Secure Bidding Environment',
      subtitle: 'STQC Certified & SSL/TLS Secured',
      description: 'Robust infrastructure audited periodically. Includes secure time synchronization using Network Time Protocol (NTP) to guarantee fairness in bid submissions.',
      tag: 'SECURITY',
      gradient: 'from-[#1e3a5f] to-[#12223a]',
    },
    {
      title: 'Informatics & Analytics',
      subtitle: 'Descriptive & Unified Statistics Dashboards',
      description: 'Gain insights into active tenders, closing dates, awarded contracts, and financial metrics across key performance indicators.',
      tag: 'ANALYTICS',
      gradient: 'from-[#2e5b88] to-[#1e3d5e]',
    },
    {
      title: 'Capacity Building & Support',
      subtitle: 'Continuous Web Learning and Training Sessions',
      description: 'Interactive workshops, downloads, standard bidding manuals, and video resources are provided to onboard procuring entities and bidders seamlessly.',
      tag: 'EDUCATION',
      gradient: 'from-[#163f68] to-[#2568a3]',
    },
  ];

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, handleNext]);

  return (
    <div className="w-full bg-white py-4 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto relative rounded-xl overflow-hidden shadow-lg h-[280px] sm:h-[350px] md:h-[400px]">
        
        {/* Slides list */}
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full bg-gradient-to-r ${slide.gradient} text-white flex items-center p-8 sm:p-12 md:p-16 transition-opacity duration-700 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Slide Content */}
            <div className="max-w-2xl flex flex-col items-start text-left gap-2 md:gap-3">
              <span className="text-[10px] md:text-xs font-bold tracking-widest bg-amber-500 text-slate-900 px-2.5 py-0.5 rounded-full shadow-sm">
                {slide.tag}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mt-1 leading-tight">
                {slide.title}
              </h2>
              <h3 className="text-sm sm:text-base md:text-lg font-medium text-white/90">
                {slide.subtitle}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-white/80 line-clamp-3 leading-relaxed mt-1">
                {slide.description}
              </p>
              
              <div className="flex gap-3 mt-3">
                <a
                  href="#active-tenders"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold px-4 py-2 rounded transition-colors shadow"
                >
                  Explore Tenders
                </a>
                <a
                  href="#about-us"
                  className="bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold px-4 py-2 rounded transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Controls */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
          title="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/>
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer"
          title="Next slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>
          </svg>
        </button>

        {/* Dots indicators & Play/Pause controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-black/30 px-4 py-1.5 rounded-full border border-white/10">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white hover:text-amber-400 transition-colors cursor-pointer"
            title={isPlaying ? 'Pause Auto-rotation' : 'Play Auto-rotation'}
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          
          <span className="w-px h-3 bg-white/20" />

          {/* Dots */}
          <div className="flex gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'bg-amber-400 w-4' : 'bg-white/40 hover:bg-white/70'}`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
