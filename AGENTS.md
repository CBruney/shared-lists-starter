# Agent Instructions

You are working in the public Shared Lists Starter repository.

## Priorities

1. Keep setup config-driven.
2. Preserve list-level access control.
3. Keep the public repo sanitized.
4. Run tests before claiming success.

## Do Not Commit

- Secrets.
- `.env`.
- Real production database IDs.
- Private deployment IDs.
- Private emails.
- Personal integration details.
- Generated `dist/` output unless the user explicitly asks.

## Normal Commands

```bash
npm install
npm run dev
npm test
npm run build
```

## Deployment

Use exactly one hosting lane per task:

- OpenAI Sites: follow `docs/DEPLOY_OPENAI_SITES.md`.
- Cloudflare Workers + D1 + Access: follow `docs/DEPLOY_CLOUDFLARE.md`.

Do not mix the lanes unless the user asks for a migration plan.

## Configuration

Use `shared-lists.config.json` and environment variables for normal setup. Do not edit source code to change the feedback email, auth provider, first owner, public URL, or optional feature flags.

## Verification

Before final response, run:

```bash
npm test
npm run build
git diff --check
```

If a command cannot run, say exactly why.
