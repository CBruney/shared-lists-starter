# Privacy And Data Lifecycle

Shared Lists Starter is infrastructure. Each deployer is responsible for the privacy notice, user consent, backup policy, and deletion process for their own deployment.

## Data The App Stores

The default app stores:

- Signed-in user email addresses and display names.
- List titles.
- List membership, role, and sharing permission.
- Task titles, due dates, completion state, sort order, and soft-delete metadata.
- Activity records such as list creation, task changes, and member changes.
- Pending access requests.
- Idempotency records for selected write requests.

Optional features can store more:

- People import stores admin-provided profile enrichment fields such as full name, aliases, and Slack handle.
- Private Google Contacts stores a per-user autocomplete index in `user_contacts` and a per-user contact-source record.
- Quick-action intake stores external task references for de-duplication.

## Browser Caches

The PWA caches static app assets only. It does not cache list data in the service worker.

The browser may store:

- Theme preference.
- Sidebar and onboarding dismissal state.
- List summary surface data in `localStorage`, keyed by signed-in email.
- List detail data in `sessionStorage`, keyed by signed-in email and list ID.
- A per-user people autocomplete index in `localStorage`, keyed by signed-in email.
- In-progress UI state while the page is open, including pending requests and optimistic edits.

The people index is keyed by signed-in email and should contain only people who share a list with that user plus that user's private contacts, when enabled.

Suggested browser-cache lifetimes:

- List summary surface: up to seven days.
- List detail/session cache: current browser session, with a short freshness window for faster navigation.
- Shared people autocomplete index: up to 24 hours.
- Private contacts autocomplete entries: up to 24 hours.

On sign-out or access loss, the app clears private browser state before redirecting or repainting the signed-out screen. That includes list surface keys, list detail keys, people-index keys, pending list-delete timers, in-flight list/detail/people requests, Google Contacts status in memory, and optimistic mutation queues.

The app intentionally keeps non-private UI preferences such as theme choice, sidebar state, and onboarding/tutorial dismissal.

## Logs

The Worker logs structured API events. Logs should avoid task text and raw actor email. Operators should configure their host log retention and access policy before production use.

Recommended log policy:

- Keep operational logs only as long as needed for debugging and abuse investigation.
- Restrict log access to maintainers or operators who need it.
- Do not copy logs into public issues unless all private data is removed.

## Retention

The starter does not impose a universal retention period. A deployer should choose and document one.

Suggested defaults for small private deployments:

- Keep active lists and tasks until a list owner deletes them.
- Keep soft-deleted task records only as long as undo or audit needs require.
- Keep idempotency records for the configured replay window.
- Remove private contact data immediately when a user disconnects the provider.

## Deletion

List owners can remove members and delete lists through the app. Deployed operators should also provide a manual deletion path for:

- A user's account profile.
- A user's private contacts.
- Lists owned by that user.
- Backups that contain deleted data.

## Export

The starter does not yet include a user-facing export feature. Operators can export from the underlying database if needed. Remove unrelated users' data before sharing any export.

## Backups

Backups are a deployment responsibility. Before production use, define:

- Backup frequency.
- Where backups are stored.
- Who can restore them.
- How long backups are retained.
- How deleted-user data is removed from backups when required.

## Privacy Notice Checklist

Before inviting real users, publish a privacy notice that explains:

- Who operates the deployment.
- What data is stored.
- Why the data is stored.
- Which optional integrations are enabled.
- How users can request deletion or export.
- How long logs and backups are retained.
- Whether data is shared with any host or integration provider.
