# 🚀 CLOUDFLARE INTEGRATION AI: DEPLOYMENT PROMPT & GUIDE

> **Instructions for the Operator:**
> Copy and paste the prompt below into the **Cloudflare Dashboard AI Assistant**, **Wrangler AI Assistant**, or any **AI Coding Agent** (Antigravity, Claude, ChatGPT, Cursor) to instruct it to deploy the **Dev’ai Controller** application to your Cloudflare account.

---

## 📋 COPY-PASTE PROMPT FOR AI ASSISTANT

```text
You are deploying "Dev’ai Controller" to my Cloudflare account.
Please configure, build, and deploy this project as a high-performance Cloudflare Worker with Cloudflare Pages / Assets integration using the following specifications:

1. WORKER & BINDING SPECIFICATIONS:
   - Worker Name: "devai-controller"
   - Compatibility Date: "2026-03-01"
   - Compatibility Flags: ["nodejs_compat"]
   - Cloudflare Workers AI Binding:
     [ai]
     binding = "AI"
     model = "@cf/meta/llama-3.3-70b-instruct"
   - Assets / Static Frontend Directory:
     [assets]
     directory = "./dist"
     binding = "ASSETS"

2. ENVIRONMENT SECRETS (Configure in Cloudflare Worker Settings > Variables & Secrets or via `wrangler secret put`):
   - CLOUDFLARE_ACCOUNT_ID: [Cloudflare Account ID]
   - CLOUDFLARE_API_TOKEN: [Cloudflare API Token with Workers AI and Worker Scripts Edit permissions]
   - SUPABASE_URL: [Supabase Project URL, e.g., https://xyz.supabase.co]
   - SUPABASE_SERVICE_ROLE_KEY: [Supabase service-role secret key for RLS-enforced token vault and audit logs]
   - GITHUB_TOKEN: [GitHub Personal Access Token with repo, workflow, read:user scopes]
   - RESEND_API_KEY: [Resend API key starting with re_]
   - OPENAI_API_KEY: [Optional fallback key for gpt-4o-mini standby redundancy]
   - WORKER_SECRET: [32-character encryption key for AES-256-GCM token storage]

3. DEPLOYMENT SCRIPT & ROUTING:
   Use the worker script `cloudflare-worker.js` (or compile `server.ts`):
   - Expose the following REST APIs:
     * GET  /api/health -> Edge status, runtime colocation (e.g., SJC, NRT, LHR)
     * GET  /api/status -> Real-time status of Cloudflare, Supabase, GitHub, Resend, and OpenAI
     * GET  /api/chat/sessions -> Chat sessions and conversation history
     * POST /api/chat/sessions -> Create fresh chat session
     * GET  /api/chat/sessions/:id -> Retrieve session messages
     * POST /api/chat/sessions/:id/messages -> Cloudflare Workers AI Llama 3.3 70B inference stream
     * POST /api/chat/sessions/:id/clear -> Clear session messages
     * GET  /api/deployments -> Live edge deployment log & active version
     * POST /api/deployments/trigger -> Trigger edge deployment build
     * POST /api/deployments/rollback -> Zero-downtime version rollback
     * GET  /api/notifications -> Multi-service alert feed (Resend, GitHub, Cloudflare)
     * POST /api/coding/execute -> Autonomous code planning, diff generation & PR creation
     * GET  /api/tokens -> Encrypted vault tokens with AES-256-GCM auth tags
     * POST /api/tokens -> Store new encrypted service credential
     * GET  /api/logs -> Audit log stream with RLS enforcement
   - Static Asset Fallback:
     * Serve index.html and Vite assets from ./dist for all non-API paths (SPA fallback)

4. BUILD & DEPLOY EXECUTION:
   1. Install dependencies: `npm install`
   2. Build frontend assets: `npm run build`
   3. Verify `wrangler.toml` has `[ai]` binding enabled
   4. Deploy worker and assets: `npx wrangler deploy`

5. POST-DEPLOYMENT HEALTH VERIFICATION:
   Once deployed, run these verification curl requests:
   - curl -s https://devai-controller.<your-subdomain>.workers.dev/api/health
   - curl -s https://devai-controller.<your-subdomain>.workers.dev/api/status
   - curl -s -X POST https://devai-controller.<your-subdomain>.workers.dev/api/chat/sessions \
       -H "Content-Type: application/json" \
       -d '{"title": "Edge Health Check"}'

Verify that the response returns healthy status with `@cf/meta/llama-3.3-70b-instruct` active.
```

---

## ⚙️ TECHNICAL ARCHITECTURE

### 1. Cloudflare Workers AI Binding (`wrangler.toml`)
The AI engine runs natively at the Cloudflare Edge using Workers AI:
```toml
name = "devai-controller"
main = "cloudflare-worker.js"
compatibility_date = "2026-03-01"
compatibility_flags = ["nodejs_compat"]

[ai]
binding = "AI"

[assets]
directory = "./dist"
binding = "ASSETS"

[observability]
enabled = true
head_sampling_rate = 1
```

### 2. Dual-Engine Intelligence Pipeline
1. **Primary Edge Engine**: Cloudflare Workers AI model `@cf/meta/llama-3.3-70b-instruct` running across 330+ global edge cities.
2. **Built-in Standby Fallback**: Secondary fallback to `gemini-2.5-flash` / `gpt-4o-mini` with automatic failover if edge rate limits or regional maintenance occur.
3. **Built-in Error Diagnostic Engine**: Immediate plain-English diagnosis and resolution instructions for all Cloudflare error codes (1101, 1000, 1014, 521, 522, 524), Supabase 42501 RLS recursion, Resend 403 DNS verification, and GitHub 401/403 credentials.

### 3. Step-by-Step Deployment Commands (CLI)

```bash
# 1. Clone or navigate to the repository
cd Dev-ai-Controller-

# 2. Install dependencies
npm install

# 3. Build frontend bundle
npm run build

# 4. Set encrypted Cloudflare Worker secrets
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
npx wrangler secret put CLOUDFLARE_API_TOKEN
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put WORKER_SECRET

# 5. Deploy to Cloudflare Workers
npx wrangler deploy
```

---

## 🔒 ZERO-TRUST SECURITY SPECIFICATIONS

- **Token Encryption**: All third-party secrets (GitHub, Resend, Supabase) are encrypted via **AES-256-GCM** using a key derived from `WORKER_SECRET` with unique 12-byte initialization vectors (IV) and 16-byte authentication tags.
- **No Secret Leaks**: Decrypted values are never exposed to browser client code. The frontend only receives masked values (e.g., `ghp_••••••••ab12`).
- **Audit Logging**: Every API dispatch or token decryption event is recorded in the Supabase audit log table with duration, caller IP, and timestamp.
