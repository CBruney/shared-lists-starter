import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { D1Store } from "../src/lib/d1-store.mjs";

test("hot path indexes are captured in D1 schema and migrations", async () => {
  const migration = await readFile("drizzle/0004_hot_query_indexes.sql", "utf8");
  const revisionsMigration = await readFile("drizzle/0005_revisions.sql", "utf8");
  const markersMigration = await readFile("drizzle/0006_list_markers.sql", "utf8");
  const appMarkerMigration = await readFile("drizzle/0007_default_app_marker.sql", "utf8");
  const accessRequestsMigration = await readFile("drizzle/0008_access_requests.sql", "utf8");
  const taskSortOrderMigration = await readFile("drizzle/0009_task_sort_order.sql", "utf8");
  const userProfilesMigration = await readFile("drizzle/0011_user_profiles.sql", "utf8");
  const store = await readFile("src/lib/d1-store.mjs", "utf8");

  for (const indexName of [
    "idx_list_members_email_list",
    "idx_tasks_open_list_due_created",
    "idx_tasks_completed_list_completed",
    "idx_activity_list_created_id",
    "idx_list_access_requests_list_status",
    "idx_list_access_requests_requester_status",
    "idx_tasks_open_list_sort_order",
  ]) {
    assert.match(`${migration}\n${accessRequestsMigration}\n${taskSortOrderMigration}`, new RegExp(indexName));
    assert.match(store, new RegExp(indexName));
  }
  assert.match(revisionsMigration, /ALTER TABLE lists ADD COLUMN revision/);
  assert.match(revisionsMigration, /ALTER TABLE tasks ADD COLUMN revision/);
  assert.match(revisionsMigration, /idx_idempotency_keys_created_at/);
  assert.match(store, /ALTER TABLE lists ADD COLUMN revision/);
  assert.match(store, /ALTER TABLE tasks ADD COLUMN revision/);
  assert.match(store, /idx_idempotency_keys_created_at/);
  assert.match(markersMigration, /marker_color/);
  assert.match(markersMigration, /marker_icon/);
  assert.match(appMarkerMigration, /marker_icon = 'app'/);
  assert.match(accessRequestsMigration, /CREATE TABLE IF NOT EXISTS list_access_requests/);
  assert.match(taskSortOrderMigration, /ALTER TABLE tasks ADD COLUMN sort_order/);
  assert.match(taskSortOrderMigration, /ROW_NUMBER\(\) OVER/);
  assert.match(userProfilesMigration, /ALTER TABLE users ADD COLUMN full_name/);
  assert.match(userProfilesMigration, /ALTER TABLE users ADD COLUMN aliases_json/);
  assert.match(store, /profile_synced_at TEXT/);
  assert.doesNotMatch(store, /ON CONFLICT\(email\) DO UPDATE SET\s*display_name = excluded\.display_name,\s*updated_at = CURRENT_TIMESTAMP/);
  assert.match(store, /ALTER TABLE list_members ADD COLUMN marker_color/);
  assert.match(store, /ALTER TABLE list_members ADD COLUMN marker_icon/);
  assert.doesNotMatch(store, /CASE WHEN lm\.can_share THEN 0 ELSE 1 END/);
});

