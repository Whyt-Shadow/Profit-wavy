import React, { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Me from './components/Me';
import Payment from './components/Payment';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import SafeContainer from './components/SafeContainer';
import { NotificationProvider } from './components/NotificationProvider';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Capture referral code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem('referralCode', ref);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Sync with MongoDB
        try {
          const referralCode = localStorage.getItem('referralCode');
          const syncRes = await fetch('/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              referralCode: referralCode || undefined
            }),
          });
          if (syncRes.ok) {
            const syncedUser = await syncRes.json();
            console.log("User synced successfully with MongoDB:", syncedUser);
            // Dispatch event to notify dashboard
            window.dispatchEvent(new CustomEvent('user-synced'));
            // Clear referral code after successful sync
            localStorage.removeItem('referralCode');
          } else {
            const errorData = await syncRes.json().catch(() => ({ error: 'Unknown server error' }));
            console.error("Server error syncing user:", errorData.error);
          }
        } catch (error) {
          console.error("Network error syncing user with MongoDB:", error);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-2 border-dashed border-blue-600/30 rounded-full"
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
          </motion.div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (!user) return null;
    
    if (selectedPlan) {
      return (
        <Payment 
          plan={selectedPlan} 
          onBack={() => setSelectedPlan(null)} 
          onSuccess={() => {
            setSelectedPlan(null);
            setActiveTab('dashboard');
          }} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} setActiveTab={setActiveTab} />;
      case 'products':
        return <Products onInvest={(plan) => setSelectedPlan(plan)} />;
      case 'me':
        return <Me user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30">
        <AnimatePresence mode="wait">
          {!user ? (
            !showAuth ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <LandingPage onGetStarted={() => setShowAuth(true)} />
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
              >
                {/* Mesh Background for Auth */}
                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                  <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
                  <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
                </div>

                <button 
                  onClick={() => setShowAuth(false)}
                  className="absolute top-8 left-8 text-[10px] font-black text-gray-500 hover:text-white transition-all flex items-center gap-3 uppercase tracking-[0.3em] group z-50"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                    <motion.span animate={{ x: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>←</motion.span>
                  </div>
                  Exit to Terminal
                </button>
                <div className="w-full max-w-md relative z-10">
                  <Auth />
                </div>
              </motion.div>
            )
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col min-h-screen"
            >
              <Navbar user={user} setActiveTab={setActiveTab} />
              <main className="flex-1 container mx-auto px-4 pt-32 pb-32 max-w-7xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab + (selectedPlan ? '-payment' : '')}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <SafeContainer>
                      {renderContent()}
                    </SafeContainer>
                  </motion.div>
                </AnimatePresence>
              </main>
              <BottomNav 
                activeTab={activeTab} 
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setSelectedPlan(null);
                }} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NotificationProvider>
  );
}
