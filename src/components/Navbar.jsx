import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, TrendingUp } from 'lucide-react';

export default function Navbar({ user }) {
  const handleSignOut = () => signOut(auth);

  return (
    <nav className="bg-[#050505]/80 backdrop-blur-2xl fixed top-8 left-0 right-0 z-50 h-20 flex items-center border-b border-white/5">
      <div className="container mx-auto px-6 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-2">
          <div className="flex flex-col leading-none">
            <span className="font-black text-2xl tracking-tighter text-white uppercase italic ml-7 -mt-1 font-display">Wavy</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'User'} 
                className="w-7 h-7 rounded-xl border border-white/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-xl bg-blue-600 flex items-center justify-center text-[10px] font-black">
                {user.displayName?.[0] || 'U'}
              </div>
            )}
            <span className="text-xs font-black text-gray-300 uppercase tracking-widest hidden sm:inline">
              {user.displayName?.split(' ')[0]}
            </span>
          </div>
          
          <button
            onClick={handleSignOut}
            className="p-2.5 text-gray-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 rounded-2xl transition-all group"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </nav>
  );
}
