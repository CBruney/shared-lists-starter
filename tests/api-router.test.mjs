import test from "node:test";
import assert from "node:assert/strict";
import { routeApiRequest } from "../src/lib/api-router.mjs";
import { MemoryStore } from "../src/lib/shared-lists-core.mjs";

async function call(store, path, { method = "GET", body, user = "admin@local.test", headers = {}, routeOptions = {} } = {}) {
  const response = await routeApiRequest(new Request(`http://local.test${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  }), {
    store,
    currentUserEmail: user,
    ...routeOptions,
  });
  const payload = await response.json();
  return { status: response.status, payload };
}

async function rawCall(store, path, { method = "GET", body, user = "admin@local.test", headers = {}, routeOptions = {} } = {}) {
  return routeApiRequest(new Request(`http://local.test${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  }), {
    store,
    currentUserEmail: user,
    ...routeOptions,
  });
}

function encodedEmail(email) {
  return encodeURIComponent(email);
}

test("API requires authenticated OpenAI identity", async () => {
  const store = new MemoryStore();
  const response = await routeApiRequest(new Request("http://local.test/api/lists"), {
    store,
    currentUserEmail: "",
  });
  assert.equal(response.status, 401);
});

test("Quick action integration creates a durable Quick Actions task", async () => {
  const store = new MemoryStore();
  const origin = "https://quick-actions.invalid";
  const quickActionOptions = {
    quickActionIntegrationEnabled: true,
    quickActionIntegrationOrigins: origin,
  };
  const first = await call(store, "/api/integrations/quick-actions", {
    method: "POST",
    headers: { origin },
    routeOptions: quickActionOptions,
    body: {
      source: "quick-actions",
      external_id: "quick-action-1",
      title: "Follow up on the launch note",
      due_date: "2026-06-04",
    },
  });

  assert.equal(first.status, 201);
  assert.equal(first.payload.created, true);
  assert.equal(first.payload.list.title, "Quick Actions");
  assert.equal(first.payload.task.title, "Follow up on the launch note");
  assert.equal(first.payload.task.due_date, "2026-06-04");

  const replay = await call(store, "/api/integrations/quick-actions", {
    method: "POST",
    headers: { origin },
    routeOptions: quickActionOptions,
    body: {
      source: "quick-actions",
      external_id: "quick-action-1",
      title: "Do not create a duplicate",
    },
  });

  assert.equal(replay.status, 200);
  assert.equal(replay.payload.created, false);
  assert.equal(replay.payload.task.id, first.payload.task.id);

  const list = await call(store, `/api/lists/${first.payload.list.id}/task-surface`);
  assert.equal(list.payload.open_tasks.length, 1);
  assert.equal(list.payload.open_tasks[0].title, "Follow up on the launch note");
});

test("Quick action integration only allows configured browser origins", async () => {
  const store = new MemoryStore();
  const allowedOrigin = "https://quick-actions.invalid";
  const quickActionOptions = {
    quickActionIntegrationEnabled: true,
    quickActionIntegrationOrigins: allowedOrigin,
  };
  const preflight = await rawCall(store, "/api/integrations/quick-actions", {
    method: "OPTIONS",
    headers: { origin: allowedOrigin },
    routeOptions: quickActionOptions,
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), allowedOrigin);
  assert.equal(preflight.headers.get("access-control-allow-credentials"), "true");

  const denied = await call(store, "/api/integrations/quick-actions", {
    method: "POST",
    headers: { origin: "https://not-quick-actions.example" },
    routeOptions: quickActionOptions,
    body: {
      source: "quick-actions",
      external_id: "quick-action-denied",
      title: "Should not publish",
    },
  });
  assert.equal(denied.status, 403);
});

test("Quick action integration is disabled unless configured", async () => {
  const store = new MemoryStore();
  const response = await call(store, "/api/integrations/quick-actions", {
    method: "POST",
    headers: { origin: "https://quick-actions.invalid" },
    body: {
      source: "quick-actions",
      external_id: "quick-action-disabled",
      title: "Should not publish",
    },
  });

  assert.equal(response.status, 404);
});

test("first owner setup can claim an empty deployment once", async () => {
  const store = new MemoryStore({ users: ["first-owner@local.test", "other-user@local.test"] });
  const firstOwnerOptions = {
    firstOwnerEmails: new Set(["first-owner@local.test"]),
  };

  const blocked = await call(store, "/api/setup/first-owner", {
    method: "POST",
    user: "other-user@local.test",
    routeOptions: firstOwnerOptions,
    body: { title: "First owner list" },
  });
  assert.equal(blocked.status, 403);

  const status = await call(store, "/api/setup/status", {
    user: "first-owner@local.test",
    routeOptions: firstOwnerOptions,
  });
  assert.equal(status.status, 200);
  assert.equal(status.payload.ready, true);
  assert.equal(status.payload.can_claim, true);
  assert.equal(status.payload.allowed_owner_required, true);

  const claimed = await call(store, "/api/setup/first-owner", {
    method: "POST",
    user: "first-owner@local.test",
    routeOptions: firstOwnerOptions,
    body: { title: "First owner list" },
  });
  assert.equal(claimed.status, 201);
  assert.equal(claimed.payload.setup_complete, true);
  assert.equal(claimed.payload.list.title, "First owner list");
  assert.equal(claimed.payload.list.current_user_role, "owner");

  const second = await call(store, "/api/setup/first-owner", {
    method: "POST",
    user: "first-owner@local.test",
    routeOptions: firstOwnerOptions,
    body: { title: "Second" },
  });
  assert.equal(second.status, 409);
});

