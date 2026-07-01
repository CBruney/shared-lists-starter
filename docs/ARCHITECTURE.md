# Architecture

Shared Lists Starter is a Worker-compatible app with a static PWA shell, a small API router, and D1-style persistence.

## Request Flow

```text
Browser
  -> static app shell
  -> /api/*
  -> Worker identity adapter
  -> API router
  -> store layer
  -> D1 tables
```

## Core Pieces

- `src/index.html`: app shell.
- `src/app.js`: browser UI and optimistic interaction logic.
- `src/worker.js`: Worker entrypoint and host-specific environment wiring.
- `src/lib/request-identity.mjs`: OpenAI Sites, local dev, and Cloudflare Access identity resolution.
- `src/lib/api-router.mjs`: API routes and permission boundaries.
- `src/lib/d1-store.mjs`: D1-backed store.
- `src/lib/shared-lists-core.mjs`: shared validation, in-memory store, and model helpers.
- `drizzle/`: database migrations.

## Permission Model

The app can be reachable at a public URL, but list data is not public.

Every list has:

- One owner.
- Zero or more members.
- Optional sharing permission for non-owner members.
- Pending access requests for people who open a list link before they are members.

The API returns list data only when the signed-in email is a member of that list.

## Auth Providers

OpenAI Sites:

- Reads the authenticated email from the Sites request header.
- Ignores Cloudflare Access-only credentials.
- Works well when the app is deployed through OpenAI Sites.

Cloudflare Access:

- Verifies a Cloudflare Access JWT.
- Ignores OpenAI Sites identity headers.
- Requires `CLOUDFLARE_ACCESS_TEAM_DOMAIN` and `CLOUDFLARE_ACCESS_AUD`.
- Works well when you want to own the Cloudflare account, D1 database, Access policy, and DNS.

Local dev:

- Uses a local-only development user switcher.
- Never use local dev identity behavior as a production auth model.

## Storage

The schema stores:

- `users`
- `lists`
- `list_members`
- `tasks`
- `activity`
- `list_access_requests`
- `idempotency_keys`
- `task_external_refs`
- `user_contact_sources`
- `user_contacts`
- `contact_oauth_states`

Apply migrations before production use.

## Optional Features

Optional features should be enabled by config or environment variables, not by editing app source.

The public starter defaults to a plain shared-list app. Private integrations belong in adapters, forks, or host-specific config.

Private Google Contacts autocomplete is optional. When enabled, contact data is scoped by signed-in user and merged into that user’s autocomplete results only.

People autocomplete returns list peers plus the signed-in user's private contacts. It does not expose the full global `users` table to every authenticated browser.
