import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Global error handling for browser environment
window.onerror = function(message, source, lineno, colno, error) {
  console.error('GLOBAL-FRONTEND-ERROR:', { message, source, lineno, colno, error: error?.stack || error });
  // We don't alert because of iFrame restrictions, but we log for the agent
  return false; 
};

window.onunhandledrejection = function(event) {
  const reason = event.reason;
  const message = reason?.message || (typeof reason === 'string' ? reason : JSON.stringify(reason));
  console.error('GLOBAL-UNHANDLED-REJECTION:', message || 'No reason provided', { reason });
};

// Safety for localStorage in restricted environments
const safeLocalStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage.getItem failed:', e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('localStorage.setItem failed:', e);
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage.removeItem failed:', e);
    }
  }
};
window.safeLocalStorage = safeLocalStorage;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
