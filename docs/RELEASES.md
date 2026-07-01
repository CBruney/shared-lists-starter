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
- Cloudflare Workers + D1 + Cloudflare Access setup docs.
- CI, Dependabot config, issue templates, security policy, support policy, and contribution guide.

Known limits:

- No hosted public demo yet; use the local demo.
- No automated end-to-end deploy smoke test yet.
- No published package for the shared core yet.
- No guaranteed support channel.

Before publishing this release publicly, create a clean public repo from the sanitized export. Do not make a private working repo public.
