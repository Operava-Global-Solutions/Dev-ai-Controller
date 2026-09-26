# ⚡ Dev’ai Controller — General AI Agent Platform

> **Complete Architecture, Multi-Agent Orchestration, Automations Engine, Tool Registry (MCP), and Cloudflare Deployment Specification**  
> **Version**: 1.0 • **Deployment Target**: GitHub + Cloudflare • **Primary AI**: Cloudflare Workers AI (`@cf/meta/llama-3.3-70b-instruct`) • **Email Engine**: Resend API

---

## 🌟 1. Product Purpose & Core Architectural Principles

**Dev’ai Controller** is a **generalized AI Agent Platform** rather than a single chatbot. It is engineered to orchestrate multi-agent workflows, ingest tenant-scoped knowledge, discover MCP tools dynamically, create automations from natural-language requests, schedule transactional emails via Resend, enforce operator approval before consequential actions, and deploy production workloads to the Cloudflare Global Edge.

```
                         USER / CUSTOMER
                                |
                                v
                     +----------------------+
                     | Web / Embedded UI    |
                     | Chat / AGENTS / API  |
                     +----------+-----------+
                                |
                                v
                     +----------------------+
                     | API Gateway / Worker |
                     +----------+-----------+
                                |
                                v
                     +----------------------+
                     | Agent Orchestrator   |
                     +----------+-----------+
                                |
              +-----------------+------------------+
              |                 |                  |
              v                 v                  v
        Knowledge Layer     Tool Registry     Workflow Engine
              |                 |                  |
              v                 v                  v
        Vector Search        MCP / APIs        Scheduler
              |                 |                  |
              +-----------------+------------------+
                                |
                                v
                       +----------------+
                       | Cloudflare AI  |
                       | Model Gateway  |
                       +----------------+
                                |
                                v
                         Validation Layer
                                |
                    +-----------+-----------+
                    |                       |
              Needs Approval           Safe Answer
                    |
                    v
               Approval
                    |
                    v
               Execution
                    |
                    v
              Audit / Logs
```

### 🏛️ The Core Law of the Platform
- **AI plans and interprets.**
- **Knowledge supplies factual context.**
- **Tools perform actions.**
- **Workflow Engine executes deterministic steps.**
- **Permissions control access.**
- **Approval controls consequential actions.**
- **Cloudflare executes production workloads.**
- **GitHub is the authoritative source-of-truth repository.**

---

## 🧭 2. AGENTS Workspace & Navigation

The platform features an **AGENTS** workspace structured into three integrated modules:

| Module | Purpose | Features |
| :--- | :--- | :--- |
| **1. Automations Engine** | Natural-Language Workflow Creation & Lifecycle Management | 9 status tabs (Working, Draft, Pending Approval, Scheduled, Active, Paused, Completed, Failed, Inactive), Natural-Language parser, Attached Knowledge with Title IDs, Validation Contract, Approval Preview modal (`[CANCEL]` vs `[APPROVE]`), and Execution Logs. |
| **2. Chat & Multi-Agent** | Autonomous Multi-Agent Workspace | Agent selector (General, Developer, Knowledge, Customer Service, Design, Custom), Connected MCP Servers (Knowledge, GitHub, Figma, Resend, Cloudflare), Agent-to-Agent delegation (e.g. General -> Design -> Figma MCP -> Result). |
| **3. Agent Worker & Architecture** | Cloudflare Edge Runtime & Embeddable Widget | Visual blueprint of Cloudflare bindings (`[ai]`, `[[d1_databases]]`, `[[r2_buckets]]`, `[[vectorize]]`, `[[kv_namespaces]]`, `[durable_objects]`), Resend pipeline, and Embeddable Customer Service Widget (`/widget.js`). |

---

## ☁️ 3. Cloudflare Edge Architecture & Bindings

The production runtime is deployed as a standalone Cloudflare Worker (`cloudflare-worker.js`) executing across 330+ edge locations in V8 isolates without cold starts.

### Active `wrangler.toml` Bindings:

