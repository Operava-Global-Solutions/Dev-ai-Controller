# 🚀 Cloudflare Integration AI: Complete Deployment Prompt & Edge Guide
# Specification Version: 2.0 (7-Step Canonical Autonomous Lifecycle & Governance Standard)

> **Instructions for Operator & AI Assistants:**
> Copy and paste the prompt in Section 1 below into the **Cloudflare Dashboard AI Assistant**, **Wrangler AI Assistant**, or any **AI Coding Agent** (Cursor, Claude, Antigravity, ChatGPT) to configure, bind, and deploy the **Dev’ai Controller** platform to Cloudflare Global Edge.

---

## 📋 1. Copy-Paste Deployment Prompt for Cloudflare AI Assistant

```text
You are deploying "Dev’ai Controller" — a General AI Agent Platform with 7-Step Canonical Autonomous Governance — to my Cloudflare account.
Configure, bind, build, and deploy this project as a high-performance Cloudflare Worker with static frontend assets using the following specifications:

1. WORKER & BINDING SPECIFICATIONS:
   - Worker Name: "devai-controller"
   - Compatibility Date: "2026-03-01"
   - Compatibility Flags: ["nodejs_compat"]
   - Main Script: "cloudflare-worker.js"

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
     dimensions = 768
     metric = "cosine"

   - Cloudflare Workers KV Cache & Config:
     [[kv_namespaces]]
     binding = "CONFIG_KV"
     id = "[KV_NAMESPACE_ID]"

   - Cloudflare Durable Objects (Stateful Agent Sessions):
     [durable_objects]
     bindings = [
       { name = "AGENT_SESSION", class_name = "AgentSessionDO" }
     ]

   - Cron Triggers (Scheduled Automations):
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
   - SUPABASE_SERVICE_ROLE_KEY: [Supabase service-role secret key for backend RLS audit storage]
   - ADMIN_PASSWORD: [Administrative access password]
   - WORKER_SECRET: [32-character encryption seed for AES-256-GCM token storage]

3. 7-STEP CANONICAL AGENT GOVERNANCE SPECIFICATION:
   Enforce the 7-step autonomous agent execution standard across all flows:
   - Step 1: Understand Request — validates tenant boundary, sanitizes input, extracts operational intent.
   - Step 2: Build Executive Plan — constructs deterministic DAG, maps required tools, estimates SLA budget.
   - Step 3: Retrieve Knowledge & Prepare Tool Calls — queries Vectorize for attached Title IDs, binds MCP inputs.
   - Step 4: Approval Gate — halts consequential mutations until explicit operator approval token is granted.
   - Step 5: Execute Approved Action — dispatches payloads via authorized MCP, Resend, or GitHub APIs.
   - Step 6: Verify Outcome & Compare Resources — asserts actual returned state against expected resource schema (zero drift).
   - Step 7: Audit Log — appends immutable record with SHA-256 cryptographic digest, latency, and step receipts.

4. COMPLETE REST API ROUTING:
   Use `cloudflare-worker.js` exposing:
   - GET  /api/health -> Edge health, colocation airport code, and active bindings
   - GET  /api/status -> Multi-service operational monitor (Cloudflare, Supabase, GitHub, Resend)
   - GET  /v1/agents -> List 6 platform agents (General, Developer, Knowledge, Customer Service, Design, Custom)
   - GET  /v1/agents/:id -> Agent profile and permissions
   - GET  /v1/agents/:id/flow -> 7-stage canonical structure flow
   - GET  /v1/agents/:id/knowledge -> Attached Title IDs and knowledge references
   - POST /v1/agents/:id/simulate-flow -> Executes 7-step pipeline simulation with verification assertions & SHA-256 hash
   - GET  /v1/tools -> Controlled Tool Registry with permissions & risk levels
   - GET  /v1/mcp -> Connected Model Context Protocol (MCP) servers
   - GET  /v1/knowledge -> Knowledge objects indexed by Title IDs
   - POST /v1/knowledge -> Ingest & index document with Title ID
   - GET  /v1/automations -> Automations engine with 9 lifecycle states
   - POST /v1/automations/parse -> Natural-language automation interpreter with 5-point validation contract
   - POST /v1/automations/:id/approve -> Consequential Action Approval Gate
   - POST /v1/automations/:id/cancel -> Cancel proposed automation
   - POST /v1/automations/:id/run -> Immediate execution trigger ("Run Now")
   - GET  /v1/executions -> Execution audit trail with approval tokens & SHA-256 hashes
   - GET  /v1/widget/config -> Customer service widget configuration
   - POST /v1/widget/chat -> Customer service AI chat grounded in knowledge (@cf/meta/llama-3.3-70b-instruct)
   - GET  /widget.js -> Static embeddable customer service script
   - POST /api/coding/execute -> Cloudflare Workers AI coding engine producing AST patches & GitHub PRs

5. BUILD & DEPLOY EXECUTION:
   1. Install dependencies: `npm install`
   2. Build frontend assets: `npm run build`
   3. Deploy worker: `npx wrangler deploy`
```

