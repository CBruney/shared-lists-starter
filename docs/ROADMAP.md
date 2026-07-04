# Roadmap

Shared Lists Starter is pre-1.0. The goal is to stay small, useful, and easy to deploy.

## v0.1

- Clean Apache-2.0 starter.
- Local development with an empty in-memory database.
- OpenAI Sites deployment lane.
- Cloudflare Workers + D1 + Access design lane.
- List-level ownership, sharing, and access requests.
- First-owner setup for fresh deployments.
- CI, Dependabot config, issue templates, and contribution docs.
- Desktop and mobile screenshots.
- Privacy/data-lifecycle, accessibility, governance, and maintainer docs.

## Next

- Complete the OpenAI Sites staging pilot checklist in `DEPLOY_OPENAI_SITES.md`.
- Keep Google Contacts disabled until the readiness gates in `PRIVATE_CONTACTS.md` pass.
- Make the Cloudflare instructions executable.
- Add a complete Cloudflare smoke test with a disposable D1 database.
- Test the production system, not just its components.
- Add browser and accessibility automation for keyboard, focus, and combobox behavior.
- Add a dedicated confidential conduct-reporting route before accepting outside contributors.
- Split the ACL, schema, and store layer into a published package.
- Add starter templates for grocery, packing, chores, and trip lists.
- Add import/export helpers for text and CSV.

## Not Planned For The Starter

- A hosted multi-tenant SaaS.
- Payment flows.
- A large project-management surface.
- Private personal automations.

Those can live in forks, adapters, or separate apps.
