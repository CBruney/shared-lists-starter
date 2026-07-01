# Contributing

Thanks for helping improve Shared Lists Starter.

## Before You Start

Open an issue for larger changes, security-sensitive changes, or anything that changes auth, permissions, migrations, or deployment behavior.

Small documentation fixes and focused bug fixes can go straight to a pull request.

## Local Checks

Run these before opening a pull request:

```bash
npm test
npm run build
git diff --check
```

## Pull Request Rules

- Keep changes focused.
- Explain user-visible behavior.
- Add or update tests when changing auth, permissions, migrations, sharing, or task behavior.
- Do not commit secrets, private URLs, private emails, real database IDs, or deployment tokens.
- Prefer config and environment variables over source edits for setup choices.

## Public Repo Hygiene

This starter is meant to be safe to fork. Do not add private deployment metadata or personal integration details to public docs, tests, examples, or config.
