import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
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
    try {
      const params = new URLSearchParams(window.location.search);
      const urlReferral = params.get('ref') || params.get('referral');
      const savedReferral = window.safeLocalStorage.getItem('referralCode');
      
      if (urlReferral) {
        setReferralCode(urlReferral);
        setIsLogin(false); // Switch to register if referral code is present
      } else if (savedReferral) {
        setReferralCode(savedReferral);
      }
    } catch (e) {
      console.warn("localStorage access restricted:", e);
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
      let msg = err && typeof err === 'object' ? err.message : String(err);
      
      if (msg && msg.includes('auth/email-already-in-use')) {
        msg = 'You already have an account. Redirecting to login...';
        setTimeout(() => {
          setIsLogin(true);
          setError(null);
        }, 2500);
      } else if (msg && msg.includes('auth/user-not-found')) {
        msg = 'User not found.';
      } else if (msg && msg.includes('auth/wrong-password')) {
        msg = 'Incorrect password.';
      } else if (msg && msg.includes('auth/invalid-credential')) {
        msg = 'Invalid phone/email or password.';
      }
      
      setError(msg || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Sync with MongoDB
      const syncRes = await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          referralCode: referralCode || undefined
        })
      });

      if (!isLogin && syncRes.status === 200) {
        setError('You already have an account. Redirecting to your dashboard...');
        setTimeout(() => {
          setError(null);
        }, 2500);
      }
    } catch (err) {
      console.error('Google Auth error:', err);
      let msg = err && typeof err === 'object' ? err.message : String(err);
      
      if (msg && msg.includes('auth/account-exists-with-different-credential')) {
        msg = 'An account already exists with this email. Please log in with your primary method.';
        setTimeout(() => {
          setIsLogin(true);
          setError(null);
        }, 3000);
      }
      
      setError(msg || 'An error occurred during Google Auth.');
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
              I accept the <button type="button" onClick={() => openTerms("Terms and Conditions")} className="text-blue-500 hover:underline">Terms and Conditions</button> and <button type="button" onClick={() => openTerms("Privacy Policy")} className="text-blue-500 hover:underline">Privacy Policy</button>.
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

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
          <span className="bg-white px-4 text-gray-400">Or continue with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full bg-white border border-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google
      </button>

      <p className="mt-8 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
        {isLogin ? "New to ProfitWavy?" : "Existing Partner?"}{' '}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setPhone('');
            setDisplayName('');
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
