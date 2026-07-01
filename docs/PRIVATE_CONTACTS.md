# Optional Private Contacts

Shared Lists can optionally let each signed-in user connect Google Contacts for faster sharing autocomplete.

This is not required for the app to work. Users can always type a full email address into Share and add that person directly.

## Privacy Boundary

- Contacts are scoped by the signed-in user email.
- One user’s contacts are never shared with other list members.
- Contacts are used only for autocomplete suggestions in that user’s own browser session.
- The app stores a private search index in D1 so typing does not call Google on every keystroke.
- The Google permission is read-only contacts access.

## Latency Model

The low-latency path is:

1. User connects Google Contacts in Settings.
2. The server syncs up to the configured contact limit into `user_contacts`.
3. The browser loads `/api/people/index` once and caches it per signed-in email.
4. The Share input filters that local index while the user types.

Google is used during connect/sync, not during each keystroke.

## Enable It

Turn on the client-visible setting:

```json
{
  "features": {
    "privateGoogleContacts": true
  }
}
```

Set server environment values in the host secret store:

```text
GOOGLE_CONTACTS_ENABLED=true
GOOGLE_CONTACTS_CLIENT_ID=
GOOGLE_CONTACTS_CLIENT_SECRET=
GOOGLE_CONTACTS_TOKEN_SECRET=
GOOGLE_CONTACTS_MAX_CONTACTS=2000
```

`GOOGLE_CONTACTS_TOKEN_SECRET` should be a strong random secret used to encrypt stored refresh tokens. Do not commit it.

## User Flow

When enabled and configured, Settings shows `Google Contacts`.

- `Connect` starts Google OAuth.
- `Sync` refreshes the private autocomplete index.
- `Disconnect` removes the user’s stored contacts and token for this app.

If the feature is disabled or server credentials are missing, the settings row stays hidden.
