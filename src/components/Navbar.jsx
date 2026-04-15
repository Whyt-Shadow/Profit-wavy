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
              onClick={() => setShowMenu(!showMenu)}
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
              <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", showMenu && "rotate-180")} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-64 bg-[#0a0a0a] border border-white/10 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="space-y-2">
                      <div className="p-3 border-b border-white/5 mb-2">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Signed in as</p>
                        <p className="text-xs font-bold text-white truncate">{user.email}</p>
                      </div>
                      
                      <button 
                        onClick={() => handleMenuClick('me')}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <UserIcon className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">View Profile</span>
                      </button>
                      
                      <button 
                        onClick={() => {
                          alert("Settings are being optimized for your account tier.");
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Settings</span>
                      </button>

                      <button 
                        onClick={() => {
                          alert("Security vault is active and monitored 24/7.");
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white">Security</span>
                      </button>

                      <div className="h-px bg-white/5 my-2" />

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors group"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
