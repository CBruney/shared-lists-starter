# Demo

There is no hosted public demo for v0.1.0. The working demo is local and starts with an empty in-memory database.

Screenshots:

- Desktop: `docs/assets/screenshots/desktop.jpg`
- Mobile: `docs/assets/screenshots/mobile.jpg`

```bash
npm ci
npm run dev
```

Open the URL printed by the dev server, usually:

```text
http://localhost:8001
```

The local demo does not connect to production storage. Create a list in the UI to verify the main flow.

## What To Check

The local demo should show:

- A signed-in local development user.
- An empty first-run state.
- A working create-list flow.
- The Share dialog.
- The Settings dialog.
- The install-as-app guide.

Do not publish a hosted demo until it has its own non-production storage and contains no real people, private emails, private deployment IDs, live database IDs, or personal tasks.
