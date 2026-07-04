# First Owner Setup

First-owner setup gives a fresh deployment a clear starting point without source edits.

The same guard applies to the normal create-list API while the database is empty. Production deployments fail closed unless `FIRST_OWNER_EMAILS` names the signed-in emails allowed to create the first list, or `ALLOW_ANY_FIRST_OWNER=true` is explicitly set for a deliberate demo/test setup.

## Recommended Setting

Set this before the first production deploy:

```text
FIRST_OWNER_EMAILS=
ALLOW_ANY_FIRST_OWNER=false
```

Use the real email address of the person allowed to create the first list. If multiple people may claim setup, use a comma-separated list of real email addresses.

If `FIRST_OWNER_EMAILS` is blank and `ALLOW_ANY_FIRST_OWNER` is not `true`, setup status is not ready and first-list creation returns `503`.

Use `ALLOW_ANY_FIRST_OWNER=true` only for a local demo or disposable test deployment where any signed-in user may claim setup while the database has no lists.

## Check Setup Status

Use an authenticated host session. A bare unauthenticated request should return `401`.

```bash
curl "$APP_URL/api/setup/status"
```

Expected fresh-deployment response:

```json
{
  "enabled": true,
  "has_lists": false,
  "ready": true,
  "can_claim": true,
  "allowed_owner_required": true,
  "configured": true
}
```

If the deployment is not configured, `ready` and `can_claim` are `false` and `configured` is `false`.

## Claim First Owner

You can claim setup by creating the first list in the app UI while signed in as an allowed owner.

Agents or API clients can also call the setup endpoint while authenticated as an allowed owner. Set `APP_URL` to the deployed app URL and `FIRST_LIST_TITLE` to the real list name before running this command from an authenticated host session:

```bash
curl -X POST "$APP_URL/api/setup/first-owner" \
  -H "content-type: application/json" \
  -d "{\"title\":\"$FIRST_LIST_TITLE\"}"
```

Do not spoof production identity headers. Use the provider's real sign-in flow or an authenticated API-capable session.

Key fields in the response:

```json
{
  "setup_complete": true,
  "list": {
    "current_user_role": "owner"
  }
}
```

Once the first list exists, the endpoint returns `409`.

## After Setup

Open the app, open the first list, and add members from the Share panel.

If you want another person to add members too, grant that person sharing permission in the same Share panel.
