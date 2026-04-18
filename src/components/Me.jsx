import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Shield, Bell, CreditCard, HelpCircle, ChevronRight, LogOut, ArrowLeft, User as UserIcon, Lock, Globe, Smartphone, Mail, CheckCircle2, Trash2, Plus, FileText, Zap } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import AddPaymentModal from './AddPaymentModal';
import TermsModal from './TermsModal';
import { useNotification } from './NotificationProvider';

export default function Me({ user: firebaseUser }) {
  const [subView, setSubView] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [termsTitle, setTermsTitle] = useState('Terms and Conditions');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ displayName: '', phone: '' });
  const { showNotification } = useNotification();

  // Sync sub-view with browser history
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.profileSubView !== undefined) {
        setSubView(event.state.profileSubView);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const savedState = window.history.state;
    if (savedState && savedState.profileSubView !== subView) {
      window.history.pushState({ ...savedState, profileSubView: subView }, '');
    }
  }, [subView]);

  const openTerms = (title) => {
    setTermsTitle(title);
    setShowTerms(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out failed:", e);
      showNotification("Sign out failed. Please try again.", "error");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [firebaseUser.uid]);

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/users/${firebaseUser.uid}`);
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        setEditData({ 
          displayName: data.displayName || firebaseUser.displayName || '', 
          phone: data.phone || '' 
        });
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`/api/users/${firebaseUser.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        showNotification("Institutional profile updated successfully", "success");
        setIsEditing(false);
        await fetchUserData();
      } else {
        showNotification("Failed to update profile", "error");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showNotification("Network error updating profile", "error");
    }
  };

  const handleAddPayment = async (method) => {
    try {
      const res = await fetch(`/api/users/${firebaseUser.uid}/payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(method),
      });
      if (res.ok) {
        await fetchUserData();
      }
    } catch (error) {
      console.error("Failed to add payment method:", error);
      throw error;
    }
  };

  const handleRemovePayment = async (id) => {
    try {
      const res = await fetch(`/api/users/${firebaseUser.uid}/payment-methods/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showNotification("Payment method removed successfully", "success");
        await fetchUserData();
      }
    } catch (error) {
      console.error("Failed to remove payment method:", error);
      showNotification("Failed to remove payment method", "error");
    }
  };

  const menuItems = [
    { id: 'settings', icon: Settings, label: 'Account Settings', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'security', icon: Shield, label: 'Security & Privacy', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'notifications', icon: Bell, label: 'Notifications', color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'payments', icon: CreditCard, label: 'Payment Methods', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'support', icon: HelpCircle, label: 'Support & Help', color: 'text-gray-600', bg: 'bg-gray-50' },
  ];

  const renderSubView = () => {
    const views = {
      settings: (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black font-display uppercase italic text-blue-500">Profile Information</h3>
            <div className="space-y-4">
              {!userData?.hasClaimedBonus && (
                <button 
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/users/${firebaseUser.uid}/claim-bonus`, { method: 'POST' });
                      const data = await res.json();
                      if (res.ok) {
                        showNotification(`Bonus claimed! Balance: GH₵ ${data.balance}`, "success");
                        fetchUserData();
                      } else {
                        showNotification(data.error || 'Bonus already recorded', "error");
                      }
                    } catch (e) {
                      showNotification("Network error claiming bonus", "error");
                    }
                  }}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all mb-4"
                >
                  🎁 Claim GH₵ 5 Welcome Bonus
                </button>
              )}
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Display Name</span>
                  </div>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={editData.displayName}
                      onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                      className="text-xs font-black text-white bg-black/40 border border-blue-500/30 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-xs font-black text-white">{userData?.displayName || firebaseUser.displayName || 'Not Set'}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Email Address</span>
                  </div>
                  <span className="text-xs font-black text-gray-500">{firebaseUser.email}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-gray-500" />
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Phone Number</span>
                  </div>
                  {isEditing ? (
                    <input 
                      type="text"
                      placeholder="+233..."
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="text-xs font-black text-white bg-black/40 border border-blue-500/30 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-xs font-black text-white">{userData?.phone || 'Not Set'}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Referral Code</span>
                  </div>
                  <span className="text-xs font-black text-blue-500">{userData?.referralCode || '...'}</span>
                </div>
                <button 
                  onClick={() => {
                    try {
                      const link = `${window.location.origin}?ref=${userData?.referralCode}`;
                      navigator.clipboard.writeText(link).then(() => {
                        showNotification("Referral link copied!", "success");
                      }).catch((e) => {
                        console.error("Clipboard write failed:", e);
                        showNotification("Failed to copy link. Please select and copy manually.", "error");
                      });
                    } catch (e) {
                      console.error("Clipboard access restricted:", e);
                      showNotification("Clipboard access restricted.", "error");
                    }
                  }}
                  className="w-full py-2 bg-blue-600/10 text-blue-500 text-[8px] font-black uppercase tracking-widest rounded-xl border border-blue-500/20 hover:bg-blue-600 hover:text-white transition-all"
                >
                  Copy Referral Link
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  className="flex-1 py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full py-4 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-blue-700 transition-all"
              >
                Update Profile
              </button>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black font-display uppercase italic text-gray-500">Preferences</h3>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Language</span>
              <span className="text-xs font-black text-white">English (US)</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Currency</span>
              <span className="text-xs font-black text-white">GHS (₵)</span>
            </div>
          </div>
        </div>
      ),
      security: (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black font-display uppercase italic text-green-500">Security Status</h3>
            <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
              <Shield className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest">Institutional Grade Active</p>
                <p className="text-[10px] text-green-500/70 font-bold uppercase tracking-widest mt-0.5">Your account is fully protected</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black font-display uppercase italic text-gray-500">Security Actions</h3>
            <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-500" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Change Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-500" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Two-Factor Auth</span>
              </div>
              <span className="text-[8px] font-black bg-blue-600 px-2 py-1 rounded text-white uppercase">Enabled</span>
            </button>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black font-display uppercase italic text-gray-500">Legal Documents</h3>
            <button 
              onClick={() => openTerms("Terms and Conditions")}
              className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Terms and Conditions</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <button 
              onClick={() => openTerms("Privacy Policy")}
              className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-500" />
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      ),
      notifications: (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black font-display uppercase italic text-orange-500">Notification Channels</h3>
            {[
              { label: 'Email Alerts', desc: 'Daily summaries and reports', active: true },
              { label: 'Push Notifications', desc: 'Real-time wave updates', active: true },
              { label: 'SMS Security', desc: 'Critical account alerts', active: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">{item.label}</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{item.desc}</p>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${item.active ? 'bg-orange-500' : 'bg-gray-800'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
      payments: (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black font-display uppercase italic text-purple-500">Saved Methods</h3>
              <button 
                onClick={() => setIsAddPaymentOpen(true)}
                className="flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 px-4 py-2 rounded-xl text-[10px] font-black text-purple-400 uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
              >
                <Plus className="w-3 h-3" />
                Add New
              </button>
            </div>
            
            <div className="space-y-4">
              {userData?.paymentMethods?.length > 0 ? (
                userData.paymentMethods.map((pm) => (
                  <div key={pm._id} className="relative group">
                    <div className={`p-6 bg-gradient-to-br ${pm.type === 'card' ? 'from-purple-600 to-indigo-700' : 'from-blue-600 to-cyan-700'} rounded-3xl relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 p-4 opacity-20">
                        {pm.type === 'card' ? <CreditCard className="w-12 h-12 text-white" /> : <Smartphone className="w-12 h-12 text-white" />}
                      </div>
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-4">
                        {pm.provider} {pm.type === 'card' ? 'Card' : 'MoMo'}
                      </p>
                      <p className="text-xl font-black font-display text-white tracking-[0.2em] mb-6">
                        {pm.type === 'card' ? `•••• •••• •••• ${pm.details.slice(-4)}` : pm.details}
                      </p>
                      <div className="flex justify-between items-end">
                        <div className="max-w-[150px] md:max-w-[200px]">
                          <p className="text-[8px] font-black text-white/50 uppercase tracking-widest">Account Holder</p>
                          <p className="text-xs font-black text-white uppercase truncate" title={firebaseUser.displayName || firebaseUser.email}>
                            {firebaseUser.displayName || firebaseUser.email || 'Investor'}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleRemovePayment(pm._id)}
                          className="bg-red-500/20 hover:bg-red-500 p-2 rounded-lg border border-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                  <CreditCard className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">No payment methods saved</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ),
      support: (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-black font-display uppercase italic text-gray-500">Help Center</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all text-center space-y-3">
                <Mail className="w-6 h-6 text-blue-500 mx-auto" />
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Email Support</p>
              </button>
              <button className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all text-center space-y-3">
                <Globe className="w-6 h-6 text-green-500 mx-auto" />
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Knowledge Base</p>
              </button>
            </div>
            <div className="p-6 bg-blue-600/10 border border-blue-600/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Priority Support Active</p>
              </div>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                As an institutional investor, you have 24/7 access to our dedicated support wave.
              </p>
            </div>
          </div>
        </div>
      )
    };

    return views[subView] || null;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      <AddPaymentModal 
        isOpen={isAddPaymentOpen} 
        onClose={() => setIsAddPaymentOpen(false)} 
        onAdd={handleAddPayment} 
      />
      
      {/* Dynamic Mesh Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px]" 
        />
      </div>

      <div className="space-y-8 md:space-y-12 pb-32 pt-12 px-4 max-w-3xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!subView ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 md:space-y-12"
            >
              <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
                <div className="relative group">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-4 border-2 border-dashed border-blue-600/30 rounded-full"
                  />
                  {firebaseUser.photoURL ? (
                    <img 
                      src={firebaseUser.photoURL} 
                      alt={firebaseUser.displayName || 'Me'} 
                      className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] border-4 border-white/10 shadow-2xl relative z-10 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] bg-blue-600 flex items-center justify-center text-white text-4xl md:text-5xl font-black border-4 border-white/10 shadow-2xl relative z-10 font-display italic">
                      {firebaseUser.displayName?.[0] || firebaseUser.email?.[0]}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-green-500 w-6 h-6 md:w-8 md:h-8 rounded-xl md:rounded-2xl border-4 border-[#050505] z-20 shadow-lg" />
                </div>
                
                <div className="space-y-1 md:space-y-2">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic font-display">{firebaseUser.displayName || 'Investor'}</h2>
                  <div className="flex flex-col items-center gap-2">
                    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-3 md:px-4 py-1 md:py-1.5 rounded-full">
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{firebaseUser.email}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-3 py-1 rounded-full">
                      <Shield className="w-3 h-3 text-blue-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-blue-400">Institutional Level {userData?.level || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Referral Link Quick Access */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full bg-blue-600/10 border border-blue-500/20 rounded-[28px] p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Institutional Referral Link</span>
                    </div>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{userData?.referralCount || 0} Referrals</span>
                  </div>
                  <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Your Unique Invite URL</p>
                      <p className="text-[10px] font-black text-white truncate">{window.location.origin}?ref={userData?.referralCode || '...'}</p>
                    </div>
                    <button 
                      onClick={() => {
                        const link = `${window.location.origin}?ref=${userData?.referralCode}`;
                        navigator.clipboard.writeText(link).then(() => {
                          showNotification("Institutional invite link copied!", "success");
                        });
                      }}
                      className="shrink-0 bg-blue-600 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                    >
                      Copy
                    </button>
                  </div>
                </motion.div>
              </div>

              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[28px] md:rounded-[48px] overflow-hidden shadow-2xl">
                {menuItems.map((item, index) => (
                  <button 
                    key={item.label}
                    onClick={() => setSubView(item.id)}
                    className={`w-full flex items-center justify-between p-4 md:p-8 hover:bg-white/[0.05] transition-all group active:scale-[0.99] ${
                      index !== menuItems.length - 1 ? 'border-b border-white/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-6">
                      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${item.bg.replace('bg-', 'bg-opacity-20 bg-')}`}>
                        <item.icon className={`w-5 h-5 md:w-7 md:h-7 ${item.color}`} />
                      </div>
                      <span className="font-black text-sm md:text-lg font-display uppercase italic tracking-tight text-gray-200 group-hover:text-white transition-colors">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 md:w-6 md:h-6 text-gray-600 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
                  </button>
                ))}
              </div>

              <button 
                onClick={handleSignOut}
                className="w-full bg-red-500/10 text-red-500 border border-red-500/20 font-black py-5 md:py-6 rounded-2xl md:rounded-[32px] flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all group shadow-xl shadow-red-500/5 active:scale-[0.98] uppercase tracking-[0.3em] text-[10px] md:text-xs"
              >
                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Terminate Session
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="sub"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => window.history.back()}
                  className="flex items-center gap-3 text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-[0.3em] group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  Back to Profile
                </button>
                <h2 className="text-xl font-black font-display uppercase italic text-white tracking-tighter">
                  {menuItems.find(m => m.id === subView)?.label}
                </h2>
              </div>
              {renderSubView()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.5em]">Profit Wavy v2.4.0 • Institutional Grade</p>
        </div>
      </div>

      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title={termsTitle} 
      />
    </div>
  );
}