test("active tasks expose persisted desktop drag and mobile hold-move reorder", async () => {
  const app = await readFile("src/app.js", "utf8");
  const styles = await readFile("src/styles.css", "utf8");

  assert.match(app, /mobileTaskDragStartDistance = 4/);
  assert.match(app, /function bindTaskReordering/);
  assert.match(app, /activeTaskDragId = row\.dataset\.taskId/);
  assert.match(app, /function finishActiveTaskDrag/);
  assert.match(app, /deferredTaskAdoptions\.set\(oldTaskId/);
  assert.match(app, /if \(activeTaskDragId === oldTaskId\)/);
  assert.match(app, /data-task-drag-handle/);
  assert.match(app, /if \(Math\.abs\(latestY - startY\) < mobileTaskDragStartDistance\) return;\s*beginDragging\(\);/);
  assert.match(app, /function applyTaskDragShifts/);
  assert.match(app, /if \(els\.taskList\.classList\.contains\("task-reordering"\)\) return;/);
  assert.match(app, /function persistOpenTaskOrder/);
  assert.match(app, /\/tasks\/reorder/);
  assert.match(styles, /\.task-drag-handle/);
  assert.match(styles, /\.task-row\.task-dragging/);
  assert.match(styles, /\.task-row\.task-shifting/);
  assert.match(styles, /\.task-list\.task-reordering \.task-title-button \{\s*pointer-events: none;/);
  assert.match(styles, /\.task-row\.task-drop-before::before/);
  assert.match(styles, /\.task-date-actions \{\s*display: none;/);
  assert.match(styles, /\.task-row\.task-editing \.task-date-actions \{[\s\S]*display: flex;/);
  assert.match(styles, /@media \(min-width: 761px\)[\s\S]*\.task-row:not\(\.task-editing\) \{\s*grid-template-columns: 24px minmax\(0, 1fr\) 28px;/);
  assert.match(styles, /\.task-row:not\(\.task-editing\) \.task-drag-handle \{\s*grid-column: 3;/);
  assert.match(styles, /\.task-row \.task-drag-handle \{\s*padding-right: 11px;\s*width: 39px;/);
});

test("task text accepts multi-document notes while enforcing a bounded limit", async () => {
  const app = await readFile("src/app.js", "utf8");
  const core = await readFile("src/lib/shared-lists-core.mjs", "utf8");
  const html = await readFile("src/index.html", "utf8");

  assert.match(app, /const maxTaskTitleLength = 4000/);
  assert.match(app, /title\.length > maxTaskTitleLength/);
  assert.match(core, /export const MAX_TASK_TITLE_LENGTH = 4000/);
  assert.match(core, /title\.length > MAX_TASK_TITLE_LENGTH/);
  assert.match(html, /Tasks can contain up to 4,000 characters, including multiple links\./);
});

test("list detail fetches can abort stale in-flight requests", async () => {
  const app = await readFile("src/app.js", "utf8");

  assert.match(app, /new AbortController\(\)/);
  assert.match(app, /request\.controller\?\.abort\(\)/);
  assert.match(app, /signal: controller\?\.signal \|\| upstreamSignal/);
  assert.match(app, /function isAbortError/);
  assert.match(app, /defaultReadRequestTimeoutMs = 3500/);
  assert.match(app, /defaultMutationRequestTimeoutMs = 8000/);
  assert.match(app, /timeoutError\.timedOut = true/);
  assert.match(app, /apiFetchWithRetry\(\s*`\/api\/lists\/\$\{encodeURIComponent\(listId\)\}\/task-surface`/);
  assert.match(app, /apiFetchWithRetry\(bootstrapPath\(\), \{\}, \{ retries: 1 \}\)/);
});

test("public access path requires ChatGPT sign-in before list data", async () => {
  const app = await readFile("src/app.js", "utf8");
  const styles = await readFile("src/styles.css", "utf8");

  assert.match(app, /const signInPath = "\/signin-with-chatgpt"/);
  assert.match(app, /const signOutPath = "\/signout-with-chatgpt"/);
  assert.match(app, /state\.authRequired/);
  assert.match(app, /function enterSignedOutState/);
  assert.match(app, /function signInUrl/);
  assert.match(app, /function signOutUrl/);
  assert.match(app, /function currentAuthReturnTo/);
  assert.match(app, /markAuthAttempt/);
  assert.match(app, /function currentSharedListsLink/);
  assert.match(app, /function copyCurrentSharedListsLink/);
  assert.match(app, /function renderSettingsAuthAction/);
  assert.match(app, /return_to/);
  assert.match(app, /response\.status === 401/);
  assert.match(app, /Sign in with ChatGPT/);
  assert.match(app, /Your lists stay private/);
  assert.match(app, /Session ended/);
  assert.match(app, /data-copy-auth-return-link/);
  assert.match(app, /Shared Lists link copied/);
  assert.match(app, /Use the address bar to copy this link/);
  assert.match(app, /sign-in-list-state/);
  assert.match(app, /Sign in with ChatGPT to view lists shared with this account/);
  assert.match(app, /Sign out of Shared Lists/);
  assert.match(styles, /\.sign-in-state/);
  assert.match(styles, /\.sign-in-list-state/);
  assert.match(styles, /\.auth-recovery-copy/);
  assert.match(styles, /\.auth-copy-link-button/);
  assert.match(styles, /\.primary-link-button/);
});

test("returning desktop and mobile sessions render cached tasks immediately", async () => {
  const app = await readFile("src/app.js", "utf8");

  assert.match(app, /const listDetailPersistentCacheMaxAgeMs = listSurfaceCacheMaxAgeMs/);
  assert.match(app, /function fastInitialActiveDetail\(listId\) \{[\s\S]*return getCachedListDetail\(listId\) \|\| placeholderListDetail/);
  assert.doesNotMatch(app, /function fastInitialActiveDetail\(listId\) \{[\s\S]{0,120}if \(isMobileLayout\(\)\) return null/);
  assert.match(app, /const mobileListTransitionGuardMs = 180/);
  assert.match(app, /const listPrefetchConcurrency = 2/);
  assert.match(app, /const batch = listIds\.slice\(index, index \+ listPrefetchConcurrency\)/);
});

test("people autocomplete preloads an identity-scoped index and filters without a keystroke debounce", async () => {
  const app = await readFile("src/app.js", "utf8");
  const router = await readFile("src/lib/api-router.mjs", "utf8");
  const store = await readFile("src/lib/d1-store.mjs", "utf8");

  assert.match(app, /const peopleIndexCacheMaxAgeMs = 24 \* 60 \* 60 \* 1000/);
  assert.match(app, /preparePeopleIndexForUser\(state\.session\?\.email\)/);
  assert.match(app, /apiFetch\("\/api\/people\/index"\)/);
  assert.match(app, /if \(state\.peopleIndex\.loaded\) \{\s*applyPeopleIndexSuggestions\(query\);\s*return;/);
  assert.doesNotMatch(app, /peopleSearchTimer/);
  assert.doesNotMatch(app, /fetchPeopleSuggestions\(query\), 140/);
  assert.match(router, /path === "\/api\/people\/index"/);
  assert.match(store, /async getPeopleIndex\(\)/);
});

test("production reads skip runtime schema migration work", async () => {
  const store = await readFile("src/lib/d1-store.mjs", "utf8");
  const worker = await readFile("src/worker.js", "utf8");
  const router = await readFile("src/lib/api-router.mjs", "utf8");

  assert.match(store, /constructor\(db, \{ runtimeSchemaBootstrap = false \} = \{\}\)/);
  assert.match(store, /if \(!this\.runtimeSchemaBootstrap\) return;/);
  assert.match(worker, /runtimeSchemaBootstrap: env\.RUNTIME_SCHEMA_BOOTSTRAP === "true"/);
  assert.match(worker, /defer: backgroundDefer\(context\)/);
  assert.match(router, /const groupsPromise = measure\("lists", \(\) => store\.getLists\(userEmail\)\)/);
  assert.match(router, /const requestedActivePromise =/);
  assert.match(router, /persistUserAfterResponse\(store, userEmail, defer\)/);
});

test("desktop and mobile launch from a generic edge shell without service-worker navigation", async () => {
  const app = await readFile("src/app.js", "utf8");
  const serviceWorker = await readFile("src/service-worker.js", "utf8");
  const worker = await readFile("src/worker.js", "utf8");
  const index = await readFile("src/index.html", "utf8");

  assert.match(app, /function bootstrapPath/);
  assert.match(app, /include_active/);
  assert.match(app, /listDetailPersistentCacheMaxAgeMs/);
  assert.match(app, /if \(isAuthRequiredError\(error\) \|\| !state\.authConfirmed\) \{/);
  assert.match(app, /enterSignedOutState\(\);/);
  assert.match(app, /function confirmSessionAndHydrateFastSurface/);
  assert.match(app, /Promise\.all\(\[bootstrapApp\(\), sessionConfirmation\]\)/);
  assert.doesNotMatch(app, /function removeCachedNavigationShells/);
  assert.doesNotMatch(app, /preAuthListSurfaceEmail/);
  assert.match(app, /registration\.update/);
  assert.doesNotMatch(app, /shouldRegisterMobileServiceWorker/);
  assert.doesNotMatch(serviceWorker, /NAVIGATION_SHELL_TIMEOUT_MS/);
  assert.match(serviceWorker, /if \(request\.mode === "navigate"\) return;/);
  assert.doesNotMatch(serviceWorker, /navigationResponse/);
  assert.doesNotMatch(serviceWorker, /"\/shell\.html"/);
  assert.match(serviceWorker, /LEGACY_CACHE_PREFIX = "shared-lists-shell"/);
  assert.doesNotMatch(index, /SHARED_LISTS_AUTH_EMAIL/);
  assert.doesNotMatch(index, /sharedLists:lastUser:v1/);
  assert.match(worker, /url\.pathname === "\/shell\.html"/);
  assert.match(worker, /public, max-age=60, stale-while-revalidate=86400/);
  assert.doesNotMatch(worker, /injectAuthenticatedUser/);
});

test("task-surface launch reads use one authorization-safe D1 batch", async () => {
  const seenStatements = [];
  let batchCalls = 0;
  const db = {
    prepare(sql) {
      return {
        bind(...params) {
          return { sql, params };
        },
      };
    },
    async batch(statements) {
      batchCalls += 1;
      seenStatements.push(...statements);
      return [
        {
          results: [{
            id: "list_fast",
            title: "Fast list",
            owner_email: "admin@local.test",
            owner_name: "Admin",
            member_count: 1,
            open_task_count: 1,
            completed_task_count: 0,
            pending_access_request_count: 0,
            authorized: 1,
            current_user_can_share: 1,
            marker_color: "blue",
            marker_icon: "app",
          }],
        },
        {
          results: [{
            id: "task_fast",
            list_id: "list_fast",
            title: "Already visible",
            status: "open",
            created_by_email: "admin@local.test",
            sort_order: 1024,
          }],
        },
        {
          results: [{
            email: "admin@local.test",
            role: "owner",
            can_share: 1,
            display_name: "Admin",
          }],
        },
      ];
    },
  };

  const surface = await new D1Store(db).getListTaskSurface("admin@local.test", "list_fast");
  assert.equal(batchCalls, 1);
  assert.equal(seenStatements.length, 3);
  assert.equal(surface.open_tasks[0].title, "Already visible");
  assert.equal(surface.members[0].email, "admin@local.test");
  assert.match(seenStatements[1].sql, /INNER JOIN list_members viewer/);
  assert.match(seenStatements[2].sql, /INNER JOIN list_members viewer/);
  assert.deepEqual(seenStatements[1].params, ["admin@local.test", "list_fast"]);
});

test("client keeps resume refresh and retry paths guarded", async () => {
  const app = await readFile("src/app.js", "utf8");

  assert.match(app, /function scheduleResumeRefresh/);
  assert.match(app, /function hasPendingMutations/);
  assert.match(app, /visibilitychange/);
  assert.match(app, /window\.addEventListener\("online"/);
  assert.match(app, /apiFetchWithRetry\(`\/api\/lists\/\$\{encodeURIComponent\(serverListId\)\}\/tasks`/);
  assert.match(app, /apiFetchWithRetry\(`\/api\/tasks\/\$\{encodeURIComponent\(taskId\)\}`/);
  assert.match(app, /function isTransientStatus/);
  assert.match(app, /mutation\.expectedRevision/);
  assert.match(app, /"if-match-revision"/);
});

test("completed archive cache is reused only when it matches the summary count", async () => {
  const app = await readFile("src/app.js", "utf8");

  assert.match(app, /function shouldReuseCachedCompletedTasks/);
  assert.match(app, /cached\?\.completed_tasks_loaded/);
  assert.match(app, /Array\.isArray\(cached\.completed_tasks\)/);
  assert.match(app, /cached\.list\?\.completed_task_count/);
  assert.match(app, /detail\.list\?\.completed_task_count/);
  assert.match(app, /cached\.completed_tasks\.length === cachedCount && cached\.completed_tasks\.length === detailCount/);
  assert.match(app, /shouldReuseCachedCompletedTasks\(cached, detail\)/);
});

test("marker picker includes an explicit default reset", async () => {
  const app = await readFile("src/app.js", "utf8");

  assert.match(app, /data-marker-default/);
  assert.match(app, /defaultListMarkerColor/);
  assert.match(app, /defaultListMarkerIcon/);
  assert.match(app, /marker-default-choice/);
});

test("list links are copyable and unauthorized links can request access", async () => {
  const app = await readFile("src/app.js", "utf8");
  const html = await readFile("src/index.html", "utf8");
  const styles = await readFile("src/styles.css", "utf8");

  assert.match(app, /const listLinkParam = "list"/);
  assert.match(app, /function activeListLink/);
  assert.match(app, /function copyActiveListLink/);
  assert.match(app, /els\.copyListLinkButton\.hidden = listActionDisabled \|\| Boolean\(deniedListRequest\)/);
  assert.match(app, /function clearListLinkFromUrl/);
  assert.match(app, /function requestDeniedListAccess/);
  assert.match(app, /function returnToListPickerFromAccessDenied/);
  assert.match(app, /\/access-requests/);
  assert.match(html, /header-actions[\s\S]*copy-list-link-button[\s\S]*share-button/);
  assert.match(html, /<span class="copy-list-link-text">Link<\/span>/);
  assert.doesNotMatch(html, /Copy Link/);
  assert.doesNotMatch(html, /sharing-section[\s\S]*copy-list-link-button/);
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*header-copy-link-button \.copy-list-link-text[\s\S]*display: none/);
  assert.match(html, /access-denied-panel/);
  assert.match(html, /share-request-badge/);
  assert.match(html, /access-request-section/);
});

test("sharing panel stays focused while settings replays the home screen guide", async () => {
  const app = await readFile("src/app.js", "utf8");
  const html = await readFile("src/index.html", "utf8");
  const styles = await readFile("src/styles.css", "utf8");

  assert.doesNotMatch(html, /app-access-note|copy-app-access-emails-button|Due Soon|Activity/);
  assert.doesNotMatch(app, /function copyAppAccessEmails|function activityLabel|function formatRelative/);
  assert.doesNotMatch(styles, /\.app-access-note|\.due-soon-list|\.activity-list|secondary-detail-section/);
  assert.match(app, /Person added/);
  assert.match(app, /Added \$\{email\} to \$\{state\.active\.list\.title\}\./);
  assert.match(app, /Could not add \$\{email\}/);
  assert.match(app, /function renderSharing/);
  assert.match(app, /function commitSharing/);
  assert.match(app, /function renderMemberList/);
  assert.match(app, /data-member-email/);
  assert.match(app, /restoreUiState\(snapshot, \{ repaint: false \}\)/);
  assert.match(app, /commitSharing\(active, listId\)/);
  assert.match(app, /renderSharing\(\)/);
  const sharingMutations = ["inviteMember", "updateMemberSharing", "allowAllToShare", "removeMember"]
    .map((name) => {
      const start = app.indexOf(`async function ${name}`);
      const end = app.indexOf("\nasync function", start + 1);
      return app.slice(start, end === -1 ? undefined : end);
    })
    .join("\n");
  assert.doesNotMatch(sharingMutations, /syncListAndSummaries/);
  assert.match(styles, /\.invite-status\.success/);
  assert.match(html, /id="settings-button"/);
  assert.match(html, /id="settings-auth-action"/);
  assert.match(html, /data-auth-action="signin"/);
  assert.match(html, /id="settings-auth-title">Sign in/);
  assert.match(html, /M12\.2 2h-\.4/);
  assert.doesNotMatch(html, /M12 2v3M12 19v3/);
  assert.match(html, /id="show-home-screen-guide-button"/);
  assert.match(html, /Install as app/);
  assert.match(html, /id="install-app-settings-description"/);
  assert.match(app, /els\.showHomeScreenGuideButton\.hidden = false/);
  assert.doesNotMatch(app, /showHomeScreenGuideButton\.hidden = isStandaloneDisplay/);
  assert.match(html, /name="theme-preference" value="system"/);
  assert.match(html, /Match system/);
  assert.match(html, /id="show-overview-demo-button"/);
  assert.match(html, /Replay the quick tour/);
  assert.match(html, /id="settings-license-link" href="\/license\.html"/);
  assert.match(html, /Reusable starter: Apache-2\.0/);
  assert.match(html, /id="overview-demo"/);
  assert.match(html, /Shared Lists overview/);
  assert.match(html, /id="overview-action-callout"/);
  assert.match(html, /overview-mini-calendar demo-date/);
  assert.match(html, /overview-mini-action demo-copy"><svg/);
  assert.match(html, /overview-mini-action demo-share"><svg/);
  assert.match(html, /overview-mini-settings demo-theme"><svg/);
  assert.match(html, /Feedback/);
  assert.doesNotMatch(html, /<span class="demo-theme">Settings<\/span>/);
  assert.match(html, /id="home-screen-guide"/);
  assert.match(html, /Install Shared Lists as a WebApp/);
  assert.match(html, /desktop-install-steps/);
  assert.match(html, /Open Shared Lists in Chrome on your computer\./);
  assert.match(html, /Click the Install WebApp icon on the right side of the Chrome address bar\./);
  assert.match(html, /Tap the Share button in your browser\./);
  assert.match(html, /View More/);
  assert.match(html, /Add to Home Screen/);
  assert.match(app, /homeScreenGuideDismissedKey/);
  assert.match(app, /overviewDemoDismissedKey/);
  assert.match(app, /function shouldAutoShowOverviewDemo/);
  assert.match(app, /function renderOverviewDemo/);
  assert.match(app, /overviewActionCallout\.style\.cssText = step\.pos/);
  assert.match(app, /cue: "Tap calendar"/);
  assert.match(app, /cue: "Tap gear"/);
  assert.doesNotMatch(app, /setTimeout\(nextOverviewStep/);
  assert.match(app, /mergeMembersPreservingCurrentOrder/);
  assert.doesNotMatch(app, /a\.can_share && !b\.can_share/);
  assert.match(app, /overviewDemoClose\.addEventListener\("click", completeOverviewDemo\)/);
  assert.match(app, /overviewDemoDone\.addEventListener\("click", completeOverviewDemo\)/);
  assert.match(app, /state\.overviewDemoOpen\) completeOverviewDemo\(\)/);
  assert.match(app, /homeScreenGuideClose\.addEventListener\("click", completeHomeScreenGuide\)/);
  assert.match(app, /homeScreenGuideDone\.addEventListener\("click", completeHomeScreenGuide\)/);
  assert.match(app, /state\.homeScreenGuideOpen\) completeHomeScreenGuide\(\)/);
  assert.match(app, /function shouldOfferHomeScreenGuide/);
  assert.match(app, /function isLikelyIosDevice/);
  assert.match(app, /sharedLists:theme:v1/);
  assert.match(app, /function setThemePreference/);
  assert.match(app, /function installGuideModeForDevice/);
  assert.match(styles, /\.guide-bounce-arrow/);
  assert.match(styles, /\.guide-close-button\s*\{[\s\S]*z-index:\s*2/);
  assert.match(styles, /\.chrome-address-visual/);
  assert.match(styles, /\.chrome-install-icon/);
  assert.match(styles, /\.desktop-install-confirm/);
  assert.match(styles, /\.overview-demo/);
  assert.match(styles, /\.overview-action-callout/);
  assert.match(styles, /background:\s*#ffd400/);
  assert.match(styles, /\.overview-mini-app/);
  assert.match(styles, /\.overview-mini-footer\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\) 34px/);
  assert.match(styles, /:root\[data-theme="dark"\] \.count-pill/);
  assert.match(styles, /@keyframes overview-pulse/);
  assert.match(styles, /:root\[data-theme="dark"\]/);
  assert.match(styles, /\.segmented-control/);
  assert.match(styles, /--mobile-header-bg/);
  assert.match(styles, /\.task-header\s*\{[\s\S]*background:\s*var\(--mobile-header-bg\)/);
  assert.match(styles, /\.settings-auth-row \.settings-row-icon/);
});

test("feedback opens an email with Codex-friendly context", async () => {
  const app = await readFile("src/app.js", "utf8");
  const config = JSON.parse(await readFile("shared-lists.config.json", "utf8"));

  assert.equal(typeof config.feedbackEmail, "string");
  assert.match(app, /email: appConfig\.feedbackEmail/);
  assert.match(app, /function feedbackMailtoUrl/);
  assert.match(app, /mailto:\$\{feedbackTarget\.email\}/);
  assert.match(app, /Tell us what happened, what you expected, or what would make this better/);
  assert.match(app, /"Feedback:",\n\s+"\[Tell us what happened, what you expected, or what would make this better\.\]",\n\s+"",\n\s+"",\n\s+"",\n\s+"Codex context:"/);
  assert.doesNotMatch(app, /"Shared Lists feedback",\n\s+"",\n\s+"Feedback:"/);
  assert.match(app, /Codex context:/);
  assert.match(app, /feedback_version: 1/);
  assert.match(app, /active_list_id:/);
  assert.match(app, /active_list_title:/);
  assert.match(app, /current_user_role:/);
  assert.match(app, /page_url:/);
  assert.doesNotMatch(app, /Requested Codex action/);
  assert.doesNotMatch(app, /personal-feedback\.example\.test|slackUrl|Slack opened|template copied for Slack/);
});

test("active list title can be edited inline by owners", async () => {
  const app = await readFile("src/app.js", "utf8");
  const styles = await readFile("src/styles.css", "utf8");

  assert.match(app, /editingListTitle/);
  assert.match(app, /function renderActiveListTitle/);
  assert.match(app, /data-edit-list-title-trigger/);
  assert.match(app, /data-edit-list-title/);
  assert.match(app, /function renameActiveList/);
  assert.match(app, /method: "PATCH"/);
  assert.match(app, /if \(!listId \|\| !isOwner\(\)\) return;/);
  assert.match(app, /state\.editingListTitle = false;\n\s+state\.editingListOriginalTitle = "";/);
  assert.match(styles, /\.list-title-inline-button/);
  assert.match(styles, /\.list-title-inline-input/);
});

test("task title URLs render as one-click external links", async () => {
  const app = await readFile("src/app.js", "utf8");
  const styles = await readFile("src/styles.css", "utf8");

  assert.match(app, /function linkifyTaskTitle/);
  assert.match(app, /class="task-title-link"/);
  assert.match(app, /target="_blank"/);
  assert.match(app, /rel="noopener noreferrer"/);
  assert.match(app, /title="\$\{escapeAttr\(urlText\)\}"/);
  assert.match(app, /aria-label="Open \$\{escapeAttr\(displayLabel\)\}: \$\{escapeAttr\(urlText\)\}"/);
  assert.match(app, /function normalizeTaskTitleHref/);
  assert.match(app, /function taskLinkDisplayLabel/);
  assert.match(app, /return "Google Doc"/);
  assert.match(app, /\^www\\\./);
  assert.match(app, /function splitTrailingUrlPunctuation/);
  assert.match(app, /target\.closest\("\.task-title-link"\)/);
  assert.match(app, /ignoreTarget: \(target\) => target\.closest\("a, input, textarea, label, \.row-icon-button, \.task-check, \.task-drag-handle"\)/);
  assert.match(styles, /\.task-title-link/);
  assert.match(styles, /\.task-title-link-label/);
});

test("task title editor expands for long item text", async () => {
  const app = await readFile("src/app.js", "utf8");
  const styles = await readFile("src/styles.css", "utf8");

  assert.match(app, /function sizeTaskTitleEditor/);
  assert.match(app, /const borderHeight = input\.offsetHeight - input\.clientHeight;/);
  assert.match(app, /input\.scrollHeight \+ Math\.max\(0, borderHeight\)/);
  assert.match(styles, /\.task-row\.task-editing \{\s*align-items: start;\s*grid-template-columns: 24px minmax\(0, 1fr\) 28px;\s*grid-template-rows: auto auto;/);
  assert.match(styles, /\.task-row\.task-editing \.task-main \{\s*align-self: stretch;\s*grid-column: 2;\s*grid-row: 1;/);
  assert.match(styles, /\.task-row\.task-editing \.task-date-actions \{[\s\S]*display: flex;[\s\S]*grid-row: 2;/);
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*\.task-row\.task-editing \.swipe-content \{\s*align-items: start;\s*grid-template-rows: auto auto;/);
});

test("open task titles stay vertically centered in their rows", async () => {
  const styles = await readFile("src/styles.css", "utf8");

  assert.match(styles, /\.task-main \{[\s\S]*align-self: stretch;[\s\S]*display: flex;[\s\S]*justify-content: center;/);
  assert.match(styles, /\.task-title-button \{[\s\S]*align-items: center;[\s\S]*display: inline-flex;[\s\S]*min-height: 34px;/);
});

test("mobile list opens guard against carry-through task clicks", async () => {
  const app = await readFile("src/app.js", "utf8");
  const styles = await readFile("src/styles.css", "utf8");

  assert.match(app, /mobileListTransitionGuardMs/);
  assert.match(app, /mobileListTransitionGuardPending/);
  assert.match(app, /mobile-list-transition-guard/);
  assert.match(app, /function beginMobileListTransitionGuard/);
  assert.match(app, /function armMobileListTransitionGuard/);
  assert.match(app, /function settleMobileListTransitionGuard/);
  assert.match(app, /function clearMobileListTransitionGuard/);
  assert.match(app, /function blockMobileListTransitionCarryThrough/);
  assert.match(app, /if \(isMobileLayout\(\)\) beginMobileListTransitionGuard\(\);\n\s+openList\(button\.dataset\.listId\)/);
  assert.match(app, /state\.mobileExpandedTaskId = null;[\s\S]*?if \(isMobileLayout\(\)\) \{/);
  assert.match(app, /document\.addEventListener\("click", blockMobileListTransitionCarryThrough, true\)/);
  assert.match(app, /target\?\.closest\("\.task-pane"\)/);
  assert.match(styles, /body\.mobile-list-transition-guard \.task-pane/);
  assert.match(styles, /body\.mobile-list-transition-guard::after/);
  assert.match(styles, /pointer-events: none/);
  assert.match(styles, /pointer-events: auto/);
});

test("mobile owned lists can swipe delete with undo before server delete", async () => {
  const app = await readFile("src/app.js", "utf8");
  const styles = await readFile("src/styles.css", "utf8");

  assert.match(app, /function bindMobileListSwipeDelete/);
  assert.match(app, /data-delete-list/);
  assert.match(app, /pendingListDeletes/);
  assert.match(app, /listDeleteUndoWindowMs/);
  assert.match(app, /function undoPendingListDelete/);
  assert.match(app, /function finalizePendingListDelete/);
  assert.match(app, /current_user_role === "owner"/);
  assert.match(app, /showToast\("List deleted", \{\n\s+actionLabel: "Undo"/);
  assert.match(app, /if \(!dragging && Math\.abs\(deltaX\) > 8[\s\S]*row\.setPointerCapture\?\.\(pointerId\)/);
  assert.match(styles, /\.list-row \.swipe-content/);
  assert.match(styles, /\.list-row\.swiping \.swipe-content/);
  assert.match(styles, /\.list-row\.swipe-ready \.swipe-action/);
});

test("desktop sidebar can collapse without affecting mobile picker", async () => {
  const app = await readFile("src/app.js", "utf8");
  const html = await readFile("src/index.html", "utf8");
  const styles = await readFile("src/styles.css", "utf8");

  assert.match(html, /sidebar-toggle-button/);
  assert.match(html, /sidebar-restore-button/);
  assert.match(html, /sharedLists:sidebarCollapsed:v1/);
  assert.match(app, /sidebarCollapsed: readSidebarCollapsedPreference\(\)/);
  assert.match(app, /function toggleDesktopSidebar/);
  assert.match(app, /writeSidebarCollapsedPreference\(state\.sidebarCollapsed\)/);
  assert.match(app, /document\.body\.classList\.toggle\("sidebar-collapsed"/);
  assert.match(styles, /@media \(min-width: 761px\)/);
  assert.match(styles, /body\.sidebar-collapsed \.app-shell/);
  assert.match(styles, /body\.sidebar-collapsed \.sidebar/);
  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*\.sidebar-toggle-button,[\s\S]*\.sidebar-restore-button/);
});

test("mobile list picker does not preselect an active list row", async () => {
  const app = await readFile("src/app.js", "utf8");
  const html = await readFile("src/index.html", "utf8");

  assert.match(app, /function shouldShowListSelection/);
  assert.match(app, /return !isMobileLayout\(\) \|\| state\.mobileView !== "lists"/);
  assert.match(app, /const active = showActive && list\.id === state\.activeListId/);
  assert.match(html, /<body data-mobile-view="lists">/);
  assert.doesNotMatch(html, /const active = !mobile/);
});
