import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { Sidebar } from './components/Sidebar.js';
import { StatusDashboard } from './components/StatusDashboard.js';
import { CodingAgent } from './components/CodingAgent.js';
import { DeploymentsMonitor } from './components/DeploymentsMonitor.js';
import { NotificationsFeed } from './components/NotificationsFeed.js';
import { AuditLogs } from './components/AuditLogs.js';
import { DocsViewer } from './components/DocsViewer.js';
import { ExportKit } from './components/ExportKit.js';
import { DevaiChat } from './components/DevaiChat.js';
import { ChatHistory } from './components/ChatHistory.js';
import { KnowledgeCenter } from './components/KnowledgeCenter.js';
import { WorkerAgent } from './components/WorkerAgent.js';
import { AgentsPlatform } from './components/AgentsPlatform.js';
import { BreadcrumbNav } from './components/BreadcrumbNav.js';
import { AdminProtectiveWrapper } from './components/AdminProtectiveWrapper.js';
import type {
  ServiceStatusInfo,
  ServiceType,
  DeployedApp,
  NotificationItem,
  CodingTask,
  AuditLog,
  AdminAuthUser,
} from './types/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('agents');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<string | null>(null);

  // Authenticated Admin User (read-only session display)
  const [currentUser, setCurrentUser] = useState<AdminAuthUser>({
    id: 'usr-sb-7782194',
    email: 'secured.jelvan@gmail.com',
    name: 'Jelvan',
    role: 'Developer / Operator',
    sessionValid: true,
    lastSignInAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  });

  // Services Status Data: production status is unknown until /api/status responds.
  const [services, setServices] = useState<Record<ServiceType, ServiceStatusInfo>>({
    cloudflare: { id: 'cloudflare', name: 'Cloudflare', role: 'Primary Runtime, Edge APIs & Cloudflare AI', status: 'offline', latencyMs: 0, lastChecked: '', version: '', details: 'Awaiting live health check.', features: [] },
    github: { id: 'github', name: 'GitHub', role: 'Source Code, Commits & PR Automation', status: 'offline', latencyMs: 0, lastChecked: '', version: '', details: 'Awaiting live health check.', features: [] },
    resend: { id: 'resend', name: 'Resend', role: 'Transactional Email & Notifications', status: 'offline', latencyMs: 0, lastChecked: '', version: '', details: 'Awaiting live health check.', features: [] },
    openai: { id: 'openai', name: 'OpenAI (Fallback)', role: 'Secondary / Fallback AI Provider', status: 'offline', latencyMs: 0, lastChecked: '', version: '', details: 'Awaiting live health check.', isFallback: true, features: [] },
  });

  const [systemSummary, setSystemSummary] = useState({
    overallStatus: 'degraded_performance' as const,
    primaryAiProvider: 'Awaiting live health check',
    fallbackAiProvider: 'Awaiting live health check',
    totalActiveDeployments: 0,
    securedSecretsCount: 0,
    timestamp: '',
  });

  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);

  // Deployments Data
  const [deployments, setDeployments] = useState<DeployedApp[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);

  // Notifications Data
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Coding Tasks Data
  const [codingTasks, setCodingTasks] = useState<CodingTask[]>([]);
  const [isExecutingCodeTask, setIsExecutingCodeTask] = useState(false);

  // Audit Logs
  const [logs, setLogs] = useState<AuditLog[]>([]);

  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hub_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('hub_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('hub_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Fetch Services Status
  const fetchStatus = async () => {
    setIsRefreshingStatus(true);
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data.success && data.services) {
        setServices(data.services);
        if (data.systemSummary) {
          setSystemSummary(data.systemSummary);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch status:', err);
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  // Fetch Deployments
  const fetchDeployments = async () => {
    try {
      const res = await fetch('/api/deployments');
      const data = await res.json();
      if (data.success && data.deployments) {
        setDeployments(data.deployments);
      }
    } catch (err) {
      console.warn('Failed to fetch deployments:', err);
    }
  };

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  };

  // Fetch Coding Tasks
  const fetchCodingTasks = async () => {
    try {
      const res = await fetch('/api/coding/tasks');
      const data = await res.json();
      if (data.success && data.tasks) {
        setCodingTasks(data.tasks);
      }
    } catch (err) {
      console.warn('Failed to fetch coding tasks:', err);
    }
  };

  // Fetch Logs
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.warn('Failed to fetch logs:', err);
    }
  };

  // Fetch Auth User
  const fetchAuthUser = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/auth/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.warn('Failed to fetch auth user:', err);
    }
  };

  // Initial Data Load
  useEffect(() => {
    fetchAuthUser();
    fetchStatus();
    fetchDeployments();
    fetchNotifications();
    fetchCodingTasks();
    fetchLogs();
  }, []);

  // Trigger Deployment
  const handleTriggerDeploy = async (appId: string) => {
    setIsDeploying(true);
    try {
      const res = await fetch('/api/deployments/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, user: currentUser.email }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDeployments();
        await fetchLogs();
        await fetchNotifications();
      }
    } catch (err) {
      console.error('Trigger deployment failed:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  // Rollback Deployment
  const handleRollbackDeploy = async (appId: string) => {
    setIsDeploying(true);
    try {
      const res = await fetch('/api/deployments/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, user: currentUser.email }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchDeployments();
        await fetchLogs();
        await fetchNotifications();
      }
    } catch (err) {
      console.error('Rollback deployment failed:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  // Execute Coding Agent Task
  const handleExecuteCodingTask = async (prompt: string, repo: string, branch: string) => {
    setIsExecutingCodeTask(true);
    try {
      const res = await fetch('/api/coding/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, repo, branch, user: currentUser.email }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        setCodingTasks((prev) => [data.task, ...prev]);
        await fetchNotifications();
        await fetchLogs();
      }
    } catch (err) {
      console.error('Coding task execution failed:', err);
    } finally {
      setIsExecutingCodeTask(false);
    }
  };

  return (
    <AdminProtectiveWrapper>
      <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0f1117] text-[#1a1d24] dark:text-[#f0f3f6] flex flex-col antialiased">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          currentUser={currentUser}
          onUserUpdate={setCurrentUser}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar Navigation */}
          <Sidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen((prev) => !prev)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            currentUser={currentUser}
          />

          {/* Main Content View */}
          <main
            className={`flex-1 chat-dot-bg ${
              activeTab === 'chat'
                ? 'flex flex-col h-[calc(100vh-65px)] overflow-hidden p-2 sm:p-4'
                : 'overflow-y-auto p-4 sm:p-6 lg:p-8'
            }`}
          >
            <div
              className={`w-full max-w-6xl mx-auto ${
                activeTab === 'chat' ? 'flex-1 flex flex-col h-full min-h-0' : ''
              }`}
            >
              {/* Breadcrumb Navigation Trail */}
              <BreadcrumbNav
                activeTab={activeTab}
                onNavigate={setActiveTab}
                selectedChatSessionId={selectedChatSessionId}
                onClearChatSession={() => setSelectedChatSessionId(null)}
              />

              {activeTab === 'agents' && <AgentsPlatform />}

              {activeTab === 'status' && (
                <StatusDashboard
                  services={services}
                  systemSummary={systemSummary}
                  onRefresh={fetchStatus}
                  isRefreshing={isRefreshingStatus}
                  onNavigateToCoding={() => setActiveTab('coding')}
                  onNavigateToDeployments={() => setActiveTab('deployments')}
                  onNavigateToNotifications={() => setActiveTab('notifications')}
                />
              )}

              {activeTab === 'worker' && <WorkerAgent />}

              {activeTab === 'chat' && (
                <DevaiChat
                  activeSessionId={selectedChatSessionId}
                  onSelectSession={setSelectedChatSessionId}
                  onNavigateToHistory={() => setActiveTab('chathistory')}
                  onNavigateToKnowledge={() => setActiveTab('knowledge')}
                />
              )}

              {activeTab === 'chathistory' && (
                <ChatHistory
                  onOpenSession={(id) => {
                    setSelectedChatSessionId(id);
                    setActiveTab('chat');
                  }}
                  onCreateNewChat={async () => {
                    try {
                      const res = await fetch('/api/chat/sessions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title: 'Fresh Chat' }),
                      });
                      const data = await res.json();
                      if (data.success && data.session) {
                        setSelectedChatSessionId(data.session.id);
                      }
                    } catch (e) {
                      console.error('Failed to create fresh chat:', e);
                    }
                    setActiveTab('chat');
                  }}
                />
              )}

              {activeTab === 'coding' && (
                <CodingAgent
                  tasks={codingTasks}
                  onExecuteTask={handleExecuteCodingTask}
                  isLoading={isExecutingCodeTask}
                />
              )}

              {activeTab === 'deployments' && (
                <DeploymentsMonitor
                  deployments={deployments}
                  onTriggerDeploy={handleTriggerDeploy}
                  onRollbackDeploy={handleRollbackDeploy}
                  isLoading={isDeploying}
                />
              )}

              {activeTab === 'notifications' && (
                <NotificationsFeed notifications={notifications} />
              )}

              {activeTab === 'logs' && (
                <AuditLogs logs={logs} onRefresh={fetchLogs} />
              )}

              {activeTab === 'knowledge' && <KnowledgeCenter />}

              {activeTab === 'docs' && <DocsViewer />}

              {activeTab === 'export' && <ExportKit />}
            </div>
          </main>
        </div>
      </div>
    </AdminProtectiveWrapper>
  );
}
