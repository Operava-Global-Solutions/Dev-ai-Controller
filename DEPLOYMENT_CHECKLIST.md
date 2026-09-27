# Dev’ai Controller — Production Readiness Checklist

## Repository verification

- [ ] `npm install` completes.
- [ ] `npm run check` passes TypeScript and the production build.
- [ ] GitHub Actions CI passes.
- [ ] CodeQL passes.
- [ ] No secret values are committed or bundled into browser assets.

## Cloudflare resources

- [ ] Workers AI binding `AI` is enabled.
- [ ] D1 database `devai_production_db` exists and `wrangler.toml` contains its real `database_id`.
- [ ] R2 bucket `devai-knowledge-docs` exists.
- [ ] Vectorize index `devai-knowledge-vectors` exists with the configured dimensions/metric.
- [ ] KV namespace `CONFIG_KV` exists and `wrangler.toml` contains its real ID.
- [ ] Durable Object binding `AGENT_SESSION` is available.
- [ ] Cron trigger `*/15 * * * *` is registered.

## Required secrets

Provision with `wrangler secret put <NAME>`:

- [ ] `CLOUDFLARE_ACCOUNT_ID`
- [ ] `CLOUDFLARE_API_TOKEN`
- [ ] `GITHUB_TOKEN`
- [ ] `RESEND_API_KEY`
- [ ] `ADMIN_PASSWORD`
- [ ] `ADMIN_JWT_KEY`
- [ ] `WORKER_SECRET`
- [ ] Optional `OPENAI_API_KEY`
- [ ] Optional `GEMINI_API_KEY`

## Runtime verification

- [ ] `GET /api/health` returns HTTP 200 and reports required Cloudflare bindings.
- [ ] `GET /api/status` returns HTTP 200.
- [ ] 7-step agent simulation completes and returns verification/audit metadata.
- [ ] Automation parser validates a complete schedule request.
- [ ] Customer widget responds with tenant-authorized knowledge.
- [ ] D1 writes persist and remain tenant-scoped.
- [ ] Consequential mutations stop at the approval gate without an approval token.
- [ ] Cron-driven automation executes on schedule.
- [ ] Logs and frontend assets contain no credentials.

## Release gate

Do not deploy production while either placeholder remains in `wrangler.toml`:

- `database_id = "00000000-0000-0000-0000-000000000000"`
- `id = "00000000000000000000000000000000"`

These values must come from the target Cloudflare account; they are not safe to guess or generate locally.
