# Configuration

Use config files and environment variables for setup. Avoid source edits for normal deployment choices.

## Client Config

`shared-lists.config.json` is read at build time and injected into the app shell. `appName` also updates the document metadata and web manifest during the build.

```json
{
  "appName": "Shared Lists",
  "publicUrl": "",
  "feedbackEmail": "",
  "authProvider": "openai-sites",
  "features": {
    "quickActionBridge": false,
    "accessAudit": false,
    "peopleImport": false,
    "privateGoogleContacts": false
  },
  "quickActionBridge": {
    "allowedOrigins": []
  }
}
```

Fields:

- `appName`: display name used in the document title, app shell, social metadata, and web manifest.
- `publicUrl`: production URL used for metadata. Leave blank until you have a real deployed URL.
- `feedbackEmail`: recipient for the feedback and Help/questions mailto links. Leave blank to hide both actions.
- `authProvider`: `openai-sites` or `cloudflare-access`.
- `features`: client-visible feature flags.
- `quickActionBridge.allowedOrigins`: allowed browser origins for the optional quick-action bridge.

## Server Environment

Set these in your host, not in source:

```text
SHARED_LISTS_AUTH_PROVIDER=openai-sites
DEV_DEFAULT_USER_EMAIL=
FIRST_OWNER_EMAILS=
ENABLE_FIRST_OWNER_SETUP=true
ALLOW_ANY_FIRST_OWNER=false
ENABLE_ACCESS_AUDIT=false
ACCESS_AUDIT_ADMINS=
ENABLE_PEOPLE_IMPORT=false
QUICK_ACTION_INTEGRATION_ENABLED=false
QUICK_ACTION_INTEGRATION_ORIGINS=
GOOGLE_CONTACTS_ENABLED=false
GOOGLE_CONTACTS_CLIENT_ID=
GOOGLE_CONTACTS_CLIENT_SECRET=
GOOGLE_CONTACTS_TOKEN_SECRET=
GOOGLE_CONTACTS_MAX_CONTACTS=2000
CLOUDFLARE_ACCESS_TEAM_DOMAIN=
CLOUDFLARE_ACCESS_AUD=
```

Set blank values in the host environment before production deploy. `DEV_DEFAULT_USER_EMAIL` is for local development only. `FIRST_OWNER_EMAILS` and `ACCESS_AUDIT_ADMINS` should contain real email addresses for the people allowed to use those actions. Cloudflare values should come from the Cloudflare Access application you create for this app.

`SHARED_LISTS_AUTH_PROVIDER` is required outside local development. Missing or unknown values fail closed.

`FIRST_OWNER_EMAILS` is required before a production first-owner setup. `ALLOW_ANY_FIRST_OWNER=true` is an explicit opt-in for local demos or disposable test deployments where any signed-in user may claim the first list while the database is empty.

For local development, copy `.env.example` to `.env`; `npm run dev` loads `.env` automatically. Production hosts should use their native secret or environment-variable store.

## Auth Provider Values

Use `openai-sites` for OpenAI Sites.

Use `cloudflare-access` for Cloudflare Workers protected by Cloudflare Access.

The configured provider is exclusive in production. OpenAI Sites headers are not accepted in Cloudflare mode, and Cloudflare Access JWTs are not accepted in OpenAI Sites mode.

## Optional Features

- `ENABLE_ACCESS_AUDIT`: exposes the admin access-audit endpoint when set to `true`.
- `ENABLE_PEOPLE_IMPORT`: exposes the admin people-import page and API when set to `true`.
- `QUICK_ACTION_INTEGRATION_ENABLED`: exposes the generic quick-action integration when set to `true`. `QUICK_ACTION_INTEGRATION_ORIGINS` must also contain an explicit comma-separated browser origin allowlist. An empty allowlist fails closed.
- `GOOGLE_CONTACTS_ENABLED`: exposes optional per-user Google Contacts autocomplete when set to `true` and when `features.privateGoogleContacts` is also `true`. Keep this disabled until the readiness gates in `PRIVATE_CONTACTS.md` are complete.

Keep optional features off until you know you need them.

See [`PRIVATE_CONTACTS.md`](PRIVATE_CONTACTS.md) for the Google Contacts privacy and setup model.

## Public Repo Rule

Do not commit real host IDs, database IDs, private emails, or secrets. Keep deploy-specific values in the host environment or an untracked local file.
