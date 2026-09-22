import type { DeployedApp } from '../../src/types/index.js';
import { addAuditLog } from '../storage.js';

let deployedApps: DeployedApp[] = [
  {
    id: 'app-cf-api-worker',
    name: 'api-core-worker',
    platform: 'Cloudflare Workers',
    environment: 'production',
    status: 'healthy',
    url: 'https://api-core-worker.operava.workers.dev',
    commitSha: '9f83a21',
    commitMessage: 'feat: add Workers AI Llama 3.3 orchestration route',
    branch: 'main',
    deployedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    latencyMs: 34,
    uptime: '99.99%',
    requests24h: 184500,
  },
  {
    id: 'app-cf-dashboard-edge',
    name: 'dashboard-edge',
    platform: 'Cloudflare Pages',
    environment: 'production',
    status: 'healthy',
    url: 'https://hub.operava.dev',
    commitSha: 'c4e7102',
    commitMessage: 'build: bundle optimized static assets with edge routing',
    branch: 'main',
    deployedAt: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    latencyMs: 18,
    uptime: '100.00%',
    requests24h: 312000,
  },
  {
    id: 'app-cf-email-dispatch',
    name: 'resend-notifier-worker',
    platform: 'Cloudflare Workers',
    environment: 'production',
    status: 'healthy',
    url: 'https://resend-notifier-worker.operava.workers.dev',
    commitSha: 'a12bc90',
    commitMessage: 'feat: transactional email triggers for deployment events',
    branch: 'main',
    deployedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    latencyMs: 42,
    uptime: '99.95%',
    requests24h: 48900,
  },
  {
    id: 'app-cf-auth-gatekeeper',
    name: 'auth-gatekeeper-staging',
    platform: 'Cloudflare Workers',
    environment: 'staging',
    status: 'active',
    url: 'https://auth-gatekeeper-staging.operava.workers.dev',
    commitSha: '56d11e9',
    commitMessage: 'test: Supabase JWT validation and RBAC edge headers',
    branch: 'feat/supabase-auth-verify',
    deployedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    latencyMs: 29,
    uptime: '99.91%',
    requests24h: 12400,
  },
  {
    id: 'app-sb-edge-functions',
    name: 'supabase-webhook-edge',
    platform: 'Supabase Edge',
    environment: 'production',
    status: 'healthy',
    url: 'https://yrqbxnzvplq.supabase.co/functions/v1/github-webhook',
    commitSha: '88a31e5',
    commitMessage: 'refactor: sync audit trail logs on repo pull_request events',
    branch: 'main',
    deployedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    latencyMs: 58,
    uptime: '99.98%',
    requests24h: 92300,
  },
];

export async function listDeployedApps(): Promise<DeployedApp[]> {
  return deployedApps;
}

export async function triggerDeployment(
  appId: string,
  user: string = 'secured.jelvan@gmail.com'
): Promise<{ success: boolean; app: DeployedApp; message: string }> {
  const appIndex = deployedApps.findIndex((a) => a.id === appId);
  if (appIndex === -1) {
    throw new Error(`Deployed application with ID "${appId}" not found`);
  }

  // Set status to deploying briefly then healthy
  const app = deployedApps[appIndex];
  const newCommitSha = Math.random().toString(16).substring(2, 9);
  
  deployedApps[appIndex] = {
    ...app,
    status: 'deploying',
    commitSha: newCommitSha,
    commitMessage: `chore: automatic edge deployment triggered by ${user}`,
    deployedAt: new Date().toISOString(),
  };

  // Simulate edge deployment completion in 800ms
  setTimeout(() => {
    deployedApps[appIndex] = {
      ...deployedApps[appIndex],
      status: 'healthy',
      latencyMs: Math.floor(20 + Math.random() * 25),
    };
  }, 1200);

  await addAuditLog({
    action: `deploy.trigger.${app.name}`,
    provider: 'cloudflare',
    status: 'success',
    durationMs: 420,
    summary: `Triggered deployment for ${app.name} (${app.environment}) on ${app.platform}`,
    details: `Commit ${newCommitSha} building and propagating to Cloudflare edge points of presence.`,
    user,
  });

  return {
    success: true,
    app: deployedApps[appIndex],
    message: `Deployment initiated for ${app.name}. Propagating to 300+ Cloudflare edge PoPs.`,
  };
}

export async function rollbackDeployment(
  appId: string,
  user: string = 'secured.jelvan@gmail.com'
): Promise<{ success: boolean; app: DeployedApp; message: string }> {
  const appIndex = deployedApps.findIndex((a) => a.id === appId);
  if (appIndex === -1) {
    throw new Error(`Deployed application with ID "${appId}" not found`);
  }

  const app = deployedApps[appIndex];
  const rollbackSha = 'prev-' + Math.random().toString(16).substring(2, 7);

  deployedApps[appIndex] = {
    ...app,
    status: 'healthy',
    commitSha: rollbackSha,
    commitMessage: `revert: rolled back to previous stable release by ${user}`,
    deployedAt: new Date().toISOString(),
  };

  await addAuditLog({
    action: `deploy.rollback.${app.name}`,
    provider: 'cloudflare',
    status: 'success',
    durationMs: 310,
    summary: `Rolled back ${app.name} to previous release`,
    details: `Instant zero-downtime rollback executed on Cloudflare Edge.`,
    user,
  });

  return {
    success: true,
    app: deployedApps[appIndex],
    message: `Instant rollback completed for ${app.name}. Previous release active.`,
  };
}
