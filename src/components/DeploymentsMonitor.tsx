import React, { useState } from 'react';
import {
  Server,
  ExternalLink,
  RotateCcw,
  Play,
  CheckCircle2,
  Clock,
  Zap,
  Globe,
  GitBranch,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import type { DeployedApp } from '../types/index.js';

interface DeploymentsMonitorProps {
  deployments: DeployedApp[];
  onTriggerDeploy: (appId: string) => Promise<void>;
  onRollbackDeploy: (appId: string) => Promise<void>;
  isLoading: boolean;
}

export const DeploymentsMonitor: React.FC<DeploymentsMonitorProps> = ({
  deployments,
  onTriggerDeploy,
  onRollbackDeploy,
  isLoading,
}) => {
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const handleDeploy = async (id: string) => {
    setActiveActionId(id);
    await onTriggerDeploy(id);
    setActiveActionId(null);
  };

  const handleRollback = async (id: string) => {
    setActiveActionId(id);
    await onRollbackDeploy(id);
    setActiveActionId(null);
  };

  const getEnvBadge = (env: string) => {
    switch (env) {
      case 'production':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
            Production
          </span>
        );
      case 'staging':
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 uppercase tracking-wider">
            Staging
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
            Preview
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
                <Globe className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
                Deployments
              </h2>
            </div>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
              Overview of all active edge deployments and release history.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium text-[#5f6368] dark:text-[#9aa0a6]">
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>5 / 5 Healthy</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Zap className="h-3.5 w-3.5 text-orange-500" />
              <span>Avg Latency: 28ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deployments List */}
      <div className="space-y-3">
        {deployments.map((app) => (
          <div
            key={app.id}
            className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-5 hover:border-orange-300 dark:hover:border-orange-900/60 transition-all shadow-2xs"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* App Overview */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                    {app.name}
                  </h3>
                  {getEnvBadge(app.environment)}
                  <span className="text-xs px-2 py-0.5 rounded-md bg-[#f4f5f8] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] font-medium">
                    {app.platform}
                  </span>
                  <span className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                    {app.status === 'deploying' ? 'Deploying to Edge...' : 'Healthy (Active)'}
                  </span>
                </div>

                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] font-mono">
                  {app.commitMessage}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                  <div className="flex items-center space-x-1">
                    <GitBranch className="h-3 w-3 text-purple-500" />
                    <span className="font-mono text-[#1a1d24] dark:text-[#f0f3f6]">{app.branch}</span>
                    <span className="font-mono text-[11px] opacity-70">({app.commitSha})</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-purple-500" />
                    <span>Deployed {new Date(app.deployedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Zap className="h-3 w-3 text-purple-500" />
                    <span>P95 Latency: <strong className="text-[#1a1d24] dark:text-[#f0f3f6]">{app.latencyMs}ms</strong></span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span>Uptime: <strong className="text-[#1a1d24] dark:text-[#f0f3f6]">{app.uptime}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 self-start lg:self-center">
                <a
                  href={app.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#f0f2f5] dark:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/40 transition-colors border border-[#e2e4e9] dark:border-[#2c3240]"
                >
                  <Globe className="h-3.5 w-3.5 text-purple-500" />
                  <span>Visit Live</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>

                <button
                  onClick={() => handleDeploy(app.id)}
                  disabled={isLoading || activeActionId === app.id}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors border border-purple-200 dark:border-purple-800 cursor-pointer disabled:opacity-50"
                >
                  <Play className={`h-3.5 w-3.5 ${activeActionId === app.id ? 'animate-spin' : ''}`} />
                  <span>Redeploy</span>
                </button>

                <button
                  onClick={() => handleRollback(app.id)}
                  disabled={isLoading || activeActionId === app.id}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-[#f8f9fa] dark:bg-[#1a1e27] text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6] transition-colors border border-[#e2e4e9] dark:border-[#2c3240] cursor-pointer disabled:opacity-50"
                  title="Instant zero-downtime rollback"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Rollback</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