test("session returns identity, bootstrap persists users, and people search stays minimal", async () => {
  const store = new MemoryStore({
    users: [
      "admin@local.test",
      "directory-person@local.test",
      "alias-person@local.test",
      "email-match@local.test",
    ],
  });

  const firstVisit = await call(store, "/api/session", { user: "new-person@local.test" });
  assert.equal(firstVisit.status, 200);
  assert.equal(firstVisit.payload.user.email, "new-person@local.test");
  assert.equal(store.users.has("new-person@local.test"), false);

  const bootstrapped = await call(store, "/api/bootstrap", { user: "mobile-first@local.test" });
  assert.equal(bootstrapped.status, 200);
  assert.equal(bootstrapped.payload.user.email, "mobile-first@local.test");
  assert.deepEqual(bootstrapped.payload.groups, { owned: [], shared: [] });
  assert.equal(store.users.has("mobile-first@local.test"), true);

  const noQuery = await call(store, "/api/people?q=", { user: "admin@local.test" });
  assert.equal(noQuery.status, 200);
  assert.deepEqual(noQuery.payload.people, []);

  const byName = await call(store, "/api/people?q=directory", { user: "admin@local.test" });
  assert.equal(byName.status, 200);
  assert.deepEqual(Object.keys(byName.payload.people[0]).sort(), ["display_name", "email"]);
  assert.equal(byName.payload.people[0].email, "directory-person@local.test");

  const byAlias = await call(store, "/api/people?q=alias", { user: "admin@local.test" });
  assert.equal(byAlias.payload.people[0].email, "alias-person@local.test");

  const byEmail = await call(store, "/api/people?q=email-match@local.test", { user: "admin@local.test" });
  assert.equal(byEmail.payload.people[0].email, "email-match@local.test");

  const index = await call(store, "/api/people/index", { user: "admin@local.test" });
  assert.equal(index.status, 200);
  assert.equal(index.payload.people.length, 5);
  assert.deepEqual(Object.keys(index.payload.people[0]).sort(), ["display_name", "email", "search_terms"]);
  assert.equal(index.payload.people.every((person) => person.email.endsWith("@local.test")), true);
  assert.equal(index.payload.people.some((person) => person.search_terms.includes("directory-person")), true);
});

test("owner-only people import enriches existing users and searches full names and Slack aliases", async () => {
  const store = new MemoryStore({ users: ["admin@local.test", "profile-member@local.test"] });
  const peopleImportOptions = { peopleImportEnabled: true, adminEmails: new Set(["admin@local.test"]) };
  const payload = {
    synced_at: "2026-06-25T20:30:00.000Z",
    profiles: [
      {
        email: "profile-member@local.test",
        full_name: "Profile Member",
        display_name: "Profile",
        slack_user_id: "U0000000001",
        slack_handle: "profile.member",
        aliases: ["profile member", "member profile"],
      },
      {
        email: "new-person@local.test",
        full_name: "New Person",
        slack_user_id: "U0123456789",
        slack_handle: "new.person",
      },
    ],
  };

  const disabled = await call(store, "/api/admin/people/import", {
    method: "POST",
    routeOptions: { peopleImportEnabled: false },
    body: payload,
  });
  assert.equal(disabled.status, 404);

  const denied = await call(store, "/api/admin/people/import", {
    method: "POST",
    user: "profile-member@local.test",
    routeOptions: peopleImportOptions,
    body: payload,
  });
  assert.equal(denied.status, 403);

  const imported = await call(store, "/api/admin/people/import", {
    method: "POST",
    routeOptions: peopleImportOptions,
    body: payload,
  });
  assert.equal(imported.status, 200);
  assert.equal(imported.payload.imported_count, 2);
  assert.equal(imported.payload.created_count, 1);
  assert.equal(imported.payload.updated_count, 1);

  const byFullName = await call(store, "/api/people?q=profile%20member");
  assert.equal(byFullName.payload.people[0].email, "profile-member@local.test");
  assert.equal(byFullName.payload.people[0].display_name, "Profile Member");
  const byImportedAlias = await call(store, "/api/people?q=member%20profile");
  assert.equal(byImportedAlias.payload.people[0].email, "profile-member@local.test");
  const byHandle = await call(store, "/api/people?q=profile.mem");
  assert.equal(byHandle.payload.people[0].email, "profile-member@local.test");

  await call(store, "/api/session", { user: "profile-member@local.test" });
  const afterSession = await call(store, "/api/people?q=profile%20member");
  assert.equal(afterSession.payload.people[0].display_name, "Profile Member");

  const directory = await call(store, "/api/admin/people", { routeOptions: peopleImportOptions });
  assert.equal(directory.status, 200);
  assert.equal(directory.payload.profiles.find((profile) => profile.email === "profile-member@local.test").slack_user_id, "U0000000001");
});

