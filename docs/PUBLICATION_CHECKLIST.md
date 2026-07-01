# Release Checklist

Run this before each public release.

## Local Checks

```bash
npm ci
npm run check
git diff --check
```

## Sanitization Checks

Search for private markers. Replace the terms below with the private project IDs, domains, email domains, and database IDs used by the private source app:

```bash
rg -i "private-project-id|private-version-id|private-domain|private-email-domain|real-cloudflare-aud|real-database-id"
```

The only acceptable matches should be in the private source repo, not in the generated public export.

## Public Repo Setup

- Add a repo description.
- Add topics such as `shared-lists`, `pwa`, `cloudflare-workers`, `d1`, `openai-sites`.
- Add the repo homepage.
- Enable Dependabot or your preferred dependency monitor.
- Enable GitHub Discussions.
- Enable branch protection if accepting outside contributions.
- Confirm GitHub Actions is enabled and the CI workflow passes.
- Enable GitHub private vulnerability reporting.
- Review `docs/GITHUB_SETUP.md`.

## Release

- Create an initial tag such as `v0.1.0`.
- Keep public commits free of private material.
- Do not copy private deployment files into the starter.
- Record whether each release changes runtime code, docs only, or repository settings.
