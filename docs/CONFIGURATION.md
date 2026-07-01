# Configuration

Use config files and environment variables for setup. Avoid source edits for normal deployment choices.

## Client Config

`shared-lists.config.json` is read at build time and injected into the app shell.

```json
{
  "appName": "Shared Lists",
  "publicUrl": "",
  "feedbackEmail": "",
  "authProvider": "openai-sites",
  "features": {
    "quickActionBridge": false,
    "accessAudit": false,
    "peopleImport": false
  },
  "quickActionBridge": {
    "allowedOrigins": []
  }
}
```

Fields:

- `appName`: display name.
- `publicUrl`: production URL used for metadata. Leave blank until you have a real deployed URL.
- `feedbackEmail`: recipient for the feedback mailto link. Leave blank to hide the Feedback button.
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
ENABLE_ACCESS_AUDIT=false
ACCESS_AUDIT_ADMINS=
ENABLE_PEOPLE_IMPORT=false
QUICK_ACTION_INTEGRATION_ENABLED=false
QUICK_ACTION_INTEGRATION_ORIGINS=
CLOUDFLARE_ACCESS_TEAM_DOMAIN=
CLOUDFLARE_ACCESS_AUD=
```

Set blank values in the host environment before production deploy. `DEV_DEFAULT_USER_EMAIL` is for local development only. `FIRST_OWNER_EMAILS` and `ACCESS_AUDIT_ADMINS` should contain real email addresses for the people allowed to use those actions. Cloudflare values should come from the Cloudflare Access application you create for this app.

## Auth Provider Values

Use `openai-sites` for OpenAI Sites.

Use `cloudflare-access` for Cloudflare Workers protected by Cloudflare Access.

## Optional Features

- `ENABLE_ACCESS_AUDIT`: exposes the admin access-audit endpoint when set to `true`.
- `ENABLE_PEOPLE_IMPORT`: exposes the admin people-import page and API when set to `true`.
- `QUICK_ACTION_INTEGRATION_ENABLED`: exposes the generic quick-action integration when set to `true`.

Keep optional features off until you know you need them.

## Public Repo Rule

Do not commit real host IDs, database IDs, private emails, or secrets. Keep deploy-specific values in the host environment or an untracked local file.
