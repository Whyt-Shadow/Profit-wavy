import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, CreditCard, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { auth } from '../lib/firebase';

export default function WithdrawModal({ isOpen, onClose, balance, onWithdrawSuccess }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('momo');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = async () => {
    setError('');
    const withdrawAmount = parseInt(amount);
    
    if (!withdrawAmount || withdrawAmount < 100) {
      setError("Minimum withdrawal is GH₵ 100");
      return;
    }

    if (withdrawAmount > balance) {
      setError("Insufficient balance");
      return;
    }

    if (!details) {
      setError(`Please enter your ${method === 'momo' ? 'MoMo number' : 'Card details'}`);
      return;
    }
    
    setLoading(true);
    try {
      // In a real app, this would trigger a payout API
      // For this demo, we'll just record a transaction and update balance
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          type: 'withdrawal', // We'll need to update the enum in the model if it doesn't exist
          amount: withdrawAmount,
          planName: `Withdrawal to ${method.toUpperCase()}`,
        }),
      });

      if (response.ok) {
        onWithdrawSuccess();
        onClose();
      } else {
        setError("Failed to process withdrawal. Please try again.");
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      setError("An error occurred. Please try again.");
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
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black font-display uppercase italic tracking-tight">Withdraw Funds</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Available Balance</span>
                <span className="text-xl font-black font-display text-blue-500">GH₵ {balance.toLocaleString()}</span>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Amount (GH₵)</label>
                <input
                  type="number"
                  placeholder="Min. 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xl font-black focus:ring-2 focus:ring-red-500 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setMethod('momo')}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                    method === 'momo' ? 'bg-blue-600/10 border-blue-500/20' : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <Smartphone className={`w-6 h-6 ${method === 'momo' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${method === 'momo' ? 'text-blue-400' : 'text-gray-500'}`}>MoMo</span>
                </button>
                <button 
                  onClick={() => setMethod('card')}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                    method === 'card' ? 'bg-blue-600/10 border-blue-500/20' : 'bg-white/5 border-white/10 opacity-50'
                  }`}
                >
                  <CreditCard className={`w-6 h-6 ${method === 'card' ? 'text-blue-500' : 'text-gray-400'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${method === 'card' ? 'text-blue-400' : 'text-gray-500'}`}>Card</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">
                  {method === 'momo' ? 'Mobile Money Number' : 'Card Number / Details'}
                </label>
                <input
                  type="text"
                  placeholder={method === 'momo' ? '024 XXX XXXX' : 'XXXX XXXX XXXX XXXX'}
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

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-gray-500 shrink-0" />
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium uppercase tracking-wider">
                  Withdrawals are processed within 24 hours to your selected destination.
                </p>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={loading || !amount || !details}
                className="w-full bg-white text-black font-black py-5 rounded-2xl text-xs uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    Request Withdrawal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
