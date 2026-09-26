# 🌐 Production Deployment Guide: Dev’ai Controller
# Specification Version: 2.0 (7-Step Canonical Autonomous Lifecycle & Governance Standard)

This guide provides end-to-end instructions for deploying the **Dev’ai Controller** to production on Cloudflare Workers, Cloudflare Pages, Supabase, and Resend.

---

## 🏛️ System Architecture

```
+---------------------------------------------------------------------------------+
|                        Cloudflare Global Edge Network                           |
|                                                                                 |
|   +---------------------------------+     +---------------------------------+   |
|   |         Cloudflare Pages        |     |        Cloudflare Worker        |   |
|   |  (React 18 + Tailwind UI SPA)   |     |  (7-Step Governance & API)      |   |
|   +----------------+----------------+     +----------------+----------------+   |
|                    |                                       |                    |
|                    +------------------+--------------------+                    |
|                                       |                                         |
|                                       v                                         |
|                   +---------------------------------------+                     |
|                   |         Cloudflare Workers AI         |                     |
|                   |   (@cf/meta/llama-3.3-70b-instruct)   |                     |
|                   +-------------------+-------------------+                     |
+---------------------------------------|-----------------------------------------+
                                        |
     +-----------------+----------------+-----------------+-----------------+
     |                 |                                  |                 |
     v                 v                                  v                 v
+----------+   +---------------+                  +---------------+   +-----------+
| Supabase |   |    GitHub     |                  |    Resend     |   |  OpenAI   |
| Database |   | REST API & PR |                  | Transactional |   | Standby   |
|  & Auth  |   |   Automation  |                  |     Email     |   | Fallback  |
+----------+   +---------------+                  +---------------+   +-----------+
```

---

## 🚀 Deployment Methods

### Method 1: Cloudflare AI Assistant Prompt (Recommended Instant Setup)

If you are using the Cloudflare Dashboard AI Assistant / Cloudflare Workers AI Builder:

