# Dev’ai Controller — Production Deployment

Dev’ai Controller production runs on Cloudflare Workers. Cloudflare D1 is the authoritative relational store; R2 stores knowledge documents, Vectorize provides semantic retrieval, KV stores configuration/cache, Durable Objects coordinate agent sessions, and Workers AI is the primary model runtime.

## 1. Provision Cloudflare resources

```bash
npx wrangler login
npx wrangler d1 create devai_production_db
npx wrangler r2 bucket create devai-knowledge-docs
npx wrangler vectorize create devai-knowledge-vectors --dimensions=768 --metric=cosine
npx wrangler kv namespace create CONFIG_KV
```

Copy the D1 database ID and KV namespace ID returned by Cloudflare into `wrangler.toml`. The committed zero values are intentional non-secret placeholders and **must be replaced before production deployment**.

## 2. Configure secrets

Set only the secrets used by the production runtime:

```bash
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
npx wrangler secret put CLOUDFLARE_API_TOKEN
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put ADMIN_JWT_KEY
npx wrangler secret put WORKER_SECRET
# Optional fallback providers:
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put GEMINI_API_KEY
```

Never commit secret values.

## 3. Verify the repository

```bash
npm install
npm run check
```

`npm run check` performs the TypeScript check and production build. Pull requests to `main` run the same verification in GitHub Actions in addition to CodeQL.

## 4. Deploy

```bash
npx wrangler deploy
```

The Worker uses the bindings declared in `wrangler.toml`: `AI`, `DB`, `STORAGE`, `VECTOR_INDEX`, `CONFIG_KV`, and `AGENT_SESSION`.

## 5. Production verification

After deployment, verify:

```bash
curl -i "https://devai-controller.<your-subdomain>.workers.dev/api/health"
curl -i "https://devai-controller.<your-subdomain>.workers.dev/api/status"

curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/v1/agents/agent-general-01/simulate-flow" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Audit edge worker and prepare client briefing"}'

curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/v1/automations/parse" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Send monthly client update on October 31 at 09:00"}'

curl -i -X POST "https://devai-controller.<your-subdomain>.workers.dev/v1/widget/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"What services do you provide?"}'
```

Confirm D1 persistence, tenant isolation, approval-gate behavior, audit hashes, scheduled cron execution, and that no secret appears in browser assets or logs.

## Deployment gate

A production deployment is ready only when:

- `npm run check` passes.
- GitHub CI and CodeQL pass.
- D1 and KV placeholder IDs in `wrangler.toml` have been replaced with the real Cloudflare resource IDs.
- R2 and Vectorize resources exist under the configured names.
- Required Worker secrets are provisioned.
- Post-deployment health and lifecycle checks pass.
