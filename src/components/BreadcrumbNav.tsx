import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  Zap,
  Sparkles,
  Bot,
  Activity,
  Clock,
  Terminal,
  Globe,
  Bell,
  History,
  HelpCircle,
  Box,
  BookOpen,
  ChevronDown,
  Layers,
  ArrowRight,
  Home,
  MessageSquare,
  X,
} from 'lucide-react';

export interface BreadcrumbItemConfig {
  id: string;
  label: string;
  category: string;
  categoryLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const TAB_REGISTRY: Record<string, BreadcrumbItemConfig> = {
  agents: {
    id: 'agents',
    label: 'AGENTS Platform',
    category: 'agents',
    categoryLabel: 'Autonomous Agents',
    icon: Zap,
    description: 'Multi-agent orchestration and automated execution engine',
  },
  chat: {
    id: 'chat',
    label: 'Dev’ai Chat',
    category: 'agents',
    categoryLabel: 'Autonomous Agents',
    icon: Sparkles,
    description: 'Interactive natural language command center with Gemini 3.8 Flash',
  },
  worker: {
    id: 'worker',
    label: 'Worker Agent',
    category: 'agents',
    categoryLabel: 'Autonomous Agents',
    icon: Bot,
    description: 'Cloudflare Worker bindings, secrets, and edge logic controller',
  },
  chathistory: {
    id: 'chathistory',
    label: 'Chat History',
    category: 'agents',
    categoryLabel: 'Autonomous Agents',
    icon: Clock,
    description: 'Archive of past reasoning sessions and command executions',
  },
  coding: {
    id: 'coding',
    label: 'Coding Agent',
    category: 'engineering',
    categoryLabel: 'Engineering & Code',
    icon: Terminal,
    description: 'Automated code refactoring, PR generation, and GitHub automation',
  },
  deployments: {
    id: 'deployments',
    label: 'Deployments Monitor',
    category: 'engineering',
    categoryLabel: 'Engineering & Code',
    icon: Globe,
    description: 'Edge worker deployments, revisions, and instant rollback controls',
  },
  export: {
    id: 'export',
    label: 'Deploy Kit',
    category: 'engineering',
    categoryLabel: 'Engineering & Code',
    icon: Box,
    description: 'Production worker export bundles and infrastructure templates',
  },
  status: {
    id: 'status',
    label: 'Services Health',
    category: 'observability',
    categoryLabel: 'Observability & Mesh',
    icon: Activity,
    description: 'Real-time telemetry across Cloudflare, Supabase, GitHub, and Resend',
  },
  notifications: {
    id: 'notifications',
    label: 'Notifications',
    category: 'observability',
    categoryLabel: 'Observability & Mesh',
    icon: Bell,
    description: 'System alerts, task updates, and transactional event streams',
  },
  logs: {
    id: 'logs',
    label: 'Audit Trail',
    category: 'observability',
    categoryLabel: 'Observability & Mesh',
    icon: History,
    description: 'Immutable security log of operations and authentication events',
  },
  knowledge: {
    id: 'knowledge',
    label: 'Knowledge Center',
    category: 'knowledge',
    categoryLabel: 'Resources & Docs',
    icon: HelpCircle,
    description: 'Operator guides, incident runbooks, and domain guidelines',
  },
  docs: {
    id: 'docs',
    label: 'LLM Documentation',
    category: 'knowledge',
    categoryLabel: 'Resources & Docs',
    icon: BookOpen,
    description: 'Model specifications, API schemas, and context prompt library',
  },
};

export const CATEGORY_GROUPS = [
  {
    id: 'agents',
    label: 'Autonomous Agents',
    tabIds: ['agents', 'chat', 'worker', 'chathistory'],
  },
  {
    id: 'engineering',
    label: 'Engineering & Code',
    tabIds: ['coding', 'deployments', 'export'],
  },
  {
    id: 'observability',
    label: 'Observability & Mesh',
    tabIds: ['status', 'notifications', 'logs'],
  },
  {
    id: 'knowledge',
    label: 'Resources & Docs',
    tabIds: ['knowledge', 'docs'],
  },
];

interface BreadcrumbNavProps {
  activeTab: string;
  onNavigate: (tabId: string) => void;
  selectedChatSessionId?: string | null;
  onClearChatSession?: () => void;
  className?: string;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
  activeTab,
  onNavigate,
  selectedChatSessionId,
  onClearChatSession,
  className = '',
}) => {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const menuRef = useRef<HTMLLIElement>(null);
  const quickSwitcherRef = useRef<HTMLDivElement>(null);

  const currentTabConfig = TAB_REGISTRY[activeTab] || {
    id: activeTab,
    label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
    category: 'general',
    categoryLabel: 'Workspace',
    icon: Layers,
    description: 'Workspace view',
  };

  const currentCategory = CATEGORY_GROUPS.find((c) => c.id === currentTabConfig.category);
  const siblingTabs = currentCategory
    ? currentCategory.tabIds.map((id) => TAB_REGISTRY[id]).filter(Boolean)
    : [];

  const CurrentIcon = currentTabConfig.icon;

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
      }
      if (quickSwitcherRef.current && !quickSwitcherRef.current.contains(event.target as Node)) {
        setIsQuickSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCategoryMenuOpen(false);
        setIsQuickSwitcherOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <nav
      aria-label="Breadcrumb navigation trail"
      className={`w-full shrink-0 flex items-center justify-between py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl border border-[#e2e4e9]/80 dark:border-[#252a35]/80 bg-white/70 dark:bg-[#12161f]/70 backdrop-blur-md shadow-2xs mb-3 sm:mb-4 transition-all ${className}`}
    >
      {/* Dynamic Trail List */}
      <ol className="flex items-center flex-wrap gap-1 sm:gap-1.5 text-xs sm:text-sm min-w-0">
        {/* Crumb 1: Root Workspace */}
        <li className="flex items-center">
          <button
            type="button"
            onClick={() => onNavigate('agents')}
            className="flex items-center space-x-1.5 text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] font-medium transition-colors cursor-pointer group focus-visible:outline-2 focus-visible:outline-purple-500 rounded px-1 -mx-1"
            title="Dev’ai Controller Root (AGENTS Platform)"
          >
            <Home className="h-3.5 w-3.5 text-[#ff6b35] group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden sm:inline">Controller</span>
            <span className="sm:hidden">Dev’ai</span>
          </button>
        </li>

        {/* Separator */}
        <li aria-hidden="true" className="text-[#a0a5ad] dark:text-[#555d6e] select-none">
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        </li>

        {/* Crumb 2: Category with Quick Sibling Switcher Dropdown */}
        <li className="relative flex items-center" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsCategoryMenuOpen((prev) => !prev)}
            aria-expanded={isCategoryMenuOpen}
            aria-haspopup="true"
            className="flex items-center space-x-1 text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-purple-500 rounded px-1 -mx-1"
            title={`Category: ${currentTabConfig.categoryLabel} (Click to switch sibling views)`}
          >
            <span className="truncate max-w-[120px] sm:max-w-none">
              {currentTabConfig.categoryLabel}
            </span>
            <ChevronDown
              className={`h-3 w-3 text-[#8b919d] dark:text-[#6e7787] transition-transform duration-200 ${
                isCategoryMenuOpen ? 'rotate-180 text-purple-500' : ''
              }`}
            />
          </button>

          {/* Sibling Category Dropdown Menu */}
          {isCategoryMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-56 sm:w-64 z-50 rounded-xl border border-[#e2e4e9] dark:border-[#2c3240] bg-white dark:bg-[#161a23] shadow-lg p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold text-[#8b919d] dark:text-[#6e7787] tracking-wider uppercase border-b border-[#e2e4e9] dark:border-[#252a35] mb-1">
                {currentTabConfig.categoryLabel}
              </div>
              <div className="space-y-0.5">
                {siblingTabs.map((item) => {
                  const SiblingIcon = item.icon;
                  const isActive = item.id === activeTab;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        setIsCategoryMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                          : 'text-[#374151] dark:text-[#d1d5db] hover:bg-[#f3f4f6] dark:hover:bg-[#1f242e]'
                      }`}
                    >
                      <SiblingIcon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-purple-600 dark:text-purple-400' : 'text-[#8b919d] dark:text-[#6e7787]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{item.label}</div>
                      </div>
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </li>

        {/* Separator */}
        <li aria-hidden="true" className="text-[#a0a5ad] dark:text-[#555d6e] select-none">
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        </li>

        {/* Crumb 3: Active Tab Leaf */}
        <li
          className="flex items-center space-x-1.5 font-semibold text-[#1a1d24] dark:text-[#f0f3f6] min-w-0"
          aria-current={!selectedChatSessionId || activeTab !== 'chat' ? 'page' : undefined}
        >
          <CurrentIcon className="h-3.5 w-3.5 text-[#9333ea] dark:text-[#a855f7] shrink-0" />
          <span className="truncate">{currentTabConfig.label}</span>
        </li>

        {/* Crumb 4 (Optional): Sub-level Chat Session */}
        {activeTab === 'chat' && selectedChatSessionId && (
          <>
            <li aria-hidden="true" className="text-[#a0a5ad] dark:text-[#555d6e] select-none">
              <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            </li>
            <li
              className="flex items-center space-x-1 font-mono text-[11px] sm:text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200/70 dark:border-purple-800/60"
              aria-current="page"
            >
              <MessageSquare className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[140px]">
                {selectedChatSessionId.length > 15
                  ? `${selectedChatSessionId.slice(0, 13)}…`
                  : selectedChatSessionId}
              </span>
              {onClearChatSession && (
                <button
                  type="button"
                  onClick={onClearChatSession}
                  className="hover:text-purple-950 dark:hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                  title="Return to fresh chat session"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </li>
          </>
        )}
      </ol>

      {/* Right side: Quick Jump Switcher */}
      <div className="relative shrink-0 ml-2" ref={quickSwitcherRef}>
        <button
          type="button"
          onClick={() => setIsQuickSwitcherOpen((prev) => !prev)}
          aria-expanded={isQuickSwitcherOpen}
          aria-haspopup="true"
          className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] hover:bg-[#f0f2f5] dark:hover:bg-[#1a1e27] border border-transparent hover:border-[#e2e4e9] dark:hover:border-[#2c3240] transition-colors cursor-pointer"
          title="Quick Jump to any section"
        >
          <Layers className="h-3.5 w-3.5 text-[#ff6b35]" />
          <span className="hidden md:inline">Jump</span>
          <ChevronDown
            className={`h-3 w-3 transition-transform duration-200 ${
              isQuickSwitcherOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Global Quick Switcher Dropdown */}
        {isQuickSwitcherOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 z-50 rounded-xl border border-[#e2e4e9] dark:border-[#2c3240] bg-white dark:bg-[#161a23] shadow-xl p-2 animate-in fade-in slide-in-from-top-1 duration-150 max-h-96 overflow-y-auto">
            <div className="px-2 py-1 text-[11px] font-semibold text-[#8b919d] dark:text-[#6e7787] uppercase tracking-wider border-b border-[#e2e4e9] dark:border-[#252a35] mb-2 flex items-center justify-between">
              <span>Quick Navigation</span>
              <span className="text-[10px] lowercase font-normal">12 modules</span>
            </div>

            <div className="space-y-3">
              {CATEGORY_GROUPS.map((category) => (
                <div key={category.id} className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    {category.label}
                  </div>
                  <div className="grid grid-cols-1 gap-0.5">
                    {category.tabIds.map((id) => {
                      const item = TAB_REGISTRY[id];
                      if (!item) return null;
                      const ItemIcon = item.icon;
                      const isActive = item.id === activeTab;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onNavigate(item.id);
                            setIsQuickSwitcherOpen(false);
                          }}
                          className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold'
                              : 'text-[#374151] dark:text-[#d1d5db] hover:bg-[#f3f4f6] dark:hover:bg-[#1f242e]'
                          }`}
                        >
                          <ItemIcon
                            className={`h-3.5 w-3.5 shrink-0 ${
                              isActive
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-[#8b919d] dark:text-[#6e7787]'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <span className="truncate block">{item.label}</span>
                          </div>
                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