test("session identity does not wait on or duplicate D1 persistence", async () => {
  let persistenceStarted = false;
  const store = {
    ensureUser() {
      persistenceStarted = true;
      throw new Error("session should not write");
    },
  };

  const response = await rawCall(store, "/api/session", {
    user: "fast-session@local.test",
  });
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.user.email, "fast-session@local.test");
  assert.match(response.headers.get("server-timing"), /app;dur=/);
  assert.equal(persistenceStarted, false);
});

test("bootstrap can include active list detail for first-paint speed", async () => {
  const store = new MemoryStore();
  const created = await call(store, "/api/lists", {
    method: "POST",
    body: { title: "Desktop launch" },
  });
  await call(store, `/api/lists/${created.payload.list.id}/tasks`, {
    method: "POST",
    body: { title: "Render this with bootstrap" },
  });

  const summaryOnly = await call(store, "/api/bootstrap");
  assert.equal(summaryOnly.status, 200);
  assert.equal("active" in summaryOnly.payload, false);

  const withActive = await call(store, `/api/bootstrap?include_active=true&active_list_id=${created.payload.list.id}`);
  assert.equal(withActive.status, 200);
  assert.equal(withActive.payload.active.list.id, created.payload.list.id);
  assert.equal(withActive.payload.active.open_tasks[0].title, "Render this with bootstrap");
  assert.equal(withActive.payload.active.completed_tasks_loaded, false);
  assert.equal(withActive.payload.active.details_loaded, false);

  const timed = await rawCall(store, `/api/bootstrap?include_active=true&active_list_id=${created.payload.list.id}`);
  assert.match(timed.headers.get("server-timing"), /app;dur=/);
  assert.match(timed.headers.get("server-timing"), /lists;dur=/);
  assert.match(timed.headers.get("server-timing"), /active;dur=/);

  const otherUserList = await call(store, "/api/lists", {
    user: "alias-person@local.test",
    method: "POST",
    body: { title: "Member private list" },
  });
  const unauthorizedDeepLink = await call(
    store,
    `/api/bootstrap?include_active=true&active_list_id=${created.payload.list.id}`,
    { user: "alias-person@local.test" },
  );
  assert.equal(unauthorizedDeepLink.status, 200);
  assert.equal(unauthorizedDeepLink.payload.groups.owned[0].id, otherUserList.payload.list.id);
  assert.equal(unauthorizedDeepLink.payload.active, null);
});

test("bootstrap overlaps returning-user reads and defers user persistence", async () => {
  const listId = "list_fast_bootstrap";
  const summary = {
    id: listId,
    title: "Fast bootstrap",
    owner_email: "admin@local.test",
    owner_name: "Admin User",
    current_user_role: "owner",
    current_user_can_share: true,
    member_count: 1,
    open_task_count: 1,
    completed_task_count: 0,
  };
  const active = {
    list: summary,
    members: [],
    open_tasks: [{ id: "task_fast", list_id: listId, title: "Already visible", status: "open" }],
    completed_tasks: [],
    completed_tasks_loaded: false,
    activity: [],
    access_requests: [],
    details_loaded: false,
  };
  let resolveLists;
  let resolveActive;
  let resolveUser;
  const started = [];
  const deferred = [];
  const store = {
    getLists() {
      started.push("lists");
      return new Promise((resolve) => {
        resolveLists = resolve;
      });
    },
    getListTaskSurface() {
      started.push("active");
      return new Promise((resolve) => {
        resolveActive = resolve;
      });
    },
    ensureUser() {
      started.push("user");
      return new Promise((resolve) => {
        resolveUser = resolve;
      });
    },
  };

  const responsePromise = rawCall(store, `/api/bootstrap?include_active=true&active_list_id=${listId}`, {
    routeOptions: {
      defer(promise) {
        deferred.push(promise);
      },
    },
  });

  await Promise.resolve();
  assert.deepEqual(started.sort(), ["active", "lists"]);
  resolveLists({ owned: [summary], shared: [] });
  resolveActive(active);
  const response = await responsePromise;
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(payload.active.open_tasks[0].title, "Already visible");
  assert.equal(started.includes("user"), true);
  assert.equal(deferred.length, 1);

  resolveUser({ email: "admin@local.test", display_name: "Admin User" });
  await deferred[0];
});

