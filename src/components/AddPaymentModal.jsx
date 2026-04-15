import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, CreditCard, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AddPaymentModal({ isOpen, onClose, onAdd }) {
  const [type, setType] = useState('momo');
  const [details, setDetails] = useState('');
  const [provider, setProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!details || !provider) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await onAdd({ type, details, provider, isDefault: false });
      onClose();
      // Reset form
      setDetails('');
      setProvider('');
    } catch (err) {
      setError('Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black font-display uppercase italic tracking-tight">Add Method</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setType('momo')}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                    type === 'momo' ? 'bg-blue-600/10 border-blue-500/20' : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <Smartphone className={`w-6 h-6 ${type === 'momo' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${type === 'momo' ? 'text-blue-400' : 'text-gray-500'}`}>MoMo</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setType('card')}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                    type === 'card' ? 'bg-blue-600/10 border-blue-500/20' : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <CreditCard className={`w-6 h-6 ${type === 'card' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${type === 'card' ? 'text-blue-400' : 'text-gray-500'}`}>Card</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">
                  {type === 'momo' ? 'Network Provider' : 'Card Issuer'}
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                >
                  <option value="" disabled className="bg-[#0a0a0a]">Select Provider</option>
                  {type === 'momo' ? (
                    <>
                      <option value="MTN" className="bg-[#0a0a0a]">MTN MoMo</option>
                      <option value="Telecel" className="bg-[#0a0a0a]">Telecel Cash</option>
                      <option value="AT" className="bg-[#0a0a0a]">AT Money</option>
                    </>
                  ) : (
                    <>
                      <option value="VISA" className="bg-[#0a0a0a]">VISA</option>
                      <option value="Mastercard" className="bg-[#0a0a0a]">Mastercard</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">
                  {type === 'momo' ? 'Mobile Number' : 'Card Number'}
                </label>
                <input
                  type="text"
                  placeholder={type === 'momo' ? '024 XXX XXXX' : 'XXXX XXXX XXXX XXXX'}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-black py-5 rounded-2xl text-xs uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Save Method
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
