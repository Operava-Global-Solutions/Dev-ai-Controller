export interface ExportFile {
  path: string;
  name: string;
  category: 'Worker (Cloudflare)' | 'Supabase SQL' | 'Documentation' | 'Cloudflare AI';
  language: string;
  description: string;
  content: string;
}

export const EXPORT_FILES: ExportFile[] = [
  {
    path: 'cloudflare-worker.js',
    name: 'cloudflare-worker.js',
    category: 'Worker (Cloudflare)',
    language: 'javascript',
    description: 'Production standalone Cloudflare Worker script. Ready to paste directly into Cloudflare Quick Edit.',
    content: `/**
 * Cloudflare Agent Hub - Production Cloudflare Worker Entry Point
 * Direct Paste / Quick Edit script for Cloudflare Workers Dashboard
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'operational', edge: 'cloudflare-worker' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/api/status') {
      return new Response(JSON.stringify({
        success: true,
        services: {
          cloudflare: { id: 'cloudflare', name: 'Cloudflare', status: 'operational', version: 'Workers v2026.3' },
          supabase: { id: 'supabase', name: 'Supabase', status: env.SUPABASE_URL ? 'operational' : 'degraded' },
          github: { id: 'github', name: 'GitHub', status: env.GITHUB_TOKEN ? 'operational' : 'degraded' },
          resend: { id: 'resend', name: 'Resend', status: env.RESEND_API_KEY ? 'operational' : 'degraded' },
          openai: { id: 'openai', name: 'OpenAI (Fallback)', status: env.OPENAI_API_KEY ? 'standby' : 'offline', isFallback: true },
        },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/api/coding/execute' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      let aiText = '';
      if (env.AI) {
        const res = await env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
          messages: [{ role: 'user', content: body.prompt || 'Optimize worker' }],
        });
        aiText = res.response;
      }
      return new Response(JSON.stringify({ success: true, aiText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Cloudflare Agent Hub Edge Worker' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};`,
  },
  {
    path: 'CLOUDFLARE_WORKER_PROMPT.txt',
    name: 'CLOUDFLARE_WORKER_PROMPT.txt',
    category: 'Cloudflare AI',
    language: 'text',
    description: 'Direct prompt to copy and paste into Cloudflare AI Assistant to deploy this worker directly.',
    content: `You are deploying the "Cloudflare Agent Hub" production worker on my Cloudflare account.
Please configure and activate this Cloudflare Worker with:
1. Name: "cloudflare-agent-hub"
2. Compatibility Date: "2026-03-01", flags: ["nodejs_compat"]
3. Binding: AI -> Cloudflare Workers AI (@cf/meta/llama-3.3-70b-instruct)
4. Secrets: CLOUDFLARE_API_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GITHUB_TOKEN, RESEND_API_KEY, OPENAI_API_KEY
5. Attach the provided cloudflare-worker.js code and deploy across edge nodes.`,
  },
  {
    path: 'DEPLOYMENT.md',
    name: 'DEPLOYMENT.md',
    category: 'Documentation',
    language: 'markdown',
    description: 'Production deployment guide covering Cloudflare Workers, Pages, Supabase, and Resend.',
    content: `# Production Deployment Guide
1. Deploy Worker: Use 'cloudflare-worker.js' in Cloudflare Dashboard Quick Edit or 'wrangler deploy'.
2. Attach Workers AI: Add AI binding to '@cf/meta/llama-3.3-70b-instruct'.
3. Set Secrets: Add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GITHUB_TOKEN, RESEND_API_KEY, OPENAI_API_KEY in Cloudflare Settings -> Variables and Secrets.
4. Run Supabase SQL schema in Supabase SQL editor.
5. Deploy React SPA on Cloudflare Pages.`,
  },
  {
    path: 'wrangler.toml',
    name: 'wrangler.toml',
    category: 'Worker (Cloudflare)',
    language: 'toml',
    description: 'Cloudflare Wrangler configuration with native Workers AI binding and static site bucket.',
    content: `name = "cloudflare-agent-hub"
main = "cloudflare-worker.js"
compatibility_date = "2026-03-01"
compatibility_flags = ["nodejs_compat"]

[ai]
binding = "AI"

[site]
bucket = "./dist"

[observability]
enabled = true`,
  },
  {
    path: 'supabase-schema.sql',
    name: 'supabase-schema.sql',
    category: 'Supabase SQL',
    language: 'sql',
    description: 'PostgreSQL schema with Row Level Security (RLS) for persistent audit logs and telemetry.',
    content: `-- Supabase Audit Log Schema
CREATE TABLE IF NOT EXISTS public.hub_audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    action TEXT NOT NULL,
    service TEXT NOT NULL,
    status TEXT NOT NULL,
    "user" TEXT NOT NULL,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    summary TEXT NOT NULL,
    details TEXT,
    request_payload JSONB,
    response_data JSONB,
    error_message TEXT
);

ALTER TABLE public.hub_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service Role Full Access"
ON public.hub_audit_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated Read Only"
ON public.hub_audit_logs FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_audit_service_time ON public.hub_audit_logs (service, timestamp DESC);`,
  },
];