```toml
name = "devai-controller"
main = "cloudflare-worker.js"
compatibility_date = "2026-03-01"
compatibility_flags = ["nodejs_compat"]

# 1. Cloudflare Workers AI Native Binding
[ai]
binding = "AI"

# 2. Cloudflare D1 Relational Database Binding
[[d1_databases]]
binding = "DB"
database_name = "devai_production_db"
database_id = "00000000-0000-0000-0000-000000000000"

# 3. Cloudflare R2 Document & Knowledge Storage
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "devai-knowledge-docs"

# 4. Cloudflare Vectorize Semantic Search Index
[[vectorize]]
binding = "VECTOR_INDEX"
index_name = "devai-knowledge-vectors"

# 5. Cloudflare Workers KV Cache & Config
[[kv_namespaces]]
binding = "CONFIG_KV"
id = "00000000000000000000000000000000"

# 6. Cloudflare Durable Objects Stateful Agent Coordination
[durable_objects]
bindings = [
  { name = "AGENT_SESSION", class_name = "AgentSessionDO" }
]

# 7. Static Assets (React Vite SPA)
[site]
bucket = "./dist"

# 8. Observability & Logging
[observability]
enabled = true
head_sampling_rate = 1

# 9. Scheduled Workflows & Cron Triggers
[triggers]
crons = ["*/15 * * * *"]
```

### Worker Invocation in Code:
```javascript
// Native Cloudflare Workers AI execution
const aiRes = await env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
  messages: [
    { role: 'system', content: 'You are the General Agent. Plan, ground in facts, and invoke tools.' },
    { role: 'user', content: prompt }
  ],
  max_tokens: 1024
});
```

---

## ✉️ 4. Resend Transactional Email Engine

Email scheduling and delivery is powered by the **Resend API v1** integration:

- **Email Knowledge Representation**:
  - `Header`: Standard branded header component
  - `Preheader`: High-contrast preview text
  - `Subject`: Verified subject line
  - `Body`: Markdown or HTML content
  - `CTA`: Primary action button with verified target URL
  - `Footer`: Zero-trust compliance and security notice
  - `Signature`: Standard executive team signature
  - `Variables`: Dynamic client tokens (e.g. `{{CLIENT_NAME}}`, `{{MONTH}}`, `{{YEAR}}`, `{{INVOCATIONS_COUNT}}`)
- **Safety & Validation**:
  - The AI parses attached knowledge templates (e.g. `monthly-client-email-v1`) and validates syntax.
  - Verifies that no external malicious script tags (`<script>`) are present.
  - Refuses to invent missing recipients, dates, or signatures.

---

## 🐙 5. GitHub Integration & DevOps Pipeline

GitHub serves as the **authoritative source-of-truth repository**:

- **Repository Tree & File Analysis**: Real-time inspection via GitHub REST API v3.
- **Surgical AST Diff Engine**: Produces precise patches targeting only modified lines without wholesale file rewrites.
- **Automated Pull Request Dispatch**: Staged commits are pushed to isolated branches (e.g. `branch-agent-patch`) with structured PR checklists and verification logs.
- **CI/CD Pipeline Workflow**:
  ```
  Developer Branch -> Local Test/Lint -> Push -> GitHub PR -> Automated Lint & Typecheck -> Review -> Cloudflare Edge Deploy
  ```

---

## 🤖 6. Multi-Agent Registry & Agent-to-Agent Flow

Agents are tenant-scoped and restricted by explicit permissions. **The model itself is never treated as the authorization layer.**

| Agent | Identifier | Role & Permissions | Connected Tools |
| :--- | :--- | :--- | :--- |
| **General Agent** | `agent-general-01` | High-level orchestrator, intent formulation, tool dispatch | `knowledge.search`, `knowledge.add`, `email.schedule`, `agent.call`, `workflow.run` |
| **Developer Agent** | `agent-developer-01` | Code patch synthesis, GitHub PRs, Cloudflare worker builds | `github.read`, `github.write`, `github.pull_request`, `cloudflare.deploy` |
| **Knowledge Agent** | `agent-knowledge-01` | Document ingestion, chunking, and semantic vector retrieval | `knowledge.search`, `knowledge.add` |
| **Customer Service Agent** | `agent-customer-01` | Isolated public webchat representative with zero admin privileges | `knowledge.search` |
| **Design Agent** | `agent-design-01` | Figma MCP token extractor and component specification verifier | `figma.read`, `figma.create` |
| **Custom Agent** | `agent-custom-01` | Configurable multi-step webhook ingestion and database reconciliation | `cloudflare.read`, `email.schedule` |

### Agent-to-Agent Communication Flow:
```
Main Agent  -->  Design Agent  -->  Figma MCP  -->  Design Tokens  -->  Result  -->  Main Agent
```

---

## ⚡ 7. Automations Engine & Consequential Action Approvals

### Natural-Language Automation Example:
1. **User input**: *"I want to schedule an email on 31."*
2. **AI identifies ambiguity and asks**:
   - *Which month?*
   - *What time?*
   - *Who receives it?*
   - *What is the subject?*
   - *What content/template should be used?*
   - *Should it repeat?*
