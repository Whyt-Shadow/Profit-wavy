import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { auth } from '../lib/firebase';

export default function DepositModal({ isOpen, onClose, onDepositSuccess }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const config = {
    reference: (new Date()).getTime().toString(),
    email: auth.currentUser?.email || 'customer@example.com',
    amount: (parseInt(amount) || 0) * 100,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key_here',
    currency: 'GHS',
    channels: ['mobile_money', 'card'],
  };

  const initializePayment = usePaystackPayment(config);

  const handleDeposit = () => {
    if (!amount || parseInt(amount) < 100) {
      alert("Minimum deposit is GH₵ 100");
      return;
    }
    
    setLoading(true);
    initializePayment({
      onSuccess: async (reference) => {
        try {
          await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: auth.currentUser.uid,
              type: 'deposit',
              amount: parseInt(amount),
              planName: 'Wallet Deposit',
            }),
          });
          onDepositSuccess();
          onClose();
        } catch (error) {
          console.error('Deposit error:', error);
        } finally {
          setLoading(false);
        }
      },
      onClose: () => {
        setLoading(false);
      }
    });
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
              <h2 className="text-2xl font-black font-display uppercase italic tracking-tight">Deposit Funds</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Amount (GH₵)</label>
                <input
                  type="number"
                  placeholder="Min. 100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xl font-black focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                <p className="text-[10px] text-blue-200/60 leading-relaxed font-medium uppercase tracking-wider">
                  Securely processed by Paystack. Funds are credited instantly to your wallet.
                </p>
              </div>

              <button
                onClick={handleDeposit}
                disabled={loading || !amount}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-xs uppercase tracking-[0.3em] hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Initialize Deposit
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
