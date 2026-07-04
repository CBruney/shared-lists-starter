import {
  AppError,
  displayNameFromEmail,
  KnownPeopleProvider,
  normalizeEmail,
  normalizeDueDate,
  requireValidEmail,
  validateListMarkerPreferences,
  validateListTitle,
  validateTaskTitle,
} from "./shared-lists-core.mjs";
import {
  disconnectGoogleContacts,
  googleContactsAuthorizationUrl,
  googleContactsStatus,
  handleGoogleContactsCallback,
  syncGoogleContacts,
} from "./google-contacts.mjs";

const ADMIN_EMAILS = new Set();
const IDEMPOTENCY_TTL_HOURS = 72;

export async function routeApiRequest(
  request,
  {
    store,
    currentUserEmail,
    accessAuditEnabled = false,
    adminEmails = ADMIN_EMAILS,
    firstOwnerEmails = new Set(),
    firstOwnerSetupEnabled = true,
    allowAnyFirstOwner = false,
    peopleImportEnabled = true,
    logger = null,
    quickActionIntegrationEnabled = false,
    quickActionIntegrationOrigins = "",
    privateContactsConfig = { enabled: false },
    defer = null,
  } = {},
) {
  const startedAt = Date.now();
  const timings = [];
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const path = trimTrailingSlash(url.pathname);
  const quickActionCorsHeaders = quickActionIntegrationEnabled ? quickActionIntegrationCorsHeaders(request, quickActionIntegrationOrigins) : null;
  const logEntry = {
    request_id: request.headers.get("x-request-id") || newIdForLog(),
    route: "unmatched",
    method,
    path,
    status: 500,
    outcome: "error",
    action: "",
    list_id: "",
    task_id: "",
  };
  const responseJson = (body, init = {}) => {
    const headers = new Headers(init.headers || {});
    const metrics = [["app", Date.now() - startedAt], ...timings];
    headers.set("server-timing", metrics.map(([name, duration]) => `${name};dur=${duration}`).join(", "));
    return json(body, { ...init, headers });
  };
  const measure = async (name, operation) => {
    const timingStartedAt = Date.now();
    try {
      return await operation();
    } finally {
      timings.push([name, Date.now() - timingStartedAt]);
    }
  };
  const send = (body, init = {}) => {
    const response = responseJson(body, init);
    logEntry.status = response.status;
    logEntry.outcome = response.status < 400 ? "ok" : "error";
    return response;
  };
  const sendIdempotent = async (path, userEmail, handler, init = {}) => {
    const scope = idempotencyScope(request, userEmail, method, path);
    if (scope && typeof store.cleanupIdempotency === "function") {
      try {
        await store.cleanupIdempotency({ olderThanHours: IDEMPOTENCY_TTL_HOURS });
      } catch {
        // Cleanup keeps the replay table bounded; a cleanup miss should not block the mutation.
      }
    }
    if (scope && typeof store.getIdempotencyResponse === "function") {
      const replay = await store.getIdempotencyResponse(scope);
      if (replay) {
        return send(replay.body, {
          status: replay.status,
          headers: { "x-idempotent-replay": "true" },
        });
      }
    }

    const body = await handler();
    const response = send(body, init);
    if (scope && response.status < 400 && typeof store.saveIdempotencyResponse === "function") {
      try {
        await store.saveIdempotencyResponse(scope, {
          status: response.status,
          body,
        });
      } catch {
        // The mutation succeeded; idempotency persistence should not turn it into a user-visible failure.
      }
    }
    return response;
  };

  try {
    if (isQuickActionIntegrationPath(path) && !quickActionIntegrationEnabled) {
      throw new AppError(404, "Not found");
    }

    if (isQuickActionIntegrationPath(path) && method === "OPTIONS") {
      if (!quickActionCorsHeaders) throw new AppError(403, "Quick action origin is not allowed");
      logEntry.route = "/api/integrations/quick-actions";
      logEntry.action = "quick_action_preflight";
      return new Response(null, { status: 204, headers: quickActionCorsHeaders });
    }

    assertStateChangingRequestAllowed(request, path, method);

    if (!currentUserEmail) throw new AppError(401, "Authenticated user is required");
    const userEmail = requireValidEmail(currentUserEmail, "current user");

    if (isQuickActionIntegrationPath(path) && method === "POST") {
      if (!quickActionCorsHeaders) throw new AppError(403, "Quick action origin is not allowed");
      logEntry.route = "/api/integrations/quick-actions";
      logEntry.action = "quick_action";
      const body = await readJson(request);
      const result = await store.createTaskFromExternalSource(userEmail, {
        source: body.source || "quick-actions",
        external_id: body.external_id ?? body.externalId,
        title: body.title,
        due_date: body.due_date ?? body.dueDate,
        list_title: body.list_title || body.listTitle || "Quick Actions",
      });
      logEntry.list_id = result.list?.id || "";
      logEntry.task_id = result.task?.id || "";
      return send(result, { status: result.created ? 201 : 200, headers: quickActionCorsHeaders });
    }

    if (path === "/api/session" && method === "GET") {
      logEntry.route = "/api/session";
      logEntry.action = "session";
      return send({
        user: {
          email: userEmail,
          display_name: displayNameFromEmail(userEmail),
        },
      });
    }

    if (path === "/api/bootstrap" && method === "GET") {
      logEntry.route = "/api/bootstrap";
      logEntry.action = "bootstrap";
      const includeActive = url.searchParams.get("include_active") === "true";
      const requestedListId = url.searchParams.get("active_list_id");
      const groupsPromise = measure("lists", () => store.getLists(userEmail));
      const requestedActivePromise =
        includeActive && requestedListId
          ? measure("active", () => activeListByIdForBootstrap(store, userEmail, requestedListId))
          : null;
      const groups = await groupsPromise;
      const body = {
        user: {
          email: userEmail,
          display_name: displayNameFromEmail(userEmail),
        },
        groups,
      };
      if (includeActive) {
        body.active = requestedActivePromise
          ? await requestedActivePromise
          : await measure("active", () => activeListForBootstrap(store, userEmail, groups, requestedListId));
      }
      await persistUserAfterResponse(store, userEmail, defer);
      return send(body);
    }

    if (path === "/api/setup/status" && method === "GET") {
      logEntry.route = "/api/setup/status";
      logEntry.action = "setup_status";
      const hasLists = typeof store.hasAnyLists === "function" ? await store.hasAnyLists() : true;
      return send(firstOwnerSetupStatus(userEmail, {
        hasLists,
        firstOwnerEmails,
        firstOwnerSetupEnabled,
        allowAnyFirstOwner,
      }));
    }

    if (path === "/api/setup/first-owner" && method === "POST") {
      logEntry.route = "/api/setup/first-owner";
      logEntry.action = "setup_first_owner";
      if (!firstOwnerSetupEnabled) throw new AppError(404, "Not found");
      const hasLists = typeof store.hasAnyLists === "function" ? await store.hasAnyLists() : true;
      if (hasLists) throw new AppError(409, "First owner setup is already complete");
      assertFirstOwnerAllowed(userEmail, firstOwnerEmails, { allowAnyFirstOwner });
      const body = await readJson(request);
      const list = await store.createList(userEmail, validateListTitle(body.title || "Shared List"));
      logEntry.list_id = list?.list?.id || "";
      return send({ setup_complete: true, ...list }, { status: 201 });
    }

    if (path === "/api/people" && method === "GET") {
      logEntry.route = "/api/people";
      logEntry.action = "people_search";
      await store.ensureUser(userEmail);
      const provider = new KnownPeopleProvider(store);
      return send({
        people: await peopleSearchForUser(provider, store, userEmail, url.searchParams.get("q") || "", privateContactsConfig),
      });
    }

    if (path === "/api/people/index" && method === "GET") {
      logEntry.route = "/api/people/index";
      logEntry.action = "people_index";
      await store.ensureUser(userEmail);
      const provider = new KnownPeopleProvider(store);
      return send({ people: await peopleIndexForUser(provider, store, userEmail, privateContactsConfig) });
    }

    if (path === "/api/contacts/google/status" && method === "GET") {
      logEntry.route = "/api/contacts/google/status";
      logEntry.action = "contacts_google_status";
      await store.ensureUser(userEmail);
      return send(await googleContactsStatus(store, userEmail, privateContactsConfig?.google || privateContactsConfig));
    }

    if (path === "/api/contacts/google/connect" && method === "POST") {
      logEntry.route = "/api/contacts/google/connect";
      logEntry.action = "contacts_google_connect";
      await store.ensureUser(userEmail);
      const body = await readJson(request);
      return send(await googleContactsAuthorizationUrl(request, store, userEmail, privateContactsConfig?.google || privateContactsConfig, {
        redirectTo: body.redirect_to || body.redirectTo || "/",
      }));
    }

    if (path === "/api/contacts/google/callback" && method === "GET") {
      logEntry.route = "/api/contacts/google/callback";
      logEntry.action = "contacts_google_callback";
      await store.ensureUser(userEmail);
      const result = await handleGoogleContactsCallback(request, store, userEmail, privateContactsConfig?.google || privateContactsConfig);
      logEntry.status = 302;
      logEntry.outcome = "ok";
      const redirectUrl = new URL(result.redirect_to || "/", request.url);
      return Response.redirect(redirectUrl.toString(), 302);
    }

    if (path === "/api/contacts/google/sync" && method === "POST") {
      logEntry.route = "/api/contacts/google/sync";
      logEntry.action = "contacts_google_sync";
      await store.ensureUser(userEmail);
      return send(await syncGoogleContacts(store, userEmail, privateContactsConfig?.google || privateContactsConfig));
    }

    if (path === "/api/contacts/google" && method === "DELETE") {
      logEntry.route = "/api/contacts/google";
      logEntry.action = "contacts_google_disconnect";
      await store.ensureUser(userEmail);
      return send({ source: await disconnectGoogleContacts(store, userEmail) });
    }

    if (path === "/api/admin/access-audit" && method === "GET") {
      logEntry.route = "/api/admin/access-audit";
      logEntry.action = "access_audit";
      if (!accessAuditEnabled) throw new AppError(404, "Not found");
      assertAdmin(userEmail, adminEmails);
      const email = requireValidEmail(url.searchParams.get("email"), "email");
      const related = url.searchParams.get("related")
        ? requireValidEmail(url.searchParams.get("related"), "related email")
        : "";
      const terms = url.searchParams.getAll("term").flatMap((term) => String(term || "").split(","));
      return send(await store.accessAudit(email, { related_email: related, terms }));
    }

    if (path === "/api/admin/people" && method === "GET") {
      logEntry.route = "/api/admin/people";
      logEntry.action = "people_profile_index";
      if (!peopleImportEnabled) throw new AppError(404, "Not found");
      assertAdmin(userEmail, adminEmails);
      if (typeof store.getPeopleProfiles !== "function") throw new AppError(501, "People profile import is unavailable");
      return send({ profiles: await store.getPeopleProfiles() });
    }

    if (path === "/api/admin/people/import" && method === "POST") {
      logEntry.route = "/api/admin/people/import";
      logEntry.action = "people_profile_import";
      if (!peopleImportEnabled) throw new AppError(404, "Not found");
      assertAdmin(userEmail, adminEmails);
      if (typeof store.importPeopleProfiles !== "function") throw new AppError(501, "People profile import is unavailable");
      const body = await readJson(request);
      const result = await store.importPeopleProfiles(body.profiles, {
        syncedAt: body.synced_at || body.syncedAt || new Date().toISOString(),
      });
      return send(result);
    }

    if (path === "/api/lists" && method === "GET") {
      logEntry.route = "/api/lists";
      logEntry.action = "list_index";
      return send(await store.getLists(userEmail));
    }

    if (path === "/api/lists" && method === "POST") {
      logEntry.route = "/api/lists";
      logEntry.action = "created_list";
      if (firstOwnerSetupEnabled && typeof store.hasAnyLists === "function" && !(await store.hasAnyLists())) {
        assertFirstOwnerAllowed(userEmail, firstOwnerEmails, { allowAnyFirstOwner });
      }
      const body = await readJson(request);
      const list = await store.createList(userEmail, validateListTitle(body.title));
      logEntry.list_id = list?.list?.id || "";
      return send(list, { status: 201 });
    }

    const listMatch = path.match(/^\/api\/lists\/([^/]+)$/);
    if (listMatch && method === "GET") {
      logEntry.route = "/api/lists/:id";
      logEntry.action = "list_detail";
      logEntry.list_id = decodeURIComponent(listMatch[1]);
      return send(
        await store.getList(userEmail, logEntry.list_id, {
          include_completed: url.searchParams.get("include_completed") === "true",
        }),
      );
    }
    if (listMatch && method === "PATCH") {
      logEntry.route = "/api/lists/:id";
      logEntry.action = "updated_list";
      logEntry.list_id = decodeURIComponent(listMatch[1]);
      const body = await readJson(request);
      const patch = {};
      if ("title" in body) patch.title = validateListTitle(body.title);
      return send(await store.patchList(userEmail, logEntry.list_id, patch));
    }
    if (listMatch && method === "DELETE") {
      logEntry.route = "/api/lists/:id";
      logEntry.action = "deleted_list";
      logEntry.list_id = decodeURIComponent(listMatch[1]);
      return send(await store.deleteList(userEmail, logEntry.list_id));
    }

    const listPreferencesMatch = path.match(/^\/api\/lists\/([^/]+)\/preferences$/);
    if (listPreferencesMatch && method === "PATCH") {
      logEntry.route = "/api/lists/:id/preferences";
      logEntry.action = "updated_list_preferences";
      logEntry.list_id = decodeURIComponent(listPreferencesMatch[1]);
      const body = validateListMarkerPreferences(await readJson(request));
      return send(await store.updateListPreferences(userEmail, logEntry.list_id, body));
    }

    const accessRequestCollectionMatch = path.match(/^\/api\/lists\/([^/]+)\/access-requests$/);
    if (accessRequestCollectionMatch && method === "POST") {
      logEntry.route = "/api/lists/:id/access-requests";
      logEntry.action = "requested_access";
      logEntry.list_id = decodeURIComponent(accessRequestCollectionMatch[1]);
      return send(await store.requestAccess(userEmail, logEntry.list_id), { status: 202 });
    }

    const approveAccessRequestMatch = path.match(/^\/api\/lists\/([^/]+)\/access-requests\/([^/]+)\/approve$/);
    if (approveAccessRequestMatch && method === "POST") {
      logEntry.route = "/api/lists/:id/access-requests/:email/approve";
      logEntry.action = "approved_access_request";
      logEntry.list_id = decodeURIComponent(approveAccessRequestMatch[1]);
      return send(
        await store.approveAccessRequest(
          userEmail,
          logEntry.list_id,
          requireValidEmail(decodeURIComponent(approveAccessRequestMatch[2])),
        ),
      );
    }

    const accessRequestMatch = path.match(/^\/api\/lists\/([^/]+)\/access-requests\/([^/]+)$/);
    if (accessRequestMatch && method === "DELETE") {
      logEntry.route = "/api/lists/:id/access-requests/:email";
      logEntry.action = "declined_access_request";
      logEntry.list_id = decodeURIComponent(accessRequestMatch[1]);
      return send(
        await store.declineAccessRequest(
          userEmail,
          logEntry.list_id,
          requireValidEmail(decodeURIComponent(accessRequestMatch[2])),
        ),
      );
    }

    const taskSurfaceMatch = path.match(/^\/api\/lists\/([^/]+)\/task-surface$/);
    if (taskSurfaceMatch && method === "GET") {
      logEntry.route = "/api/lists/:id/task-surface";
      logEntry.action = "list_task_surface";
      logEntry.list_id = decodeURIComponent(taskSurfaceMatch[1]);
      const getter = typeof store.getListTaskSurface === "function" ? store.getListTaskSurface.bind(store) : store.getList.bind(store);
      return send(await getter(userEmail, logEntry.list_id, { include_completed: false }));
    }

    const listDetailsMatch = path.match(/^\/api\/lists\/([^/]+)\/details$/);
    if (listDetailsMatch && method === "GET") {
      logEntry.route = "/api/lists/:id/details";
      logEntry.action = "list_details";
      logEntry.list_id = decodeURIComponent(listDetailsMatch[1]);
      const getter = typeof store.getListDetails === "function" ? store.getListDetails.bind(store) : store.getList.bind(store);
      return send(await getter(userEmail, logEntry.list_id, { include_completed: false }));
    }

    const completedTasksMatch = path.match(/^\/api\/lists\/([^/]+)\/completed-tasks$/);
    if (completedTasksMatch && method === "GET") {
      logEntry.route = "/api/lists/:id/completed-tasks";
      logEntry.action = "completed_tasks";
      logEntry.list_id = decodeURIComponent(completedTasksMatch[1]);
      return send({ completed_tasks: await store.getCompletedTasks(userEmail, logEntry.list_id) });
    }

    const createTaskMatch = path.match(/^\/api\/lists\/([^/]+)\/tasks$/);
    if (createTaskMatch && method === "POST") {
      logEntry.route = "/api/lists/:id/tasks";
      logEntry.action = "created_task";
      logEntry.list_id = decodeURIComponent(createTaskMatch[1]);
      return await sendIdempotent(path, userEmail, async () => {
        const body = await readJson(request);
        const task = await store.createTask(userEmail, logEntry.list_id, {
          title: validateTaskTitle(body.title),
          due_date: normalizeDueDate(body.due_date),
        });
        logEntry.task_id = task.id;
        return { task };
      }, { status: 201 });
    }

    const reorderTasksMatch = path.match(/^\/api\/lists\/([^/]+)\/tasks\/reorder$/);
    if (reorderTasksMatch && method === "PATCH") {
      logEntry.route = "/api/lists/:id/tasks/reorder";
      logEntry.action = "reordered_tasks";
      logEntry.list_id = decodeURIComponent(reorderTasksMatch[1]);
      const body = await readJson(request);
      return send(await store.reorderOpenTasks(userEmail, logEntry.list_id, body.task_ids));
    }

    const deleteCompletedMatch = path.match(/^\/api\/lists\/([^/]+)\/tasks\/delete-completed$/);
    if (deleteCompletedMatch && method === "POST") {
      logEntry.route = "/api/lists/:id/tasks/delete-completed";
      logEntry.action = "deleted_completed_tasks";
      logEntry.list_id = decodeURIComponent(deleteCompletedMatch[1]);
      return await sendIdempotent(path, userEmail, async () => {
        const body = await readJson(request);
        const taskIds = Array.isArray(body.task_ids) ? body.task_ids : null;
        return store.deleteCompletedTasks(userEmail, logEntry.list_id, taskIds);
      });
    }

    const restoreDeletedMatch = path.match(/^\/api\/lists\/([^/]+)\/tasks\/restore-deleted$/);
    if (restoreDeletedMatch && method === "POST") {
      logEntry.route = "/api/lists/:id/tasks/restore-deleted";
      logEntry.action = "restored_completed_tasks";
      logEntry.list_id = decodeURIComponent(restoreDeletedMatch[1]);
      const body = await readJson(request);
      return send(await store.restoreDeletedTasks(userEmail, logEntry.list_id, Array.isArray(body.task_ids) ? body.task_ids : []));
    }

    const taskMatch = path.match(/^\/api\/tasks\/([^/]+)$/);
    if (taskMatch && method === "PATCH") {
      logEntry.route = "/api/tasks/:id";
      logEntry.action = "updated_task";
      logEntry.task_id = decodeURIComponent(taskMatch[1]);
      const body = await readJson(request);
      const patch = {};
      if ("title" in body) patch.title = validateTaskTitle(body.title);
      if ("due_date" in body) patch.due_date = normalizeDueDate(body.due_date);
      if ("status" in body) patch.status = String(body.status || "");
      if ("revision" in body) patch.expected_revision = body.revision;
      if ("expected_revision" in body) patch.expected_revision = body.expected_revision;
      const task = await store.patchTask(userEmail, logEntry.task_id, patch);
      logEntry.list_id = task.list_id;
      if (patch.status === "completed") logEntry.action = "completed_task";
      if (patch.status === "open") logEntry.action = "reopened_task";
      return send({ task });
    }
    if (taskMatch && method === "DELETE") {
      logEntry.route = "/api/tasks/:id";
      logEntry.action = "deleted_task";
      logEntry.task_id = decodeURIComponent(taskMatch[1]);
      const expectedRevision = request.headers.get("if-match-revision");
      return await sendIdempotent(path, userEmail, () =>
        store.deleteTask(userEmail, logEntry.task_id, { expected_revision: expectedRevision }),
      );
    }

    const memberCollectionMatch = path.match(/^\/api\/lists\/([^/]+)\/members$/);
    if (memberCollectionMatch && method === "POST") {
      logEntry.route = "/api/lists/:id/members";
      logEntry.action = "added_member";
      logEntry.list_id = decodeURIComponent(memberCollectionMatch[1]);
      const body = await readJson(request);
      const email = requireValidEmail(body.email);
      return send(await store.addMember(userEmail, logEntry.list_id, email), {
        status: 201,
      });
    }

    const memberShareAllMatch = path.match(/^\/api\/lists\/([^/]+)\/members\/share-all$/);
    if (memberShareAllMatch && method === "POST") {
      logEntry.route = "/api/lists/:id/members/share-all";
      logEntry.action = "allowed_all_to_share";
      logEntry.list_id = decodeURIComponent(memberShareAllMatch[1]);
      return send(await store.allowAllMembersToShare(userEmail, logEntry.list_id));
    }

    const memberMatch = path.match(/^\/api\/lists\/([^/]+)\/members\/([^/]+)$/);
    if (memberMatch && method === "PATCH") {
      logEntry.route = "/api/lists/:id/members/:email";
      logEntry.action = "updated_member_sharing";
      logEntry.list_id = decodeURIComponent(memberMatch[1]);
      const body = await readJson(request);
      return send(
        await store.updateMemberSharing(
          userEmail,
          logEntry.list_id,
          requireValidEmail(decodeURIComponent(memberMatch[2])),
          body.can_share === true,
        ),
      );
    }
    if (memberMatch && method === "DELETE") {
      logEntry.route = "/api/lists/:id/members/:email";
      logEntry.action = "removed_member";
      logEntry.list_id = decodeURIComponent(memberMatch[1]);
      return send(
        await store.removeMember(
          userEmail,
          logEntry.list_id,
          normalizeEmail(decodeURIComponent(memberMatch[2])),
        ),
      );
    }

    return send({ error: "Not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof AppError) {
      logEntry.status = error.status;
      logEntry.outcome = error.status === 403 ? "denied" : error.status === 404 ? "not_found" : "invalid";
      return responseJson(
        { error: error.message },
        { status: error.status, headers: isQuickActionIntegrationPath(path) && quickActionCorsHeaders ? quickActionCorsHeaders : {} },
      );
    }
    logEntry.status = 500;
    logEntry.outcome = "error";
    logEntry.error_name = error?.name || "Error";
    return responseJson(
      { error: "Unexpected server error" },
      { status: 500, headers: isQuickActionIntegrationPath(path) && quickActionCorsHeaders ? quickActionCorsHeaders : {} },
    );
  } finally {
    await emitApiLog(logger, {
      ...logEntry,
      duration_ms: Date.now() - startedAt,
      actor_email_hash: await hashEmailForLog(currentUserEmail),
    });
  }
}

export async function readJson(request) {
  assertJsonContentType(request);
  try {
    return await request.json();
  } catch {
    throw new AppError(400, "Request body must be JSON");
  }
}

function assertStateChangingRequestAllowed(request, path, method) {
  if (!isStateChangingMethod(method)) return;
  if (isQuickActionIntegrationPath(path)) return;

  const requestOrigin = new URL(request.url).origin;
  const origin = request.headers.get("origin");
  if (origin && normalizeOrigin(origin) !== requestOrigin) {
    throw new AppError(403, "Cross-site requests are not allowed");
  }

  const fetchSite = String(request.headers.get("sec-fetch-site") || "").toLowerCase();
  if (fetchSite === "cross-site") {
    throw new AppError(403, "Cross-site requests are not allowed");
  }

  assertJsonContentType(request);
}

function isStateChangingMethod(method) {
  return !["GET", "HEAD", "OPTIONS"].includes(method);
}

function assertJsonContentType(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new AppError(415, "Request content type must be application/json");
  }
}