---

## 🛠️ 2. Step-by-Step Wrangler CLI Deployment

### Step 1: Install Wrangler CLI & Authenticate
```bash
npm install -g wrangler
wrangler login
```

### Step 2: Create Cloudflare Storage & Database Bindings
```bash
# 1. Create Cloudflare D1 Relational Database
npx wrangler d1 create devai_production_db

# 2. Create Cloudflare R2 Knowledge Document Storage Bucket
npx wrangler r2 bucket create devai-knowledge-docs

# 3. Create Cloudflare Vectorize Semantic Search Index (768 dimensions for Workers AI text embeddings)
npx wrangler vectorize create devai-knowledge-vectors --dimensions=768 --metric=cosine

# 4. Create Cloudflare Workers KV Cache
npx wrangler kv:namespace create CONFIG_KV
```

*Note: Update the IDs generated above into your `wrangler.toml` file under `database_id` and `id`.*

### Step 3: Configure Encrypted Production Secrets
Run each command and paste the secret value when prompted:
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

### Step 4: Build Assets & Deploy to Edge
```bash
# 1. Typecheck & build Vite frontend + bundle server
npm run build

# 2. Deploy Cloudflare Worker with all bindings
npx wrangler deploy
```

---

## 🔍 3. Post-Deployment Verification & Testing

Once deployed, verify your edge endpoints:

### 1. Verify Edge Health & Airport Code Colocation
```bash
curl -i "https://devai-controller.<your-subdomain>.workers.dev/api/health"
```
*Expected response:*
```json
{
  "status": "operational",
  "platform": "General AI Agent Platform",
  "version": "2.5.0",
  "governanceStandard": "7_STEP_CANONICAL_LIFECYCLE",
  "edge": "cloudflare-worker",
  "colo": "SJC",
  "bindings": {
    "workers_ai": true,
    "d1_database": true,
    "r2_storage": true,
    "vectorize": true,
    "kv_cache": true,
    "durable_objects": true
  }
}
```

### 2. Verify 7-Step Canonical Flow Simulation
```bash
curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/v1/agents/agent-general-01/simulate-flow" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Audit edge worker and prepare client briefing"}'
```
*Expected response:* Returns all 7 canonical stages executed, `approvalId` cleared, `verification` zero-drift confirmation, and immutable `auditHash`.

### 3. Verify Customer Service Widget AI Chat
```bash
curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/v1/widget/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how do I schedule an email update?"}'
```
*Expected response:* Returns an AI reply powered by Cloudflare Workers AI `@cf/meta/llama-3.3-70b-instruct`.

### 4. Verify Static Customer Widget Script
```bash
curl -i "https://devai-controller.<your-subdomain>.workers.dev/widget.js"
```
*Expected response:* Returns `Content-Type: application/javascript` embed script.

---

## 🛡️ 4. Zero-Trust Security Guarantees
- **No Client Secrets**: API keys are restricted exclusively to encrypted Worker environment variables.
- **Strict Tenant Scoping**: All knowledge objects, agent contexts, and logs are isolated by `tenantId`.
- **Immutable Audit Trail**: Every step, result, approval, and verification receipt is hashed with SHA-256.
- **Consequential Action Gates**: Mutations require human-in-the-loop cryptographic authorization.