1. Open `CLOUDFLARE_WORKER_PROMPT.txt` in the root of this repository.
2. Copy the entire prompt text block.
3. Open the [Cloudflare Dashboard](https://dash.cloudflare.com) and click the **AI Assistant** icon in the header or Workers navigation.
4. Paste the prompt and press Enter.
5. The Cloudflare AI Assistant will automatically configure:
   - Worker name: `devai-controller`
   - Workers AI binding: `AI` (`@cf/meta/llama-3.3-70b-instruct`)
   - Compatibility flags: `["nodejs_compat"]`
   - Edge bindings: `DB`, `STORAGE`, `VECTOR_INDEX`, `CONFIG_KV`, `AGENT_SESSION`
   - Edge endpoints and 7-step governance routers

---

### Method 2: Wrangler CLI (Automated Developer Workflow)

#### Step 1: Install Wrangler & Authenticate
```bash
npm install -g wrangler
wrangler login
```

#### Step 2: Provision Cloudflare Edge Resources
```bash
# 1. Relational Database (D1)
npx wrangler d1 create devai_production_db

# 2. Knowledge Documents Storage Bucket (R2)
npx wrangler r2 bucket create devai-knowledge-docs

# 3. Vector Embeddings Semantic Search (Vectorize)
npx wrangler vectorize create devai-knowledge-vectors --dimensions=768 --metric=cosine

# 4. Configuration & Session Cache (KV)
npx wrangler kv:namespace create CONFIG_KV
```

*Update the created resource IDs in your `wrangler.toml` file under `database_id` and `id`.*

#### Step 3: Set Encrypted Production Secrets on Cloudflare
Run each command and input the corresponding value:
```bash
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
npx wrangler secret put CLOUDFLARE_API_TOKEN
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put WORKER_SECRET
```

#### Step 4: Build Assets and Deploy
```bash
# 1. Typecheck and compile static assets + bundle server
npm run build

# 2. Deploy Worker to Cloudflare Global Edge
npx wrangler deploy
```

---

### Method 3: Cloudflare Dashboard (Direct Web Quick Edit)

Use this method to deploy directly in your browser:

1. **Log in to Cloudflare Dashboard**:
   Navigate to [dash.cloudflare.com](https://dash.cloudflare.com) > **Compute (Workers & Pages)**.

2. **Create a Worker**:
   - Click **Create application** > **Create Worker**.
   - Name the Worker: `devai-controller`.
   - Click **Deploy**.

3. **Paste Worker Script**:
   - Click **Edit code** (Quick Edit).
   - Replace all placeholder code with the contents of `/cloudflare-worker.js`.
   - Click **Deploy** in the top right.

4. **Bind Workers AI**:
   - Go to Worker **Settings** > **Bindings**.
   - Click **Add** > select **Workers AI**.
   - Variable name: `AI`.
   - Click **Deploy**.

5. **Configure Production Secrets**:
   - Go to **Settings** > **Variables and Secrets**.
   - Add encrypted secrets for:
     * `CLOUDFLARE_ACCOUNT_ID`
     * `CLOUDFLARE_API_TOKEN`
     * `SUPABASE_URL`
     * `SUPABASE_SERVICE_ROLE_KEY`
     * `GITHUB_TOKEN`
     * `RESEND_API_KEY`
     * `ADMIN_PASSWORD`
     * `WORKER_SECRET`

6. **Deploy Frontend on Cloudflare Pages**:
   - Run `npm run build` locally to generate the `/dist` directory.
   - In Cloudflare Dashboard, go to **Workers & Pages** > **Create** > **Pages** > **Direct Upload**.
   - Upload the `/dist` directory.

---

## 🗄️ Supabase PostgreSQL Setup & Audit Schema

To enable persistent audit telemetry and session tracking in your Supabase database:

1. Go to your Supabase Project Dashboard > **SQL Editor**.
2. Run the following migration script:

```sql
-- Create audit logs table
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

-- Create agent executions table with 7-step governance fields
CREATE TABLE IF NOT EXISTS public.agent_executions (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    tenant_id TEXT NOT NULL DEFAULT 'tenant_prod_edge_001',
    started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'completed',
    approval_id TEXT,
    audit_hash TEXT NOT NULL,
    verification_passed BOOLEAN NOT NULL DEFAULT true,
    verification_summary TEXT,
    stages_executed JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.hub_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (Backend Worker)
CREATE POLICY "Service Role Full Access"
ON public.hub_audit_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service Role Agent Executions Full Access"
ON public.agent_executions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated read-only access for operators
CREATE POLICY "Authenticated Read Only Access"
ON public.hub_audit_logs
FOR SELECT
TO authenticated
USING (true);

-- Indexes for ultra-fast query performance
CREATE INDEX IF NOT EXISTS idx_audit_service_timestamp
ON public.hub_audit_logs (service, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_executions_agent_timestamp
ON public.agent_executions (agent_id, started_at DESC);
```

---

## 🧪 Post-Deployment Verification Checklist

Execute these curl checks against your production worker URL (`https://devai-controller.<your-subdomain>.workers.dev`):

### 1. Health & Active Bindings
```bash
curl -i "https://devai-controller.<your-subdomain>.workers.dev/api/health"
```

### 2. Operational Status Aggregator
```bash
curl -i "https://devai-controller.<your-subdomain>.workers.dev/api/status"
```

### 3. Agent 7-Step Lifecycle Simulation
```bash
curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/v1/agents/agent-general-01/simulate-flow" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Audit edge worker and prepare client briefing"}'
```
*Confirms all 7 steps executed with approval token, zero drift, and SHA-256 hash.*

### 4. Natural-Language Automation Parser
```bash
curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/v1/automations/parse" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Send monthly client update on October 31 at 09:00"}'
```
*Confirms validation contract evaluation and clarifying question logic.*

### 5. Cloudflare Workers AI Embeddable Customer Chat
```bash
curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/v1/widget/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What services do you provide?"}'
```

---

## 🔒 Zero-Trust Production Security Checklist
- [x] Zero secrets committed to git repositories (`.env` in `.gitignore`)
- [x] All credentials stored in Cloudflare Encrypted Secrets
- [x] Frontend SPA contains zero API keys or backend admin tokens
- [x] Supabase service_role key restricted exclusively to backend worker
- [x] Cloudflare Workers AI authenticated via native `env.AI` binding
- [x] 7-Step Canonical Autonomous Lifecycle enforced on all autonomous agents
- [x] SHA-256 cryptographic audit trail generated on every execution
- [x] Human-in-the-loop approval gate enforced on consequential mutations
