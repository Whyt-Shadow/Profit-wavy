import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { auth } from '../lib/firebase';

export default function Payment({ plan, onBack, onSuccess }) {
  const [loading, setLoading] = useState(false);
  
  // Extract numeric value from "GH₵ 100"
  const amountInGhc = parseInt(plan.min.replace(/[^\d]/g, ''));
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
          if (auth.currentUser) {
            // 1. Record the transaction in MongoDB
            await fetch('/api/transactions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: auth.currentUser.uid,
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
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold tracking-tight">Complete Investment</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Payment Method</h3>
            <div className="space-y-4">
              <div className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-blue-500 bg-blue-50/50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-blue-500 text-white">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700">Mobile Money / Card</span>
                    <span className="text-xs text-gray-500 font-medium">Powered by Paystack</span>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Payment Action */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Confirm Investment</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Amount to Invest</label>
                <div className="w-full bg-gray-50 rounded-xl py-3 px-4 font-bold text-lg text-gray-700">
                  {plan.min}
                </div>
              </div>
              <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[#1e293b] text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Pay with Paystack</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Plan Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Selected Plan</span>
                <span className="font-bold">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Daily Returns</span>
                <span className="text-green-400 font-bold">{plan.returns}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-gray-400">Total Payable</span>
                <span className="text-2xl font-bold">{plan.min}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Your transaction is processed securely via Paystack. Supports MTN, Telecel, and AT Mobile Money.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
