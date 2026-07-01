# Accessibility

Shared Lists Starter aims for WCAG 2.2 AA for the default app shell.

## Current Design Targets

- All primary actions must be reachable by keyboard.
- Icon-only buttons must have accessible names.
- Dialogs must have labels, close controls, and predictable focus behavior.
- Color must not be the only signal for task state, sharing state, or errors.
- Mobile touch targets should be large enough for repeated use.
- The app should respect light mode, dark mode, and system color preference.

## Current Automated Checks

The test suite includes static checks for:

- Labeled buttons and controls in the PWA shell.
- Install-as-app and overview dialog surfaces.
- Theme controls.
- Share and member-management controls.
- Service worker behavior that avoids caching private API data.

Run:

```bash
npm run check
```

## Manual Checks Before A Release

Use the app with only a keyboard:

- Create a list.
- Add a task.
- Set a due date.
- Open Share.
- Add a member.
- Change theme.
- Open and close Settings.
- Open and close the install guide.

Use a screen reader or browser accessibility tree to confirm the same flows have meaningful names.

## Not Yet Automated

The starter does not yet include a full browser keyboard test or an axe-style accessibility audit in CI. Add those before treating the Cloudflare lane or any hosted demo as production-ready.