test("list task surface returns tasks before secondary sharing details", async () => {
  const store = new MemoryStore();
  const created = await call(store, "/api/lists", {
    method: "POST",
    body: { title: "Fast list open" },
  });
  const listId = created.payload.list.id;
  await call(store, `/api/lists/${listId}/members`, {
    method: "POST",
    body: { email: "editor@local.test" },
  });
  await call(store, `/api/lists/${listId}/tasks`, {
    method: "POST",
    body: { title: "Render before details" },
  });

  const surface = await call(store, `/api/lists/${listId}/task-surface`);
  assert.equal(surface.status, 200);
  assert.equal(surface.payload.open_tasks[0].title, "Render before details");
  assert.equal(surface.payload.details_loaded, false);
  assert.equal(surface.payload.members.length, 1);

  const details = await call(store, `/api/lists/${listId}/details`);
  assert.equal(details.status, 200);
  assert.equal(details.payload.details_loaded, true);
  assert.equal(details.payload.members.length, 2);
  assert.equal("open_tasks" in details.payload, false);
});

test("owners can rename lists", async () => {
  const store = new MemoryStore();
  const created = await call(store, "/api/lists", {
    method: "POST",
    body: { title: "Original list title" },
  });
  const listId = created.payload.list.id;
  await call(store, `/api/lists/${listId}/members`, {
    method: "POST",
    body: { email: "editor@local.test" },
  });

  const renamed = await call(store, `/api/lists/${listId}`, {
    method: "PATCH",
    body: { title: "Updated list title" },
  });
  assert.equal(renamed.status, 200);
  assert.equal(renamed.payload.list.title, "Updated list title");

  const sharedView = await call(store, `/api/lists/${listId}`, { user: "editor@local.test" });
  assert.equal(sharedView.payload.list.title, "Updated list title");

  const blocked = await call(store, `/api/lists/${listId}`, {
    user: "editor@local.test",
    method: "PATCH",
    body: { title: "Shared member rename" },
  });
  assert.equal(blocked.status, 403);
});

test("open task order persists across fetches and rejects stale or unauthorized reorder attempts", async () => {
  const store = new MemoryStore();
  const created = await call(store, "/api/lists", {
    method: "POST",
    body: { title: "Manual ordering" },
  });
  const listId = created.payload.list.id;
  const first = await call(store, `/api/lists/${listId}/tasks`, {
    method: "POST",
    body: { title: "First created", due_date: null },
  });
  const second = await call(store, `/api/lists/${listId}/tasks`, {
    method: "POST",
    body: { title: "Second created", due_date: "2026-06-01" },
  });
  const third = await call(store, `/api/lists/${listId}/tasks`, {
    method: "POST",
    body: { title: "Third created", due_date: null },
  });
  const reorderedIds = [third.payload.task.id, first.payload.task.id, second.payload.task.id];

  const reordered = await call(store, `/api/lists/${listId}/tasks/reorder`, {
    method: "PATCH",
    body: { task_ids: reorderedIds },
  });
  assert.equal(reordered.status, 200);
  assert.deepEqual(reordered.payload.open_tasks.map((task) => task.id), reorderedIds);

  await call(store, `/api/tasks/${first.payload.task.id}`, {
    method: "PATCH",
    body: { due_date: "2026-05-01" },
  });
  const surface = await call(store, `/api/lists/${listId}/task-surface`);
  assert.deepEqual(surface.payload.open_tasks.map((task) => task.id), reorderedIds);

  await call(store, `/api/tasks/${third.payload.task.id}`, {
    method: "PATCH",
    body: { status: "completed" },
  });
  await call(store, `/api/tasks/${third.payload.task.id}`, {
    method: "PATCH",
    body: { status: "open" },
  });
  const afterReopen = await call(store, `/api/lists/${listId}/task-surface`);
  assert.deepEqual(afterReopen.payload.open_tasks.map((task) => task.id), [
    first.payload.task.id,
    second.payload.task.id,
    third.payload.task.id,
  ]);

  const stale = await call(store, `/api/lists/${listId}/tasks/reorder`, {
    method: "PATCH",
    body: { task_ids: [first.payload.task.id] },
  });
  assert.equal(stale.status, 409);

  const unauthorized = await call(store, `/api/lists/${listId}/tasks/reorder`, {
    method: "PATCH",
    body: { task_ids: afterReopen.payload.open_tasks.map((task) => task.id) },
    user: "not-a-member@local.test",
  });
  assert.equal(unauthorized.status, 403);
});

