# Cloudflare Access Identity Adapter

The Cloudflare lane verifies the Cloudflare Access JWT before trusting the signed-in email.

Implementation:

- `src/lib/request-identity.mjs`
- `src/worker.js`

Config:

```text
SHARED_LISTS_AUTH_PROVIDER=cloudflare-access
CLOUDFLARE_ACCESS_TEAM_DOMAIN=
CLOUDFLARE_ACCESS_AUD=
```

Use the real team domain and audience value from the Cloudflare Access application that protects this Worker.

Client config:

```json
{
  "authProvider": "cloudflare-access"
}
```

The adapter reads `cf-access-jwt-assertion` or `CF_Authorization`, fetches the Access JWKS from the configured team domain, verifies the RS256 signature, checks issuer, audience, expiration, and then returns the email.

Full deploy steps: `docs/DEPLOY_CLOUDFLARE.md`.
