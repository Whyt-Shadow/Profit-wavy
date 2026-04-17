import { motion } from 'motion/react';
import { Check, TrendingUp, Zap, Star, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Products({ onInvest }) {
  const plans = [
    {
      id: 'starter',
      name: 'Starter Plan',
      min: 'GH₵ 50',
      returns: 'GH₵ 12.5',
      assets: 'Agricultural Commodities',
      image: 'https://picsum.photos/seed/agriculture/600/400',
      popular: true,
      color: 'from-blue-600 to-blue-700',
      icon: Zap
    },
    {
      id: 'silver',
      name: 'Silver Plan',
      min: 'GH₵ 300',
      returns: 'GH₵ 75',
      assets: 'Fintech Emerging Markets',
      image: 'https://picsum.photos/seed/fintech/600/400',
      popular: false,
      color: 'from-slate-700 to-slate-800',
      icon: Star
    },
    {
      id: 'gold',
      name: 'Gold Plan',
      min: 'GH₵ 500',
      returns: 'GH₵ 125',
      assets: 'Sustainable Energy',
      image: 'https://picsum.photos/seed/energy/600/400',
      popular: false,
      color: 'from-slate-700 to-slate-800',
      icon: ShieldCheck
    },
    {
      id: 'platinum',
      name: 'Platinum Plan',
      min: 'GH₵ 800',
      returns: 'GH₵ 200',
      assets: 'AI & Cloud Computing',
      image: 'https://picsum.photos/seed/ai-tech/600/400',
      popular: false,
      color: 'from-slate-700 to-slate-800',
      icon: Zap
    },
    {
      id: 'diamond',
      name: 'Diamond Plan',
      min: 'GH₵ 1000',
      returns: 'GH₵ 250',
      assets: 'Real Estate Development',
      image: 'https://picsum.photos/seed/realestate/600/400',
      popular: false,
      color: 'from-slate-700 to-slate-800',
      icon: TrendingUp
    },
    {
      id: 'executive',
      name: 'Executive Plan',
      min: 'GH₵ 1500',
      returns: 'GH₵ 375',
      assets: 'Luxury Hospitality',
      image: 'https://picsum.photos/seed/luxury-hotel/600/400',
      popular: false,
      color: 'from-slate-700 to-slate-800',
      icon: Star
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      min: 'GH₵ 2000',
      returns: 'GH₵ 500',
      assets: 'Global Blue Chips',
      image: 'https://picsum.photos/seed/bluechip/600/400',
      popular: false,
      color: 'from-slate-700 to-slate-800',
      icon: ShieldCheck
    },
    {
      id: 'elite',
      name: 'Elite Plan',
      min: 'GH₵ 3000',
      returns: 'GH₵ 750',
      assets: 'Venture Capital',
      image: 'https://picsum.photos/seed/venture/600/400',
      popular: false,
      color: 'from-slate-700 to-slate-800',
      icon: Zap
    },
    {
      id: 'legacy',
      name: 'Legacy Plan',
      min: 'GH₵ 5000',
      returns: 'GH₵ 1250',
      assets: 'Multi-generational Wealth Fund',
      image: 'https://picsum.photos/seed/wealth/600/400',
      popular: false,
      color: 'from-slate-700 to-slate-800',
      icon: TrendingUp
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
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
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -45, 0],
            x: [0, -50, 0],
            y: [0, 100, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 blur-[120px]" 
        />
      </div>

      <div className="flex flex-col items-center space-y-12 md:space-y-16 pb-32 pt-12 px-4 max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-4 md:space-y-6">
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="h-px w-8 md:w-12 bg-blue-600" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-blue-500">Capital Deployment</span>
            <div className="h-px w-8 md:w-12 bg-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic font-display">
            Investment <span className="text-gray-600">Waves.</span>
          </h1>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl max-w-2xl mx-auto">
            <p className="text-gray-400 font-medium text-xs md:text-lg leading-relaxed">
              Select an institutional-grade wave plan tailored to your capital growth objectives.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 w-full">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -10 }}
              className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] overflow-hidden relative flex flex-col group shadow-2xl shadow-black/50"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Header */}
              <div className={`bg-gradient-to-br ${plan.color} p-10 text-center relative overflow-hidden`}>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <plan.icon className="w-12 h-12 text-white/20 absolute -top-2 -right-2 rotate-12 group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-white text-3xl font-black font-display uppercase italic relative z-10">{plan.name}</h3>
                {plan.popular && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-xl z-20 animate-pulse">
                    Popular
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-10 flex flex-col items-center space-y-8 flex-1 relative z-10">
                {/* Product Image */}
                <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 group-hover:border-blue-500/30 transition-all duration-500">
                  <img 
                    src={plan.image} 
                    alt={plan.assets} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="bg-white/5 w-full py-6 rounded-[32px] text-center border border-white/5 group-hover:border-blue-500/30 transition-colors">
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Minimum Stake</p>
                  <p className="text-white text-4xl font-black font-display italic tracking-tighter">{plan.min}</p>
                </div>

                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Daily ROI</span>
                    <span className="text-green-500 font-black font-display text-xl">{plan.returns}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Investable Product</span>
                    <span className="text-blue-400 font-bold text-[10px] uppercase text-right">{plan.assets}</span>
                  </div>
                  {plan.duration && (
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                      <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Duration</span>
                      <span className="text-blue-400 font-black font-display text-sm">{plan.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
                    <Check className="w-5 h-5 text-blue-500 stroke-[3px]" />
                    <span>GH₵ 5 Registration Bonus</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-400 font-bold text-xs uppercase tracking-widest">
                    <Check className="w-5 h-5 text-blue-500 stroke-[3px]" />
                    <span>5% Referral Reward</span>
                  </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("CLICK: Deploying capital for:", plan.name);
                    onInvest(plan);
                  }}
                  className="w-full mt-auto bg-white text-black font-black py-5 rounded-[24px] text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-[0.95] flex items-center justify-center gap-3 group/btn cursor-pointer relative z-50 pointer-events-auto"
                >
                  Deploy Capital
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