test("users can personalize list markers without changing other members", async () => {
  const store = new MemoryStore({
    users: ["admin@local.test", "editor@local.test"],
  });
  const created = await call(store, "/api/lists", {
    method: "POST",
    body: { title: "Marker test" },
  });
  const listId = created.payload.list.id;
  await call(store, `/api/lists/${listId}/members`, {
    method: "POST",
    body: { email: "editor@local.test" },
  });

  const ownerMarker = await call(store, `/api/lists/${listId}/preferences`, {
    method: "PATCH",
    body: { marker_color: "green", marker_icon: "briefcase" },
  });
  assert.equal(ownerMarker.status, 200);
  assert.equal(ownerMarker.payload.list.marker_color, "green");
  assert.equal(ownerMarker.payload.list.marker_icon, "briefcase");

  const editorMarker = await call(store, `/api/lists/${listId}/preferences`, {
    method: "PATCH",
    body: { marker_color: "purple", marker_icon: "star" },
    user: "editor@local.test",
  });
  assert.equal(editorMarker.status, 200);

  const ownerLists = await call(store, "/api/lists");
  const editorLists = await call(store, "/api/lists", { user: "editor@local.test" });
  assert.equal(ownerLists.payload.owned[0].marker_color, "green");
  assert.equal(editorLists.payload.shared[0].marker_color, "purple");

  const invalid = await call(store, `/api/lists/${listId}/preferences`, {
    method: "PATCH",
    body: { marker_color: "pink", marker_icon: "star" },
  });
  assert.equal(invalid.status, 400);
});

test("people search requires an authenticated valid identity and caps results", async () => {
  const store = new MemoryStore({
    users: [
      "person0@local.test",
      "person1@local.test",
      "person2@local.test",
      "person3@local.test",
      "person4@local.test",
      "person5@local.test",
      "person6@local.test",
      "person7@local.test",
      "person8@local.test",
      "person9@local.test",
    ],
  });

  const malformed = await call(store, "/api/people?q=person", { user: "friend" });
  assert.equal(malformed.status, 400);

  const malformedIndex = await call(store, "/api/people/index", { user: "friend" });
  assert.equal(malformedIndex.status, 400);

  const results = await call(store, "/api/people?q=person", { user: "person0@local.test" });
  assert.equal(results.status, 200);
  assert.equal(results.payload.people.length, 8);

  const external = await call(store, "/api/people?q=person", { user: "visitor@local.test" });
  assert.equal(external.status, 200);
});

test("structured logs capture outcomes without task text or raw actor email", async () => {
  const store = new MemoryStore();
  const logs = [];
  const routeOptions = { logger: (entry) => logs.push(entry) };
  const created = await call(store, "/api/lists", {
    method: "POST",
    body: { title: "Private launch notes" },
    routeOptions,
  });
  assert.equal(created.status, 201);

  const denied = await call(store, `/api/lists/${created.payload.list.id}`, {
    user: "requester@local.test",
    routeOptions,
  });
  assert.equal(denied.status, 403);

  assert.equal(logs.length, 2);
  assert.equal(logs[0].route, "/api/lists");
  assert.equal(logs[0].status, 201);
  assert.equal(logs[1].route, "/api/lists/:id");
  assert.equal(logs[1].outcome, "denied");
  assert.equal(logs[1].status, 403);
  assert.equal("actor_email" in logs[1], false);
  assert.equal(typeof logs[1].actor_email_hash, "string");
  assert.equal(JSON.stringify(logs).includes("Private launch notes"), false);
});

test("admin access audit is Admin-only and reports membership without task text", async () => {
  const store = new MemoryStore();
  const alexList = await call(store, "/api/lists", {
    method: "POST",
    user: "audit-owner@local.test",
    body: { title: "Audit-only list" },
  });
  await call(store, `/api/lists/${alexList.payload.list.id}/tasks`, {
    method: "POST",
    user: "audit-owner@local.test",
    body: { title: "Private audit task" },
  });
  await call(store, `/api/lists/${alexList.payload.list.id}/members`, {
    method: "POST",
    user: "audit-owner@local.test",
    body: { email: "audit-member@local.test" },
  });

  const disabled = await call(
    store,
    `/api/admin/access-audit?email=${encodedEmail("audit-member@local.test")}&related=${encodedEmail("audit-owner@local.test")}&term=audit`,
  );
  assert.equal(disabled.status, 404);

  const auditOptions = { accessAuditEnabled: true, adminEmails: new Set(["admin@local.test"]) };
  const nonAdmin = await call(
    store,
    `/api/admin/access-audit?email=${encodedEmail("audit-member@local.test")}&related=${encodedEmail("audit-owner@local.test")}&term=audit`,
    { user: "audit-member@local.test", routeOptions: auditOptions },
  );
  assert.equal(nonAdmin.status, 403);

  const audit = await call(
    store,
    `/api/admin/access-audit?email=${encodedEmail("audit-member@local.test")}&related=${encodedEmail("audit-owner@local.test")}&term=audit`,
    { routeOptions: auditOptions },
  );
  assert.equal(audit.status, 200);
  assert.equal(audit.payload.visible_list_count, 1);
  assert.equal(audit.payload.lists[0].related_is_owner, true);
  assert.equal(audit.payload.lists[0].related_is_member, true);
  assert.equal(audit.payload.lists[0].tasks_created_by_related_count, 1);
  assert.equal(audit.payload.lists[0].task_title_match_count, 1);
  assert.equal(JSON.stringify(audit.payload).includes("Private audit task"), false);
});

