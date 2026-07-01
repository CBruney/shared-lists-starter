# Releases

## v0.1.0

Status: initial pre-1.0 starter release.

This release is meant for people who want to inspect, fork, run, and deploy their own small shared-list app. It is not a hosted service.

Included:

- Apache-2.0 license.
- Local development server.
- PWA app shell.
- D1-style schema and migrations.
- List ownership and membership permissions.
- Owner-delegated sharing.
- Access requests for people who open a list link before they are members.
- First-run overview tour, with replay from Settings.
- Install-as-app guidance for mobile and desktop users.
- First-owner setup for fresh deployments.
- OpenAI Sites setup docs.
- Cloudflare Workers + D1 + Cloudflare Access design docs, marked incomplete for executable deployment.
- Scoped people autocomplete that returns list peers and private contacts, not the full user table.
- Provider-isolated auth: OpenAI Sites headers and Cloudflare Access JWTs are not interchangeable.
- Privacy/data-lifecycle, accessibility, governance, maintainer, and code-owner docs.
- Desktop and mobile screenshots.
- CI, Dependabot config, issue templates, security policy, support policy, and contribution guide.

Known limits:

- No hosted public demo yet; use the local demo.
- Cloudflare deploy/migrate/smoke/rollback commands are not implemented yet.
- No automated production-system deploy smoke test yet.
- No published package for the shared core yet.
- No guaranteed support channel.