3. **User clarifies**: *"Send the monthly client update to client@operava.com at 09:00 on October 31 using monthly-client-email-v1."*
4. **AI inspects attached knowledge**: Loads `monthly-client-email-v1`, `company-branding-v2`, and `signature-template`.
5. **AI Knowledge Validation**: Verifies 5/5 checks pass -> **READY FOR APPROVAL**.
6. **Consequential Action Approval Preview**:
   - `[ CANCEL ]`: No schedule is created. Automation remains in DRAFT/INACTIVE.
   - `[ APPROVE ]`: Automation is saved, registered in Cloudflare Cron Triggers, and transitioned to `SCHEDULED`.

### 9 Automation Lifecycle States:
- `WORKING`: Being actively formulated or edited.
- `DRAFT`: Saved but not validated or approved.
- `PENDING_APPROVAL`: Validated and waiting for operator confirmation.
- `SCHEDULED`: Approved and registered on Cloudflare Cron Triggers.
- `ACTIVE`: Running recurring or event-driven automation.
- `PAUSED`: Temporarily suspended without deletion.
- `COMPLETED`: One-time execution completed successfully.
- `FAILED`: Execution halted due to network or provider error.
- `INACTIVE`: Disabled without deletion.

---

## 💬 8. Embeddable Customer Service AI Widget

Provides an isolated, drop-in customer service chat widget for any external website:

```html
<script src="https://controller.operava.com/widget.js" data-tenant="tenant_prod_edge_001" data-agent="agent-customer-01" async></script>
```

- **Zero Privilege Leakage**: Customer AI only has `knowledge.read` permissions and can never access GitHub, Cloudflare, or email sending tools.
- **Human Escalation**: If response confidence falls below 0.85, the inquiry is forwarded to an engineering lead ticket instead of inventing an answer.

---

## 📡 9. Complete REST API Catalog (`/v1/*` Namespace)

### Agent & Tool Endpoints
- `GET /v1/agents` — List authorized agents with permissions and enabled tools.
- `GET /v1/agents/:id` — Retrieve specific agent profile and system instructions.
- `GET /v1/tools` — Controlled Tool Registry with input/output schemas and risk levels.
- `GET /v1/mcp` — List connected Model Context Protocol (MCP) servers.

### Knowledge Layer Endpoints
- `GET /v1/knowledge` — List tenant knowledge items with Title IDs.
- `POST /v1/knowledge` — Ingest, chunk, and index a new document with an immutable Title ID.

### Automations & Approval Endpoints
- `GET /v1/automations` — List automations (supports `?status=SCHEDULED` filter).
- `GET /v1/automations/:id` — Retrieve automation details and workflow sequence.
- `POST /v1/automations/parse` — Natural-language interpreter and validation check contract.
- `POST /v1/automations/:id/approve` — Consequential Action Approval Gate (activates schedule).
- `POST /v1/automations/:id/cancel` — Cancel proposed automation.
- `POST /v1/automations/:id/run` — Immediate execution ("Run Now").
- `GET /v1/executions` — Immutable execution audit log stream.

### Customer Service Widget Endpoints
- `GET /widget.js` — Client JavaScript bundle for public site integration.
- `GET /v1/widget/config` — Retrieve tenant widget styling and greeting settings.
- `POST /v1/widget/chat` — Public customer inquiry endpoint grounded in authorized knowledge.

---

## 🔒 10. Security & Zero-Trust Secrets Isolation

1. **Zero Browser Exposure**: API tokens (`CLOUDFLARE_API_TOKEN`, `GITHUB_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `OPENAI_API_KEY`) are stored in server-side environment variables and encrypted using `AES-256-GCM` with 96-bit unique IVs.
2. **Untrusted Uploads**: Ingested files are treated as untrusted data, never as system instructions.
3. **Prompt Injection Defense**:
   ```
   SYSTEM RULES  >  SECURITY POLICY  >  USER PERMISSIONS  >  TOOL PERMISSIONS  >  KNOWLEDGE  >  USER CONTENT
   ```
4. **Least-Privilege Token Scoping**: Each agent receives only the tools explicitly granted in its permission array.

---

## 🚀 11. Local Development & Deployment

### Prerequisites
- Node.js 20+
- npm

### 1. Installation
```bash
git clone https://github.com/jelvan-operava/Dev-ai-Controller-.git
cd Dev-ai-Controller-
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```
Populate `.env` with your API keys:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `RESEND_API_KEY`
- `GITHUB_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`

### 3. Start Development Server
```bash
npm run dev
```
Runs Express fullstack server with Vite middleware on `http://localhost:3000`.

### 4. Build & Verify
```bash
npm run lint
npm run build
```

### 5. Deploy to Cloudflare
```bash
npx wrangler deploy
```
Deploys `cloudflare-worker.js` with all bindings to the Cloudflare Global Edge.
