# Contributing

Thanks for helping improve Shared Lists Starter.

## Before You Start

Open an issue for larger changes, security-sensitive changes, or anything that changes auth, permissions, migrations, or deployment behavior.

Small documentation fixes and focused bug fixes can go straight to a pull request.

## Runtime

Use the runtime declared in `package.json`:

- Node `>=24 <27`
- npm `>=10`

Install with:

```bash
npm ci
```

The local development server loads `.env` when present. Do not commit `.env`.

## Fork And Branch Flow

1. Fork the repository.
2. Create a branch from `main`.
3. Keep the change focused.
4. Run the checks below.
5. Open a pull request against `main`.

## Local Checks

Run these before opening a pull request:

```bash
npm test
npm run build
git diff --check
```

`npm run check` runs the same test and build sequence used by CI.

## Test Organization

- `tests/request-identity.test.mjs`: auth provider and identity-boundary tests.
- `tests/api-router.test.mjs`: API, permissions, sharing, setup, and optional integration behavior.
- `tests/shared-lists-core.test.mjs`: in-memory store and model behavior.
- `tests/pwa-shell.test.mjs`: PWA shell, metadata, service worker, and source safety checks.
- `tests/performance-safety.test.mjs`: size, cache, and privacy guardrails.

Add or update tests when you change auth, list permissions, people autocomplete, migrations, task behavior, or deployment-facing config.

## Migration Rules

- Add D1-compatible SQL files under `drizzle/`.
- Keep migrations idempotent where possible.
- Update `drizzle/meta/_journal.json`.
- Update any runtime schema-bootstrap logic in `src/lib/d1-store.mjs` if the app still needs to start safely on an older database.
- Add tests for behavior that depends on the new schema.

## Pull Request Rules

- Keep changes focused.
- Explain user-visible behavior.
- Add or update tests when changing auth, permissions, migrations, sharing, or task behavior.
- Do not commit secrets, private URLs, private emails, real database IDs, or deployment tokens.
- Prefer config and environment variables over source edits for setup choices.
- Note whether the change affects OpenAI Sites, Cloudflare, or both.
- Include screenshots for user-facing UI changes when practical.

## License And Contribution Terms

The project is licensed under Apache License 2.0. By opening a pull request, you agree that your contribution is licensed under Apache-2.0.

No CLA or DCO sign-off is required today.

## Public Repo Hygiene

This starter is meant to be safe to fork. Do not add private deployment metadata or personal integration details to public docs, tests, examples, or config.
