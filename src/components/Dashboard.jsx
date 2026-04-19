import React, { useState, useEffect } from 'react';
import { formatCurrency, cn } from '../lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight,
  Plus,
  ArrowDownLeft,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  PieChart as PieChartIcon,
  Zap,
  X,
  Gift,
  Info,
  Activity,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNotification } from './NotificationProvider';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';

export default function Dashboard({ user, setActiveTab }) {
  const [totalBalance, setTotalBalance] = useState(0);
  const [invested, setInvested] = useState(0);
  const [availableCash, setAvailableCash] = useState(0);
  const [activeReturns, setActiveReturns] = useState(0);
  const [userData, setUserData] = useState(null);
  const [recentReturns, setRecentReturns] = useState([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [dbError, setDbError] = useState(null);
  const { showNotification } = useNotification();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    try {
      const isDismissed = window.safeLocalStorage.getItem(`welcome_dismissed_${user.uid}`);
      if (!isDismissed) {
        setShowWelcome(true);
      }
    } catch (e) {
      console.warn("localStorage restricted:", e);
      setShowWelcome(true); // Default to showing if we can't check
    }
  }, [user.uid]);

  const fetchData = async () => {
    try {
      if (!user?.uid) return;
      
      // Check system status first to see if DB is actually connected
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort("System status check timeout"), 5000);
        const statusRes = await fetch('/api/system/status', { signal: controller.signal });
        const text = await statusRes.text();
        clearTimeout(timeoutId);

        if (statusRes.status === 503 || text.includes("<title>Starting Server...</title>")) {
          setDbError("Institutional Terminal is re-synchronizing with the global matrix...");
          return;
        }

        if (statusRes.ok) {
          try {
            const status = JSON.parse(text);
            if (status.db === 'disconnected' || status.dbStatus === 'disconnected') {
              setDbError("Database signal lost. Re-establishing secure terminal link...");
              return;
            }
          } catch (e) {
             console.warn("Status parse failed - assuming terminal reboot");
          }
        }
      } catch (e) {
        if (e.message === 'Failed to fetch') {
           setDbError("Signal Link Dropout: Terminal is recalibrating signals...");
           return;
        }
        console.warn("System status check timed out or failed", e);
      }

      setDbError(null);
      
      const safeFetchJson = async (url, timeoutMs = 20000) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort("Terminal Signal Timeout"), timeoutMs);
        try {
          const res = await fetch(url, { signal: controller.signal });
          const text = await res.text();
          clearTimeout(timeoutId);

          if (!res.ok) {
            try {
              const errorData = JSON.parse(text);
              return { error: errorData.error || `HTTP ${res.status}`, status: res.status };
            } catch (e) {
              if (text.includes("<title>Starting Server...</title>")) {
                return { error: "Institutional Terminal is booting...", status: 503, isBooting: true };
              }
              return { error: "Protocol Error", status: res.status };
            }
          }

          try {
            const data = JSON.parse(text);
            return { data, status: 200 };
          } catch (e) {
            if (text.includes("<title>Starting Server...</title>")) {
              return { error: "Institutional Terminal is booting...", status: 503, isBooting: true };
            }
            return { error: "Data Format Signal Latency", status: 200 };
          }
        } catch (err) {
          clearTimeout(timeoutId);
          // Standardize timeout error for the catch block
          if (err.name === 'AbortError' || err.message === 'Fetch timeout' || err === 'Fetch timeout' || err.message === 'Terminal Signal Timeout') {
            throw new Error('Institutional Signal Timeout');
          }
          throw err;
        }
      };

      // Fetch User Data
      const userResult = await safeFetchJson(`/api/users/${user.uid}`);
      if (userResult.data) {
        const userData = userResult.data;
        const balance = Number(userData.balance) || 0;
        const totalReturns = Number(userData.totalReturns) || 0;
        const totalInvested = Number(userData.totalInvested) || 0;

        setTotalBalance(balance + totalReturns);
        setInvested(totalInvested);
        setAvailableCash(balance);
        setActiveReturns(totalReturns);
        setUserData(userData);
      } else if (userResult.isBooting) {
        setDbError("Establishing secure connection to Institutional Terminal...");
      } else if (userResult.error) {
        console.error("User fetch error:", userResult.error);
        if (userResult.status === 503) setDbError(userResult.error);
      }

      // Fetch Transactions
      const txResult = await safeFetchJson(`/api/transactions/${user.uid}`);
      if (txResult.data) {
        const txData = txResult.data;
        if (Array.isArray(txData)) {
          setRecentReturns(txData.slice(0, 10).map((tx) => ({
            id: tx._id || Math.random(),
            name: tx.planName || (tx.type === 'withdrawal' ? 'Withdrawal' : 'Transaction'),
            amount: Number(tx.amount) || 0,
            type: tx.type === 'investment' || tx.type === 'withdrawal' ? 'loss' : 'gain',
            date: new Date(tx.createdAt || tx.timestamp || Date.now()).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
          })));
        }
      }
    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'Institutional Signal Timeout' || error === 'User data fetch timeout' || error === 'Transaction fetch timeout') {
        console.warn("Dashboard Signal Latency: Terminal sync timed out, skipping this cycle.");
        if (recentReturns.length === 0) {
          setDbError("Institutional Signal Latency: Re-calibrating terminal link...");
        }
      } else if (error.message === 'Failed to fetch') {
        console.warn("Signal Link Dropout: Terminal is likely performing a secure reboot or recalibrating. Retrying in next cycle.");
        if (recentReturns.length === 0) {
          setDbError("Institutional Terminal is recalibrating signal... Please wait.");
        }
      } else {
        console.error("Network error fetching data from MongoDB:", error);
        if (recentReturns.length === 0) {
          setDbError("Network latency detected. Re-establishing secure terminal link...");
        }
      }
    }
  };

  useEffect(() => {
    // Small delay for the first fetch to ensure backend sync and DB link are established
    const initialTimeout = setTimeout(() => {
      fetchData().catch(err => console.error("DASHBOARD-INITIAL-FETCH-ERROR", err));
    }, 2500); 
    
    const interval = setInterval(() => {
      fetchData().catch(err => console.error("DASHBOARD-POLL-ERROR", err));
    }, 15000); // Institutional refresh every 15s to maintain stability
    
    // Listen for sync completion event from App.jsx
    const handleSync = () => {
      console.log("DASHBOARD: Sync event received, refreshing data...");
      fetchData().catch(err => console.error("DASHBOARD-SYNC-ERROR", err));
    };
    window.addEventListener('user-synced', handleSync);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
      window.removeEventListener('user-synced', handleSync);
    };
  }, [user.uid]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <DepositModal 
        isOpen={isDepositOpen} 
        onClose={() => setIsDepositOpen(false)} 
        onDepositSuccess={fetchData} 
      />
      <WithdrawModal 
        isOpen={isWithdrawOpen} 
        onClose={() => setIsWithdrawOpen(false)} 
        balance={availableCash}
        level={userData?.level || 0}
        referralCount={userData?.referralCount || 0}
        hasCompletedTerm={userData?.hasCompletedTerm || false}
        onWithdrawSuccess={fetchData} 
      />

      {/* Dynamic Mesh Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px]" 
        />
      </div>

      <div className="space-y-6 md:space-y-8 pb-32 pt-6 px-4 max-w-7xl mx-auto relative z-10">
        {dbError && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-500 mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">System Alert</p>
              <p className="text-sm font-bold">{dbError}</p>
            </div>
          </motion.div>
        )}

        {showWelcome && recentReturns.some(tx => tx.name === 'Registration Bonus') && invested === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-2xl flex items-center justify-between gap-4 text-blue-500 mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">Welcome Reward</p>
                <p className="text-sm font-bold">You've received a GH₵ 5 registration bonus! Start your investment journey now.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowWelcome(false);
                window.safeLocalStorage.setItem(`welcome_dismissed_${user.uid}`, 'true');
              }}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 md:w-12 bg-blue-600" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Institutional Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic font-display">
              Market <span className="text-gray-600">Overview.</span>
            </h1>
            <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest max-w-sm">
              Secured Capital Deployment & Institutional Yield Matrix
            </p>
          </div>
          <div className="flex items-center gap-4 self-start md:self-auto">
            <button 
              onClick={fetchData}
              className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-3xl hover:bg-white/10 transition-all group"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-active:rotate-180 transition-transform duration-500">
                <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">System Sync</p>
                <p className="text-xs md:text-sm font-black text-blue-500 uppercase tracking-widest">Refresh Data</p>
              </div>
            </button>
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-3xl">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <p className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">Market Status</p>
                <p className="text-xs md:text-sm font-black text-green-500 uppercase tracking-widest">Active Wave</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] md:rounded-[48px] p-6 md:p-10 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 md:mb-10">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[10px] md:text-xs font-black text-blue-200 uppercase tracking-[0.3em]">Total Portfolio Value</p>
                  <div className="flex items-center gap-1.5 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Active Terminal</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full border border-white/30 backdrop-blur-md shadow-lg shadow-black/20 group/level">
                    <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400 group-hover/level:scale-125 transition-transform" />
                    <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">
                      {userData?.level === 5 ? 'LEGACY TIER' : 
                       userData?.level === 4 ? 'ELITE TIER' : 
                       userData?.level === 3 ? 'PREMIUM TIER' : 
                       userData?.level === 2 ? 'SILVER TIER' : 
                       userData?.level === 1 ? 'BRONZE TIER' : 'STANDARD TIER'}
                    </span>
                  </div>
                </div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter font-display italic">{formatCurrency(totalBalance)}</h2>
              </div>
              <div className="bg-white/20 backdrop-blur-md p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white/20">
                <Wallet className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 md:gap-8 pt-6 md:pt-10 border-t border-white/10">
              <div className="space-y-1 md:space-y-2">
                <p className="text-[8px] md:text-[10px] text-blue-200 uppercase font-black tracking-[0.3em]">Invested Capital</p>
                <p className="text-xl md:text-3xl font-black font-display">{formatCurrency(invested)}</p>
              </div>
              <div className="space-y-1 md:space-y-2">
                <p className="text-[8px] md:text-[10px] text-blue-200 uppercase font-black tracking-[0.3em]">Liquid Assets</p>
                <p className="text-xl md:text-3xl font-black font-display">{formatCurrency(availableCash)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {/* Quick Action Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] md:rounded-[48px] p-8 md:p-10 flex flex-col justify-between group"
          >
            <div className="space-y-6 md:space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Quick Actions</h3>
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              </div>
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                {[
                  { label: 'Deposit', icon: Plus, color: 'bg-blue-600 text-white shadow-blue-500/20', onClick: () => setIsDepositOpen(true) },
                  { label: 'Withdraw', icon: ArrowDownLeft, color: 'bg-white/10 text-white border border-white/10', onClick: () => setIsWithdrawOpen(true) },
                  { label: 'Invest', icon: Zap, color: 'bg-white/10 text-white border border-white/10', onClick: () => setActiveTab('products') },
                ].map((action) => (
                  <button 
                    key={action.label}
                    onClick={action.onClick}
                    className="flex flex-col items-center gap-3 md:gap-4 group/btn"
                  >
                    <div className={cn("w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center transition-all group-hover/btn:scale-110 group-hover/btn:-rotate-6 shadow-xl", action.color)}>
                      <action.icon className="w-6 h-6 md:w-7 md:h-7" />
                    </div>
                    <span className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/btn:text-white transition-colors">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/5">
              <p className="text-[8px] md:text-[10px] text-gray-600 font-black uppercase tracking-widest">Secure Transactions via Paystack</p>
            </div>
          </motion.div>
        </div>

        {/* Operational Protocol & Level Schema */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-10 space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Investment Protocol</h3>
                <p className="text-xl font-black font-display uppercase italic">Capital <span className="text-gray-600">Deployment.</span></p>
              </div>
            </div>
            
            <div className="space-y-6">
              <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed">
                Profit Wavy operates as a high-frequency institutional terminal. When you stake capital into a <span className="text-blue-500 font-bold italic">"Product Wave"</span>, your funds are algorithmically allocated toward sector-specific liquidity pools. These "Waves" represent diversified portfolios that leverage market volatility spreads.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <span className="text-[10px] font-black text-blue-500">01</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Capital Aggregation</p>
                    <p className="text-xs text-gray-500 leading-relaxed">Upon initiation, your capital is aggregated into a master vault. This pooling mechanism allows Profit Wavy to execute large-scale trades that are typically inaccessible to individual retail participants.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <span className="text-[10px] font-black text-blue-500">02</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Selection Logic</p>
                    <p className="text-xs text-gray-500 leading-relaxed">Each wave (Starter, Basic, Pro, Elite, Legacy) corresponds to a different liquidity pool with varied risk-mitigation ratios. Higher-tier waves utilize sophisticated algorithmic hedging to manage larger capital footprints.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <span className="text-[10px] font-black text-blue-500">03</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">High-Frequency Execution</p>
                    <p className="text-xs text-gray-500 leading-relaxed">Over a localized 15-day cycle, our matrix optimizes positions across multiple exchanges. The system captures micro-volatility in the Ghanaian Cedi and international asset pairings to stabilize the 100% principal guarantee.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <span className="text-[10px] font-black text-blue-500">04</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-widest mb-1">Terminal Settlement</p>
                    <p className="text-xs text-gray-500 leading-relaxed">At the conclusion of the 15-day term, the system liquidates all positions held for your specific wave ticket. The platform then processes a synchronized payout of the initial capital plus the fixed institutional yield.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-[10px] text-gray-600 font-medium leading-relaxed italic">
                  Note: The Yield Matrix is strictly regulated by our internal liquidity compliance. Sub-standard verification levels (Level 0) may experience delayed signal processing compared to Institutional Architects (Level 5).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Asset Backing</p>
                <p className="text-xs font-bold text-white">Institutional Grade</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Term Duration</p>
                <p className="text-xs font-bold text-white">15-Day Cycles</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-10 space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/20">
                <Award className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Rank Schema</h3>
                <p className="text-xl font-black font-display uppercase italic">Tiered <span className="text-gray-600">Escalation.</span></p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed">
                Unlock higher-tier liquidity pools and priority verification by escalating your institutional standing. Progression is algorithmically determined by capital commitment and verification depth.
              </p>

              <div className="space-y-4">
                {[
                  { lvl: '0', name: 'Standard Terminal', benefit: 'Basic access to Starter waves (GH₵ 50-500). Standard terminal latency and periodic signal verification.' },
                  { lvl: '1-2', name: 'Bronze / Silver Associate', benefit: 'Unlocked GH₵ 3,000+ high-yield products. Accelerated payout windows and secondary liquidity access.' },
                  { lvl: '3-4', name: 'Premium / Elite Investor', benefit: 'VIP verification priority & GH₵ 10,000+ limits. Tailored institutional signals and zero-latency terminal links.' },
                  { lvl: '5', name: 'Legacy Architect', benefit: 'Ultimate institutional standing. Unlimited signal access, dedicated liquidity channels, and priority algorithmic placement.' },
                ].map((tier, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-all hover:border-blue-500/20">
                    <div className="mt-1 w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0 border border-blue-500/10 group-hover:bg-blue-600 transition-colors shadow-lg">
                      <span className="text-[12px] font-black text-white">{tier.lvl}</span>
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1">{tier.name}</p>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{tier.benefit}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest text-center">Protocol Escalation Manual v4.2</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] md:rounded-[48px] p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Transaction History</h3>
              <p className="text-2xl md:text-3xl font-black font-display uppercase italic">Recent <span className="text-gray-600">Activity.</span></p>
            </div>
            <button 
              onClick={() => {
                showNotification("Generating institutional statement... Check your 'Me' section shortly.", "success");
              }}
              className="text-[8px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] hover:text-white transition-colors border border-blue-500/30 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl hover:bg-blue-600 hover:border-blue-600 self-start md:self-auto"
            >
              Export Statement
            </button>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {recentReturns.map((item, i) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-[32px] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group"
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div className={cn(
                    "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg",
                    item.type === 'gain' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {item.type === 'gain' ? (
                      <ArrowUpRight className="w-5 h-5 md:w-7 md:h-7" />
                    ) : (
                      <TrendingDown className="w-5 h-5 md:w-7 md:h-7" />
                    )}
                  </div>
                  <div>
                    <p className="font-black text-sm md:text-lg font-display uppercase italic tracking-tight">{item.name}</p>
                    <p className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">{item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-lg md:text-2xl font-black font-display",
                    item.type === 'gain' ? "text-green-500" : "text-red-500"
                  )}>
                    {item.type === 'gain' ? '+' : '-'}{formatCurrency(item.amount)}
                  </p>
                  <p className="text-[8px] md:text-[10px] text-gray-600 font-black uppercase tracking-widest">Settled</p>
                </div>
              </motion.div>
            ))}
            {recentReturns.length === 0 && (
              <div className="py-12 md:py-20 text-center space-y-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="w-8 h-8 md:w-10 md:h-10 text-gray-700 animate-spin-slow" />
                </div>
                <p className="text-gray-500 font-black text-[8px] md:text-[10px] uppercase tracking-widest">No recent activity detected</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

