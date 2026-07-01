# First Owner Setup

First-owner setup gives a fresh deployment a clear starting point without source edits.

The same guard applies to the normal create-list API while the database is empty. If `FIRST_OWNER_EMAILS` is set, only those signed-in emails can create the first list.

## Recommended Setting

Set this before the first production deploy:

```text
FIRST_OWNER_EMAILS=
```

Use the real email address of the person allowed to create the first list. If multiple people may claim setup, use a comma-separated list of real email addresses.

If this value is blank, any signed-in user may claim setup while the database has no lists.

## Check Setup Status

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
  "allowed_owner_required": true
}
```

## Claim First Owner

You can claim setup by creating the first list in the app UI while signed in as an allowed owner.

Agents or API clients can also call the setup endpoint while authenticated as an allowed owner. Set `APP_URL` to the deployed app URL and `FIRST_LIST_TITLE` to the real list name before running this command:

```bash
curl -X POST "$APP_URL/api/setup/first-owner" \
  -H "content-type: application/json" \
  -d "{\"title\":\"$FIRST_LIST_TITLE\"}"
```

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
