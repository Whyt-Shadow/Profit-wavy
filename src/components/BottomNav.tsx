import { Home, Box, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'products', label: 'Product', icon: Box },
    { id: 'me', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#050505]/80 backdrop-blur-2xl border-t border-white/5 px-8 py-5 z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-2 transition-all relative group",
                isActive ? "text-blue-500" : "text-gray-500 hover:text-gray-300"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -top-3 w-12 h-1 bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]"
                />
              )}
              <Icon className={cn("w-7 h-7 transition-transform group-hover:scale-110", isActive && "stroke-[2.5px]")} />
              <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] font-display italic", isActive ? "opacity-100" : "opacity-40")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
