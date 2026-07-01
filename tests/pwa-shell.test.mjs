import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { promisify } from "node:util";
import vm from "node:vm";

const execFileAsync = promisify(execFile);

test("PWA shell build caches only safe static assets", async () => {
  await execFileAsync("node", ["scripts/build.mjs"]);

  const manifest = JSON.parse(await readFile("dist/client/manifest.webmanifest", "utf8"));
  assert.equal(manifest.name, "Shared Lists");
  assert.equal(manifest.display, "standalone");
  assert.deepEqual(manifest.icons.map((icon) => icon.sizes).sort(), ["180x180", "192x192", "512x512"]);
  assert.equal(manifest.icons.find((icon) => icon.sizes === "180x180").src.startsWith("data:image/png;base64,"), true);
  assert.equal((await stat("dist/client/apple-touch-icon.png")).size > 0, true);
  assert.equal((await stat("dist/client/social-preview.png")).size > 0, true);

  const index = await readFile("dist/client/index.html", "utf8");
  assert.match(index, /rel="apple-touch-icon"/);
  assert.match(index, /href="\/apple-touch-icon\.png"/);
  assert.match(index, /id="shared-lists-config" type="application\/json"/);
  assert.doesNotMatch(index, /__SHARED_LISTS_CONFIG__/);
  assert.match(index, /<div class="brand-mark" aria-hidden="true">\s*<img src="\/apple-touch-icon\.png" alt="" \/>/);
  assert.doesNotMatch(index, /brand-mark[\s\S]{0,220}<path d="M8 6h9M8 12h9M8 18h9"/);
  assert.match(index, /id="invite-status" aria-live="polite"/);
  assert.match(index, /id="invite-submit-button"/);
  assert.match(index, /id="settings-dialog"/);
  assert.match(index, /name="theme-preference" value="system"/);
  assert.match(index, /Match system/);
  assert.match(index, /name="theme-preference" value="light"/);
  assert.match(index, /name="theme-preference" value="dark"/);
  assert.match(index, /id="show-overview-demo-button"/);
  assert.match(index, /Overview/);
  assert.match(index, /Replay the quick tour/);
  assert.match(index, /id="show-home-screen-guide-button"/);
  assert.match(index, /Install as app/);
  assert.match(index, /id="install-app-settings-description"/);
  assert.match(index, /id="settings-license-link" href="\/license\.html"/);
  assert.match(index, /Reusable starter: Apache-2\.0/);
  assert.match(index, /id="settings-auth-action"/);
  assert.match(index, /data-auth-action="signin"/);
  assert.match(index, /id="settings-auth-title">Sign in/);
  assert.match(index, /id="overview-demo"/);
  assert.match(index, /Shared Lists overview/);
  assert.match(index, /Create a list/);
  assert.match(index, /id="overview-action-callout"/);
  assert.match(index, /demo-share/);
  assert.match(index, /demo-done/);
  assert.match(index, /demo-theme/);
  assert.match(index, /id="home-screen-guide"/);
  assert.match(index, /Install Shared Lists as an app/);
  assert.match(index, /Install Shared Lists as a WebApp/);
  assert.match(index, /Tap the Share button in your browser\./);
  assert.match(index, /View More/);
  assert.match(index, /Add to Home Screen/);
  assert.match(index, /desktop-install-steps/);
  assert.match(index, /Open Shared Lists in Chrome on your computer\./);
  assert.match(index, /Install WebApp/);
  assert.match(index, /Click the Install WebApp icon on the right side of the Chrome address bar\./);
  assert.match(index, /Choose Install to open Shared Lists in its own WebApp window\./);
  assert.match(index, /class="chrome-install-icon"/);
  assert.match(index, /<meta name="description" content="Share and collaborate"/);
  assert.match(index, /property="og:title" content="Shared Lists"/);
  assert.match(index, /property="og:description" content="Share and collaborate"/);
  assert.match(index, /property="og:image" content="[^"]*\/social-preview\.png"/);
  assert.match(index, /property="og:image:width" content="1200"/);
  assert.match(index, /property="og:image:height" content="630"/);
  assert.match(index, /name="twitter:card" content="summary_large_image"/);
  assert.doesNotMatch(index, /data:image\/png;base64,/);
  assert.doesNotMatch(index, /sharedLists:lastUser:v1/);
  const app = await readFile("dist/client/app.js", "utf8");
  const sourceApp = await readFile("src/app.js", "utf8");
  assert.match(sourceApp, /features\.quickActionBridge/);
  assert.match(sourceApp, /if \(!appConfig\.features\.quickActionBridge\) return/);
  assert.match(sourceApp, /\/api\/integrations\/quick-actions/);
  assert.match(app, /class="member-identity"/);
  assert.match(sourceApp, /Added \$\{email\} to \$\{state\.active\.list\.title\}\./);
  assert.match(sourceApp, /\$\{email\} is already on this list\./);

  const styles = await readFile("dist/client/styles.css", "utf8");
  const peopleSuggestionsRule = styles.match(/\.people-suggestions\s*\{([^}]*)\}/)?.[1] || "";
  assert.match(peopleSuggestionsRule, /background:\s*var\(--surface\)/);
  assert.match(peopleSuggestionsRule, /position:\s*fixed/);
  assert.match(peopleSuggestionsRule, /z-index:\s*60/);
  assert.match(app, /function positionPeopleSuggestions\(\)/);
  assert.match(app, /composedPath\(\)\.includes\(els\.peopleSuggestions\)/);
  assert.match(app, /apiFetch\("\/api\/people\/index"\)/);
  assert.match(app, /function searchPeopleIndex\(/);
  assert.match(app, /sharedLists:peopleIndex:v1:/);
  assert.match(app, /sharedLists:theme:v1/);
  assert.match(app, /sharedLists:overviewDemoDismissed:v1/);
  assert.match(app, /function setThemePreference\(/);
  assert.match(app, /function maybeShowOverviewDemo\(/);
  assert.match(app, /function openOverviewDemo\(/);
  assert.match(sourceApp, /title: "Share the list"/);
  assert.match(sourceApp, /cue: "Tap Share"/);
  assert.match(sourceApp, /pos: "right:5px;top:94px"/);
  assert.match(sourceApp, /title: "Finish tasks"/);
  assert.match(sourceApp, /title: "Choose a theme"/);
  assert.match(sourceApp, /if \(!maybeShowOverviewDemo\(\)\) maybeShowHomeScreenGuide\(\);/);
  assert.match(app, /function installGuideModeForDevice\(/);
  assert.match(app, /function installGuideDescription\(/);
  assert.match(app, /Show the desktop WebApp install guide/);
  assert.match(app, /dataset\.guideMode/);
  assert.doesNotMatch(app, /setTimeout\(\(\) => fetchPeopleSuggestions\(query\), 140\)/);
  const sourceStyles = await readFile("src/styles.css", "utf8");
  assert.match(sourceStyles, /:root\[data-theme="dark"\]/);
  assert.match(sourceStyles, /\.brand-mark img/);
  assert.match(sourceStyles, /\.segmented-control/);
  assert.match(sourceStyles, /\.overview-demo/);
  assert.match(sourceStyles, /\.overview-action-callout/);
  assert.match(sourceStyles, /\.overview-demo\[data-overview-step="share"\] \.demo-share/);
  assert.match(sourceStyles, /@keyframes overview-pulse/);
  assert.match(sourceStyles, /\.chrome-address-visual/);
  assert.match(sourceStyles, /\.chrome-install-target/);
  assert.match(sourceStyles, /\.chrome-install-icon/);
  assert.match(sourceStyles, /\.desktop-install-confirm/);
  assert.match(sourceStyles, /--browser-chrome/);
  assert.match(sourceStyles, /--mobile-header-bg/);
  assert.match(sourceStyles, /\.task-header\s*\{[\s\S]*background:\s*var\(--mobile-header-bg\)/);
  assert.doesNotMatch(sourceStyles, /\.task-header\s*\{[\s\S]*background:\s*rgba\(248,\s*250,\s*253,\s*0\.94\)/);
  assert.match(sourceStyles, /@media \(max-width: 760px\)[\s\S]*\.add-input-wrap\s*\{\s*padding:\s*0 4px 0 10px;/);
  assert.match(sourceStyles, /@media \(max-width: 760px\)[\s\S]*\.add-input-wrap input\s*\{\s*min-height:\s*44px;\s*padding:\s*0 0 0 8px;/);
  assert.match(sourceStyles, /\.owner-only-label\s*\{\s*display:\s*none;/);
  assert.match(sourceStyles, /grid-template-columns:\s*32px minmax\(0, 1fr\) max-content;/);
  assert.match(sourceStyles, /\.member-row > \.role-chip/);
  assert.match(sourceStyles, /\.invite-status\.success/);
  assert.match(sourceStyles, /\.invite-status\.error/);
  assert.match(sourceStyles, /\.invite-status\.pending/);
  assert.match(sourceStyles, /\.home-screen-guide/);
  assert.match(sourceStyles, /\.home-screen-guide-scrim\[data-guide-mode="desktop"\] \.desktop-install-title/);
  assert.match(sourceStyles, /\.home-screen-guide-scrim\[data-guide-mode="desktop"\] \.mobile-install-steps/);
  assert.match(sourceStyles, /\.home-screen-guide-scrim\[data-guide-mode="mobile"\] \.desktop-install-steps/);
  assert.match(sourceStyles, /\.guide-bounce-arrow/);
  assert.match(sourceStyles, /@keyframes guide-bounce/);

  const serviceWorker = await readFile("dist/client/service-worker.js", "utf8");
  assert.match(serviceWorker, /CACHE_PREFIX = "shared-lists-static"/);
  assert.match(serviceWorker, /LEGACY_CACHE_PREFIX = "shared-lists-shell"/);
  assert.match(serviceWorker, /CACHE_NAME = `\$\{CACHE_PREFIX\}-\$\{APP_VERSION\}`/);
  assert.doesNotMatch(serviceWorker, /NAVIGATION_SHELL_TIMEOUT_MS/);
  assert.match(serviceWorker, /\/app\.js\?v=/);
  assert.match(serviceWorker, /\/styles\.css\?v=/);
  assert.doesNotMatch(serviceWorker, /"\/shell\.html"/);
  assert.match(serviceWorker, /\/manifest\.webmanifest/);
  assert.match(serviceWorker, /\/apple-touch-icon\.png/);
  assert.match(serviceWorker, /\/offline\.html/);
  const staticAssets = serviceWorker.match(/const STATIC_ASSETS = \[([\s\S]*?)\];/)?.[1] || "";
  assert.doesNotMatch(staticAssets, /"\/"/);
  assert.doesNotMatch(staticAssets, /\/shell\.html/);
  assert.doesNotMatch(staticAssets, /\/index\.html["']/);
  assert.doesNotMatch(staticAssets, /\/api\//);
  assert.match(serviceWorker, /url\.pathname\.startsWith\("\/api\/"\)/);

  const offline = await readFile("dist/client/offline.html", "utf8");
  assert.match(offline, /Reconnect to load your lists\./);
  assert.doesNotMatch(offline, /@openai\.com/);

  const peopleImport = await readFile("dist/client/people-import.html", "utf8");
  assert.match(peopleImport, /Owner-only profile enrichment/);
  assert.match(peopleImport, /\/api\/admin\/people\/import/);
  assert.doesNotMatch(peopleImport, /admin@openai\.com/);

  const license = await readFile("dist/client/license.html", "utf8");
  assert.match(license, /Shared Lists License/);
  assert.match(license, /href="\/" aria-label="Back to Shared Lists"/);
  assert.match(license, /license-topbar/);
  assert.doesNotMatch(license, />Back to Shared Lists</);
  assert.match(license, /Apache License 2\.0/);
  assert.match(license, /Current starter version: <strong>v0\.1\.0<\/strong>/);
  assert.match(license, /The public starter lives at/);
  assert.match(license, /https:\/\/github\.com\/CBruney\/shared-lists-starter/);
  assert.doesNotMatch(license, /public starter is not published yet/);
  assert.match(license, /Clone the public starter repo to build your own version/);
  assert.doesNotMatch(license, /npm run export:public/);
  assert.match(license, /https:\/\/www\.apache\.org\/licenses\/LICENSE-2\.0/);

  const shell = await readFile("dist/client/shell.html", "utf8");
  assert.match(index, /data-generic-shell="true"/);
  assert.doesNotMatch(index, /<option value=/);
  assert.match(shell, /data-generic-shell="true"/);
  assert.doesNotMatch(shell, /<option value=/);

  assert.equal((await stat("dist/client/app.js")).size < 145_000, true);
  assert.equal((await stat("dist/client/styles.css")).size < 54_000, true);
  assert.equal((await stat("dist/client/index.html")).size < 27_000, true);

  const cachedShellText = [
    app,
    styles,
    shell,
    await readFile("dist/client/manifest.webmanifest", "utf8"),
    offline,
  ].join("\n");
  for (const privateText of ["admin@local.test", "editor@local.test", "external-owner@local.test", "Editor checklist", "Planning review", "Seeded task text"]) {
    assert.equal(cachedShellText.includes(privateText), false);
  }
});

test("service worker never intercepts page navigation", async () => {
  const source = await readFile("src/service-worker.js", "utf8");
  const listeners = {};
  const context = vm.createContext({
    URL,
    Response,
    Set,
    console,
    fetch: async () => new Response("network"),
    caches: {},
    self: {
      location: { origin: "https://shared-lists.test" },
      addEventListener(type, listener) {
        listeners[type] = listener;
      },
    },
  });
  vm.runInContext(source, context);

  let responseIntercepted = false;
  let lifetimeExtended = false;
  listeners.fetch({
    request: { method: "GET", mode: "navigate", url: "https://shared-lists.test/" },
    respondWith() {
      responseIntercepted = true;
    },
    waitUntil() {
      lifetimeExtended = true;
    },
  });

  assert.equal(responseIntercepted, false);
  assert.equal(lifetimeExtended, false);
});
