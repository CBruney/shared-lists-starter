# Deploy With Cloudflare Workers + D1 + Access

Use this lane when you want to own the Cloudflare account, D1 database, Access policy, and DNS.

## Current Status

This lane is **not yet executable end to end**.

The app now isolates Cloudflare Access identity from OpenAI Sites identity, but the Cloudflare deployment procedure still needs work before a maintainer should follow it for real users.

Not done yet:

- Add working `npm` scripts for Cloudflare deploy, migration, smoke test, and rollback.
- Pin and document the supported Wrangler version.
- Confirm `wrangler.toml.example` matches current Wrangler migration configuration.
- Replace OpenAI Sites sign-in and sign-out paths with provider-correct Cloudflare behavior.
- Run a disposable production-like Worker + D1 rehearsal that covers migrations, authentication, first-owner setup, list permissions, deployment, and rollback.

Use the steps below as a checklist for what the lane should do, not as a guaranteed copy-paste deployment guide.

## Prerequisites

- Cloudflare account.
- Wrangler installed and authenticated.
- A Cloudflare Access application for your app domain.
- A D1 database.

## Intended Steps

1. Copy the example config:

   ```bash
   cp wrangler.toml.example wrangler.toml
   ```

2. Create a D1 database:

   ```bash
   wrangler d1 create shared-lists
   ```

3. Put the returned database ID into `wrangler.toml`.

4. Set `shared-lists.config.json`:

   ```json
   {
     "authProvider": "cloudflare-access",
     "publicUrl": ""
   }
   ```

   Leave `publicUrl` blank until you know the real production URL.

5. Fill in Cloudflare Access values in `wrangler.toml`:

   ```toml
   SHARED_LISTS_AUTH_PROVIDER = "cloudflare-access"
   CLOUDFLARE_ACCESS_TEAM_DOMAIN = ""
   CLOUDFLARE_ACCESS_AUD = ""
   FIRST_OWNER_EMAILS = ""
   ```

   Use the real team domain and audience value from the Cloudflare Access application. Set `FIRST_OWNER_EMAILS` to the real email address, or comma-separated real email addresses, allowed to create the first list.

6. Run checks:

   ```bash
   npm run check
   ```

7. Apply migrations locally if you want a local D1 test:

   ```bash
   wrangler d1 migrations apply shared-lists --local
   ```

8. Apply migrations to production:

   ```bash
   wrangler d1 migrations apply shared-lists --remote
   ```

9. Deploy:

   ```bash
   # Not implemented yet.
   # Add a real script before using this lane for production.
   ```

10. Protect the app URL with Cloudflare Access.

11. Verify signed-out requests are blocked by Access or return `401` from the app.

12. Sign in through Access as an email listed in `FIRST_OWNER_EMAILS`.

13. Create the first list in the app UI.

    Agents or authenticated API clients can also claim first owner with the setup endpoint. Set `APP_URL` to the deployed app URL and `FIRST_LIST_TITLE` to the real list name before running this command:

    ```bash
    curl -X POST "$APP_URL/api/setup/first-owner" \
      -H "content-type: application/json" \
      -d "{\"title\":\"$FIRST_LIST_TITLE\"}"
    ```

## Notes

The Worker verifies the Cloudflare Access JWT before trusting an email address. Set both the team domain and application audience value.

Do not commit `wrangler.toml` if it contains real account, database, domain, or policy values.
