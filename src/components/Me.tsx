import { User } from 'firebase/auth';
import { motion } from 'motion/react';
import { Settings, Shield, Bell, CreditCard, HelpCircle, ChevronRight, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

export default function Me({ user }: { user: User }) {
  const handleSignOut = () => signOut(auth);

  const menuItems = [
    { icon: Settings, label: 'Account Settings', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Shield, label: 'Security & Privacy', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Bell, label: 'Notifications', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: CreditCard, label: 'Payment Methods', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: HelpCircle, label: 'Support & Help', color: 'text-gray-600', bg: 'bg-gray-50' },
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
      </div>

      <div className="space-y-12 pb-32 pt-12 px-4 max-w-3xl mx-auto relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative group">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border-2 border-dashed border-blue-600/30 rounded-full"
            />
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Me'} 
                className="w-32 h-32 rounded-[40px] border-4 border-white/10 shadow-2xl relative z-10 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-32 h-32 rounded-[40px] bg-blue-600 flex items-center justify-center text-white text-5xl font-black border-4 border-white/10 shadow-2xl relative z-10 font-display italic">
                {user.displayName?.[0] || user.email?.[0]}
              </div>
            )}
            <div className="absolute bottom-2 right-2 bg-green-500 w-8 h-8 rounded-2xl border-4 border-[#050505] z-20 shadow-lg" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic font-display">{user.displayName || 'Investor'}</h2>
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{user.email}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] overflow-hidden shadow-2xl">
          {menuItems.map((item, index) => (
            <button 
              key={item.label}
              className={`w-full flex items-center justify-between p-8 hover:bg-white/[0.05] transition-all group ${
                index !== menuItems.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${item.bg.replace('bg-', 'bg-opacity-20 bg-')}`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <span className="font-black text-lg font-display uppercase italic tracking-tight text-gray-200 group-hover:text-white transition-colors">{item.label}</span>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
            </button>
          ))}
        </div>

        <button 
          onClick={handleSignOut}
          className="w-full bg-red-500/10 text-red-500 border border-red-500/20 font-black py-6 rounded-[32px] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all group shadow-xl shadow-red-500/5 active:scale-[0.98] uppercase tracking-[0.3em] text-xs"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Terminate Session
        </button>

        <div className="text-center">
          <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]">Profit Wavy v2.4.0 • Institutional Grade</p>
        </div>
      </div>
    </div>
  );
}
