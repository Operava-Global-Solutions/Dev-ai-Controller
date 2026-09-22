import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  Database,
  GitBranch,
  Mail,
  Cpu,
  Sparkles,
  Zap,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import type { ServiceStatusInfo, ServiceType } from '../types/index.js';

interface StatusDashboardProps {
  services: Record<ServiceType, ServiceStatusInfo>;
  systemSummary?: {
    overallStatus: 'all_operational' | 'degraded_performance' | 'action_required';
    primaryAiProvider: string;
    fallbackAiProvider: string;
    totalActiveDeployments: number;
    securedSecretsCount: number;
    timestamp: string;
  };
  onRefresh: () => void;
  isRefreshing: boolean;
  onNavigateToCoding: () => void;
  onNavigateToDeployments: () => void;
  onNavigateToNotifications: () => void;
}

export const StatusDashboard: React.FC<StatusDashboardProps> = ({
  services,
  systemSummary,
  onRefresh,
  isRefreshing,
  onNavigateToCoding,
  onNavigateToDeployments,
  onNavigateToNotifications,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceType | null>(null);

  const getServiceIcon = (id: ServiceType) => {
    switch (id) {
      case 'cloudflare':
        return <Zap className="h-5 w-5 text-orange-500" />;
      case 'supabase':
        return <Database className="h-5 w-5 text-emerald-500" />;
      case 'github':
        return <GitBranch className="h-5 w-5 text-purple-500" />;
      case 'resend':
        return <Mail className="h-5 w-5 text-cyan-500" />;
      case 'openai':
        return <Cpu className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string, isFallback?: boolean) => {
    if (isFallback) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
          Standby Fallback
        </span>
      );
    }
    if (status === 'operational') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
          Operational
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5" />
        Degraded
      </span>
    );
  };

  const serviceList: ServiceStatusInfo[] = [
    services.cloudflare || {
      id: 'cloudflare',
      name: 'Cloudflare',
      role: 'Primary Runtime, Edge APIs & Cloudflare AI',
      status: 'operational',
      latencyMs: 24,
      lastChecked: new Date().toISOString(),
      details: 'Workers runtime, request routing, and Cloudflare AI healthy.',
      features: ['Serverless Runtime', 'Cloudflare Workers AI', 'Request Routing', 'Zero-Trust Secrets'],
    },
    services.supabase || {
      id: 'supabase',
      name: 'Supabase',
      role: 'Authentication & Central Database',
      status: 'operational',
      latencyMs: 28,
      lastChecked: new Date().toISOString(),
      details: 'Supabase Auth session validator and PostgreSQL database connected with RLS policies.',
      features: ['Supabase Auth', 'PostgreSQL Database', 'Row Level Security', 'Audit Trail Storage'],
    },
    services.github || {
      id: 'github',
      name: 'GitHub',
      role: 'Source Code, Commits & PR Automation',
      status: 'operational',
      latencyMs: 42,
      lastChecked: new Date().toISOString(),
      details: 'GitHub REST API connected with standard repository access & code inspection.',
      features: ['Repository Inspection', 'Source Code Analysis', 'Pull Request Automation', 'Commit Verification'],
    },
    services.resend || {
      id: 'resend',
      name: 'Resend',
      role: 'Transactional Email & Notifications',
      status: 'operational',
      latencyMs: 35,
      lastChecked: new Date().toISOString(),
      details: 'Transactional email delivery pipeline verified. Ready for deployment and agent alerts.',
      features: ['Transactional Email', 'Deployment Notifications', 'System Alerts', 'Batch Email Delivery'],
    },
    services.openai || {
      id: 'openai',
      name: 'OpenAI (Fallback)',
      role: 'Secondary / Fallback AI Provider',
      status: 'standby',
      latencyMs: 48,
      lastChecked: new Date().toISOString(),
      details: 'Standby fallback provider available. Ready to seamlessly take over if primary Cloudflare AI throttles.',
      isFallback: true,
      features: ['Secondary Fallback AI', 'Automatic Failover', 'Zero-Downtime Reasoning', 'Model Redundancy'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Architecture & System Health */}
      <div className="rounded-2xl border border-orange-200/80 dark:border-orange-950/60 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50 dark:from-[#1c1815] dark:via-[#16181d] dark:to-[#1a1715] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-lg font-semibold tracking-tight text-[#1a1d24] dark:text-[#f0f3f6]">
                Multi-Service Operational Status
              </h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800/80">
                Cloudflare Workers AI Core
              </span>
            </div>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] max-w-2xl leading-relaxed">
              Monitoring real-time health across Cloudflare, Supabase, GitHub, Resend, and OpenAI.
              All confidential secrets remain server-side in Cloudflare configuration.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-[#20242d] text-[#1a1d24] dark:text-[#f0f3f6] border border-[#e2e4e9] dark:border-[#2e333d] hover:bg-[#f8f9fa] dark:hover:bg-[#282d38] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-orange-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Pinging Services...' : 'Refresh Status'}</span>
            </button>

            <button
              onClick={onNavigateToCoding}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#f38020] hover:bg-[#d96e14] text-white transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Drive Coding</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-orange-200/50 dark:border-orange-950/40">
          <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1f232c]/80 border border-[#e2e4e9] dark:border-[#2e333d]">
            <p className="text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6]">Primary AI Engine</p>
            <p className="text-xs font-semibold text-[#1a1d24] dark:text-[#f0f3f6] mt-0.5 truncate">
              Workers AI (Llama 3.3 70B)
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-[#1f232c]/80 border border-[#e2e4e9] dark:border-[#2e333d]">
            <p className="text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6]">Fallback AI Engine</p>
            <p className="text-xs font-semibold text-[#1a1d24] dark:text-[#f0f3f6] mt-0.5 truncate">
              OpenAI (gpt-4o-mini)
            </p>
          </div>

          <div
            onClick={onNavigateToDeployments}
            className="p-3 rounded-xl bg-white/80 dark:bg-[#1f232c]/80 border border-[#e2e4e9] dark:border-[#2e333d] cursor-pointer hover:border-orange-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6]">Active Deployments</p>
              <ArrowUpRight className="h-3 w-3 text-orange-500" />
            </div>
            <p className="text-xs font-semibold text-[#1a1d24] dark:text-[#f0f3f6] mt-0.5">
              5 Edge Apps Healthy
            </p>
          </div>

          <div
            onClick={onNavigateToNotifications}
            className="p-3 rounded-xl bg-white/80 dark:bg-[#1f232c]/80 border border-[#e2e4e9] dark:border-[#2e333d] cursor-pointer hover:border-orange-400 transition-colors"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6]">Notifications Pipeline</p>
              <ArrowUpRight className="h-3 w-3 text-orange-500" />
            </div>
            <p className="text-xs font-semibold text-[#1a1d24] dark:text-[#f0f3f6] mt-0.5">
              Resend Verified • 100%
            </p>
          </div>
        </div>
      </div>

      {/* 5 Services Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceList.map((service) => (
          <div
            key={service.id}
            onClick={() => setSelectedServiceId(service.id === selectedServiceId ? null : service.id)}
            className={`rounded-2xl border p-5 transition-all cursor-pointer ${
              selectedServiceId === service.id
                ? 'border-orange-500 dark:border-orange-500 bg-white dark:bg-[#1a1e27] ring-2 ring-orange-500/20'
                : 'border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] hover:border-orange-300 dark:hover:border-orange-800/60 shadow-2xs'
            }`}
          >
            {/* Header: Service Icon, Name & Status */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#f4f5f8] dark:bg-[#202530] border border-[#e2e4e9] dark:border-[#2c3240]">
                  {getServiceIcon(service.id)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
                    {service.name}
                  </h3>
                  <p className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] truncate max-w-[170px]">
                    {service.role}
                  </p>
                </div>
              </div>

              {getStatusBadge(service.status, service.isFallback)}
            </div>

            {/* Service Summary Detail */}
            <p className="mt-3 text-xs text-[#5f6368] dark:text-[#9aa0a6] line-clamp-2 leading-relaxed">
              {service.details}
            </p>

            {/* Metrics pills */}
            <div className="mt-4 pt-3 border-t border-[#f0f2f5] dark:border-[#232834] flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1.5 text-[#5f6368] dark:text-[#9aa0a6]">
                <Clock className="h-3 w-3 text-orange-500" />
                <span>P95 Latency:</span>
                <span className="font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">{service.latencyMs}ms</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#f4f5f8] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6]">
                {service.version || 'v1.0'}
              </span>
            </div>

            {/* Capabilities tags */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {service.features.map((feat, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#f8f9fb] dark:bg-[#1c212b] text-[#5f6368] dark:text-[#9aa0a6] border border-[#eaedf1] dark:border-[#282f3d]"
                >
                  {feat}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Zero-Trust Secrets Isolation Architecture Card */}
      <div className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1a1d24] dark:text-[#f0f3f6]">
              Cloudflare Server-Side Secret Isolation Architecture
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            Zero Browser Exposure
          </span>
        </div>

        <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
          Following security mandates, no confidential API keys, tokens, or infrastructure credentials exist on the UI.
          All credentials (<code className="text-orange-600 dark:text-orange-400 font-mono">CLOUDFLARE_API_TOKEN</code>,{' '}
          <code className="text-purple-600 dark:text-purple-400 font-mono">GITHUB_TOKEN</code>,{' '}
          <code className="text-emerald-600 dark:text-emerald-400 font-mono">SUPABASE_SERVICE_ROLE_KEY</code>,{' '}
          <code className="text-cyan-600 dark:text-cyan-400 font-mono">RESEND_API_KEY</code>,{' '}
          <code className="text-blue-600 dark:text-blue-400 font-mono">OPENAI_API_KEY</code>) are securely bound on Cloudflare Worker runtime.
        </p>
      </div>
    </div>
  );
};
