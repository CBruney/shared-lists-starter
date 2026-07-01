# Agent Runbook

This file is for coding agents asked to clone, install, run, test, configure, or deploy Shared Lists Starter.

## Goal

Get a new deployment running without editing app source for normal setup. Use config files and environment variables first.

## Clean Clone

```bash
git clone "$REPOSITORY_URL"
cd shared-lists-starter
npm ci
npm run check
```

Use only a repository URL the user gives you or the current repository URL reported by Git. Do not invent a public URL. If `REPOSITORY_URL` is not set, ask for the real URL or use the already-open local checkout.

## Local Run

```bash
npm run dev
```

Open the printed local URL, usually `http://localhost:8001`.

The local server starts with an empty in-memory database. It does not connect to production D1.

If the user wants the local session tied to a real email address, start it with:

```bash
DEV_DEFAULT_USER_EMAIL="$OWNER_EMAIL" npm run dev
```

## Configuration Rules

Edit these files for ordinary setup:

- `shared-lists.config.json`: app name, public URL, feedback email, client-visible features.
- `.env` or the host secret store: auth provider, first-owner allowlist, Cloudflare Access values, optional server features.
- `.openai/hosting.json`: OpenAI Sites binding metadata.
- `wrangler.toml`: Cloudflare Worker, D1, and Access deployment metadata.

Do not edit `src/app.js`, `src/worker.js`, or the store layer just to change the first owner, host, feedback email, or auth provider.
Do not enable optional features such as access audit, people import, quick-action intake, or private Google Contacts autocomplete unless the user asks for them.

## Pick One Deployment Lane

### OpenAI Sites

Use this lane when the repo contains `.openai/hosting.json` and the user wants Sites.

1. Confirm `.openai/hosting.json` has no private `project_id` unless this is an existing site owned by the user.
2. Confirm `shared-lists.config.json` has `"authProvider": "openai-sites"`.
3. Run `npm run check`.
4. Use the OpenAI Sites connector to create or reuse the site.
5. Save a version from the exact pushed commit.
6. Deploy the saved version.
7. Verify `/api/session` returns `401` when signed out and returns a user when signed in.
8. Run first-owner setup if this is a new deployment.

### Cloudflare Workers + D1 + Access

Use this lane when the user wants Cloudflare ownership.

1. Copy `wrangler.toml.example` to `wrangler.toml`.
2. Fill in `database_id`, `CLOUDFLARE_ACCESS_TEAM_DOMAIN`, `CLOUDFLARE_ACCESS_AUD`, and `FIRST_OWNER_EMAILS` with values from the user's Cloudflare account and real owner email list.
3. Set `shared-lists.config.json` to `"authProvider": "cloudflare-access"`.
4. Run `npm run check`.
5. Run D1 migrations.
6. Deploy with Wrangler.
7. Verify the Cloudflare Access policy protects the app URL.
8. Run first-owner setup as the allowed owner.

## First Owner Setup

Check status:

```bash
curl "$APP_URL/api/setup/status"
```

Claim setup:

Set `APP_URL` to the deployed app URL and `FIRST_LIST_TITLE` to the real list name before running this command.

```bash
curl -X POST "$APP_URL/api/setup/first-owner" \
  -H "content-type: application/json" \
  -d "{\"title\":\"$FIRST_LIST_TITLE\"}"
```

This request must be authenticated by the host. Do not spoof production identity headers.

## Safety Checks

Before handing back:

```bash
npm run check
git diff --check
```

Also check:

- No private emails.
- No private URLs.
- No committed `.env`.
- No real Cloudflare database IDs in `wrangler.toml.example`.
- No OpenAI Sites `project_id` in a public starter unless the user explicitly owns and wants it there.

## Expected Result

Report:

- Hosting lane used.
- Public URL.
- First owner email, if configured.
- Tests and build status.
- Any manual step still required by the hosting provider.
