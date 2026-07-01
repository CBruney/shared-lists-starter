# OpenAI Sites Identity Adapter

The OpenAI Sites lane uses the authenticated email supplied by Sites.

Implementation:

- `src/lib/request-identity.mjs`
- `src/worker.js`

Config:

```text
SHARED_LISTS_AUTH_PROVIDER=openai-sites
```

Client config:

```json
{
  "authProvider": "openai-sites"
}
```

Do not copy a private `.openai/hosting.json` `project_id` into a public starter. Each deployer should create or connect their own Sites project.
