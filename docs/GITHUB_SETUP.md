# GitHub Setup

Use this to keep the canonical starter repository ready for outside users.

## Repository

- Name: `shared-lists-starter`
- Description: `Reusable starter for private shared lists with D1-style storage and list-level permissions.`
- Topics: `shared-lists`, `pwa`, `cloudflare-workers`, `d1`, `openai-sites`
- Default branch: `main`
- Homepage: `https://github.com/CBruney/shared-lists-starter#readme`
- Discussions: enabled

## Branch Protection

Protect `main` with:

- Require a pull request before merging.
- Require status checks to pass.
- Require the `CI / Test and build` check.
- Require branches to be up to date before merging.
- Require conversation resolution before merging.
- Block force pushes.
- Block deletions.

For a solo-maintained early release, admin bypass is acceptable. For outside contributors, disable bypass once the workflow is stable.

## Automation

This repo includes:

- `.github/workflows/ci.yml`
- `.github/dependabot.yml`
- issue templates
- pull request template

After the first public push, confirm that GitHub Actions and Dependabot are enabled in the repository settings.

## Security

Enable private vulnerability reporting in GitHub repository settings. `SECURITY.md` points reporters to GitHub's private advisory form.

## Discussions

Enable GitHub Discussions for open-ended setup questions and community notes. Keep bug reports in Issues and confidential security reports in private vulnerability reporting.

## Confidential Conduct Route

Before accepting outside contributors, configure a confidential conduct-reporting route. A private maintainer email alias is preferable. If that is not available yet, keep `CODE_OF_CONDUCT.md` pointing to GitHub private vulnerability reporting as the temporary confidential route.

## First Release

Keep the `v0.1.0` release notes aligned with `CHANGELOG.md`, `docs/RELEASES.md`, and the current starter docs.
