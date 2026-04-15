import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, TrendingUp, Shield, Settings, User as UserIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Navbar({ user, setActiveTab }) {
  const [showMenu, setShowMenu] = useState(false);
  const handleSignOut = () => signOut(auth);

  const handleMenuClick = (tab) => {
    if (tab) setActiveTab(tab);
    setShowMenu(false);
  };

  return (
    <nav className="fixed top-4 md:top-8 left-0 right-0 z-50 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-[#050505]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] md:rounded-[32px] px-4 md:px-8 h-16 md:h-20 flex items-center justify-between shadow-2xl">
          <div 
            onClick={() => handleMenuClick('dashboard')}
            className="flex items-center gap-2 md:gap-3 group cursor-pointer"
          >
            <div className="bg-blue-600 p-1.5 md:p-2 rounded-xl md:rounded-2xl group-hover:rotate-[360deg] transition-transform duration-700 shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-lg md:text-2xl tracking-tighter uppercase italic font-display">Profit</span>
              <span className="font-black text-lg md:text-2xl tracking-tighter uppercase italic -mt-1 font-display">Wavy</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 relative">
            <button 
              onClick={() => setActiveTab('me')}
              className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all group"
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl border border-white/10"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-blue-600 flex items-center justify-center text-[8px] md:text-[10px] font-black">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
              <div className="flex flex-col leading-none hidden sm:flex text-left">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  {user.displayName?.split(' ')[0]}
                </span>
                <span className="text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] mt-0.5">Verified</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
