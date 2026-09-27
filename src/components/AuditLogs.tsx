import React, { useState } from 'react';
import {
  Terminal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Download,
  ChevronRight,
  ChevronDown,
  Layers,
  Database,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import type { AuditLog, ActionStatus } from '../types/index.js';

interface AuditLogsProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ logs, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ActionStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = logs.filter((log) => {
    const serviceName = (log.service || (log as any).provider || '').toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      serviceName.includes(searchTerm.toLowerCase()) ||
      (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudflare-agent-hub-audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto py-2">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold tracking-tight text-[#1a1d24] dark:text-[#f0f3f6]">
              Audit Trail
            </h2>
          </div>
          <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
            Log of system operations, deployments, and automated actions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            title="Refresh logs"
            className="p-2 rounded-xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] hover:bg-[#f8f9fa] dark:hover:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={handleExportJson}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] hover:bg-[#f8f9fa] dark:hover:bg-[#202530] text-[#1a1d24] dark:text-[#f0f3f6] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#80868b]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, service, user or summary..."
            className="w-full bg-white dark:bg-[#161a22] border border-[#e2e4e9] dark:border-[#252a35] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1a1d24] dark:text-[#f0f3f6] placeholder-[#80868b] focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center space-x-1 bg-white dark:bg-[#161a22] p-1 rounded-xl border border-[#e2e4e9] dark:border-[#252a35] shadow-2xs text-xs">
          {(['all', 'success', 'error'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium capitalize transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#f38020] text-white'
                  : 'text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24] dark:hover:text-[#f0f3f6]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / Card List */}
      <div className="bg-white dark:bg-[#161a22] rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] shadow-2xs overflow-hidden divide-y divide-[#e2e4e9] dark:divide-[#252a35]">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[#5f6368] dark:text-[#80868b]">
            <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No audit logs matching query.</p>
          </div>
        ) : (
          filtered.map((log) => {
            const isExpanded = expandedId === log.id;
            const serviceKey = log.service || (log as any).provider || 'system';

            return (
              <div key={log.id} className="transition-colors">
                <div
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#f8f9fb] dark:hover:bg-[#1f242e]/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="mt-0.5">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-500" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#f0f2f5] dark:bg-[#202530] text-[#5f6368] dark:text-[#9aa0a6] uppercase">
                          {serviceKey}
                        </span>
                        {log.user && (
                          <span className="text-[10px] font-mono text-[#80868b] hidden sm:inline">
                            by {log.user}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">
                        {log.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-[#5f6368] dark:text-[#9aa0a6]">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-[10px] opacity-70">{log.durationMs}ms</span>
                    </div>

                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-[#80868b]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-[#80868b]" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 py-4 bg-[#f8f9fb] dark:bg-[#12151d] border-t border-[#e2e4e9] dark:border-[#252a35] text-xs font-mono space-y-3">
                    {log.details && (
                      <div>
                        <p className="text-[11px] font-semibold text-[#80868b] uppercase mb-1">Details</p>
                        <p className="text-[#1a1d24] dark:text-[#f0f3f6] font-sans text-xs">{log.details}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[11px] font-semibold text-[#80868b] uppercase mb-1">Telemetry Record</p>
                        <div className="p-2.5 rounded-lg bg-[#0d1117] text-[#c9d1d9] text-[11px] space-y-1">
                          <div>Log ID: {log.id}</div>
                          <div>Service: {serviceKey}</div>
                          <div>Status: {log.status}</div>
                          <div>Latency: {log.durationMs}ms</div>
                          <div>Timestamp: {log.timestamp}</div>
                          <div>User: {log.user || 'secured.jelvan@gmail.com'}</div>
                        </div>
                      </div>

                      {log.responseData && (
                        <div>
                          <p className="text-[11px] font-semibold text-[#80868b] uppercase mb-1">Response Payload</p>
                          <pre className="p-2.5 rounded-lg bg-[#0d1117] text-emerald-400 text-[11px] overflow-x-auto max-h-36">
                            {JSON.stringify(log.responseData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