test("API enforces many-to-many list ACLs and task lifecycle", async () => {
  const store = new MemoryStore();

  const created = await call(store, "/api/lists", {
    method: "POST",
    body: { title: "Editor checklist" },
  });
  assert.equal(created.status, 201);
  const listId = created.payload.list.id;

  const noAccess = await call(store, `/api/lists/${listId}`, { user: "requester@local.test" });
  assert.equal(noAccess.status, 403);

  const task = await call(store, `/api/lists/${listId}/tasks`, {
    method: "POST",
    body: { title: "No-date task", due_date: null },
  });
  assert.equal(task.status, 201);
  assert.equal(task.payload.task.due_date, null);

  const openDeleteTask = await call(store, `/api/lists/${listId}/tasks`, {
    method: "POST",
    body: { title: "Delete from open", due_date: null },
  });
  assert.equal(openDeleteTask.status, 201);

  const deleteOpen = await call(store, `/api/tasks/${openDeleteTask.payload.task.id}`, {
    method: "DELETE",
  });
  assert.equal(deleteOpen.status, 200);
  assert.equal(deleteOpen.payload.deleted_count, 1);

  const shared = await call(store, `/api/lists/${listId}/members`, {
    method: "POST",
    body: { email: "editor@local.test" },
  });
  assert.equal(shared.status, 201);

  const editorLists = await call(store, "/api/lists", { user: "editor@local.test" });
  assert.equal(editorLists.payload.shared.length, 1);
  assert.equal(editorLists.payload.shared[0].title, "Editor checklist");

  const completed = await call(store, `/api/tasks/${task.payload.task.id}`, {
    method: "PATCH",
    user: "editor@local.test",
    body: { status: "completed" },
  });
  assert.equal(completed.status, 200);
  assert.equal(completed.payload.task.status, "completed");

  const renamedCompleted = await call(store, `/api/tasks/${task.payload.task.id}`, {
    method: "PATCH",
    user: "editor@local.test",
    body: { title: "Renamed completed task" },
  });
  assert.equal(renamedCompleted.status, 200);
  assert.equal(renamedCompleted.payload.task.title, "Renamed completed task");

  const renamedCompletedTasks = await call(store, `/api/lists/${listId}/completed-tasks`, { user: "admin@local.test" });
  assert.equal(renamedCompletedTasks.payload.completed_tasks[0].title, "Renamed completed task");

  const deleteCompleted = await call(store, `/api/tasks/${task.payload.task.id}`, {
    method: "DELETE",
    user: "editor@local.test",
  });
  assert.equal(deleteCompleted.status, 200);
  assert.equal(deleteCompleted.payload.deleted_count, 1);

  const afterDelete = await call(store, `/api/lists/${listId}/completed-tasks`, { user: "admin@local.test" });
  assert.equal(afterDelete.payload.completed_tasks.length, 0);

  const restored = await call(store, `/api/lists/${listId}/tasks/restore-deleted`, {
    method: "POST",
    user: "editor@local.test",
    body: { task_ids: [task.payload.task.id] },
  });
  assert.equal(restored.status, 200);
  assert.equal(restored.payload.restored_count, 1);

  const afterRestore = await call(store, `/api/lists/${listId}/completed-tasks`, { user: "admin@local.test" });
  assert.equal(afterRestore.payload.completed_tasks.length, 1);

  const bulkDeleted = await call(store, `/api/lists/${listId}/tasks/delete-completed`, {
    method: "POST",
    user: "editor@local.test",
    body: {},
  });
  assert.equal(bulkDeleted.status, 200);
  assert.equal(bulkDeleted.payload.deleted_count, 1);
});

