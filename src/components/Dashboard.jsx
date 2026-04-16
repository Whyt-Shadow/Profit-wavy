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
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
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
  const [recentReturns, setRecentReturns] = useState([]);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [dbError, setDbError] = useState(null);

  const fetchData = async () => {
    if (!user?.uid) return;
    setDbError(null);
    try {
      // Fetch User Data from MongoDB
      const userRes = await fetch(`/api/users/${user.uid}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setTotalBalance(userData.balance + userData.totalReturns);
        setInvested(userData.totalInvested);
        setAvailableCash(userData.balance);
        setActiveReturns(userData.totalReturns);
      } else {
        const errorData = await userRes.json().catch(() => ({ error: 'Unknown server error' }));
        console.error("Server error fetching user:", errorData.error);
        if (userRes.status === 503) setDbError(errorData.error);
      }

      // Fetch Transactions from MongoDB
      const txRes = await fetch(`/api/transactions/${user.uid}`);
      if (txRes.ok) {
        const txData = await txRes.json();
        setRecentReturns(txData.map((tx) => ({
          id: tx._id,
          name: tx.planName || tx.type,
          amount: tx.amount,
          type: tx.type === 'investment' || tx.type === 'withdrawal' ? 'loss' : 'gain',
          date: new Date(tx.timestamp).toLocaleDateString()
        })));
      } else {
        const errorData = await txRes.json().catch(() => ({ error: 'Unknown server error' }));
        console.error("Server error fetching transactions:", errorData.error);
        if (txRes.status === 503) setDbError(errorData.error);
      }
    } catch (error) {
      console.error("Network error fetching data from MongoDB:", error);
      setDbError("Network error. Please check your connection.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Real-time refresh every 5s
    return () => clearInterval(interval);
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

        {availableCash === 5 && invested === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-2xl flex items-center gap-4 text-blue-500 mb-6"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">Welcome Reward</p>
              <p className="text-sm font-bold">You've received a GH₵ 5 registration bonus! Start your investment journey now.</p>
            </div>
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
          </div>
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-3xl self-start md:self-auto">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <p className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-widest">Market Status</p>
              <p className="text-xs md:text-sm font-black text-green-500 uppercase tracking-widest">Active Wave</p>
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
                <div className="flex items-center gap-2">
                  <p className="text-[10px] md:text-xs font-black text-blue-200 uppercase tracking-[0.3em]">Total Portfolio Value</p>
                  <div className="flex items-center gap-1 bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">
                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[6px] font-black text-green-400 uppercase tracking-widest">Live</span>
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
                alert("Generating institutional statement... Your report will be available for download in the Me section shortly.");
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

