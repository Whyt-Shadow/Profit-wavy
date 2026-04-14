import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { TrendingUp, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Auth error:', error);
      setError('Failed to sign in with Google.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'An error occurred during authentication.');
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
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1"
            >
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-gray-200 transition-all"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-gray-200 transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-gray-200 transition-all"
            />
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-500 font-medium text-center"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1e293b] text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
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
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
          <span className="bg-white px-4 text-gray-400">Or continue with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.98]"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
        Google
      </button>

      <p className="mt-8 text-center text-sm text-gray-500">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-gray-900 font-bold hover:underline"
        >
          {isLogin ? 'Sign Up' : 'Log In'}
        </button>
      </p>

      <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
        <ShieldCheck className="w-3 h-3" />
        Secure & Private
      </div>
    </div>
  );
}
