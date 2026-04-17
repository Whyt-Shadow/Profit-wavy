import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { auth } from '../lib/firebase';

export default function Payment({ plan, onBack, onSuccess }) {
  const [loading, setLoading] = useState(false);
  
  // Extract numeric value from "GH₵ 100"
  const amountInGhc = parseInt((plan?.min || '0').replace(/[^\d]/g, ''));
  const amountInPesewas = amountInGhc * 100;

  const config = {
    reference: (new Date()).getTime().toString(),
    email: auth.currentUser?.email || 'customer@example.com',
    amount: amountInPesewas,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key_here',
    currency: 'GHS',
    channels: ['mobile_money', 'card'],
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = () => {
    setLoading(true);
    initializePayment({
      onSuccess: async (reference) => {
        console.log('Payment successful', reference);
        
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            // 1. Record the transaction in MongoDB
            await fetch('/api/transactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: currentUser.uid,
                type: 'investment',
                amount: amountInGhc,
                planName: plan.name,
              }),
            });
          }
        } catch (error) {
          console.error('Error updating records in MongoDB:', error);
        }

        setLoading(false);
        onSuccess();
      },
      onClose: () => {
        console.log('Payment closed');
        setLoading(false);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => {
            if (window.history.state?.selectedPlan) {
              window.history.back();
            } else {
              onBack();
            }
          }}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
        >
          <ArrowLeft className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
        </button>
        <h2 className="text-3xl font-black font-display uppercase italic tracking-tight">Deployment <span className="text-gray-600">Terminal.</span></h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Payment Methods */}
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Execution Protocol</h3>
            <div className="space-y-4">
              <div className="w-full flex items-center justify-between p-6 rounded-2xl border-2 border-blue-500 bg-blue-500/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-white uppercase italic tracking-tight">SafeGate Gateway</span>
                    <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Paystack Institutional</span>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Payment Action */}
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Capital Commitment</h3>
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider ml-1">Transfer Amount (GHS)</label>
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 font-black text-3xl text-white font-display italic tracking-tighter">
                  {plan.min}
                </div>
              </div>
              <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-white text-black font-black py-6 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 text-xs uppercase tracking-[0.3em]"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Confirm Payment</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Wave Summary</h3>
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center group/item">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/item:text-gray-300 transition-colors">Selected Plan</span>
                <span className="font-black font-display text-lg uppercase italic tracking-tight">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center group/item">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover/item:text-gray-300 transition-colors">Daily Returns</span>
                <span className="text-green-500 font-black font-display text-xl italic">{plan.returns}</span>
              </div>
              <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest pb-1">Total Stake</span>
                <span className="text-3xl font-black font-display text-blue-500 italic tracking-tighter">{plan.min}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-600/5 rounded-2xl p-6 border border-blue-600/10 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-500 leading-relaxed font-black uppercase tracking-widest">
              Institutional encryption active. Signal verified via Paystack Secure Nodes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
