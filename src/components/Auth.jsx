import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { TrendingUp, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Phone, Ticket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TermsModal from './TermsModal';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsTitle, setTermsTitle] = useState('Terms and Conditions');

  useEffect(() => {
    // Load pre-filled referral code from URL or local storage
    const params = new URLSearchParams(window.location.search);
    const urlReferral = params.get('ref') || params.get('referral');
    const savedReferral = localStorage.getItem('referralCode');
    
    if (urlReferral) {
      setReferralCode(urlReferral);
      setIsLogin(false); // Switch to register if referral code is present
    } else if (savedReferral) {
      setReferralCode(savedReferral);
    }
  }, []);

  const openTerms = (title) => {
    setTermsTitle(title);
    setShowTerms(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (!agreedToTerms) {
        setError('You must agree to the Terms and Conditions.');
        return;
      }
    }

    setLoading(true);
    try {
      // Set persistence based on "Remember Me"
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (isLogin) {
        // Handle "Sign in with Phone/Email"
        // Since Firebase Auth requires Email, we'll try to resolve the phone/name to an email first if it doesn't look like an email
        let signId = email;
        if (!email.includes('@')) {
          try {
            const response = await fetch(`/api/users/lookup?identity=${encodeURIComponent(email)}`);
            const data = await response.json();
            if (data.email) {
              signId = data.email;
            } else {
              throw new Error('User not found with that phone number.');
            }
          } catch (err) {
            throw new Error(err.message || 'User not found with that phone number.');
          }
        }
        await signInWithEmailAndPassword(auth, signId, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        // Sync with MongoDB including new fields
        await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            phone: phone,
            displayName: displayName,
            referralCode: referralCode
          })
        });
      }
    } catch (err) {
      console.error('Auth error:', err);
      let msg = err.message;
      if (msg.includes('auth/user-not-found')) msg = 'User not found.';
      if (msg.includes('auth/wrong-password')) msg = 'Incorrect password.';
      setError(msg || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1e293b] rounded-2xl mb-6 shadow-xl">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center gap-1">
            <span className="font-black text-2xl tracking-tighter uppercase italic text-[#1e293b]">Profit</span>
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase italic text-[#1e293b] -mt-1">Wavy</span>
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-gray-500">
          {isLogin 
            ? 'Access your investment dashboard and insights.' 
            : 'Start your journey to smarter wealth management.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AnimatePresence mode="popLayout">
          {isLogin ? (
            <motion.div
              key="login-fields"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  required
                  placeholder="Enter your phone number"
                  value={email} // Using email state to store the identifier for login
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="signup-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required={!isLogin}
                    placeholder="John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    required={!isLogin}
                    placeholder="+233..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  required={!isLogin}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                />
              </div>
            </div>
          )}
        </div>

        {!isLogin && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
              />
            </div>
          </div>
        )}

        {!isLogin && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Referral Code (Optional)</label>
            <div className="relative group">
              <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="REF123"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full bg-gray-50 border border-transparent rounded-xl py-3 pl-12 pr-4 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400 uppercase"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#1e293b] focus:ring-[#1e293b] cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer select-none">
              Remember Me
            </label>
          </div>
        </div>

        {!isLogin && (
          <div className="flex items-start gap-3 py-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#1e293b] focus:ring-[#1e293b] cursor-pointer"
            />
            <label 
              id="terms-label"
              htmlFor="terms" 
              className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed cursor-pointer select-none transition-colors duration-300"
            >
              I agree to the <button type="button" onClick={() => openTerms("Terms and Conditions")} className="text-blue-500 hover:underline">Terms</button> and <button type="button" onClick={() => openTerms("Privacy Policy")} className="text-blue-500 hover:underline">Privacy Policy</button>.
            </label>
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-xs text-red-600 font-bold uppercase tracking-wider">{error}</p>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1e293b] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-slate-200"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
        {isLogin ? "New to ProfitWavy?" : "Existing Partner?"}{' '}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="text-[#1e293b] hover:underline"
        >
          {isLogin ? 'Join Now' : 'Sign In'}
        </button>
      </p>

      <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-center gap-2 text-[10px] text-gray-300 uppercase tracking-widest font-bold">
        <ShieldCheck className="w-3 h-3" />
        Encryption Active
      </div>

      <TermsModal 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
        title={termsTitle} 
      />
    </div>
  );
}
