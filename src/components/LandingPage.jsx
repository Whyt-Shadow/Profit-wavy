import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Users, 
  Mail,
  ChevronRight,
  Star,
  ArrowUpRight,
  Lock,
  Smartphone,
  PieChart
} from 'lucide-react';

import Ticker from './Ticker';
import Footer from './Footer';

export default function LandingPage({ onGetStarted }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
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
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[150px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -45, 0],
            x: [0, -50, 0],
            y: [0, 100, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -100, 0]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] left-[10%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[180px]" 
        />
      </div>

      {/* Live Ticker */}
      <Ticker />

      {/* Header */}
      <header className="fixed top-8 left-0 right-0 z-50 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] px-8 h-20 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-blue-600 p-2 rounded-2xl group-hover:rotate-[360deg] transition-transform duration-700 shadow-lg shadow-blue-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-2xl tracking-tighter uppercase italic font-display">Profit</span>
                <span className="font-black text-2xl tracking-tighter uppercase italic -mt-1 font-display">Wavy</span>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
              <a href="#features" className="hover:text-white transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#plans" className="hover:text-white transition-colors relative group">
                Plans
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
              <a href="#security" className="hover:text-white transition-colors relative group">
                Security
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <button 
                onClick={onGetStarted}
                className="text-white font-black text-xs uppercase tracking-widest hover:text-blue-400 transition-colors hidden sm:block"
              >
                Login
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-white text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-[0.95] shadow-xl shadow-white/5"
              >
                Join the Wave
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-64 pb-32 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="flex flex-col items-center text-center space-y-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050505] bg-gray-800 overflow-hidden">
                    <img src={`https://picsum.photos/seed/face${i}/50/50`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
                Trusted by 50,000+ Global Investors
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-[10rem] font-black tracking-tighter leading-[0.85] font-display uppercase italic"
            >
              Wealth <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-400 to-blue-600 bg-[length:200%_auto] animate-[gradient_8s_linear_infinite]">Redefined.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-xl text-gray-400 max-w-2xl leading-relaxed font-medium"
            >
              Profit Wavy isn't just a platform. It's an institutional-grade ecosystem designed to accelerate your capital through smart, automated waves.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 pt-8"
            >
              <button 
                onClick={onGetStarted}
                className="group relative bg-blue-600 text-white px-12 py-6 rounded-[32px] font-black text-xl hover:bg-blue-700 transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Start Your Wave
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
              </button>
              <button className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-12 py-6 rounded-[32px] font-black text-xl hover:bg-white/10 transition-all active:scale-95">
                View Plans
              </button>
            </motion.div>
          </div>
        </div>

        {/* Parallax Floating Elements */}
        <motion.div style={{ y: y1 }} className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] -z-10" />
        <motion.div style={{ y: y2 }} className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
      </section>

      {/* Stats Ticker */}
      <div className="py-20 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: "Total Assets", value: "GH₵ 25M+", icon: BarChart3 },
              { label: "Active Waves", value: "12,400+", icon: Zap },
              { label: "Daily Payouts", value: "GH₵ 150k", icon: ArrowUpRight },
              { label: "Security Score", value: "99.9%", icon: ShieldCheck },
            ].map((stat, i) => (
              <div key={i} className="space-y-2 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-blue-500 mb-2">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">{stat.label}</span>
                </div>
                <p className="text-4xl font-black font-display">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bento Grid Features - Redesigned */}
      <section id="features" className="py-40 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-24 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px w-20 bg-blue-600" />
              <span className="text-xs font-black uppercase tracking-[0.5em] text-blue-500">The Ecosystem</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic font-display">
              Built for <br /> <span className="text-gray-600">Dominance.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Main Feature */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-12 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 space-y-8">
                  <div className="bg-blue-600 w-20 h-20 rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-500/40">
                    <PieChart className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-4xl font-black font-display uppercase italic">Smart Wave Allocation</h3>
                  <p className="text-xl text-gray-400 leading-relaxed font-medium">
                    Our proprietary algorithm dynamically shifts your capital into the highest performing waves, ensuring maximum ROI while maintaining strict risk parameters.
                  </p>
                  <button className="flex items-center gap-3 text-blue-500 font-black text-xs uppercase tracking-widest group/btn">
                    Explore Strategy
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </button>
                </div>
                <div className="w-full md:w-64 h-64 bg-black/40 rounded-[32px] border border-white/5 p-6 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-dashed border-blue-600/30 rounded-full"
                    />
                    <div className="absolute inset-4 border-4 border-blue-600 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-12 h-12 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Side Feature */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-blue-600 rounded-[48px] p-12 flex flex-col justify-between text-white shadow-2xl shadow-blue-600/20 group"
            >
              <div className="space-y-8">
                <div className="bg-white/20 backdrop-blur-md w-16 h-16 rounded-[20px] flex items-center justify-center border border-white/20">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black font-display uppercase italic leading-tight">Vault-Grade Security</h3>
                <p className="text-blue-100 font-medium leading-relaxed">
                  Multi-sig wallets, 2FA, and institutional custody. Your wealth is locked in a digital fortress.
                </p>
              </div>
              <div className="pt-8 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Secure / 02</span>
                <ShieldCheck className="w-6 h-6 opacity-50" />
              </div>
            </motion.div>

            {/* Bottom Row */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-10 flex flex-col justify-between group"
            >
              <div className="space-y-6">
                <div className="bg-orange-500 w-14 h-14 rounded-[18px] flex items-center justify-center shadow-xl shadow-orange-500/20">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-black font-display uppercase italic">Instant Mobile Payouts</h3>
                <p className="text-gray-400 font-medium leading-relaxed">
                  Withdraw your returns directly to your mobile wallet in seconds. No delays, just liquidity.
                </p>
              </div>
              <div className="pt-8 flex items-center gap-2">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="h-full w-1/3 bg-orange-500"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-8 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[48px] p-12 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
              <div className="relative z-10 flex-1 space-y-6">
                <h3 className="text-4xl font-black font-display uppercase italic text-white">AI-Driven Insights</h3>
                <p className="text-indigo-100 text-lg font-medium leading-relaxed">
                  Our Gemini-powered engine analyzes global markets 24/7 to provide you with actionable insights and predictive performance data.
                </p>
                <div className="flex gap-4">
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Predictive</div>
                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Real-time</div>
                </div>
              </div>
              <div className="relative w-48 h-48 flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 bg-white/20 rounded-full blur-3xl"
                />
                <Zap className="w-20 h-20 text-white relative z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works - Editorial Style */}
      <section className="py-40 bg-white text-black relative overflow-hidden">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-6">
                <span className="text-xs font-black uppercase tracking-[0.5em] text-blue-600">The Blueprint</span>
                <h2 className="text-7xl font-black tracking-tighter uppercase italic font-display leading-[0.85]">
                  How to <br /> Catch the <br /> <span className="text-blue-600">Wave.</span>
                </h2>
              </div>
              <p className="text-xl text-gray-500 font-medium leading-relaxed">
                We've stripped away the complexity of traditional investing. Three steps to financial dominance.
              </p>
              <button 
                onClick={onGetStarted}
                className="bg-black text-white px-10 py-5 rounded-[24px] font-black text-lg uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
              >
                Get Started Now
              </button>
            </div>

            <div className="lg:col-span-7 space-y-12">
              {[
                { step: "01", title: "Deploy Capital", desc: "Choose your wave plan and fund your account via secure mobile money or card integration." },
                { step: "02", title: "Automated Growth", desc: "Our ecosystem allocates your capital into high-yield assets, generating daily returns automatically." },
                { step: "03", title: "Instant Liquidity", desc: "Withdraw your profits at any time. Your wealth is always accessible, always moving." },
              ].map((item, i) => (
                <div key={i} className="group flex gap-12 items-start border-b border-gray-100 pb-12 last:border-0 transition-all hover:pl-4">
                  <span className="text-6xl font-black font-display text-gray-100 group-hover:text-blue-600 transition-colors duration-500">{item.step}</span>
                  <div className="space-y-4 pt-2">
                    <h3 className="text-3xl font-black font-display uppercase italic">{item.title}</h3>
                    <p className="text-lg text-gray-500 font-medium leading-relaxed max-w-md">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Premium Grid */}
      <section className="py-40 px-6 bg-[#050505]">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-32 space-y-6">
            <span className="text-xs font-black uppercase tracking-[0.5em] text-blue-500">Wall of Dominance</span>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic font-display">
              The Wave <span className="text-gray-600">Effect.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Kwame Mensah",
                role: "Tech Founder",
                content: "Profit Wavy is the first platform that actually delivers on the promise of automated wealth. The daily returns are clockwork.",
                avatar: "https://picsum.photos/seed/kwame/100/100"
              },
              {
                name: "Ama Serwaa",
                role: "Portfolio Manager",
                content: "The security infrastructure is what sold me. Knowing my capital is in a digital vault while it grows is everything.",
                avatar: "https://picsum.photos/seed/ama/100/100"
              },
              {
                name: "David Osei",
                role: "Real Estate Mogul",
                content: "Mobile money integration makes this the most accessible high-yield platform in Africa. Pure genius.",
                avatar: "https://picsum.photos/seed/david/100/100"
              }
            ].map((t, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white/5 backdrop-blur-3xl border border-white/10 p-12 rounded-[48px] space-y-8 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                  <Star className="w-12 h-12 text-blue-500" />
                </div>
                <p className="text-xl text-gray-300 font-medium italic leading-relaxed relative z-10">"{t.content}"</p>
                <div className="flex items-center gap-4 relative z-10">
                  <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10" referrerPolicy="no-referrer" />
                  <div>
                    <p className="font-black text-lg font-display uppercase italic">{t.name}</p>
                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Brutalist Style */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-blue-600 rounded-[64px] p-12 lg:p-32 text-center relative overflow-hidden shadow-[0_50px_100px_rgba(37,99,235,0.4)]"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10 space-y-12">
              <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase italic font-display leading-[0.8]">
                Don't Miss <br /> The Wave.
              </h2>
              <p className="text-2xl text-blue-100 font-medium max-w-2xl mx-auto leading-relaxed">
                Join 50,000+ investors who are already riding the wave to financial dominance. Your future self is waiting.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button 
                  onClick={onGetStarted}
                  className="w-full sm:w-auto bg-white text-blue-600 px-16 py-8 rounded-[32px] font-black text-2xl uppercase tracking-widest hover:bg-blue-50 transition-all shadow-2xl active:scale-95"
                >
                  Join Now
                </button>
                <div className="flex flex-col items-center sm:items-start text-blue-200">
                  <div className="flex -space-x-2 mb-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">500+ Joined Today</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Dark Luxury */}
      <Footer />
    </div>
  );
}
