# Deploy With OpenAI Sites

Use this lane when you want the shortest path from Codex to a hosted app.

## Prerequisites

- Codex with OpenAI Sites available.
- A clean clone of this repo.
- `npm ci` completed.

## Steps

1. Set `shared-lists.config.json`:

   ```json
   {
     "authProvider": "openai-sites",
     "publicUrl": ""
   }
   ```

   Leave `publicUrl` blank until you know the real Sites production URL. Set it after the first deploy if you want full absolute social-preview metadata.

2. Set first-owner server values in Sites:

   ```text
   FIRST_OWNER_EMAILS=
   ENABLE_FIRST_OWNER_SETUP=true
   ALLOW_ANY_FIRST_OWNER=false
   SHARED_LISTS_AUTH_PROVIDER=openai-sites
   ```

   `FIRST_OWNER_EMAILS` must be the real email address, or comma-separated real email addresses, allowed to create the first list.

3. Run local checks:

   ```bash
   npm run check
   ```

4. Create or reuse an OpenAI Sites project.

5. Keep `.openai/hosting.json` public-safe. A reusable starter should not contain someone else's `project_id`.

6. Save a Sites version from the exact pushed commit.

7. Deploy the saved version.

8. Verify signed-out behavior:

   ```bash
   curl -i "$APP_URL/api/session"
   ```

   A signed-out request should return `401`.

9. Verify that caller-supplied identity headers do not grant access. A signed-out request with an `oai-authenticated-user-email` header should still be rejected or ignored by Sites, not treated as a signed-in user.

   ```bash
   curl -i "$APP_URL/api/session" \
     -H "oai-authenticated-user-email: spoofed@example.test"
   ```

10. Sign in through the browser as an email listed in `FIRST_OWNER_EMAILS`.

11. Create the first list in the app UI.

    Agents or authenticated API clients can also claim first owner with the setup endpoint. Set `APP_URL` to the deployed app URL and `FIRST_LIST_TITLE` to the real list name before running this command from an authenticated host session:

    ```bash
    curl -X POST "$APP_URL/api/setup/first-owner" \
      -H "content-type: application/json" \
      -d "{\"title\":\"$FIRST_LIST_TITLE\"}"
    ```

    Do not spoof production identity headers. Use the real provider-authenticated browser/session path.

## Access Model

For a family or small group app, the normal Sites setup is:

- Public app shell.
- Authenticated API.
- List-level permissions in the app.

That means a person can open the app URL, but they cannot see a list unless they are a member of that list.

## Reproducible Sites Procedure

Before staging:

- Confirm `.openai/hosting.json` points to the intended Sites project, or has no `project_id` when creating a new reusable starter site.
- Confirm the Sites database binding matches the app's D1-style storage binding expected by the project.
- Confirm all migrations in `drizzle/` are included in the saved version.
- Confirm `SHARED_LISTS_AUTH_PROVIDER=openai-sites`.
- Confirm `FIRST_OWNER_EMAILS` is nonempty for production staging, unless this is a disposable test with `ALLOW_ANY_FIRST_OWNER=true`.
- Keep optional features disabled unless intentionally testing them.

Staging checklist:

- Signed-out `/api/session` returns `401`.
- Signed-out `/api/session` with a caller-supplied identity header does not return that supplied identity.
- Signed-in `/api/session` returns the provider identity.
- A signed-in user outside `FIRST_OWNER_EMAILS` cannot create the first list.
- A signed-in user inside `FIRST_OWNER_EMAILS` can create the first list.
- A member can see only lists where they are a member.
- A non-member with a list URL sees no list data and can request access if that flow is enabled.
- Member add/remove and `can_share` changes preserve the share-panel state without a full-page reset.
- Sign-out clears private browser cache and returns to a sign-in-required state with a visible sign-in action.

Rollback:

- Keep the previous saved Sites version available until staging passes.
- If verification fails, redeploy the previous known-good saved version.
- Do not run destructive database migrations as part of rollback. Use additive migrations and follow the database backup policy for data recovery.
