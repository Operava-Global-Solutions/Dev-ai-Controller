import type { DeployedApp } from '../../src/types/index.js';
import { addAuditLog } from '../storage.js';

function cloudflareCredentials() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) throw new Error('Cloudflare production credentials are not configured');
  return { accountId, apiToken };
}

async function cf(path: string, init?: RequestInit) {
  const { accountId, apiToken } = cloudflareCredentials();
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.success === false) throw new Error(`Cloudflare API error ${response.status}: ${JSON.stringify(body?.errors || body)}`);
  return body.result;
}

export async function listDeployedApps(): Promise<DeployedApp[]> {
  const workers = await cf('/workers/scripts');
  return (Array.isArray(workers) ? workers : []).map((w: any) => ({
    id: w.id,
    name: w.id,
    platform: 'Cloudflare Workers',
    environment: 'production',
    status: 'healthy',
    url: `https://${w.id}.workers.dev`,
    commitSha: w.etag || '',
    commitMessage: 'Live Cloudflare Worker deployment',
    branch: 'production',
    deployedAt: w.modified_on || w.created_on || new Date().toISOString(),
    latencyMs: 0,
    uptime: 'Live API',
    requests24h: 0,
  }));
}

export async function triggerDeployment(appId: string, user = 'operator'): Promise<{ success: boolean; app: DeployedApp; message: string }> {
  const apps = await listDeployedApps();
  const app = apps.find((a) => a.id === appId);
  if (!app) throw new Error(`Cloudflare Worker "${appId}" was not found. Production deployment requires an existing Worker or a deployment artifact.`);
  throw new Error(`Production redeploy for "${appId}" requires an explicit Worker artifact/version. No deployment was performed; simulated deployment is disabled.`);
}

export async function rollbackDeployment(appId: string, user = 'operator'): Promise<{ success: boolean; app: DeployedApp; message: string }> {
  const apps = await listDeployedApps();
  const app = apps.find((a) => a.id === appId);
  if (!app) throw new Error(`Cloudflare Worker "${appId}" was not found.`);
  throw new Error(`Production rollback for "${appId}" requires a verified Cloudflare version identifier. No rollback was performed; simulated rollback is disabled.`);
}
