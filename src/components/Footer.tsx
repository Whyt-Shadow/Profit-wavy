import React from 'react';
import { TrendingUp, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050505] text-white pt-40 pb-20 border-t border-white/5 relative z-10">
      <div className="container mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-2xl tracking-tighter uppercase italic font-display">Profit</span>
                <span className="font-black text-2xl tracking-tighter uppercase italic -mt-1 font-display">Wavy</span>
              </div>
            </div>
            <p className="text-gray-500 text-lg leading-relaxed font-medium">
              The institutional-grade ecosystem for the modern investor. Ride the wave to financial dominance.
            </p>
            <div className="flex items-center gap-6">
              {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                <a key={social} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all border border-white/5">
                  <Globe className="w-6 h-6 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.4em] text-blue-500 mb-10">Investment</h4>
            <ul className="space-y-6 text-gray-400 font-bold text-sm uppercase tracking-widest">
              <li><a href="#" className="hover:text-white transition-colors">Starter Wave</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Elite Wave</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Legacy Wave</a></li>
              <li><a href="#" className="hover:text-white transition-colors">ROI Calculator</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.4em] text-blue-500 mb-10">Ecosystem</h4>
            <ul className="space-y-6 text-gray-400 font-bold text-sm uppercase tracking-widest">
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Insights</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Referral</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.4em] text-blue-500 mb-10">Company</h4>
            <ul className="space-y-6 text-gray-400 font-bold text-sm uppercase tracking-widest">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Legal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em]">
            © 2026 Profit Wavy. Institutional Grade Wealth Management.
          </p>
          <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.5em] text-gray-600">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
