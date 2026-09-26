# 📋 Dev’ai Controller — Production Deployment Checklist
# Specification Version: 2.0 (7-Step Canonical Autonomous Lifecycle & Governance Standard)

This checklist outlines the mandatory environment variables, security headers, edge bindings, health checks, and verification procedures required to deploy **Dev’ai Controller** to production on Cloudflare Workers and Cloudflare Pages.

---

## 🔐 1. Critical Environment Variables & Secrets

All production secrets must be provisioned via `wrangler secret put <NAME>` (for Cloudflare Workers) or set in encrypted production server environments. **Never commit raw values to git.**

| Variable Name | Required | Secret? | Target Location | Description & Format |
| :--- | :---: | :---: | :--- | :--- |
| `CLOUDFLARE_ACCOUNT_ID` | **Yes** | Yes | Worker Secret / `.env` | 32-character hexadecimal Cloudflare Account ID found in the Cloudflare Dashboard URL. |
| `CLOUDFLARE_API_TOKEN` | **Yes** | Yes | Worker Secret / `.env` | Scoped API token with `Workers AI: Read` and `Workers Scripts: Edit` permissions. |
| `RESEND_API_KEY` | **Yes** | Yes | Worker Secret / `.env` | Resend transactional mailer token starting with `re_` for client email dispatches. |
| `GITHUB_TOKEN` | **Yes** | Yes | Worker Secret / `.env` | GitHub Personal Access Token (PAT) with `repo`, `workflow`, and `read:user` scopes. |
| `SUPABASE_URL` | **Yes** | No | Worker Secret / `.env` | Supabase project URL (`https://<project-ref>.supabase.co`) for database & RLS audit storage. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Yes | Worker Secret / `.env` | Elevated backend service-role JWT secret. Strictly forbidden in browser SPA. |
| `ADMIN_PASSWORD` | **Yes** | Yes | Worker Secret / `.env` | Administrative access password for operator dashboard access. |
| `WORKER_SECRET` | **Yes** | Yes | Worker Secret / `.env` | High-entropy 32-character random string used as the AES-256-GCM token encryption seed. |
| `OPENAI_API_KEY` | Optional | Yes | Worker Secret / `.env` | Standby secondary fallback key (`sk-...`) if primary Cloudflare AI reaches rate limits. |
| `GEMINI_API_KEY` | Optional | Yes | Worker Secret / `.env` | Google AI Studio key (`AIza...`) for server-side proxy resilience. |
| `NODE_ENV` | **Yes** | No | Environment Variable | Set to `production` in production runtime environments. |
| `PORT` | **Yes** | No | Environment Variable | Defaults to `3000` for container / Node.js runtimes. |

### Wrangler CLI Secrets Provisioning Commands:
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

---

## 🛡️ 2. Security Headers & Zero-Trust Boundary

The production edge worker and reverse proxy must enforce the following security headers across all responses:

### Recommended Security Headers Configuration:
| Header | Value | Purpose |
| :--- | :--- | :--- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forces HTTPS communication and prevents SSL-stripping attacks. |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-sniffing vulnerabilities. |
| `X-Frame-Options` | `SAMEORIGIN` | Mitigates clickjacking attacks on the operator dashboard. |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer leakage when navigating to external documentation. |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disables unused browser hardware capabilities. |
| `Access-Control-Allow-Origin` | `*` (Public APIs) / Specific Origin (Admin) | Allows `/widget.js` and `/v1/widget/chat` embeds while isolating dashboard APIs. |
| `Access-Control-Allow-Methods`| `GET, POST, PUT, PATCH, DELETE, OPTIONS` | Whitelists REST API HTTP verbs. |
| `Access-Control-Allow-Headers`| `Content-Type, Authorization, X-Requested-With, X-Tenant-Id` | Whitelists allowed client headers. |

### Zero-Trust Isolation Invariants:
- [x] **Zero Secret Leakage**: No API keys, database credentials, or tokens are bundled into client-side JS bundles (`dist/assets/`).
- [x] **Tenant Scoping**: All knowledge items, agent profiles, and execution logs enforce tenant isolation via `tenantId`.
- [x] **Consequential Action Approval Gates**: Tools with external side-effects (`email.send`, `github.write`, `cloudflare.deploy`) require human-in-the-loop operator approval.
- [x] **Immutable Cryptographic Audit**: All executions generate a SHA-256 digest hash recording parameters, verification results, and approval tokens.

---

## ☁️ 3. Cloudflare Edge Bindings Checklist

