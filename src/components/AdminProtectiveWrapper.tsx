import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  Smartphone,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Sun,
  Moon,
  Loader2,
  RefreshCw,
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<SupabaseAuthUser>(defaultUser);
  const [token, setToken] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState<string>('secured.jelvan@gmail.com');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [otpMethod, setOtpMethod] = useState<'email' | 'authenticator'>('email');
  const [otpCode, setOtpCode] = useState<string>('');

  // UI / Status State
  const [isRequestingOtp, setIsRequestingOtp] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [otpHint, setOtpHint] = useState<string | null>(null);

  // Authenticator App setup data
  const [authSetup, setAuthSetup] = useState<{
    secret: string;
    otpauthUrl: string;
    issuer: string;
    account: string;
  } | null>(null);
  const [showAuthSetupDetails, setShowAuthSetupDetails] = useState<boolean>(false);
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false);

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

  // Verify existing token on initial mount
  useEffect(() => {
    const verifyInitialSession = async () => {
      const storedToken = localStorage.getItem('admin_token');
      if (!storedToken) {
        setIsVerifyingSession(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify-session', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const data = await res.json();
        if (data.success && data.valid && data.user) {
          setToken(storedToken);
          setCurrentUser(data.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('admin_token');
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.warn('Session verification error:', err);
        setIsAuthenticated(false);
      } finally {
        setIsVerifyingSession(false);
      }
    };

    verifyInitialSession();
  }, []);

  // Fetch Authenticator App setup details (secret & otpauth link)
  useEffect(() => {
    const fetchAuthSetup = async () => {
      try {
        const res = await fetch('/api/auth/authenticator-setup');
        const data = await res.json();
        if (data.success) {
          setAuthSetup({
            secret: data.secret,
            otpauthUrl: data.otpauthUrl,
            issuer: data.issuer,
            account: data.account,
          });
        }
      } catch (err) {
        console.warn('Could not load authenticator setup:', err);
      }
    };
    fetchAuthSetup();
  }, []);

  // Request Email OTP
  const handleRequestEmailOtp = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter Admin Email and Admin Password first.');
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsRequestingOtp(true);

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, method: 'email' }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage(data.message || 'OTP passcode dispatched to admin email.');
        if (data.otpHint) {
          setOtpHint(data.otpHint);
          setOtpCode(data.otpHint);
        }
      } else {
        setErrorMessage(data.error || 'Failed to dispatch email OTP.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error requesting OTP.');
    } finally {
      setIsRequestingOtp(false);
    }
  };

  // Submit Credentials and OTP
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Admin Email and Password are required.');
      return;
    }
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit OTP passcode.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          otp: otpCode.trim(),
          method: otpMethod,
        }),
      });

      const data = await res.json();
      if (data.success && data.token && data.user) {
        localStorage.setItem('admin_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setSuccessMessage('Authentication verified. Unlocking dashboard controls...');
        setTimeout(() => {
          setIsAuthenticated(true);
        }, 500);
      } else {
        setErrorMessage(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during verification.');
    } finally {
      setIsSubmitting(false);
    }
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
    setPassword('');
    setOtpCode('');
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleCopySecret = () => {
    if (!authSetup?.secret) return;
    navigator.clipboard.writeText(authSetup.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  // If initial session verification is in progress, show clean loader
  if (isVerifyingSession) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f1117] flex items-center justify-center chat-dot-bg">
        <div className="flex flex-col items-center space-y-3 p-6 rounded-2xl bg-white/80 dark:bg-[#161a22]/80 backdrop-blur-md border border-[#e2e4e9] dark:border-[#2c3240] shadow-xl">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center text-white shadow-xs">
            <Zap className="h-5 w-5 fill-current animate-pulse" />
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6]">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" />
            <span>Verifying Access...</span>
          </div>
        </div>
      </div>
    );
  }

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

  // Otherwise, render the Protective Security Wrapper Gate
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

      {/* Center Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-white dark:bg-[#161a22] rounded-3xl border border-[#e2e4e9] dark:border-[#2a303c] shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] items-center justify-center text-white shadow-md mx-auto">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-[#1a1d24] dark:text-[#f0f3f6] tracking-tight">
              Dev’ai Controller Access
            </h2>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] max-w-xs mx-auto leading-relaxed">
              Administrative authentication required to operate edge orchestration, code agents, and sensitive controls.
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-start space-x-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleUnlock} className="space-y-4">
            {/* Admin Email */}
            <div>
              <label className="block text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] mb-1">
                Admin Email (ADMIN_EMAIL)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[#80868b]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="secured.jelvan@gmail.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Admin Password */}
            <div>
              <label className="block text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] mb-1">
                Admin Password (ADMIN_PASSWORD)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#80868b]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter ADMIN_PASSWORD"
                  required
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#80868b] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* OTP Flow Selector: Email Code vs Authenticator App */}
            <div>
              <label className="block text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] mb-1.5">
                Two-Factor Verification Method
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#f0f2f5] dark:bg-[#1e232d] border border-[#e2e4e9] dark:border-[#2c3240]">
                <button
                  type="button"
                  onClick={() => {
                    setOtpMethod('email');
                    setErrorMessage(null);
                  }}
                  className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    otpMethod === 'email'
                      ? 'bg-white dark:bg-[#141820] text-[#1a1d24] dark:text-[#f0f3f6] shadow-xs'
                      : 'text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 text-purple-600" />
                  <span>Email Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpMethod('authenticator');
                    setErrorMessage(null);
                  }}
                  className={`flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    otpMethod === 'authenticator'
                      ? 'bg-white dark:bg-[#141820] text-[#1a1d24] dark:text-[#f0f3f6] shadow-xs'
                      : 'text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5 text-purple-600" />
                  <span>Authenticator App</span>
                </button>
              </div>
            </div>

            {/* Method Details & Helpers */}
            {otpMethod === 'email' ? (
              <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#1a1f28] border border-[#e2e4e9] dark:border-[#2c3240] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                    Email OTP (ADMIN_WJT_KEY)
                  </span>
                  <button
                    type="button"
                    onClick={handleRequestEmailOtp}
                    disabled={isRequestingOtp || !email || !password}
                    className="inline-flex items-center space-x-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {isRequestingOtp ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3" />
                        <span>Send Code</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                  Dispatches a 6-digit OTP code to <strong className="font-mono text-purple-600 dark:text-purple-400">{email}</strong> via Resend.
                </p>
                {otpHint && (
                  <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-emerald-600 dark:text-emerald-400 border-t border-[#e2e4e9] dark:border-[#2c3240]">
                    <span>Current Code: {otpHint}</span>
                    <span className="text-[10px] text-[#80868b]">(Ready to verify)</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#f8f9fb] dark:bg-[#1a1f28] border border-[#e2e4e9] dark:border-[#2c3240] space-y-2 text-xs">
                <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                  Enter the 6-digit TOTP code from Google Authenticator, Microsoft Authenticator, Authy, or Apple Passwords.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAuthSetupDetails(!showAuthSetupDetails)}
                  className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer block"
                >
                  {showAuthSetupDetails ? 'Hide Key' : 'Setup App'}
                </button>

                {showAuthSetupDetails && authSetup && (
                  <div className="pt-2 border-t border-[#e2e4e9] dark:border-[#2c3240] space-y-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#80868b]">Base32 Secret Key:</span>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="text"
                          readOnly
                          value={authSetup.secret}
                          className="flex-1 px-2 py-1 text-[11px] font-mono rounded bg-white dark:bg-[#12151c] border border-[#e2e4e9] dark:border-[#2c3240] select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="p-1.5 rounded bg-white dark:bg-[#12151c] border border-[#e2e4e9] dark:border-[#2c3240] text-[#5f6368] dark:text-[#9aa0a6] hover:text-purple-600 cursor-pointer"
                          title="Copy Key"
                        >
                          {copiedSecret ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <a
                        href={authSetup.otpauthUrl}
                        className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Add to App</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 6-Digit Passcode Input */}
            <div>
              <label className="block text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] mb-1">
                6-Digit Passcode (ADMIN_WJT_KEY)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-[#80868b]" />
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono tracking-widest text-center text-sm font-bold rounded-xl bg-[#f8f9fb] dark:bg-[#1f232c] border border-[#e2e4e9] dark:border-[#2e333d] text-[#1a1d24] dark:text-[#f0f3f6] focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Unlock Button */}
            <button
              type="submit"
              disabled={isSubmitting || !email || !password || otpCode.length !== 6}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] hover:opacity-95 shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify and Unlock</span>
                </>
              )}
            </button>
          </form>

          {/* Security Badges */}
          <div className="pt-3 border-t border-[#f0f2f5] dark:border-[#252a35] grid grid-cols-2 gap-2 text-[10px] text-[#5f6368] dark:text-[#9aa0a6]">
            <div className="flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="truncate">AES-256-GCM Vault</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500 shrink-0" />
              <span className="truncate">Worker Secret Isolation</span>
            </div>
            <div className="flex items-center space-x-1.5 col-span-2">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
              <span className="truncate">ADMIN_PASSWORD & ADMIN_WJT_KEY Enforced</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 text-center text-[11px] text-[#80868b] dark:text-[#5f6368] border-t border-[#e2e4e9] dark:border-[#252a35] bg-white/60 dark:bg-[#12161f]/60 backdrop-blur-xs z-10">
        Dev’ai Controller © 2026. Zero-Trust Edge Security Perimeter.
      </footer>
    </div>
  );
};
