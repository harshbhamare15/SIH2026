'use client';

import React from 'react';

export default function FooterSimple() {
  return (
    <footer className="w-full bg-primary text-slate-300 py-10 px-6 mt-12 border-t border-white/10 text-xs font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left">
        
        {/* Col 1: About Us */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm">About Us</h4>
          <p className="leading-relaxed opacity-80">
            The Axiom Public Procurement Portal is a next-generation platform providing cryptographically sealed-bid access and timelock escrow for public procurements.
          </p>
        </div>

        {/* Col 2: Help & Support */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm">Help & Support</h4>
          <ul className="space-y-2 opacity-80">
            <li><a href="#helpdesk" className="hover:underline">Helpdesk</a></li>
            <li><a href="#manual" className="hover:underline">User Manual</a></li>
            <li><a href="#faq" className="hover:underline">FAQs</a></li>
            <li><a href="#contact" className="hover:underline">Contact Us</a></li>
          </ul>
        </div>

        {/* Col 3: Important Links */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm">Important Links</h4>
          <ul className="space-y-2 opacity-80">
            <li><a href="#terms" className="hover:underline">Terms & Conditions</a></li>
            <li><a href="#privacy" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#hyperlink" className="hover:underline">Hyperlinking Policy</a></li>
            <li><a href="#copyright" className="hover:underline">Copyright Policy</a></li>
          </ul>
        </div>

        {/* Col 4: Connect with Us */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-sm">Connect with Us</h4>
          <div className="flex gap-4 items-center">
            <a href="#twitter" className="text-slate-300 hover:text-white transition-colors" title="Twitter">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#youtube" className="text-slate-300 hover:text-white transition-colors" title="YouTube">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="#linkedin" className="text-slate-300 hover:text-white transition-colors" title="LinkedIn">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Bar copyright & simple links */}
      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 opacity-80">
        <p>© {new Date().getFullYear()} Government of India. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#sitemap" className="hover:underline">Site Map</a>
          <span>|</span>
          <a href="#accessibility" className="hover:underline">Accessibility Statement</a>
          <span>|</span>
          <a href="#feedback" className="hover:underline">Feedback</a>
        </div>
      </div>
    </footer>
  );
}
