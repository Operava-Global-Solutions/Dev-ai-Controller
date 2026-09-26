import React, { useState } from 'react';
import {
  PanelLeft,
  ShieldCheck,
  Zap,
  Sparkles,
  Sun,
  Moon,
  KeyRound,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import type { SupabaseAuthUser } from '../types/index.js';
import { useAdminAuth } from '../context/AdminAuthContext.js';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: SupabaseAuthUser;
  onUserUpdate?: (user: SupabaseAuthUser) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onToggleSidebar,
  isSidebarOpen,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
  onUserUpdate,
}) => {
  const { logout } = useAdminAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState(currentUser.email || 'secured.jelvan@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [otpHint, setOtpHint] = useState<string | null>(null);

  const handleRequestOtp = async () => {
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both Admin Email and Admin Password first.');
      return;
    }
    setLoginError(null);
    setLoginSuccess(null);
    setIsRequestingOtp(true);

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setLoginSuccess('OTP passcode generated using ADMIN_WJT_KEY.');
        if (data.otpHint) {
          setOtpHint(data.otpHint);
          setLoginOtp(data.otpHint);
        }
      } else {
        setLoginError(data.error || 'Failed to generate OTP');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Network error requesting OTP');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setLoginError('Admin Email and Password are required.');
      return;
    }
    if (!loginOtp) {
      setLoginError('Please enter the 6-digit OTP code derived from ADMIN_WJT_KEY.');
      return;
    }

    setLoginError(null);
    setLoginSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          otp: loginOtp,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        if (data.token) {
          localStorage.setItem('admin_token', data.token);
        }
        if (onUserUpdate) {
          onUserUpdate(data.user);
        }
        setLoginSuccess('Admin session verified successfully.');
        setTimeout(() => {
          setShowLoginModal(false);
          setLoginPassword('');
          setLoginOtp('');
          setLoginSuccess(null);
          setOtpHint(null);
        }, 800);
      } else {
        setLoginError(data.error || 'Invalid credentials or OTP code');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <header className="h-14 border-b border-[#e2e4e9] dark:border-[#252a35] bg-white/95 dark:bg-[#12161f]/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3 sm:px-5">
      {/* Left side: Hamburger toggle + App Brand */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        <div
          onClick={() => setActiveTab('status')}
          className="flex items-center space-x-2.5 cursor-pointer"
        >
          {/* Operava Orange-to-Purple Gradient Logo */}
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center shadow-xs">
            <Zap className="h-4 w-4 text-white fill-current" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[#1a1d24] dark:text-[#f0f3f6]">
            Dev’ai Controller
          </span>
        </div>
      </div>

      {/* Right side: Actions & User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center space-x-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#f4f5f8] dark:bg-[#1a1e27] hover:bg-[#ebedf1] dark:hover:bg-[#222834] transition-colors border border-[#e2e4e9] dark:border-[#2c3240] cursor-pointer"
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
              {currentUser.name ? currentUser.name[0].toUpperCase() : 'J'}
            </div>
            <span className="text-xs font-semibold text-[#1a1d24] dark:text-[#f0f3f6] hidden sm:inline">
              {currentUser.name}
            </span>
          </button>

          {/* User Details Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#181d26] border border-[#e2e4e9] dark:border-[#2e333d] shadow-lg p-4 z-50 text-xs">
              <div className="flex items-center space-x-3 pb-3 border-b border-[#f0f2f5] dark:border-[#252a35]">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'J'}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#1a1d24] dark:text-[#f0f3f6]">
                    {currentUser.name}
                  </h4>
                  <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                    {currentUser.email}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Role: {currentUser.role}
                  </span>
                </div>
              </div>

              <div className="pt-3 space-y-2 text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                <div className="flex items-center justify-between">
                  <span>Auth Provider:</span>
                  <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">Supabase Auth</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session Status:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1" />
                    Verified Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Server Secrets:</span>
                  <span className="font-mono text-orange-600 dark:text-orange-400 font-semibold">
                    Cloudflare Worker Isolation
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#f0f2f5] dark:border-[#252a35] space-y-2">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setShowLoginModal(true);
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-[#f0f2f5] dark:bg-[#202530] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-xs border border-[#e2e4e9] dark:border-[#2c3240] transition-colors cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Admin Login</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-semibold text-xs border border-red-200 dark:border-red-900/60 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Login & OTP Verification Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#2c3240] shadow-2xl p-6 relative space-y-4">
            <button
              onClick={() => {
                setShowLoginModal(false);
                setLoginError(null);
                setLoginSuccess(null);
              }}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-[#80868b] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center text-white shadow-xs">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                  Admin Authentication
                </h3>
              </div>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                Sign in with ADMIN_EMAIL, ADMIN_PASSWORD, and OTP derived from ADMIN_WJT_KEY.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                <span>{loginSuccess}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] mb-1">
                  Admin Email (ADMIN_EMAIL)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#80868b]" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="secured.jelvan@gmail.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] mb-1">
                  Admin Password (ADMIN_PASSWORD)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#80868b]" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter ADMIN_PASSWORD"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6]">
                    6-Digit OTP (ADMIN_WJT_KEY)
                  </label>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={isRequestingOtp || !loginEmail || !loginPassword}
                    className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {isRequestingOtp ? 'Sending...' : 'Send Code'}
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-[#80868b]" />
                  <input
                    type="text"
                    maxLength={6}
                    value={loginOtp}
                    onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 583921"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono tracking-widest rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {otpHint && (
                  <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                    Current Valid OTP: {otpHint}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-2 rounded-xl text-xs text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !loginEmail || !loginPassword || !loginOtp}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