Verify that `wrangler.toml` contains the required production bindings:

- [ ] **Workers AI (`[ai]`)**: Binding `AI` attached with model `@cf/meta/llama-3.3-70b-instruct`.
- [ ] **D1 Database (`[[d1_databases]]`)**: Binding `DB` provisioned for relational agent state and permissions.
- [ ] **R2 Bucket (`[[r2_buckets]]`)**: Binding `STORAGE` provisioned with bucket name `devai-knowledge-docs`.
- [ ] **Vectorize Index (`[[vectorize]]`)**: Binding `VECTOR_INDEX` created with 768 dimensions and `cosine` metric.
- [ ] **KV Namespace (`[[kv_namespaces]]`)**: Binding `CONFIG_KV` provisioned for session tokens and cache.
- [ ] **Durable Objects (`[durable_objects]`)**: Binding `AGENT_SESSION` with class `AgentSessionDO`.
- [ ] **Static Assets (`[site]`)**: Bucket path pointing to `./dist`.
- [ ] **Cron Triggers (`[triggers]`)**: Configured with `crons = ["*/15 * * * *"]`.

---

## 🔍 4. Production Health Checks & Verification Suite

Execute these verification checks immediately following deployment to confirm operational readiness:

### Check 1: Edge Health & Bindings Verification
```bash
curl -i "https://devai-controller.<your-subdomain>.workers.dev/api/health"
```
**Expected Response:** `HTTP 200 OK`
```json
{
  "status": "operational",
  "platform": "General AI Agent Platform",
  "version": "2.5.0",
  "governanceStandard": "7_STEP_CANONICAL_LIFECYCLE",
  "edge": "cloudflare-worker",
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

### Check 2: Multi-Service Operational Monitor
```bash
curl -i "https://devai-controller.<your-subdomain>.workers.dev/api/status"
```
**Expected Response:** `HTTP 200 OK` with operational status for Cloudflare, Supabase, GitHub, and Resend.

### Check 3: 7-Step Canonical Flow Simulation
```bash
curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/v1/agents/agent-general-01/simulate-flow" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Audit edge worker and prepare client briefing"}'
```
**Expected Response:** `HTTP 200 OK`
- All 7 stages executed: `understand_request` -> `build_executive_plan` -> `retrieve_knowledge` -> `approval_gate` -> `execute_action` -> `verify_outcome` -> `audit_log`
- Returns valid `approvalId`, `verification.verified = true`, `driftDetected = false`, and cryptographic `auditHash`.

### Check 4: Natural-Language Automation Parser & 5-Point Validation
```bash
curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/v1/automations/parse" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Send monthly client update to client@operava.com on October 31 at 09:00"}'
```
**Expected Response:** `HTTP 200 OK` with `passedChecks: 5`, `totalChecks: 5`, and status `PENDING_APPROVAL`.

### Check 5: Embeddable Customer Service Widget
```bash
# 1. Verify JS bundle delivery
curl -i "https://devai-controller.<your-subdomain>.workers.dev/widget.js"

# 2. Verify AI chat response
curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/v1/widget/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how do I contact support?"}'
```
**Expected Response:** `HTTP 200 OK` with grounded answer from Cloudflare Workers AI (`@cf/meta/llama-3.3-70b-instruct`).

### Check 6: Coding Agent Workspace
```bash
curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/api/coding/execute" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Audit edge routing rate limiting"}'
```
**Expected Response:** `HTTP 200 OK` with AST patch plan and pull request summary.

---

## 📋 5. Pre-Flight & Post-Deployment Sign-Off Checklist

### Pre-Deployment Verification:
- [ ] Run `npm run lint` (`tsc --noEmit`) to verify 0 syntax or type errors.
- [ ] Run `npm run build` to compile the Vite client (`dist/`) and bundle the backend server (`dist/server.cjs`).
- [ ] Verify Supabase PostgreSQL tables `hub_audit_logs` and `agent_executions` are created with RLS enabled.
- [ ] Confirm all secrets are populated in Cloudflare via `wrangler secret put`.

### Post-Deployment Verification:
- [ ] Run all 6 health check curl commands and confirm `HTTP 200 OK`.
- [ ] Verify zero cold starts and fast edge latency (<1200ms) on simulation endpoints.
- [ ] Confirm static UI loads cleanly in browser with zero console errors or secret leakage.
- [ ] Test immediate zero-downtime rollback pathway (`wrangler rollback` or `/api/deployments/rollback`).
