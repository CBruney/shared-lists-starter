# Security Policy

Shared Lists Starter handles authentication, list membership, and private task data. Treat security issues seriously.

## Supported Versions

The main branch is the supported development line.

## Reporting A Vulnerability

Do not open a public issue for a suspected vulnerability.

Use GitHub private vulnerability reporting if it is enabled for the repository. If private vulnerability reporting is not enabled yet, open a minimal public issue asking for a private security contact, but do not include exploit details or private data in that issue.

Include:

- What went wrong.
- How to reproduce it.
- Which hosting lane you used.
- Whether the issue affects auth, list permissions, task data, deployment secrets, or stored data.

## Security Expectations

- Every API route must identify the signed-in user.
- Every list read or write must check list membership.
- Owner-only actions must stay owner-only.
- Deployment secrets belong in the host secret store.
- Public exports must not include private emails, private URLs, project IDs, tokens, or database IDs.
