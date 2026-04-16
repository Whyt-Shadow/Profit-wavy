import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[32px] p-10 backdrop-blur-3xl">
            <div className="w-20 h-20 bg-red-500/20 rounded-[24px] flex items-center justify-center mx-auto mb-8">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-black font-display uppercase italic text-white mb-4 tracking-tighter">
              Component <span className="text-red-500">Crash.</span>
            </h1>
            
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-relaxed mb-8">
              The high-frequency institutional wave encountered an unexpected exception in this component.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-700 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Terminal
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white/5 border border-white/10 text-gray-300 font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]"
              >
                <Home className="w-4 h-4" />
                Return to Port
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.4em]">
                Error Identifier: {this.state.error?.name || 'UnknownException'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
