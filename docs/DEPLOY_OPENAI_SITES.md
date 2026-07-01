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

9. Sign in through the browser as an email listed in `FIRST_OWNER_EMAILS`.

10. Create the first list in the app UI.

    Agents or authenticated API clients can also claim first owner with the setup endpoint. Set `APP_URL` to the deployed app URL and `FIRST_LIST_TITLE` to the real list name before running this command:

    ```bash
    curl -X POST "$APP_URL/api/setup/first-owner" \
      -H "content-type: application/json" \
      -d "{\"title\":\"$FIRST_LIST_TITLE\"}"
    ```

## Access Model

For a family or small group app, the normal Sites setup is:

- Public app shell.
- Authenticated API.
- List-level permissions in the app.

That means a person can open the app URL, but they cannot see a list unless they are a member of that list.
