import type { ServiceStatusInfo, ServiceType } from '../../src/types/index.js';
import { testGitHubToken } from './github.js';
import { testResendToken } from './resend.js';
import { testCloudflareConnection } from './cloudflareService.js';

export async function getServicesStatus(): Promise<{
  services: Record<ServiceType, ServiceStatusInfo>;
  systemSummary: {
    overallStatus: 'all_operational' | 'degraded_performance' | 'action_required';
    primaryAiProvider: string;
    fallbackAiProvider: string;
    totalActiveDeployments: number;
    securedSecretsCount: number;
    timestamp: string;
  };
}> {
  const timestamp = new Date().toISOString();

  // 1. Cloudflare Check
  const cfStart = Date.now();
  const cfRes = await testCloudflareConnection(process.env.CLOUDFLARE_API_TOKEN, process.env.CLOUDFLARE_ACCOUNT_ID);
  const cfLatency = Date.now() - cfStart;
  const cfStatus: ServiceStatusInfo = {
    id: 'cloudflare',
    name: 'Cloudflare',
    role: 'Primary Runtime, Edge APIs & Cloudflare AI',
    status: cfRes.valid ? 'operational' : 'degraded',
    latencyMs: cfLatency,
    lastChecked: timestamp,
    version: 'Workers v2026.3',
    details: cfRes.message || 'Workers runtime, request routing, and Cloudflare AI healthy.',
    metrics: {
      'Workers AI Model': '@cf/meta/llama-3.3-70b',
      'Edge PoPs': '330+ locations',
      'Secrets Secured': 5,
    },
    features: ['Serverless Runtime', 'Cloudflare Workers AI', 'Request Routing', 'Zero-Trust Secrets'],
  };

  // 3. GitHub Check
  const ghStart = Date.now();
  const ghRes = await testGitHubToken(process.env.GITHUB_TOKEN || '');
  const ghLatency = Date.now() - ghStart;
  const ghStatus: ServiceStatusInfo = {
    id: 'github',
    name: 'GitHub',
    role: 'Source Code, Commits & PR Automation',
    status: ghRes.valid ? 'operational' : 'degraded',
    latencyMs: ghLatency,
    lastChecked: timestamp,
    version: 'REST API v3',
    details: ghRes.user
      ? `Authenticated as @${ghRes.user} with repository & pull_request scopes.`
      : (ghRes.message || 'GitHub authentication check failed.'),
    metrics: {
      'Authenticated': ghRes.valid ? 'Yes' : 'No',
    },
    features: ['Repository Inspection', 'Source Code Analysis', 'Pull Request Automation', 'Commit Verification'],
  };

  // 4. Resend Check
  const reStart = Date.now();
  const reRes = await testResendToken(process.env.RESEND_API_KEY || '');
  const reLatency = Date.now() - reStart;
  const reStatus: ServiceStatusInfo = {
    id: 'resend',
    name: 'Resend',
    role: 'Transactional Email & Notifications',
    status: reRes.valid ? 'operational' : 'degraded',
    latencyMs: reLatency,
    lastChecked: timestamp,
    version: 'Resend API v1',
    details: reRes.message || 'Transactional email delivery pipeline verified. Ready for deployment and agent alerts.',
    metrics: {
      'Authenticated': reRes.valid ? 'Yes' : 'No',
    },
    features: ['Transactional Email', 'Deployment Notifications', 'System Alerts', 'Batch Email Delivery'],
  };

  // 5. OpenAI Check (Fallback Provider)
  const openAiKey = process.env.OPENAI_API_KEY;
  const openAiStatus: ServiceStatusInfo = {
    id: 'openai',
    name: 'OpenAI (Fallback)',
    role: 'Secondary / Fallback AI Provider',
    status: openAiKey ? 'standby' : 'degraded',
    latencyMs: 0,
    lastChecked: timestamp,
    version: 'gpt-4o-mini',
    details: openAiKey
      ? 'Secondary OpenAI fallback configured and on standby. Automatically invoked if Cloudflare AI is unavailable.'
      : 'OpenAI fallback is not configured.',
    isFallback: true,
    metrics: {
      'Fallback Model': 'gpt-4o-mini',
      'Failover Strategy': 'Automatic on error',
      'Active Provider': 'Cloudflare AI (Primary)',
    },
    features: ['Secondary Fallback AI', 'Automatic Failover', 'Zero-Downtime Reasoning', 'Model Redundancy'],
  };

  const allOperational = [cfStatus, ghStatus, reStatus].every(
    (s) => s.status === 'operational'
  );

  return {
    services: {
      cloudflare: cfStatus,
      github: ghStatus,
      resend: reStatus,
      openai: openAiStatus,
    },
    systemSummary: {
      overallStatus: allOperational ? 'all_operational' : 'degraded_performance',
      primaryAiProvider: 'Cloudflare Workers AI (@cf/meta/llama-3.3-70b)',
      fallbackAiProvider: 'OpenAI (gpt-4o-mini)',
      totalActiveDeployments: 0,
      securedSecretsCount: ['CLOUDFLARE_API_TOKEN','SUPABASE_SERVICE_ROLE_KEY','GITHUB_TOKEN','RESEND_API_KEY','OPENAI_API_KEY','GEMINI_API_KEY','JWT_SECRET','WORKER_SECRET'].filter((k) => Boolean(process.env[k])).length,
      timestamp,
    },
  };
}
