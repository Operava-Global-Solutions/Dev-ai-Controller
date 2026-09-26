import React from 'react';
import {
  Activity,
  Sparkles,
  Bot,
  MessageSquare,
  Clock,
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
  Terminal,
  HelpCircle,
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
      id: 'chat',
      label: 'Chat',
      icon: Sparkles,
    },
    {
      id: 'worker',
      label: 'Worker Agent',
      icon: Bot,
    },
    {
      id: 'status',
      label: 'Services',
      icon: Activity,
    },
    {
      id: 'chathistory',
      label: 'Chat History',
      icon: Clock,
    },
    {
      id: 'coding',
      label: 'Coding Agent',
      icon: Terminal,
    },
    {
      id: 'deployments',
      label: 'Deployments',
      icon: Globe,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
    },
    {
      id: 'logs',
      label: 'Audit Trail',
      icon: History,
    },
    {
      id: 'knowledge',
      label: 'Knowledge Center',
      icon: HelpCircle,
    },
    {
      id: 'export',
      label: 'Deploy Kit',
      icon: Box,
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
        className={`fixed md:static inset-y-0 left-0 z-40 w-56 border-r border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#12161f] transition-transform duration-200 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-56'
        }`}
      >
        {/* Top Header of Sidebar with Operava Gradient */}
        <div className="h-14 border-b border-[#e2e4e9] dark:border-[#252a35] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-[#ff6b35] via-[#f38020] to-[#7928ca] flex items-center justify-center shadow-xs">
              <Zap className="h-3.5 w-3.5 text-white fill-current" />
            </div>
            <span className="font-bold text-xs tracking-wider uppercase bg-gradient-to-r from-[#ff6b35] via-[#f38020] to-[#9333ea] bg-clip-text text-transparent">
              DEV’AI CONTROLLER
            </span>
          </div>

          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-[#5f6368] hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors md:hidden cursor-pointer"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
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
                className={`w-full flex items-center p-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff6b35] via-[#ea580c] to-[#9333ea] text-white shadow-xs font-semibold'
                    : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f4f5f8] dark:hover:bg-[#1a1e27] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-[#80868b]'}`} />
                  <span className="leading-tight">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer: User requested attribution */}
        <div className="p-3 border-t border-[#e2e4e9] dark:border-[#252a35] bg-[#f8f9fb] dark:bg-[#10131a] text-center">
          <p className="text-[11px] text-[#80868b] leading-tight font-medium">
            Internally developed by Jelvan R.
          </p>
          <p className="text-[10px] text-[#80868b] mt-0.5">
            All rights reserved. 2026
          </p>
        </div>
      </aside>
    </>
  );
};

