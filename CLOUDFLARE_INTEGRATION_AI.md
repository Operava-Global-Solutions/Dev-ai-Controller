# 🚀 CLOUDFLARE INTEGRATION AI: DEPLOYMENT PROMPT & GUIDE
# Specification Version: 1.0 (General AI Agent Platform)

> **Instructions for the Operator:**
> Copy and paste the prompt below into the **Cloudflare Dashboard AI Assistant**, **Wrangler AI Assistant**, or any **AI Coding Agent** (Cursor, Claude, Antigravity, ChatGPT) to deploy the **Dev’ai Controller** platform to your Cloudflare account.

---

## 📋 COPY-PASTE PROMPT FOR AI ASSISTANT

```text
You are deploying "Dev’ai Controller" — a General AI Agent Platform — to my Cloudflare account.
Please configure, build, and deploy this project as a high-performance Cloudflare Worker with static site assets using the following specifications:

1. WORKER & BINDING SPECIFICATIONS:
   - Worker Name: "devai-controller"
   - Compatibility Date: "2026-03-01"
   - Compatibility Flags: ["nodejs_compat"]

   - Cloudflare Workers AI Binding:
     [ai]
     binding = "AI"
     model = "@cf/meta/llama-3.3-70b-instruct"

   - Cloudflare D1 Relational Database Binding:
     [[d1_databases]]
     binding = "DB"
     database_name = "devai_production_db"
     database_id = "[D1_DATABASE_ID]"

   - Cloudflare R2 Document & Knowledge Storage:
     [[r2_buckets]]
     binding = "STORAGE"
     bucket_name = "devai-knowledge-docs"

   - Cloudflare Vectorize Semantic Search Index:
     [[vectorize]]
     binding = "VECTOR_INDEX"
     index_name = "devai-knowledge-vectors"

   - Cloudflare Workers KV Cache & Config:
     [[kv_namespaces]]
     binding = "CONFIG_KV"
     id = "[KV_NAMESPACE_ID]"

   - Cloudflare Durable Objects (Stateful Agent Sessions):
     [durable_objects]
     bindings = [
       { name = "AGENT_SESSION", class_name = "AgentSessionDO" }
     ]

   - Cron Triggers (Scheduled Workflows):
     [triggers]
     crons = ["*/15 * * * *"]

   - Static Frontend Directory:
     [site]
     bucket = "./dist"

2. ENVIRONMENT SECRETS (Configure in Cloudflare Worker Settings > Variables & Secrets or via `wrangler secret put`):
   - RESEND_API_KEY: [Resend API key starting with re_ for transactional emails]
   - GITHUB_TOKEN: [GitHub Personal Access Token with repo, workflow, read:user scopes]
   - CLOUDFLARE_API_TOKEN: [Cloudflare API Token with Workers AI and Scripts Edit permissions]
   - CLOUDFLARE_ACCOUNT_ID: [Cloudflare Account ID]
   - SUPABASE_URL: [Supabase Project URL, e.g., https://xyz.supabase.co]
   - SUPABASE_SERVICE_ROLE_KEY: [Supabase service-role secret key]
   - ADMIN_PASSWORD: [Administrative access password]
   - WORKER_SECRET: [32-character encryption seed for AES-256-GCM token storage]

3. DEPLOYMENT SCRIPT & ROUTING:
   Use the worker script `cloudflare-worker.js`:
   - Expose the /v1 REST API namespace:
     * GET  /v1/agents -> List authorized platform agents
     * GET  /v1/tools -> Controlled Tool Registry with permissions & risk levels
     * GET  /v1/mcp -> Connected Model Context Protocol (MCP) servers
     * GET  /v1/knowledge -> Knowledge objects with Title IDs
     * POST /v1/knowledge -> Ingest & index document with Title ID
     * GET  /v1/automations -> Automations engine with 9 lifecycle states
     * POST /v1/automations/parse -> Natural-language automation interpreter
     * POST /v1/automations/:id/approve -> Consequential Action Approval Gate
     * POST /v1/automations/:id/cancel -> Cancel proposed automation
     * POST /v1/automations/:id/run -> Immediate execution trigger
     * GET  /v1/executions -> Execution audit trail
     * GET  /v1/widget/config -> Customer service widget configuration
     * POST /v1/widget/chat -> Customer service AI chat grounded in knowledge
     * GET  /widget.js -> Static embeddable customer service script
     * GET  /api/health -> Edge status and colocation airport code

4. BUILD & DEPLOY EXECUTION:
   1. Install dependencies: `npm install`
   2. Build frontend assets: `npm run build`
   3. Deploy worker: `npx wrangler deploy`
```

---

## 🛠️ Step-by-Step CLI Instructions

### Step 1: Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### Step 2: Create Cloudflare D1 Database & Vectorize Index
```bash
# Create D1 database
npx wrangler d1 create devai_production_db

# Create R2 bucket
npx wrangler r2 bucket create devai-knowledge-docs

# Create Vectorize index (768 dimensions for Workers AI text embeddings)
npx wrangler vectorize create devai-knowledge-vectors --dimensions=768 --metric=cosine

# Create KV namespace
npx wrangler kv:namespace create CONFIG_KV
```

### Step 3: Configure Cloudflare Secrets
```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put CLOUDFLARE_API_TOKEN
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ADMIN_PASSWORD
```

### Step 4: Build and Deploy
```bash
npm run build
npx wrangler deploy
```
