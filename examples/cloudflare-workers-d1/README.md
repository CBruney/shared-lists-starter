# Cloudflare Workers + D1 Example

This example lane deploys Shared Lists Starter to Cloudflare Workers with D1 storage and Cloudflare Access identity.

Use this when:

- You want to own the Cloudflare account and database.
- You want Cloudflare Access as the auth gate.
- You are comfortable managing Wrangler, D1 migrations, Access policies, and DNS.

Required config:

```json
{
  "authProvider": "cloudflare-access"
}
```

Required server values:

```text
SHARED_LISTS_AUTH_PROVIDER=cloudflare-access
CLOUDFLARE_ACCESS_TEAM_DOMAIN=
CLOUDFLARE_ACCESS_AUD=
FIRST_OWNER_EMAILS=
ENABLE_FIRST_OWNER_SETUP=true
```

Use the real Cloudflare Access team domain and audience from the Access application. Set `FIRST_OWNER_EMAILS` to the real email address, or comma-separated real email addresses, allowed to create the first list.

Start from `wrangler.toml.example`, then follow `docs/DEPLOY_CLOUDFLARE.md`.
