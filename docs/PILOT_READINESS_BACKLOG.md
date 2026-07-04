# Pilot Readiness Backlog

This backlog tracks follow-up work that should not be hidden by the existence of starter docs or config flags.

## P1 Gates

### Google Contacts stays disabled

Status: blocked for real deployments.

Needed before enabling:

- Replace large one-contact-at-a-time D1 writes with resumable staged writes that stay inside Worker and D1 limits.
- Add OAuth tests for state ownership, replay prevention, expiry, PKCE, token exchange, token refresh, callback recovery, and disconnect cleanup.
- Add failure tests for encryption errors, D1 disconnects, Google quota/rate limits, and partial sync recovery.
- Add per-user sync cooldowns.
- Revoke Google grants on disconnect where supported.
- Add no-store and no-referrer callback headers.
- Validate token-secret strength and document key rotation.
- Pass a real D1 large-sync rehearsal.

### Cloudflare lane stays incomplete

Status: documented design lane, not production-ready.

Needed before advertising complete support:

- Pin a supported Wrangler version.
- Add working deploy, migrate, smoke-test, and rollback commands.
- Confirm `migrations_dir` and asset routing with the pinned Wrangler version.
- Implement Cloudflare-correct sign-in and sign-out behavior.
- Add `assets.run_worker_first` or equivalent verified routing for API and static assets.
- Add production security headers: CSP, `frame-ancestors`, `nosniff`, referrer policy, and permissions policy.
- Pass a disposable Worker + D1 rehearsal covering migrations, authentication, first-owner restrictions, list permissions, deploy, smoke, and rollback.

### Release and repository controls

Status: partially manual.

- Do not retag, delete, or recreate `v0.1.0`.
- Use `v0.1.1` or later for the next immutable release.
- Keep `CHANGELOG.md` updated with an `Unreleased` section before tagging.
- Protect `main` before accepting outside contributions. This requires a maintainer action in GitHub settings.

## P2 Quality

- Add keyboard alternatives for task reordering and open-task deletion.
- Complete dialog focus management and combobox semantics.
- Add browser plus axe-style accessibility checks for the WCAG 2.2 AA target.
- Keep `npm run dev` aligned with production metadata and manifest rendering.
- Keep `db/schema.ts` in parity with migrations.
- Keep the root package private unless the project intentionally publishes an npm package.
- Add a dedicated confidential conduct-reporting route when repo settings or a private reporting mailbox are available.
- Keep release-process details out of `NOTICE`.
- Use `npm ci` in agent setup instructions.
- Keep build tooling current.

