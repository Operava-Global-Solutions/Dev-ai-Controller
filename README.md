# ⚡ Dev’ai Controller

> **Autonomous Cloudflare Workers AI Controller, DevOps Orchestrator & Edge Dashboard**  
> Integrated with **Cloudflare Workers AI**, **Cloudflare Pages**, **Supabase PostgreSQL**, **GitHub API v3**, and **Resend Mailer**.

---

## 🌟 Overview

**Dev’ai Controller** is an edge-native AI orchestrator and DevOps controller built for engineers and non-technical stakeholders alike. It provides an autonomous AI driver running on Cloudflare Workers AI (`@cf/meta/llama-3.3-70b-instruct`) to diagnose system errors in plain English, monitor multi-cloud infrastructure, execute surgical code plans, trigger deployments, and manage encrypted credentials with Zero-Trust isolation.

### 🎨 Visual Identity & Design System
- **Operava Global Theme**: High-contrast modern interface with the signature orange-to-purple gradient (`#ff6b35` -> `#f38020` -> `#9333ea`).
- **Cloudflare AI Assistant Stream ("No Cards")**: Completely unboxed conversation canvas inspired by the Cloudflare Dashboard AI Assistant, where chat history smoothly scrolls upward as responses arrive.
- **Dynamic Dot Matrix Background**: Subtle gray dot canvas (`chat-dot-bg`) that animates and drifts (`is-thinking`) when the AI is processing edge tasks.
- **Animated Doing & Thinking Engine**: Real-time task step indicators with live elapsed timer, shimmer computation bars, and rotating circle loading indicators.

---

## 🧭 Navigation Tabs & Modules

| Tab | Identifier | Description |
| :--- | :--- | :--- |
| **1. Chat Dashboard** | `chat` | Autonomous AI Driver chat stream with animated task timeline, quick-action chips, and bottom-anchored command bar. |
| **2. Audit Logs** | `vault` | Encrypted credential vault (AES-256-GCM) with 16-byte GCM authentication tags and Supabase RLS audit records. |
| **3. Coding Agent** | `coding` | Cloudflare Workers AI coding engine generating AST plans, surgical file diffs, and GitHub PR dispatches. |
| **4. Deployments Monitor** | `deployments` | Real-time monitoring of Cloudflare Workers and Pages, instant deployment triggers, and zero-downtime rollback. |
| **5. Notifications** | `notifications` | Consolidated live event feed across Resend email deliveries, GitHub activities, and Cloudflare Edge alerts. |
| **6. Knowledge Center** | `knowledge` | Non-technical knowledge base with plain-English error breakdowns, technical terms dictionary, and self-healing guides. |
| **7. System Status** | `status` | Authoritative operational latency and availability for Cloudflare, Supabase, GitHub, Resend, and OpenAI. |
| **8. Export Kit** | `export` | One-click export for `wrangler.toml`, GitHub Actions workflows, Supabase migration SQL, and Worker scripts. |

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18+ (SPA), Vite, Tailwind CSS v4, Lucide Icons.
- **Backend**: Express + TypeScript (`server.ts`) powered by `tsx` in development and bundled into `dist/server.cjs` via `esbuild` for production.
- **Edge Runtime Script**: `cloudflare-worker.js` for standalone zero-dependency execution across 330+ Cloudflare global edge cities.
- **Primary AI**: Cloudflare Workers AI (`@cf/meta/llama-3.3-70b-instruct`) with native `[ai]` binding.
- **Redundancy & Failover**: Automatic standby failover to server-side Gemini (`gemini-2.5-flash`) or OpenAI (`gpt-4o-mini`).
- **Cryptographic Engine**: Node.js `crypto` with `aes-256-gcm`, PBKDF2 key derivation (100,000 rounds), unique 12-byte initialization vectors (IV), and 16-byte authentication tags.
- **Database Layer**: Supabase PostgreSQL with Row-Level Security (RLS) policies.

---

## 📡 Complete REST API Catalog

### System & Health
- `GET /api/health` — Edge runtime status, model availability, and Cloudflare colocation airport code (e.g., SJC, NRT).
- `GET /api/status` — Operational health of Cloudflare, Supabase, GitHub, Resend, and OpenAI.

### Chat & AI Driver
- `GET /api/chat/sessions` — List all stored chat sessions with message counts and timestamps.
- `POST /api/chat/sessions` — Create a new conversation session.
- `GET /api/chat/sessions/:id` — Retrieve messages and execution traces for a specific session.
- `POST /api/chat/sessions/:id/messages` — Send user prompt, stream Cloudflare Workers AI completion, and run automated tools.
- `POST /api/chat/sessions/:id/clear` — Clear messages in a session.

