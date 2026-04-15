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
import AIInsights from './AIInsights';
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

  const fetchData = async () => {
    if (!user?.uid) return;
    try {
      // Fetch User Data from MongoDB
      const userRes = await fetch(`/api/users/${user.uid}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setTotalBalance(userData.balance + userData.totalReturns);
        setInvested(userData.totalInvested);
        setAvailableCash(userData.balance);
        setActiveReturns(userData.totalReturns);
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
      }
    } catch (error) {
      console.error("Failed to fetch data from MongoDB:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
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
                <p className="text-[10px] md:text-xs font-black text-blue-200 uppercase tracking-[0.3em]">Total Portfolio Value</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Quick Action Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] md:rounded-[48px] p-8 md:p-10 flex flex-col justify-between group"
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

          {/* Active Returns Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] md:rounded-[48px] p-8 md:p-10 group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 md:mb-10">
                <div className="space-y-1">
                  <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Performance Metrics</h3>
                  <p className="text-xs md:text-sm font-black text-green-500 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    +12.5% Growth
                  </p>
                </div>
                <div className="bg-green-500/20 backdrop-blur-md p-2 md:p-3 rounded-xl md:rounded-2xl border border-green-500/20">
                  <PieChartIcon className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="space-y-4 md:space-y-6">
                  <div>
                    <p className="text-4xl md:text-5xl font-black font-display italic tracking-tighter">{formatCurrency(activeReturns)}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 font-black uppercase tracking-widest mt-2">Unrealized Active Gains</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="w-full py-4 md:py-5 rounded-2xl md:rounded-3xl bg-white text-black text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 group/btn shadow-xl shadow-white/5"
                  >
                    View Portfolio Details
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </button>
                </div>

                <div className="h-32 md:h-48 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { v: 10 }, { v: 15 }, { v: 12 }, { v: 20 }, { v: 18 }, { v: 25 }, { v: 22 }, { v: 30 }
                    ]}>
                      <defs>
                        <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke="#10b981" fillOpacity={1} fill="url(#colorV)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8">
            <AIInsights stats={{ balance: availableCash, invested: invested, returns: activeReturns }} />
          </div>
          <div className="lg:col-span-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] md:rounded-[48px] p-8 md:p-10 flex flex-col justify-center items-center text-center space-y-4 md:space-y-6 group">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-blue-600/10 flex items-center justify-center border border-blue-600/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base md:text-lg font-black font-display uppercase italic">Institutional Trust</h3>
              <p className="text-[10px] md:text-xs text-gray-500 font-medium leading-relaxed">Your capital is protected by vault-grade security and multi-sig protocols.</p>
            </div>
          </div>
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
            <button className="text-[8px] md:text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] hover:text-white transition-colors border border-blue-500/30 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl hover:bg-blue-600 hover:border-blue-600 self-start md:self-auto">
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

