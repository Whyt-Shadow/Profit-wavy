import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, CreditCard, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { auth } from '../lib/firebase';

import { useNotification } from './NotificationProvider';

export default function WithdrawModal({ isOpen, onClose, balance, onWithdrawSuccess, referralCount, hasCompletedTerm, level }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('momo');
  const [details, setDetails] = useState('');
  const [accountName, setAccountName] = useState('');
  const [network, setNetwork] = useState('MTN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasAttempted, setHasAttempted] = useState(false);
  const { showNotification } = useNotification();

  const referralLock = referralCount < 5;

  const handleWithdraw = async () => {
    setHasAttempted(true);
    setError('');
    const withdrawAmount = parseInt(amount);
    
    // 1. Check Amount & Balance FIRST
    if (!withdrawAmount || withdrawAmount < 100) {
      setError("Minimum withdrawal is GH₵ 100");
      return;
    }

    if (balance < 100) {
      setError("Insufficient amount");
      return;
    }

    if (withdrawAmount > balance) {
      setError("Insufficient balance");
      return;
    }

    // 2. Check Referral Lock ONLY after balance check passes
    if (referralLock) {
      setError("Institutional Protocol: You are required to refer 5 active members to unlock withdrawals.");
      return;
    }

    if (!details || (method === 'momo' && !accountName)) {
      setError(`Please enter your ${method === 'momo' ? 'MoMo number and Account Name' : 'Card details'}`);
      return;
    }
    
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Authentication stale. Please sign in again.");

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          type: 'withdrawal',
          amount: withdrawAmount,
          planName: `Withdrawal to ${method.toUpperCase()} (${network})`,
          metadata: {
            method,
            details,
            accountName,
            network: method === 'momo' ? network : null
          }
        }),
      });

      if (response.ok) {
        showNotification("Withdrawal Protocol Initialized. A confirmation email has been sent, and our team will process your request manually.", "success");
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
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black font-display uppercase italic tracking-tight">Withdraw Funds</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {hasAttempted && referralLock && balance >= 100 && (parseInt(amount) || 0) >= 100 && (parseInt(amount) || 0) <= balance && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Referral Link Required</p>
                  <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                    Institutional security mandates 5 active referrals to unlock funds. 
                    Current progress: <span className="text-amber-500 font-bold">{referralCount}/5</span> verified referrals.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6 relative z-10">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Standing</span>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-black uppercase text-blue-500">
                      {level === 5 ? 'LEGACY ARCHITECT' : 
                       level === 4 ? 'ELITE INVESTOR' : 
                       level === 3 ? 'PREMIUM TRADER' : 
                       level === 2 ? 'SILVER ASSOCIATE' : 
                       level === 1 ? 'BRONZE MEMBER' : 'STANDARD TIER'}
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Available Balance</span>
                  <span className="text-xl font-black font-display text-blue-500">GH₵ {(balance || 0).toLocaleString()}</span>
                </div>
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

              {method === 'momo' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 ml-1 uppercase tracking-widest">Network</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['MTN', 'VOD', 'ATL'].map((net) => (
                        <button
                          key={net}
                          onClick={() => setNetwork(net)}
                          className={`py-2 px-1 rounded-xl border text-[10px] font-black transition-all ${
                            network === net ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-gray-500'
                          }`}
                        >
                          {net === 'VOD' ? 'Telecel/Vod' : net}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="Enter exactly as shown on MOMO"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>
              )}

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
