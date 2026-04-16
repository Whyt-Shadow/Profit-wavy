import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Notification({ message, type = 'success', onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[100]"
    >
      <div className={`p-4 rounded-3xl backdrop-blur-3xl border shadow-2xl flex items-center gap-4 ${
        type === 'success' 
          ? 'bg-blue-600/10 border-blue-500/20 text-blue-500' 
          : 'bg-red-500/10 border-red-500/20 text-red-500'
      }`}>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
          type === 'success' ? 'bg-blue-600/20' : 'bg-red-500/20'
        }`}>
          {type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
        </div>
        
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
            {type === 'success' ? 'System Success' : 'System Alert'}
          </p>
          <p className="text-sm font-bold leading-tight">{message}</p>
        </div>

        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