test("task create and delete idempotency keys replay successful mutations", async () => {
  const store = new MemoryStore();
  const created = await call(store, "/api/lists", {
    method: "POST",
    body: { title: "Reliable tasks" },
  });
  const listId = created.payload.list.id;

  const firstCreate = await call(store, `/api/lists/${listId}/tasks`, {
    method: "POST",
    headers: { "idempotency-key": "create-task-1" },
    body: { title: "Retry-safe task", due_date: null },
  });
  const replayCreate = await call(store, `/api/lists/${listId}/tasks`, {
    method: "POST",
    headers: { "idempotency-key": "create-task-1" },
    body: { title: "Retry-safe task", due_date: null },
  });

  assert.equal(firstCreate.status, 201);
  assert.equal(replayCreate.status, 201);
  assert.equal(replayCreate.payload.task.id, firstCreate.payload.task.id);
  const afterCreate = await call(store, `/api/lists/${listId}`);
  assert.equal(afterCreate.payload.open_tasks.filter((task) => task.title === "Retry-safe task").length, 1);

  const firstDelete = await call(store, `/api/tasks/${firstCreate.payload.task.id}`, {
    method: "DELETE",
    headers: { "idempotency-key": "delete-task-1" },
  });
  const replayDelete = await call(store, `/api/tasks/${firstCreate.payload.task.id}`, {
    method: "DELETE",
    headers: { "idempotency-key": "delete-task-1" },
  });
  assert.equal(firstDelete.status, 200);
  assert.equal(replayDelete.status, 200);
  assert.deepEqual(replayDelete.payload, firstDelete.payload);

  const completed = await call(store, `/api/lists/${listId}/tasks`, {
    method: "POST",
    body: { title: "Bulk retry-safe task", due_date: null },
  });
  await call(store, `/api/tasks/${completed.payload.task.id}`, {
    method: "PATCH",
    body: { status: "completed" },
  });
  const firstBulkDelete = await call(store, `/api/lists/${listId}/tasks/delete-completed`, {
    method: "POST",
    headers: { "idempotency-key": "bulk-delete-1" },
    body: { task_ids: [completed.payload.task.id] },
  });
  const replayBulkDelete = await call(store, `/api/lists/${listId}/tasks/delete-completed`, {
    method: "POST",
    headers: { "idempotency-key": "bulk-delete-1" },
    body: { task_ids: [completed.payload.task.id] },
  });
  assert.equal(firstBulkDelete.status, 200);
  assert.deepEqual(replayBulkDelete.payload, firstBulkDelete.payload);
});

test("idempotency cleanup removes expired replay records", async () => {
  const store = new MemoryStore();
  store.idempotency.set("old", {
    created_at: "2026-01-01T00:00:00.000Z",
    response: { status: 200, body: { ok: true } },
  });
  store.idempotency.set("fresh", {
    created_at: new Date().toISOString(),
    response: { status: 200, body: { ok: true } },
  });

  const cleanup = await store.cleanupIdempotency({ olderThanHours: 72 });
  assert.equal(cleanup.deleted_count, 1);
  assert.equal(store.idempotency.has("old"), false);
  assert.equal(store.idempotency.has("fresh"), true);
});

test("task revisions reject stale edits", async () => {
  const store = new MemoryStore();
  const created = await call(store, "/api/lists", {
    method: "POST",
    body: { title: "Cross-device edits" },
  });
  const task = await call(store, `/api/lists/${created.payload.list.id}/tasks`, {
    method: "POST",
    body: { title: "Original title" },
  });
  const revision = task.payload.task.revision;

  const firstEdit = await call(store, `/api/tasks/${task.payload.task.id}`, {
    method: "PATCH",
    body: { title: "Phone edit", revision },
  });
  assert.equal(firstEdit.status, 200);
  assert.equal(firstEdit.payload.task.revision, revision + 1);

  const staleEdit = await call(store, `/api/tasks/${task.payload.task.id}`, {
    method: "PATCH",
    body: { title: "Laptop stale edit", revision },
  });
  assert.equal(staleEdit.status, 409);

  const staleDelete = await call(store, `/api/tasks/${task.payload.task.id}`, {
    method: "DELETE",
    headers: { "if-match-revision": String(revision) },
  });
  assert.equal(staleDelete.status, 409);

  const current = await call(store, `/api/lists/${created.payload.list.id}/task-surface`);
  assert.equal(current.payload.open_tasks[0].title, "Phone edit");
});

test("API supports owner-delegated sharing and keeps admin controls owner-only", async () => {
  const store = new MemoryStore();
  const created = await call(store, "/api/lists", {
    method: "POST",
    body: { title: "Planning review" },
  });
  const listId = created.payload.list.id;
  const shared = await call(store, `/api/lists/${listId}/members`, {
    method: "POST",
    body: { email: "editor@local.test" },
  });
  assert.equal(shared.status, 201);
  assert.equal(shared.payload.members.find((member) => member.email === "editor@local.test").can_share, false);

  const external = await call(store, `/api/lists/${listId}/members`, {
    method: "POST",
    body: { email: "outside-member@local.test" },
  });
  assert.equal(external.status, 201);
  assert.equal(external.payload.members.some((member) => member.email === "outside-member@local.test"), true);

  const malformed = await call(store, `/api/lists/${listId}/members`, {
    method: "POST",
    body: { email: "friend" },
  });
  assert.equal(malformed.status, 400);

  const nonOwner = await call(store, `/api/lists/${listId}/members`, {
    method: "POST",
    user: "editor@local.test",
    body: { email: "requester@local.test" },
  });
  assert.equal(nonOwner.status, 403);

  const grantSharing = await call(store, `/api/lists/${listId}/members/${encodedEmail("editor@local.test")}`, {
    method: "PATCH",
    body: { can_share: true },
  });
  assert.equal(grantSharing.status, 200);
  assert.equal(grantSharing.payload.members.find((member) => member.email === "editor@local.test").can_share, true);

  const sharedByEditor = await call(store, `/api/lists/${listId}/members`, {
    method: "POST",
    user: "editor@local.test",
    body: { email: "requester@local.test" },
  });
  assert.equal(sharedByEditor.status, 201);
  assert.equal(sharedByEditor.payload.members.find((member) => member.email === "requester@local.test").can_share, false);

  const editorGrant = await call(store, `/api/lists/${listId}/members/${encodedEmail("requester@local.test")}`, {
    method: "PATCH",
    user: "editor@local.test",
    body: { can_share: true },
  });
  assert.equal(editorGrant.status, 403);

  const allowAll = await call(store, `/api/lists/${listId}/members/share-all`, {
    method: "POST",
  });
  assert.equal(allowAll.status, 200);
  assert.equal(allowAll.payload.members.find((member) => member.email === "requester@local.test").can_share, true);

  const deleteList = await call(store, `/api/lists/${listId}`, {
    method: "DELETE",
    user: "editor@local.test",
  });
  assert.equal(deleteList.status, 403);
});

