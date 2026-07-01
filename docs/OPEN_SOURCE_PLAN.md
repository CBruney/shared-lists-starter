# Open Source Plan

This starter is built around four phases.

## Phase 1: Clean Public Export

Goal: publish a sanitized repo that can be cloned safely.

Included:

- Apache-2.0 license.
- Public README.
- Sanitized config.
- No private deployment IDs.
- No personal emails or live private URLs.
- Public export test.

## Phase 2: Install And Run

Goal: make the repo usable without an agent.

Included:

- `npm install`
- `npm run dev`
- `npm test`
- `npm run build`
- Local development with an empty in-memory database.
- Public setup docs.

## Phase 3: Deployable Lanes

Goal: let a deployer pick OpenAI Sites or Cloudflare without changing app source.

Included:

- OpenAI Sites docs.
- Cloudflare Workers + D1 + Access docs.
- `.openai/hosting.json` without a public project ID.
- `wrangler.toml.example`.
- Cloudflare Access identity verification.
- First-owner setup endpoint.

## Phase 4: Community And Maintenance

Goal: make the project understandable and maintainable for outside users.

Included:

- `CONTRIBUTING.md`
- `SECURITY.md`
- `SUPPORT.md`
- `CODE_OF_CONDUCT.md`
- issue templates
- pull request template
- GitHub Actions CI
- Dependabot config
- roadmap
- local demo docs
- release notes
- `AGENTS.md`
- `AGENT_README.md`
- basic release notes in `CHANGELOG.md`

## Next Phases

Good future work:

- Add a fully automated Cloudflare deploy smoke test.
- Capture real screenshots from the local demo or a dedicated hosted demo.
- Package the shared ACL/store layer as a real workspace package.
- Add a hosted demo with non-production storage and clearly synthetic data.
