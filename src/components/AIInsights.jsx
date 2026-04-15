import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AIInsights({ stats }) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const prompt = `As an institutional financial advisor, provide a brief, professional analysis of this investment profile: Balance: GH₵ ${stats.balance}, Invested: GH₵ ${stats.invested}, Returns: GH₵ ${stats.returns}. Focus on strategic growth and market positioning. Keep it under 80 words.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInsight(response.text || "Unable to generate insights at this time.");
    } catch (error) {
      console.error('AI error:', error);
      setInsight("Error connecting to AI advisor. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 blur-[100px] group-hover:bg-blue-600/10 transition-colors" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.4em]">AI Strategic Advisor</h3>
            </div>
          </div>
          <button 
            onClick={generateInsight}
            disabled={loading}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all disabled:opacity-50 group/btn"
          >
            <RefreshCw className={cn("w-5 h-5 text-blue-500", loading && "animate-spin")} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="h-3 bg-white/5 rounded-full w-full animate-pulse" />
              <div className="h-3 bg-white/5 rounded-full w-5/6 animate-pulse" />
              <div className="h-3 bg-white/5 rounded-full w-4/6 animate-pulse" />
            </motion.div>
          ) : insight ? (
            <motion.div
              key="insight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <p className="text-lg leading-relaxed text-gray-300 font-medium italic">
                "{insight}"
              </p>
              <div className="flex items-center gap-3 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                <TrendingUp className="w-4 h-4" />
                Strategic Alignment Confirmed
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 space-y-8"
            >
              <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-md mx-auto">
                Deploy our institutional AI engine to analyze your capital growth strategy and market positioning.
              </p>
              <button 
                onClick={generateInsight}
                className="bg-white text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
              >
                Generate Analysis
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-3 text-[10px] text-gray-600 uppercase tracking-[0.4em] font-black">
          <AlertCircle className="w-4 h-4 text-orange-500/50" />
          Institutional Advisory • Not Financial Advice
        </div>
      </div>
    </div>
  );
}
