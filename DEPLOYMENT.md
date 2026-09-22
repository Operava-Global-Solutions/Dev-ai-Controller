# Production Deployment Guide: Dev’ai Controller

This guide provides end-to-end instructions for deploying the **Dev’ai Controller** to production on Cloudflare Workers, Cloudflare Pages, Supabase, and Resend.

---

## Architecture Overview

```
+---------------------------------------------------------------------------------+
|                        Cloudflare Global Edge Network                           |
|                                                                                 |
|   +---------------------------------+     +---------------------------------+   |
|   |         Cloudflare Pages        |     |        Cloudflare Worker        |   |
|   |  (React 18 + Tailwind UI SPA)   |     |    (Edge APIs & Routing Engine) |   |
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

## Method 1: Cloudflare Dashboard (Direct Web Editor Paste)

Use this method if you want to deploy directly in your browser without installing CLI tools:

1. **Log in to Cloudflare Dashboard**:
   Navigate to [dash.cloudflare.com](https://dash.cloudflare.com) and select **Compute (Workers & Pages)**.

2. **Create a Worker**:
   - Click **Create application** > **Create Worker**.
   - Name the Worker: `devai-controller`.
   - Click **Deploy**.

3. **Paste Worker Code**:
   - In the Worker overview, click **Edit code** (Quick Edit).
   - Delete any placeholder code.
   - Open `/cloudflare-worker.js` from this repository.
   - Copy the entire contents and paste into the editor.
   - Click **Deploy** in the top right corner.

4. **Bind Cloudflare Workers AI**:
   - Return to the Worker page > **Settings** > **Bindings**.
   - Click **Add** > select **Workers AI**.
   - Set the Variable name to: `AI`.
   - Click **Deploy**.

5. **Configure Production Secrets**:
   - Go to **Settings** > **Variables and Secrets**.
   - Add the following secrets under **Environment Variables / Secrets** (select **Encrypt** for each):
     * `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID
     * `CLOUDFLARE_API_TOKEN`: API Token with *Workers AI: Read* and *Workers Scripts: Edit*
     * `SUPABASE_URL`: `https://your-project.supabase.co`
     * `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service_role secret key
     * `GITHUB_TOKEN`: Personal Access Token with `repo`, `read:user`, and `workflow` scopes
     * `RESEND_API_KEY`: API key from Resend starting with `re_`
     * `OPENAI_API_KEY`: *(Optional)* Standby fallback key (`sk-...`)
     * `WORKER_SECRET`: A secure 32-character random string for AES-256 vault encryption

6. **Deploy Frontend on Cloudflare Pages**:
   - Run `npm run build` in your local project to generate the `/dist` directory.
   - In the Cloudflare Dashboard, go to **Compute (Workers & Pages)** > **Create** > **Pages**.
   - Choose **Direct Upload** (drag & drop the `/dist` folder) or connect your GitHub repository with:
     * Framework preset: `Vite`
     * Build command: `npm run build`
     * Build output directory: `dist`

---

## Method 2: Cloudflare AI Assistant Prompt (Direct Automation)

If you are using the Cloudflare Dashboard AI Assistant / Cloudflare Workers AI Builder:

1. Open the file `CLOUDFLARE_WORKER_PROMPT.txt` in the root of this repository.
2. Copy the entire prompt text block.
3. Open the Cloudflare Dashboard and click the **AI Assistant** icon.
4. Paste the prompt and press Enter.
5. The Cloudflare AI Assistant will automatically configure:
   - Worker name: `cloudflare-agent-hub`
   - Workers AI binding: `AI` (`@cf/meta/llama-3.3-70b-instruct`)
   - Compatibility flags: `["nodejs_compat"]`
   - Edge endpoints and CORS handlers

---

## Method 3: Wrangler CLI (Recommended for Developers)

### Step 1: Install Wrangler & Authenticate
```bash
npm install -g wrangler
npx wrangler login
```

### Step 2: Configure `wrangler.toml`
Ensure `wrangler.toml` at the project root contains:
```toml
name = "cloudflare-agent-hub"
main = "dist/server.cjs"
compatibility_date = "2026-03-01"
compatibility_flags = ["nodejs_compat"]

# Native Cloudflare Workers AI Binding
[ai]
binding = "AI"

# Static assets serving for React frontend
[site]
bucket = "./dist"
```

### Step 3: Set Secrets on Cloudflare via CLI
Run the following commands and paste each secret when prompted:
```bash
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
npx wrangler secret put CLOUDFLARE_API_TOKEN
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put WORKER_SECRET
```

### Step 4: Build and Deploy
```bash
# Compile React frontend and bundle backend server
npm run build

# Deploy to Cloudflare Workers Global Edge
npx wrangler deploy
```

---

## Supabase PostgreSQL Setup & Audit Log Schema

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

-- Enable Row Level Security (RLS)
ALTER TABLE public.hub_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (Backend Worker)
CREATE POLICY "Service Role Full Access"
ON public.hub_audit_logs
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

-- Create index on service and timestamp for fast dashboard lookups
CREATE INDEX IF NOT EXISTS idx_audit_service_timestamp
ON public.hub_audit_logs (service, timestamp DESC);
```

---

## Verification & Health Check

After deployment, verify your edge worker:

### 1. Test Health & Colocation
```bash
curl -i https://cloudflare-agent-hub.<your-subdomain>.workers.dev/api/health
```
*Expected response:*
```json
{"status":"operational","edge":"cloudflare-worker","colo":"SJC","timestamp":"2026-09-22T07:30:00.000Z"}
```

### 2. Test Services Status Aggregator
```bash
curl -i https://cloudflare-agent-hub.<your-subdomain>.workers.dev/api/status
```
*Expected response:* Returns live health and latency metrics for Cloudflare, Supabase, GitHub, Resend, and OpenAI.

### 3. Test Cloudflare Workers AI Coding Task
```bash
curl -i -X POST https://cloudflare-agent-hub.<your-subdomain>.workers.dev/api/coding/execute \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Audit edge route handlers for rate limiting",
    "repo": "operava/operava-worker-core",
    "branch": "main"
  }'
```
*Expected response:* Generates plan, AST diff, and pull request stage using `@cf/meta/llama-3.3-70b-instruct`.

---

## Zero-Trust Security Checklist

- [x] No secrets committed to git repositories (`.env` is in `.gitignore`)
- [x] All credentials stored in Cloudflare Encrypted Secrets
- [x] Frontend SPA contains zero API keys or backend admin tokens
- [x] Supabase service_role key restricted to backend worker only
- [x] Cloudflare Workers AI calls authenticated via native `env.AI` or bearer token
- [x] CORS restricted to authorized domain origins in production
