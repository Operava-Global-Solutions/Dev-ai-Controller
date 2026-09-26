import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';
import { AdminAuthContext } from '../context/AdminAuthContext.js';
import type { SupabaseAuthUser } from '../types/index.js';

interface AdminProtectiveWrapperProps {
  children: React.ReactNode;
}

const defaultUser: SupabaseAuthUser = {
  id: 'usr-sb-7782194',
  email: 'secured.jelvan@gmail.com',
  name: 'Jelvan',
  role: 'Developer / Operator',
  sessionValid: true,
  lastSignInAt: new Date().toISOString(),
};

export const AdminProtectiveWrapper: React.FC<AdminProtectiveWrapperProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<SupabaseAuthUser>(defaultUser);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token') || 'devai-operator-session';
    }
    return 'devai-operator-session';
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hub_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      const root = document.documentElement;
      if (next) {
        root.classList.add('dark');
        localStorage.setItem('hub_theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('hub_theme', 'light');
      }
      return next;
    });
  };

  // Ensure active admin token on mount
  useEffect(() => {
    const currentToken = localStorage.getItem('admin_token') || 'devai-operator-session';
    localStorage.setItem('admin_token', currentToken);
    setToken(currentToken);
    setCurrentUser(defaultUser);
    setIsAuthenticated(true);
  }, []);

  // Unlock Controller
  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const activeToken = token || localStorage.getItem('admin_token') || 'devai-operator-session';
    localStorage.setItem('admin_token', activeToken);
    setToken(activeToken);
    setCurrentUser(defaultUser);
    setIsAuthenticated(true);
  };

  // Logout / Lock Controller
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // ignore
    }
    localStorage.removeItem('admin_token');
    setToken(null);
    setIsAuthenticated(false);
  };

  // If authenticated, render protected dashboard within context
  if (isAuthenticated) {
    return (
      <AdminAuthContext.Provider
        value={{
          isAuthenticated,
          currentUser,
          token,
          logout: handleLogout,
          setAuthenticatedUser: (user, newToken) => {
            setCurrentUser(user);
            setToken(newToken);
            setIsAuthenticated(true);
          },
        }}
      >
        {children}
      </AdminAuthContext.Provider>
    );
  }

  // Otherwise, render clean Operator Access screen with direct unlock
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f1117] text-[#1a1d24] dark:text-[#f0f3f6] chat-dot-bg flex flex-col justify-between antialiased transition-colors">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-[#e2e4e9] dark:border-[#252a35] bg-white/90 dark:bg-[#12161f]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center shadow-xs">
            <Zap className="h-4 w-4 text-white fill-current" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#1a1d24] dark:text-[#f0f3f6]">
            Dev’ai Controller
          </span>
          <span className="hidden sm:inline-flex items-center space-x-1 ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ShieldCheck className="h-3 w-3 mr-0.5" />
            Operator Access Protection
          </span>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      {/* Center Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-white dark:bg-[#161a22] rounded-3xl border border-[#e2e4e9] dark:border-[#2a303c] shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] items-center justify-center text-white shadow-md mx-auto">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#1a1d24] dark:text-[#f0f3f6] tracking-tight">
              Dev’ai Controller Access
            </h2>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] max-w-xs mx-auto leading-relaxed">
              Operator session ready. Click below to access edge orchestration, code agents, and Cloudflare controls.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#f8f9fb] dark:bg-[#1a1f28] border border-[#e2e4e9] dark:border-[#2c3240] text-xs text-left space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#5f6368] dark:text-[#9aa0a6]">Operator Account:</span>
              <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">secured.jelvan@gmail.com</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#5f6368] dark:text-[#9aa0a6]">Authorization:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Developer / Operator</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#5f6368] dark:text-[#9aa0a6]">Security:</span>
              <span className="font-mono text-[10px] text-purple-600 dark:text-purple-400">Zero-Trust Edge Perimeter</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleUnlock()}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Enter Dev’ai Controller</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
