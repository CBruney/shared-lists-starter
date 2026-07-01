# GitHub Setup

Use this after creating the clean public repo. Do not apply these settings to a private working repo unless you want the same workflow limits there.

## Repository

- Name: `shared-lists-starter`
- Description: `Reusable starter for private shared lists with D1-style storage and list-level permissions.`
- Topics: `shared-lists`, `pwa`, `cloudflare-workers`, `d1`, `openai-sites`
- Default branch: `main`

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

Enable private vulnerability reporting in GitHub repository settings before inviting outside users to file security reports.

## First Release

Create the first public release from tag `v0.1.0` after confirming the public repo contains only the sanitized export.
