# Changelog

## Unreleased

- Make production auth provider configuration fail closed unless `SHARED_LISTS_AUTH_PROVIDER` is explicitly set to `openai-sites` or `cloudflare-access`.
- Block cross-site state-changing API calls with Origin, Fetch Metadata, and JSON content-type checks.
- Clear private browser cache and session state on sign-out or access loss.
- Make first-owner setup require `FIRST_OWNER_EMAILS` unless `ALLOW_ANY_FIRST_OWNER=true` is explicitly configured.
- Keep Google Contacts and Cloudflare deployment lanes documented as gated until their production readiness work is complete.
- Make Quick Actions fail closed unless explicitly enabled with a nonempty origin allowlist.
- Update `esbuild` past `0.27.3`.

## 0.1.0

- Initial public starter export.
- D1-style schema and migrations.
- List-level membership and sharing.
- First-run overview tour.
- Install-as-app guidance from Settings.
- OpenAI Sites and Cloudflare deployment docs.
- First-owner setup endpoint.
- GitHub Actions CI and Dependabot config.
- Public release, roadmap, demo, and GitHub setup docs.
- Apache-2.0 license.
- Provider-isolated auth and scoped people autocomplete.
- Privacy/data-lifecycle, accessibility, governance, maintainer, and CODEOWNERS docs.
- Help/questions route through the same mailto mechanism as Feedback.
- Desktop and mobile screenshots.
- Cloudflare lane marked incomplete until executable setup and production-system testing are added.
