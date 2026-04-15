import React from 'react';
import { motion } from 'motion/react';

const tickerItems = [
  
];

export default function Ticker() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-blue-600 py-2 overflow-hidden border-b border-white/10">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-12 items-center"
      >
        {[...tickerItems, ...tickerItems].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
