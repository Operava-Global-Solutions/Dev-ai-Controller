import React from 'react';
import {
  Activity,
  Sparkles,
  Globe,
  Bell,
  History,
  BookOpen,
  Box,
  ShieldCheck,
  Zap,
  ChevronRight,
  PanelLeftClose,
  Database,
  ExternalLink,
} from 'lucide-react';
import type { SupabaseAuthUser } from '../types/index.js';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: SupabaseAuthUser;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  setActiveTab,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
}) => {
  const navItems = [
    {
      id: 'status',
      label: 'Services Status',
      badge: '5 Live',
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
      icon: Activity,
      description: 'Resend, Supabase, GitHub, Cloudflare, OpenAI',
    },
    {
      id: 'coding',
      label: 'Drive Coding',
      badge: 'AI Agent',
      badgeColor: 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300',
      icon: Sparkles,
      description: 'Repo analysis & code generation',
    },
    {
      id: 'deployments',
      label: 'Deployed Apps',
      badge: 'Edge 5',
      badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300',
      icon: Globe,
      description: 'Cloudflare Workers & Pages live monitoring',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      badge: 'Feed',
      badgeColor: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300',
      icon: Bell,
      description: 'Resend transactional emails & alerts',
    },
    {
      id: 'logs',
      label: 'Audit Trail',
      icon: History,
      description: 'Supabase logged action records',
    },
    {
      id: 'docs',
      label: 'Architecture Docs',
      icon: BookOpen,
      description: 'llms.txt guides & service specifications',
    },
    {
      id: 'export',
      label: 'Deploy Kit',
      icon: Box,
      description: 'Wrangler.toml & GitHub Actions',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#12161f] transition-transform duration-200 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-64'
        }`}
      >
        {/* Top Header of Sidebar */}
        <div className="h-14 border-b border-[#e2e4e9] dark:border-[#252a35] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-[#f38020] flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white fill-current" />
            </div>
            <span className="font-bold text-xs tracking-wider uppercase text-[#1a1d24] dark:text-[#f0f3f6]">
              OPERATIONS HUB
            </span>
          </div>

          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-[#5f6368] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors md:hidden"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-2 py-1 text-[10px] font-semibold text-[#80868b] uppercase tracking-wider">
            Operational Dashboard
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 768) onToggle();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-xs font-semibold'
                    : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f4f5f8] dark:hover:bg-[#1a1e27] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#80868b]'}`} />
                  <div>
                    <span className="block leading-tight">{item.label}</span>
                    <span
                      className={`text-[10px] block opacity-75 truncate max-w-[125px] ${
                        isActive ? 'text-white/80' : 'text-[#80868b]'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer: Supabase Auth & Cloudflare Secrets status */}
        <div className="p-3 border-t border-[#e2e4e9] dark:border-[#252a35] space-y-2 bg-[#f8f9fb] dark:bg-[#10131a]">
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[#80868b] flex items-center space-x-1">
                <Database className="h-3 w-3 text-emerald-500" />
                <span>Supabase Auth:</span>
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {currentUser.role}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#80868b]">User:</span>
              <span className="font-mono text-[#1a1d24] dark:text-[#f0f3f6] truncate max-w-[120px]">
                {currentUser.email}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-2 py-1 text-[10px] text-[#5f6368] dark:text-[#9aa0a6]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Zero-Trust Server Secrets Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