test("access requests stay private and can be approved by sharers", async () => {
  const store = new MemoryStore({ users: ["admin@local.test", "editor@local.test", "requester@local.test", "delegate@local.test"] });
  const created = await call(store, "/api/lists", {
    method: "POST",
    body: { title: "Access request list" },
  });
  const listId = created.payload.list.id;
  await call(store, `/api/lists/${listId}/members`, {
    method: "POST",
    body: { email: "editor@local.test" },
  });

  const invalidRequest = await call(store, "/api/lists/list_does_not_exist/access-requests", {
    method: "POST",
    user: "requester@local.test",
  });
  assert.equal(invalidRequest.status, 202);
  assert.equal(invalidRequest.payload.request_status, "pending");

  const deniedBootstrap = await call(store, `/api/bootstrap?include_active=true&active_list_id=${listId}`, {
    user: "requester@local.test",
  });
  assert.equal(deniedBootstrap.status, 200);
  assert.deepEqual(deniedBootstrap.payload.groups, { owned: [], shared: [] });
  assert.equal(deniedBootstrap.payload.active, null);

  const request = await call(store, `/api/lists/${listId}/access-requests`, {
    method: "POST",
    user: "requester@local.test",
  });
  assert.equal(request.status, 202);
  assert.equal(request.payload.request_status, "pending");

  const requesterLists = await call(store, "/api/lists", { user: "requester@local.test" });
  assert.deepEqual(requesterLists.payload, { owned: [], shared: [] });

  const ownerLists = await call(store, "/api/lists");
  assert.equal(ownerLists.payload.owned[0].pending_access_request_count, 1);

  const ownerDetails = await call(store, `/api/lists/${listId}/details`);
  assert.equal(ownerDetails.payload.access_requests.length, 1);
  assert.equal(ownerDetails.payload.access_requests[0].email, "requester@local.test");

  const regularMemberLists = await call(store, "/api/lists", { user: "editor@local.test" });
  assert.equal(regularMemberLists.payload.shared[0].pending_access_request_count, 0);
  const regularMemberDetails = await call(store, `/api/lists/${listId}/details`, { user: "editor@local.test" });
  assert.deepEqual(regularMemberDetails.payload.access_requests, []);

  const nonSharerApprove = await call(store, `/api/lists/${listId}/access-requests/${encodedEmail("requester@local.test")}/approve`, {
    method: "POST",
    user: "editor@local.test",
  });
  assert.equal(nonSharerApprove.status, 403);

  const approve = await call(store, `/api/lists/${listId}/access-requests/${encodedEmail("requester@local.test")}/approve`, {
    method: "POST",
  });
  assert.equal(approve.status, 200);
  assert.equal(approve.payload.members.some((member) => member.email === "requester@local.test"), true);
  assert.equal(approve.payload.list.pending_access_request_count, 0);

  const approvedRequesterLists = await call(store, "/api/lists", { user: "requester@local.test" });
  assert.equal(approvedRequesterLists.payload.shared[0].id, listId);

  await call(store, `/api/lists/${listId}/access-requests`, {
    method: "POST",
    user: "delegate@local.test",
  });
  await call(store, `/api/lists/${listId}/members/${encodedEmail("editor@local.test")}`, {
    method: "PATCH",
    body: { can_share: true },
  });
  const delegatedDecline = await call(store, `/api/lists/${listId}/access-requests/${encodedEmail("delegate@local.test")}`, {
    method: "DELETE",
    user: "editor@local.test",
  });
  assert.equal(delegatedDecline.status, 200);
  assert.equal(delegatedDecline.payload.access_requests.length, 0);
});
