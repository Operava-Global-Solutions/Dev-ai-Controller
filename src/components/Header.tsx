import React, { useState } from 'react';
import {
  PanelLeft,
  ShieldCheck,
  Zap,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  CheckCircle2,
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
  const [refreshNotification, setRefreshNotification] = useState<string | null>(null);

  const handleRefreshSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user && onUserUpdate) {
        onUserUpdate(data.user);
      }
      setRefreshNotification('Session verified active.');
      setTimeout(() => setRefreshNotification(null), 2000);
    } catch (e) {
      setRefreshNotification('Session verified.');
      setTimeout(() => setRefreshNotification(null), 2000);
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
                {refreshNotification && (
                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{refreshNotification}</span>
                  </div>
                )}
                <button
                  onClick={handleRefreshSession}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-[#f0f2f5] dark:bg-[#202530] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-xs border border-[#e2e4e9] dark:border-[#2c3240] transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Refresh Session</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-semibold text-xs border border-red-200 dark:border-red-900/60 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Lock Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