### Deployments & Edge Control
- `GET /api/deployments` — Active worker version, past deployments, environment bindings, and rollback readiness.
- `POST /api/deployments/trigger` — Trigger a new edge build and deployment.
- `POST /api/deployments/rollback` — Instant rollback to the previous stable release.

### Coding Engine & Repository
- `POST /api/coding/execute` — Execute autonomous coding workflow (Analysis -> Plan -> AST Diff -> GitHub Branch/PR).

### Security & Tokens
- `GET /api/tokens` — Retrieve masked token inventory with expiration dates and usage counts.
- `POST /api/tokens` — Store new service credential with AES-256-GCM encryption.
- `POST /api/tokens/:id/test` — Live verify credential validity against target provider.
- `DELETE /api/tokens/:id` — Safely revoke and delete token from vault.

### Audit Trail & Logs
- `GET /api/logs` — Immutable audit stream of all token decryptions, AI actions, and dispatch events.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ or 20+
- npm or bun

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/jelvan-operava/Dev-ai-Controller-.git
cd Dev-ai-Controller-

# Install dependencies
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```

| Variable | Required | Description |
| :--- | :--- | :--- |
| `WORKER_SECRET` | Recommended | 32-character secret string used for AES-256-GCM key derivation |
| `CLOUDFLARE_ACCOUNT_ID` | Optional | Your Cloudflare Account ID |
| `CLOUDFLARE_API_TOKEN` | Optional | Token with Workers AI and Scripts edit permissions |
| `SUPABASE_URL` | Optional | Supabase PostgreSQL project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Secret key for bypassing client RLS for audit logging |
| `GITHUB_TOKEN` | Optional | Personal Access Token with repo scope |
| `RESEND_API_KEY` | Optional | Key starting with `re_` for transactional mail dispatch |
| `OPENAI_API_KEY` | Optional | Standby fallback key |

*(Note: If optional keys are not configured, Dev’ai Controller runs in intelligent sandbox mode with built-in diagnostic and failover fallbacks.)*

### 3. Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 4. Production Build & Start
```bash
npm run build
npm run start
```

---

## 🌐 Deploying to Cloudflare

For direct automated deployment by an AI assistant or via Wrangler, refer to:
- **`CLOUDFLARE_INTEGRATION_AI.md`**: Ready-to-paste instructions for Cloudflare AI Assistant or autonomous coding agents.
- **`wrangler.toml`**: Cloudflare Workers configuration with `[ai]` binding and static asset integration.
- **`cloudflare-worker.js`**: Native ES Module edge worker.

To deploy via Wrangler CLI:
```bash
# 1. Build client bundle
npm run build

# 2. Add encrypted secrets
npx wrangler secret put WORKER_SECRET
npx wrangler secret put CLOUDFLARE_API_TOKEN
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# 3. Deploy
npx wrangler deploy
```

---

## 💡 Troubleshooting & Known Error Resolvers

Dev’ai Controller includes built-in diagnostic intelligence for common cloud errors:
- **Cloudflare Error 1101 (Worker Threw Exception)**: Check missing secrets or enable `compatibility_flags = ["nodejs_compat"]`.
- **Cloudflare Error 1000 / 1014 (DNS Points to Prohibited IP)**: Fix A record pointing back to Cloudflare internal IPs or attach a Custom Domain.
- **Cloudflare Error 521 / 522 (Web Server Down / Timeout)**: Check origin process status and whitelist Cloudflare IP ranges.
- **Supabase Error 42501 (RLS Recursion / Permission Denied)**: Use `auth.jwt() ->> 'role'` instead of table self-querying; use service role key for audit logs.
- **Resend Error 403 (Domain Not Verified)**: Send from `onboarding@resend.dev` for testing or complete DKIM/SPF DNS records.

---

## 🧑‍💻 Guide for the Next Developer / AI Agent

1. **Keep Intent Pure**: Maintain the "no cards" Cloudflare AI layout in `DevaiChat.tsx`. Do not wrap the conversation stream back into nested card boxes.
2. **Theme Consistency**: All new accent components and status elements should utilize the Operava orange-to-purple gradient tokens (`bg-brand-gradient`, `text-brand-gradient`, `border-brand-gradient`).
3. **Full-Stack Completeness**: Whenever introducing a new feature, implement the complete pipeline: UI component, backend Express route, database storage model, and audit log.
4. **Zero-Trust Rule**: Never return raw decrypted tokens to the browser. Only return masked strings (`getMaskedTokenValue`).