function normalizeOrigin(value) {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

export function json(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("cache-control", "no-store");
  return Response.json(body, {
    ...init,
    headers,
  });
}

async function activeListForBootstrap(store, userEmail, groups, requestedListId) {
  const visibleIds = new Set([...(groups.owned || []), ...(groups.shared || [])].map((list) => list.id));
  const listId = requestedListId
    ? (visibleIds.has(requestedListId) ? requestedListId : "")
    : (groups.owned || [])[0]?.id || (groups.shared || [])[0]?.id || "";
  if (!listId) return null;
  try {
    const getter = typeof store.getListTaskSurface === "function" ? store.getListTaskSurface.bind(store) : store.getList.bind(store);
    return await getter(userEmail, listId, { include_completed: false });
  } catch {
    return null;
  }
}

async function activeListByIdForBootstrap(store, userEmail, listId) {
  try {
    const getter = typeof store.getListTaskSurface === "function" ? store.getListTaskSurface.bind(store) : store.getList.bind(store);
    return await getter(userEmail, listId, { include_completed: false });
  } catch {
    return null;
  }
}

async function peopleSearchForUser(provider, store, userEmail, query, privateContactsConfig) {
  const [knownPeople, privateContacts] = await Promise.all([
    provider.search(query, { userEmail }),
    privateContactsSearchForUser(store, userEmail, query, privateContactsConfig),
  ]);
  return mergePeopleResults(knownPeople, privateContacts);
}

async function peopleIndexForUser(provider, store, userEmail, privateContactsConfig) {
  const [knownPeople, privateContacts] = await Promise.all([
    provider.index({ userEmail }),
    privateContactsIndexForUser(store, userEmail, privateContactsConfig),
  ]);
  return mergePeopleResults(knownPeople, privateContacts, { limit: 3000 });
}

async function privateContactsSearchForUser(store, userEmail, query, privateContactsConfig) {
  if (!privateContactsConfigured(privateContactsConfig) || typeof store.searchPrivateContacts !== "function") return [];
  return store.searchPrivateContacts(userEmail, query);
}

async function privateContactsIndexForUser(store, userEmail, privateContactsConfig) {
  if (!privateContactsConfigured(privateContactsConfig) || typeof store.getPrivateContactIndex !== "function") return [];
  return store.getPrivateContactIndex(userEmail);
}

function privateContactsConfigured(privateContactsConfig) {
  const google = privateContactsConfig?.google || privateContactsConfig || {};
  return Boolean(google.enabled && google.clientId && google.clientSecret && google.tokenSecret);
}

function mergePeopleResults(...args) {
  const last = args[args.length - 1];
  const options = last && typeof last === "object" && "limit" in last ? args.pop() : {};
  const limit = options.limit || PEOPLE_MERGE_LIMIT;
  const byEmail = new Map();
  for (const person of args.flat()) {
    const email = normalizeEmail(person?.email);
    if (!email) continue;
    const existing = byEmail.get(email);
    if (!existing) {
      byEmail.set(email, { ...person, email });
      continue;
    }
    byEmail.set(email, {
      ...person,
      ...existing,
      search_terms: [...new Set([...(existing.search_terms || []), ...(person.search_terms || [])])],
      source: existing.source || person.source,
      source_label: existing.source_label || person.source_label,
      private: Boolean(existing.private || person.private),
    });
  }
  return [...byEmail.values()].slice(0, limit);
}

const PEOPLE_MERGE_LIMIT = 3000;

async function persistUserAfterResponse(store, userEmail, defer) {
  const persistence = Promise.resolve()
    .then(() => store.ensureUser(userEmail))
    .catch(() => null);
  if (typeof defer === "function") {
    defer(persistence);
    return;
  }
  await persistence;
}

function trimTrailingSlash(path) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function isQuickActionIntegrationPath(path) {
  return path === "/api/integrations/quick-actions";
}

function quickActionIntegrationCorsHeaders(request, configuredOrigins) {
  const allowed = parseQuickActionIntegrationOrigins(configuredOrigins);
  if (allowed.size === 0) return null;
  const origin = request.headers.get("origin") || "";
  if (!origin) return null;
  if (!allowed.has(origin)) return null;
  return new Headers({
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "600",
    "cache-control": "no-store",
    vary: "Origin",
  });
}

function parseQuickActionIntegrationOrigins(value) {
  const configured = String(value || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return new Set(configured);
}

function firstOwnerSetupStatus(userEmail, { hasLists, firstOwnerEmails, firstOwnerSetupEnabled, allowAnyFirstOwner = false }) {
  const ownerEmails = normalizedEmailSet(firstOwnerEmails);
  const configured = allowAnyFirstOwner || ownerEmails.size > 0;
  return {
    enabled: Boolean(firstOwnerSetupEnabled),
    has_lists: Boolean(hasLists),
    ready: Boolean(firstOwnerSetupEnabled && !hasLists && configured),
    can_claim: Boolean(firstOwnerSetupEnabled && !hasLists && configured && (allowAnyFirstOwner || ownerEmails.has(normalizeEmail(userEmail)))),
    allowed_owner_required: !allowAnyFirstOwner,
    configured,
  };
}

function assertFirstOwnerAllowed(userEmail, firstOwnerEmails, { allowAnyFirstOwner = false } = {}) {
  const ownerEmails = normalizedEmailSet(firstOwnerEmails);
  if (allowAnyFirstOwner || ownerEmails.has(normalizeEmail(userEmail))) return;
  if (ownerEmails.size === 0) {
    throw new AppError(503, "First owner setup requires FIRST_OWNER_EMAILS or ALLOW_ANY_FIRST_OWNER=true");
  }
  throw new AppError(403, "This signed-in user is not allowed to complete first owner setup");
}

function normalizedEmailSet(value) {
  return new Set([...(value instanceof Set ? value : new Set(value || []))].map(normalizeEmail).filter(Boolean));
}

function assertAdmin(email, adminEmails = ADMIN_EMAILS) {
  const allowed = normalizedEmailSet(adminEmails);
  if (!allowed.has(normalizeEmail(email))) {
    throw new AppError(403, "Only an app admin can do that");
  }
}

function newIdForLog() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function idempotencyScope(request, userEmail, method, path) {
  const key = normalizeIdempotencyKey(request.headers.get("idempotency-key"));
  if (!key) return null;
  if (
    !(
      (method === "POST" && /^\/api\/lists\/[^/]+\/tasks$/.test(path)) ||
      (method === "POST" && /^\/api\/lists\/[^/]+\/tasks\/delete-completed$/.test(path)) ||
      (method === "DELETE" && /^\/api\/tasks\/[^/]+$/.test(path))
    )
  ) {
    return null;
  }
  return `${normalizeEmail(userEmail)}:${method}:${path}:${key}`;
}

function normalizeIdempotencyKey(value) {
  const key = String(value || "").trim();
  if (!key || key.length > 200 || /[\r\n]/.test(key)) return "";
  return key;
}

async function hashEmailForLog(email) {
  const normalized = normalizeEmail(email);
  if (!normalized || !globalThis.crypto?.subtle) return "";
  const bytes = new TextEncoder().encode(normalized);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
}

async function emitApiLog(logger, entry) {
  if (!logger) return;
  try {
    await logger(entry);
  } catch {
    // Logging must never affect the user flow.
  }
}
