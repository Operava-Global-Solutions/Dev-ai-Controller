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
import type {
  ServiceStatusInfo,
  ServiceType,
  DeployedApp,
  NotificationItem,
  CodingTask,
  AuditLog,
  SupabaseAuthUser,
} from './types/index.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('status');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Authenticated Supabase User (read-only session display)
  const [currentUser, setCurrentUser] = useState<SupabaseAuthUser>({
    id: 'usr-sb-7782194',
    email: 'secured.jelvan@gmail.com',
    name: 'Jelvan',
    role: 'Developer / Operator',
    sessionValid: true,
    lastSignInAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  });

  // Services Status Data
  const [services, setServices] = useState<Record<ServiceType, ServiceStatusInfo>>({
    cloudflare: {
      id: 'cloudflare',
      name: 'Cloudflare',
      role: 'Primary Runtime, Edge APIs & Cloudflare AI',
      status: 'operational',
      latencyMs: 22,
      lastChecked: new Date().toISOString(),
      version: 'Workers v2026.3',
      details: 'Workers runtime, request routing, and Cloudflare AI healthy.',
      features: ['Serverless Runtime', 'Cloudflare Workers AI', 'Request Routing', 'Zero-Trust Secrets'],
    },
    supabase: {
      id: 'supabase',
      name: 'Supabase',
      role: 'Authentication & Central Database',
      status: 'operational',
      latencyMs: 27,
      lastChecked: new Date().toISOString(),
      version: 'PostgreSQL 15.6',
      details: 'Supabase Auth session validator and PostgreSQL database connected with RLS policies.',
      features: ['Supabase Auth', 'PostgreSQL Database', 'Row Level Security', 'Audit Trail Storage'],
    },
    github: {
      id: 'github',
      name: 'GitHub',
      role: 'Source Code, Commits & PR Automation',
      status: 'operational',
      latencyMs: 38,
      lastChecked: new Date().toISOString(),
      version: 'REST API v3',
      details: 'GitHub REST API connected with standard repository access & code inspection.',
      features: ['Repository Inspection', 'Source Code Analysis', 'Pull Request Automation', 'Commit Verification'],
    },
    resend: {
      id: 'resend',
      name: 'Resend',
      role: 'Transactional Email & Notifications',
      status: 'operational',
      latencyMs: 34,
      lastChecked: new Date().toISOString(),
      version: 'Resend API v1',
      details: 'Transactional email delivery pipeline verified. Ready for deployment and agent alerts.',
      features: ['Transactional Email', 'Deployment Notifications', 'System Alerts', 'Batch Email Delivery'],
    },
    openai: {
      id: 'openai',
      name: 'OpenAI (Fallback)',
      role: 'Secondary / Fallback AI Provider',
      status: 'standby',
      latencyMs: 44,
      lastChecked: new Date().toISOString(),
      version: 'gpt-4o-mini',
      details: 'Standby fallback provider available. Ready to seamlessly take over if primary Cloudflare AI throttles.',
      isFallback: true,
      features: ['Secondary Fallback AI', 'Automatic Failover', 'Zero-Downtime Reasoning', 'Model Redundancy'],
    },
  });

  const [systemSummary, setSystemSummary] = useState({
    overallStatus: 'all_operational' as const,
    primaryAiProvider: 'Cloudflare Workers AI (@cf/meta/llama-3.3-70b)',
    fallbackAiProvider: 'OpenAI (gpt-4o-mini)',
    totalActiveDeployments: 5,
    securedSecretsCount: 5,
    timestamp: new Date().toISOString(),
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

  // Initial Data Load
  useEffect(() => {
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
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

            {activeTab === 'docs' && <DocsViewer />}

            {activeTab === 'export' && <ExportKit />}
          </div>
        </main>
      </div>
    </div>
  );
}
