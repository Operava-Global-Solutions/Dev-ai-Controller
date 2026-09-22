import React, { useState } from 'react';
import {
  Bell,
  Mail,
  Zap,
  GitBranch,
  Database,
  ExternalLink,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react';
import type { NotificationItem } from '../types/index.js';

interface NotificationsFeedProps {
  notifications: NotificationItem[];
}

export const NotificationsFeed: React.FC<NotificationsFeedProps> = ({
  notifications,
}) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'all') return true;
    return item.service === filter;
  });

  const getServiceBadge = (service: string) => {
    switch (service) {
      case 'resend':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
            <Mail className="h-3 w-3" />
            <span>Resend</span>
          </span>
        );
      case 'cloudflare':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
            <Zap className="h-3 w-3" />
            <span>Cloudflare</span>
          </span>
        );
      case 'github':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
            <GitBranch className="h-3 w-3" />
            <span>GitHub</span>
          </span>
        );
      case 'supabase':
        return (
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <Database className="h-3 w-3" />
            <span>Supabase</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 text-[11px] font-semibold text-[#5f6368]">
            <span>System</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Bell className="h-4 w-4" />
              </span>
              <h2 className="text-base font-semibold text-[#1a1d24] dark:text-[#f0f3f6]">
                Notifications
              </h2>
            </div>
            <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6]">
              Activity log and alerts across all connected services.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-[#f0f2f5] dark:bg-[#202530] border border-[#e2e4e9] dark:border-[#2c3240] self-start">
            {['all', 'resend', 'cloudflare', 'github', 'supabase'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-white dark:bg-[#161a22] text-[#1a1d24] dark:text-[#f0f3f6] shadow-2xs font-semibold text-purple-600 dark:text-purple-400'
                    : 'text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a1d24]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredNotifications.map((notif) => (
          <div
            key={notif.id}
            className="rounded-2xl border border-[#e2e4e9] dark:border-[#252a35] bg-white dark:bg-[#161a22] p-4.5 hover:border-purple-300 dark:hover:border-purple-900/60 transition-all shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  {getServiceBadge(notif.service)}
                  <span className="text-[11px] text-[#80868b]">•</span>
                  <h4 className="text-xs font-bold text-[#1a1d24] dark:text-[#f0f3f6]">
                    {notif.title}
                  </h4>
                </div>

                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                  {notif.message}
                </p>

                <div className="flex items-center space-x-4 pt-1 text-[11px] text-[#5f6368] dark:text-[#9aa0a6]">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span>{new Date(notif.timestamp).toLocaleString()}</span>
                  </div>

                  {notif.recipient && (
                    <div className="flex items-center space-x-1 text-cyan-700 dark:text-cyan-300 font-mono">
                      <span>To: {notif.recipient}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {notif.status}
                </span>

                {notif.linkUrl && (
                  <a
                    href={notif.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-[#5f6368] hover:text-orange-500 hover:bg-[#f0f2f5] dark:hover:bg-[#202530] transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
