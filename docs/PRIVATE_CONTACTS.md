# Optional Private Contacts

Shared Lists can optionally let each signed-in user connect Google Contacts for faster sharing autocomplete.

This is not required for the app to work. Users can always type a full email address into Share and add that person directly.

## Current Status

Keep Google Contacts disabled for real deployments.

The OAuth and storage foundations are present, but the sync path is not production-ready. The current large-sync approach can exceed Cloudflare Worker D1 query limits when importing a large contact set, and the failure/recovery coverage is not complete enough for real users yet.

Required gates before enabling:

- Replace one-contact-at-a-time D1 writes with resumable staged writes that stay inside Worker and D1 limits.
- Add tests for OAuth state ownership, replay prevention, expiry, PKCE, token exchange, token refresh, encryption failure, D1 disconnect, quota handling, callback recovery, and disconnect cleanup.
- Add per-user sync cooldowns and retry behavior that does not make autocomplete slow.
- Revoke the Google grant on disconnect where the provider supports it.
- Send no-store and no-referrer headers on OAuth callback responses.
- Validate token-secret strength before accepting encrypted refresh-token storage.
- Document and test token key rotation.
- Pass a real D1 large-sync rehearsal before changing the default from disabled.

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

## Future Enablement

After the gates above are complete, a deployer can turn on the client-visible setting:

```json
{
  "features": {
    "privateGoogleContacts": true
  }
}
```

And set server environment values in the host secret store:

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
