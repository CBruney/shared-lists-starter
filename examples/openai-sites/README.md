# OpenAI Sites Example

This example lane deploys the same app to OpenAI Sites with D1-style storage.

Use this when:

- You are already working in Codex.
- You want the shortest deploy path.
- You are comfortable making the app shell public while list data stays protected by app-level ACLs.

Required config:

```json
{
  "authProvider": "openai-sites"
}
```

Required server values:

```text
SHARED_LISTS_AUTH_PROVIDER=openai-sites
FIRST_OWNER_EMAILS=
ALLOW_ANY_FIRST_OWNER=false
ENABLE_FIRST_OWNER_SETUP=true
```

Set `FIRST_OWNER_EMAILS` to the real email address, or comma-separated real email addresses, allowed to create the first list.

The generated public starter includes `.openai/hosting.json` without a `project_id`. Create a new Sites project for each deployment.

Full steps: `docs/DEPLOY_OPENAI_SITES.md`.
