# Security Policy

Shared Lists Starter handles authentication, list membership, and private task data. Treat security issues seriously.

## Supported Versions

The main branch is the supported development line.

## Reporting A Vulnerability

Do not open a public issue for a suspected vulnerability.

Use GitHub private vulnerability reporting on the canonical repository:

```text
https://github.com/CBruney/shared-lists-starter/security/advisories/new
```

Do not include exploit details, private data, tokens, database exports, or private deployment URLs in a public issue.

Include:

- What went wrong.
- How to reproduce it.
- Which hosting lane you used.
- Whether the issue affects auth, list permissions, task data, deployment secrets, or stored data.

## Security Expectations

- Every API route must identify the signed-in user.
- Every list read or write must check list membership.
- Provider-specific auth must stay isolated. OpenAI Sites identity headers are not valid Cloudflare Access credentials, and Cloudflare Access JWTs are not valid OpenAI Sites credentials.
- Owner-only actions must stay owner-only.
- Deployment secrets belong in the host secret store.
- Public exports must not include private emails, private URLs, project IDs, tokens, or database IDs.
