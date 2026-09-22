import type { NotificationItem } from '../../src/types/index.js';

let notificationsList: NotificationItem[] = [
  {
    id: 'notif-resend-01',
    service: 'resend',
    type: 'email_sent',
    title: 'Deployment Notification Delivered',
    message: 'Transactional email sent to secured.jelvan@gmail.com for api-core-worker production release.',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'delivered',
    recipient: 'secured.jelvan@gmail.com',
  },
  {
    id: 'notif-cf-02',
    service: 'cloudflare',
    type: 'deployment_success',
    title: 'Cloudflare Worker Deployed',
    message: 'api-core-worker successfully deployed to global Cloudflare network (34ms P95 latency).',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    status: 'delivered',
    linkUrl: 'https://api-core-worker.operava.workers.dev',
  },
  {
    id: 'notif-gh-03',
    service: 'github',
    type: 'pr_opened',
    title: 'Pull Request Opened by Coding Agent',
    message: 'PR #142: "feat: Workers AI tool orchestration and fallbacks" ready for review.',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    status: 'delivered',
    linkUrl: 'https://github.com/operava/operava-worker-core/pull/142',
  },
  {
    id: 'notif-sb-04',
    service: 'supabase',
    type: 'security_alert',
    title: 'Supabase RLS Policy Audit Passed',
    message: 'All 8 tables verified with Row Level Security enabled. 0 anonymous read leaks.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'delivered',
  },
  {
    id: 'notif-resend-05',
    service: 'resend',
    type: 'email_sent',
    title: 'Weekly Systems Health Digest Dispatched',
    message: 'Digest delivered via Resend batch API (re_batch_49102) with 100% deliverability score.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    status: 'delivered',
    recipient: 'team@operava.dev',
  },
  {
    id: 'notif-cf-06',
    service: 'cloudflare',
    type: 'agent_task',
    title: 'Cloudflare AI Agent Task Completed',
    message: 'Automated dependency audit and code optimization completed by @cf/meta/llama-3.3-70b.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    status: 'acknowledged',
  },
];

export async function listNotifications(limit: number = 30): Promise<NotificationItem[]> {
  return notificationsList.slice(0, limit);
}

export async function createNotification(
  item: Omit<NotificationItem, 'id' | 'timestamp'>
): Promise<NotificationItem> {
  const newNotif: NotificationItem = {
    ...item,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
  };
  notificationsList.unshift(newNotif);
  return newNotif;
}
