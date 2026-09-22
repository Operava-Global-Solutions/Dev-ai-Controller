import type { LLMDocEntry } from '../../src/types/index.js';

const DOC_SOURCES = [
  {
    id: 'cf-workers-ai',
    title: 'Cloudflare Workers AI',
    sourceUrl: 'https://developers.cloudflare.com/workers-ai/llms.txt',
    category: 'Workers AI' as const,
    summary: 'Cloudflare Workers AI allows running machine learning models on Cloudflare global network including Llama 3.1 8B Instruct.',
    defaultContent: `# Cloudflare Workers AI - llms.txt

Workers AI allows developers to run machine learning models on Cloudflare's global network from your own code, using Cloudflare Workers, Pages, or via the Workers AI REST API.

## Recommended Models
- **Text Generation & Tool Calling**: \`@cf/meta/llama-3.1-8b-instruct\` (default lightweight, fast inference)
- **Code Generation**: \`@cf/qwen/qwen1.5-14b-chat-awq\`
- **Embeddings**: \`@cf/baai/bge-base-en-v1.5\`

## Worker Binding Usage
\`\`\`typescript
export default {
  async fetch(request, env) {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: 'Summarize the task'
    });
    return Response.json(response);
  }
}
\`\`\`

## REST API Endpoint
POST https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/meta/llama-3.1-8b-instruct
Headers: Authorization: Bearer {api_token}, Content-Type: application/json
`,
  },
  {
    id: 'cf-workers',
    title: 'Cloudflare Workers Core',
    sourceUrl: 'https://developers.cloudflare.com/workers/llms.txt',
    category: 'Cloudflare Workers' as const,
    summary: 'Serverless execution platform powered by V8 isolates with sub-millisecond cold starts and global edge delivery.',
    defaultContent: `# Cloudflare Workers - llms.txt

Cloudflare Workers provides a serverless execution environment that allows you to create entirely new applications or augment existing ones without configuring or maintaining infrastructure.

## Key Primitives
- **Hono Framework**: Modern lightweight web framework for Cloudflare Workers.
- **Crypto API**: Native Web Crypto API (crypto.subtle) supporting AES-GCM, SHA-256, HMAC, and PBKDF2 without external node modules.
- **Secrets Management**: wrangler secret put WORKER_SECRET, accessible via \`env.WORKER_SECRET\`.
- **Bindings**: KV, D1 (SQL), Hyperdrive, Vectorize, and Workers AI.

## Security Standard
Never return decrypted secrets to client apps. Always encrypt payloads using AES-GCM with 12-byte IVs and 16-byte authentication tags.
`,
  },
  {
    id: 'supabase',
    title: 'Supabase Database & RLS',
    sourceUrl: 'https://supabase.com/llms.txt',
    category: 'Supabase' as const,
    summary: 'Open source Firebase alternative providing Postgres with Row Level Security (RLS), Auth, Realtime, and Instant APIs.',
    defaultContent: `# Supabase - llms.txt

Supabase is an open source Firebase alternative built on PostgreSQL.

## Table Architecture for Token Vault
- **api_tokens**: Encrypted credentials table storing \`encrypted_ciphertext\`, \`iv\`, \`auth_tag\`, \`salt\`, and masked preview.
- **logs**: Audit trail recording \`action\`, \`provider\`, \`duration_ms\`, \`status\`, and user telemetry.

## Row Level Security (RLS)
Always enable Row Level Security on public tables:
\`\`\`sql
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own tokens" ON api_tokens
  FOR ALL USING (auth.uid() = user_id);
\`\`\`
`,
  },
  {
    id: 'resend',
    title: 'Resend Email API',
    sourceUrl: 'https://resend.com/docs/llms.txt',
    category: 'Resend' as const,
    summary: 'Email API for developers. Simple, fast HTTP REST API for transactional and alert messaging.',
    defaultContent: `# Resend API - llms.txt

Resend is the email platform built specifically for developers.

## Sending Emails Endpoint
POST https://api.resend.com/emails
Headers:
- Authorization: Bearer {re_...}
- Content-Type: application/json

Payload:
\`\`\`json
{
  "from": "Operava Hub <onboarding@resend.dev>",
  "to": ["user@example.com"],
  "subject": "Notification from Operava Hub",
  "html": "<strong>Your token action was executed successfully.</strong>"
}
\`\`\`

## Error Handling
- 401 Unauthorized: Invalid API key format or revoked key
- 422 Unprocessable Entity: Invalid recipient email or domain not verified
`,
  },
  {
    id: 'github',
    title: 'GitHub REST API v3',
    sourceUrl: 'https://docs.github.com/llms.txt',
    category: 'GitHub' as const,
    summary: 'GitHub REST API allows listing repositories, creating issues, managing workflows, and auditing commits.',
    defaultContent: `# GitHub REST API - llms.txt

GitHub API enables programmatic interaction with repositories, issues, pulls, and users.

## Authentication
Header: \`Authorization: Bearer ghp_...\` or fine-grained token \`github_pat_...\`
Header: \`Accept: application/vnd.github+json\`
Header: \`User-Agent: Operava-App\`

## Essential Endpoints
- **List Repositories**: GET https://api.github.com/user/repos?per_page=10&sort=updated
- **Create Issue**: POST https://api.github.com/repos/{owner}/{repo}/issues
  Body: \`{ "title": "...", "body": "...", "labels": ["..."] }\`
- **Verify Token / User**: GET https://api.github.com/user
`,
  },
];

let docCache: Map<string, LLMDocEntry> = new Map();

// Initialize doc cache
for (const doc of DOC_SOURCES) {
  docCache.set(doc.id, {
    ...doc,
    content: doc.defaultContent,
    lastFetched: new Date().toISOString(),
  });
}

/**
 * Get all available LLM documentation entries
 */
export async function getLLMDocs(): Promise<LLMDocEntry[]> {
  return Array.from(docCache.values());
}

/**
 * Refresh a specific document from source if available
 */
export async function refreshDoc(id: string): Promise<LLMDocEntry | null> {
  const doc = docCache.get(id);
  if (!doc) return null;

  try {
    const res = await fetch(doc.sourceUrl, {
      headers: { 'User-Agent': 'Operava-LLM-Collector/1.0' },
      signal: AbortSignal.timeout(3500),
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 50) {
        doc.content = text;
        doc.lastFetched = new Date().toISOString();
        docCache.set(id, doc);
      }
    }
  } catch (err) {
    console.warn(`Could not refresh llms.txt for ${id}, keeping cached version:`, err);
  }

  return doc;
}
