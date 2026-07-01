export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_TASK_TITLE_LENGTH = 4000;

export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function toBoolean(value) {
  return value === true || value === 1 || value === "1";
}

export function isValidEmail(email) {
  const normalized = normalizeEmail(email);
  return EMAIL_PATTERN.test(normalized);
}

export function requireValidEmail(value, label = "email") {
  const email = normalizeEmail(value);
  if (!email || !isValidEmail(email)) {
    throw new AppError(400, `${label} must be a valid email address`);
  }
  return email;
}

export function displayNameFromEmail(email) {
  const localPart = normalizeEmail(email).split("@")[0] || "Shared Lists user";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function validateListTitle(value) {
  const title = String(value || "").trim().replace(/\s+/g, " ");
  if (!title) throw new AppError(400, "List title is required");
  if (title.length > 120) throw new AppError(400, "List title must be 120 characters or less");
  return title;
}

export function validateTaskTitle(value) {
  const title = String(value || "").trim().replace(/\s+/g, " ");
  if (!title) throw new AppError(400, "Task title is required");
  if (title.length > MAX_TASK_TITLE_LENGTH) {
    throw new AppError(400, `Task title must be ${MAX_TASK_TITLE_LENGTH} characters or less`);
  }
  return title;
}

export function normalizeDueDate(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const dueDate = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw new AppError(400, "Due date must use YYYY-MM-DD");
  }
  return dueDate;
}

export const LIST_MARKER_COLORS = ["blue", "green", "amber", "red", "purple", "teal", "slate"];
export const LIST_MARKER_ICONS = ["app", "circle", "square", "diamond", "star", "flag", "briefcase"];
export const DEFAULT_LIST_MARKER_COLOR = "blue";
export const DEFAULT_LIST_MARKER_ICON = "app";

export function listMarkerColorValue(value) {
  const color = String(value || DEFAULT_LIST_MARKER_COLOR).trim().toLowerCase();
  return LIST_MARKER_COLORS.includes(color) ? color : DEFAULT_LIST_MARKER_COLOR;
}

export function listMarkerIconValue(value) {
  const icon = String(value || DEFAULT_LIST_MARKER_ICON).trim().toLowerCase();
  return LIST_MARKER_ICONS.includes(icon) ? icon : DEFAULT_LIST_MARKER_ICON;
}

export function validateListMarkerPreferences(value = {}) {
  const color = String(value.marker_color || "").trim().toLowerCase();
  const icon = String(value.marker_icon || "").trim().toLowerCase();
  if (!LIST_MARKER_COLORS.includes(color)) {
    throw new AppError(400, "Marker color is not available");
  }
  if (!LIST_MARKER_ICONS.includes(icon)) {
    throw new AppError(400, "Marker icon is not available");
  }
  return {
    marker_color: color,
    marker_icon: icon,
  };
}

export function normalizeExpectedRevision(value) {
  if (value === undefined || value === null || value === "") return null;
  const revision = Number(value);
  if (!Number.isInteger(revision) || revision < 0) {
    throw new AppError(400, "Revision must be a non-negative integer");
  }
  return revision;
}

export function expectedRevisionFromPatch(patch) {
  if (!patch || !("expected_revision" in patch)) return null;
  return normalizeExpectedRevision(patch.expected_revision);
}

export function newId(prefix) {
  const uuid =
    globalThis.crypto && "randomUUID" in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${uuid}`;
}

export function partitionLists(rows, currentUserEmail) {
  const userEmail = normalizeEmail(currentUserEmail);
  const owned = [];
  const shared = [];
  for (const row of rows) {
    if (normalizeEmail(row.owner_email) === userEmail) owned.push(row);
    else shared.push(row);
  }
  return { owned, shared };
}

export function listSummaryFromRecord(list, currentUserEmail) {
  const owner = normalizeEmail(list.owner_email) === normalizeEmail(currentUserEmail);
  const canShare = owner || toBoolean(list.current_user_can_share);
  return {
    id: list.id,
    title: list.title,
    owner_email: list.owner_email,
    owner_name: list.owner_name || displayNameFromEmail(list.owner_email),
    current_user_role: owner ? "owner" : "editor",
    current_user_can_share: canShare,
    marker_color: listMarkerColorValue(list.marker_color),
    marker_icon: listMarkerIconValue(list.marker_icon),
    member_count: Number(list.member_count || 0),
    open_task_count: Number(list.open_task_count || 0),
    completed_task_count: Number(list.completed_task_count || 0),
    pending_access_request_count: canShare ? Number(list.pending_access_request_count || 0) : 0,
    revision: Number(list.revision || 0),
    updated_at: list.updated_at,
    created_at: list.created_at,
  };
}

export function accessRequestView(request) {
  const email = normalizeEmail(request.email || request.requester_email);
  return {
    email,
    display_name: request.display_name || displayNameFromEmail(email),
    created_at: request.created_at,
  };
}

export const PEOPLE_SEARCH_LIMIT = 8;
export const PEOPLE_IMPORT_LIMIT = 250;

export function normalizePeopleQuery(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function peopleSearchView(user) {
  return {
    email: normalizeEmail(user.email),
    display_name: user.full_name || user.display_name || displayNameFromEmail(user.email),
  };
}

export function peopleIndexView(user) {
  const email = normalizeEmail(user.email);
  const displayName = user.full_name || user.display_name || displayNameFromEmail(email);
  const searchTerms = [...new Set([
    email,
    email.split("@")[0] || "",
    displayName,
    user.full_name,
    user.display_name,
    user.slack_handle,
    ...parseAliases(user.aliases_json),
  ].map(normalizePeopleQuery).filter(Boolean))];
  return {
    email,
    display_name: displayName,
    search_terms: searchTerms,
  };
}

export function normalizePeopleProfile(profile, { syncedAt = new Date().toISOString() } = {}) {
  const email = requireValidEmail(profile?.email);
  const fullName = normalizeProfileText(profile?.full_name || profile?.fullName || profile?.display_name, "full name", 120);
  if (!fullName) throw new AppError(400, `Full name is required for ${email}`);
  const slackUserId = normalizeOptionalProfileValue(profile?.slack_user_id || profile?.slackUserId, "Slack user id", 32);
  if (slackUserId && !/^[A-Z][A-Z0-9]{5,31}$/.test(slackUserId)) {
    throw new AppError(400, `Slack user id is invalid for ${email}`);
  }
  const slackHandle = normalizeOptionalProfileValue(profile?.slack_handle || profile?.slackHandle, "Slack handle", 80)
    .replace(/^@/, "")
    .toLowerCase();
  if (slackHandle && !/^[a-z0-9._-]+$/.test(slackHandle)) {
    throw new AppError(400, `Slack handle is invalid for ${email}`);
  }
  const suppliedAliases = Array.isArray(profile?.aliases) ? profile.aliases : [];
  const aliases = [...new Set([
    ...suppliedAliases,
    profile?.display_name,
    profile?.displayName,
    slackHandle,
  ]
    .map((value) => normalizeOptionalProfileValue(value, "Alias", 120))
    .map(normalizePeopleQuery)
    .filter((value) => value && value !== normalizePeopleQuery(fullName) && value !== email))]
    .slice(0, 20);
  const source = String(profile?.profile_source || profile?.profileSource || "weekly-interactions").trim().toLowerCase();
  if (!/^[a-z0-9_-]{2,40}$/.test(source)) throw new AppError(400, `Profile source is invalid for ${email}`);
  const profileSyncedAt = new Date(profile?.profile_synced_at || profile?.profileSyncedAt || syncedAt);
  if (Number.isNaN(profileSyncedAt.getTime())) throw new AppError(400, `Profile sync time is invalid for ${email}`);
  return {
    email,
    display_name: fullName,
    full_name: fullName,
    slack_user_id: slackUserId,
    slack_handle: slackHandle,
    aliases,
    aliases_json: JSON.stringify(aliases),
    profile_source: source,
    profile_synced_at: profileSyncedAt.toISOString(),
  };
}

export function normalizePeopleProfileBatch(profiles, { syncedAt = new Date().toISOString() } = {}) {
  if (!Array.isArray(profiles)) throw new AppError(400, "profiles must be an array");
  if (!profiles.length) return [];
  if (profiles.length > PEOPLE_IMPORT_LIMIT) {
    throw new AppError(400, `profiles may contain at most ${PEOPLE_IMPORT_LIMIT} people`);
  }
  const byEmail = new Map();
  for (const profile of profiles) {
    const normalized = normalizePeopleProfile(profile, { syncedAt });
    byEmail.set(normalized.email, normalized);
  }
  return [...byEmail.values()];
}

export function peopleProfileAdminView(user) {
  return {
    email: normalizeEmail(user.email),
    display_name: user.full_name || user.display_name || displayNameFromEmail(user.email),
    full_name: user.full_name || "",
    slack_user_id: user.slack_user_id || "",
    slack_handle: user.slack_handle || "",
    aliases: parseAliases(user.aliases_json),
    profile_source: user.profile_source || "shared-lists",
    profile_synced_at: user.profile_synced_at || null,
  };
}

export class KnownPeopleProvider {
  constructor(store) {
    this.store = store;
  }

  async search(query, options = {}) {
    if (typeof this.store.searchPeople !== "function") return [];
    return this.store.searchPeople(query, options);
  }

  async index() {
    if (typeof this.store.getPeopleIndex !== "function") return [];
    return this.store.getPeopleIndex();
  }
}

export class MemoryStore {
  constructor(seed = {}) {
    this.users = new Map();
    this.lists = new Map();
    this.members = new Map();
    this.tasks = new Map();
    this.activities = [];
    this.idempotency = new Map();
    this.accessRequests = new Map();
    this.externalTaskRefs = new Map();

    for (const seededUser of seed.users || []) {
      const email = typeof seededUser === "string" ? seededUser : seededUser.email;
      const user = this.ensureUserSync(email);
      if (typeof seededUser === "object") Object.assign(user, normalizeSeededPeopleProfile(seededUser));
    }
    for (const list of seed.lists || []) {
      this.seedList(list);
    }
  }

  seedList(seed) {
    const owner = this.ensureUserSync(seed.owner_email);
    const list = {
      id: seed.id || newId("list"),
      title: validateListTitle(seed.title),
      owner_email: owner.email,
      created_at: seed.created_at || nowIso(),
      updated_at: seed.updated_at || nowIso(),
      revision: Number(seed.revision || 0),
    };
    this.lists.set(list.id, list);
    this.members.set(list.id, new Map());
    this.members.get(list.id).set(owner.email, {
      email: owner.email,
      role: "owner",
      can_share: true,
      marker_color: listMarkerColorValue(seed.marker_color),
      marker_icon: listMarkerIconValue(seed.marker_icon),
      created_at: nowIso(),
    });
    for (const memberSeed of seed.members || []) {
      const email = typeof memberSeed === "string" ? memberSeed : memberSeed.email;
      const user = this.ensureUserSync(email);
      this.members.get(list.id).set(user.email, {
        email: user.email,
        role: "editor",
        can_share: Boolean(typeof memberSeed === "object" && memberSeed.can_share),
        marker_color: listMarkerColorValue(typeof memberSeed === "object" ? memberSeed.marker_color : null),
        marker_icon: listMarkerIconValue(typeof memberSeed === "object" ? memberSeed.marker_icon : null),
        created_at: nowIso(),
      });
    }
    for (const [index, task] of (seed.tasks || []).entries()) {
      const createdBy = this.ensureUserSync(task.created_by_email || owner.email);
      this.tasks.set(task.id || newId("task"), {
        id: task.id || newId("task"),
        list_id: list.id,
        title: validateTaskTitle(task.title),
        due_date: normalizeDueDate(task.due_date) ?? null,
        status: task.status || "open",
        created_by_email: createdBy.email,
        completed_by_email: task.completed_by_email || null,
        created_at: task.created_at || nowIso(),
        updated_at: task.updated_at || nowIso(),
        completed_at: task.status === "completed" ? task.completed_at || nowIso() : null,
        deleted_at: task.deleted_at || null,
        deleted_by_email: task.deleted_by_email || null,
        delete_reason: task.delete_reason || null,
        revision: Number(task.revision || 0),
        sort_order: Number(task.sort_order || (index + 1) * 1024),
      });
    }
    this.addActivitySync(list.id, owner.email, "created_list", { title: list.title });
  }

  ensureUserSync(email) {
    const normalized = requireValidEmail(email);
    const existing = this.users.get(normalized);
    if (existing) return existing;
    const user = {
      email: normalized,
      display_name: displayNameFromEmail(normalized),
      full_name: "",
      slack_user_id: "",
      slack_handle: "",
      aliases_json: "[]",
      profile_source: "shared-lists",
      profile_synced_at: null,
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    this.users.set(normalized, user);
    return user;
  }

  async ensureUser(email) {
    return this.ensureUserSync(email);
  }

  async hasAnyLists() {
    return this.lists.size > 0;
  }

  async searchPeople(query, { limit = PEOPLE_SEARCH_LIMIT } = {}) {
    const normalized = normalizePeopleQuery(query);
    if (normalized.length < 2) return [];
    const cappedLimit = Math.min(Math.max(Number(limit) || PEOPLE_SEARCH_LIMIT, 1), PEOPLE_SEARCH_LIMIT);
    return Array.from(this.users.values())
      .filter((user) => {
        const email = normalizeEmail(user.email);
        const localPart = email.split("@")[0] || "";
        const displayName = normalizePeopleQuery(user.display_name);
        const fullName = normalizePeopleQuery(user.full_name);
        const slackHandle = normalizePeopleQuery(user.slack_handle);
        const aliases = parseAliases(user.aliases_json);
        return email.includes(normalized)
          || localPart.includes(normalized)
          || displayName.includes(normalized)
          || fullName.includes(normalized)
          || slackHandle.includes(normalized)
          || aliases.some((alias) => alias.includes(normalized));
      })
      .sort((a, b) => sortPeopleSearchResults(a, b, normalized))
      .slice(0, cappedLimit)
      .map(peopleSearchView);
  }

  async getPeopleIndex() {
    return Array.from(this.users.values())
      .sort((a, b) => String(a.full_name || a.display_name || a.email).localeCompare(String(b.full_name || b.display_name || b.email)))
      .map(peopleIndexView);
  }

  async getPeopleProfiles() {
    return Array.from(this.users.values())
      .sort((a, b) => String(a.full_name || a.display_name || a.email).localeCompare(String(b.full_name || b.display_name || b.email)))
      .map(peopleProfileAdminView);
  }

  async importPeopleProfiles(profiles, { syncedAt = new Date().toISOString() } = {}) {
    const normalizedProfiles = normalizePeopleProfileBatch(profiles, { syncedAt });
    let createdCount = 0;
    let updatedCount = 0;
    for (const profile of normalizedProfiles) {
      const existing = this.users.get(profile.email);
      if (existing) updatedCount += 1;
      else createdCount += 1;
      this.users.set(profile.email, {
        ...(existing || {
          email: profile.email,
          created_at: nowIso(),
        }),
        ...profile,
        updated_at: nowIso(),
      });
    }
    return {
      imported_count: normalizedProfiles.length,
      created_count: createdCount,
      updated_count: updatedCount,
      profiles: normalizedProfiles.map(peopleProfileAdminView),
    };
  }

  async accessAudit(email, { related_email = "", terms = [] } = {}) {
    const targetEmail = requireValidEmail(email);
    const relatedEmail = related_email ? requireValidEmail(related_email, "related email") : "";
    const normalizedTerms = normalizeAuditTerms(terms);
    const lists = Array.from(this.lists.values())
      .filter((list) => this.isMember(targetEmail, list.id))
      .map((list) => {
        const members = Array.from(this.members.get(list.id)?.values() || []).map((member) => {
          const user = this.users.get(member.email);
          return memberView({
            ...member,
            display_name: user?.display_name || displayNameFromEmail(member.email),
          });
        });
        const tasks = Array.from(this.tasks.values()).filter((task) => task.list_id === list.id && !task.deleted_at);
        const titleMatchesTerms = normalizedTerms.some((term) => normalizePeopleQuery(list.title).includes(term));
        return {
          id: list.id,
          title: list.title,
          owner_email: list.owner_email,
          owner_name: this.users.get(list.owner_email)?.display_name || displayNameFromEmail(list.owner_email),
          target_role: this.members.get(list.id)?.get(targetEmail)?.role || "",
          target_can_share: Boolean(this.members.get(list.id)?.get(targetEmail)?.can_share),
          related_is_owner: relatedEmail ? normalizeEmail(list.owner_email) === relatedEmail : false,
          related_is_member: relatedEmail ? members.some((member) => normalizeEmail(member.email) === relatedEmail) : false,
          title_matches_terms: titleMatchesTerms,
          member_count: members.length,
          members,
          open_task_count: tasks.filter((task) => task.status === "open").length,
          completed_task_count: tasks.filter((task) => task.status === "completed").length,
          tasks_created_by_target_count: tasks.filter((task) => normalizeEmail(task.created_by_email) === targetEmail).length,
          tasks_created_by_related_count: relatedEmail
            ? tasks.filter((task) => normalizeEmail(task.created_by_email) === relatedEmail).length
            : 0,
          task_title_match_count: normalizedTerms.length
            ? tasks.filter((task) => normalizedTerms.some((term) => normalizePeopleQuery(task.title).includes(term))).length
            : 0,
        };
      })
      .sort((a, b) => a.title.localeCompare(b.title));
    return {
      target_email: targetEmail,
      related_email: relatedEmail || null,
      terms: normalizedTerms,
      visible_list_count: lists.length,
      lists,
    };
  }

  isMember(email, listId) {
    const members = this.members.get(listId);
    return Boolean(members && members.has(normalizeEmail(email)));
  }

  assertAuthorized(email, listId) {
    if (!this.lists.has(listId)) throw new AppError(404, "List not found");
    if (!this.isMember(email, listId)) throw new AppError(403, "You do not have access to this list");
  }

  assertOwner(email, listId) {
    const list = this.lists.get(listId);
    if (!list) throw new AppError(404, "List not found");
    if (normalizeEmail(list.owner_email) !== normalizeEmail(email)) {
      throw new AppError(403, "Only the list owner can do that");
    }
  }

  assertCanShare(email, listId) {
    const normalized = normalizeEmail(email);
    const list = this.lists.get(listId);
    if (!list) throw new AppError(404, "List not found");
    const member = this.members.get(listId)?.get(normalized);
    if (!member) throw new AppError(403, "You do not have access to this list");
    if (normalizeEmail(list.owner_email) === normalized || member.can_share) return;
    throw new AppError(403, "You do not have sharing rights for this list");
  }

  async getLists(email) {
    this.ensureUserSync(email);
    const rows = Array.from(this.lists.values())
      .filter((list) => this.isMember(email, list.id))
      .map((list) => this.summary(list, email))
      .sort((a, b) => a.title.localeCompare(b.title));
    return partitionLists(rows, email);
  }

  async createList(ownerEmail, title) {
    const owner = this.ensureUserSync(ownerEmail);
    const list = {
      id: newId("list"),
      title: validateListTitle(title),
      owner_email: owner.email,
      created_at: nowIso(),
      updated_at: nowIso(),
      revision: 0,
    };
    this.lists.set(list.id, list);
    this.members.set(
      list.id,
      new Map([
        [
          owner.email,
          {
            email: owner.email,
            role: "owner",
            can_share: true,
            marker_color: DEFAULT_LIST_MARKER_COLOR,
            marker_icon: DEFAULT_LIST_MARKER_ICON,
            created_at: nowIso(),
          },
        ],
      ]),
    );
    this.addActivitySync(list.id, owner.email, "created_list", { title: list.title });
    return this.getList(owner.email, list.id, { include_completed: true });
  }

  async patchList(ownerEmail, listId, patch) {
    const owner = this.ensureUserSync(ownerEmail);
    this.assertOwner(owner.email, listId);
    const list = this.lists.get(listId);
    const title = patch.title !== undefined ? validateListTitle(patch.title) : list.title;
    const next = {
      ...list,
      title,
      updated_at: nowIso(),
      revision: Number(list.revision || 0) + 1,
    };
    this.lists.set(listId, next);
    this.addActivitySync(listId, owner.email, "updated_list", { title });
    return this.getList(owner.email, listId, { include_completed: true });
  }

  async getList(email, listId, { include_completed = false } = {}) {
    this.assertAuthorized(email, listId);
    const list = this.lists.get(listId);
    const members = this.membersForList(listId);
    const tasks = Array.from(this.tasks.values()).filter((task) => task.list_id === listId && !task.deleted_at);
    const open_tasks = tasks
      .filter((task) => task.status === "open")
      .sort(sortOpenTasks)
      .map(taskView);
    const completed_tasks = include_completed
      ? tasks
          .filter((task) => task.status === "completed")
          .sort((a, b) => String(b.completed_at || "").localeCompare(String(a.completed_at || "")))
          .map(taskView)
      : [];
    const activity = this.activities
      .filter((entry) => entry.list_id === listId)
      .slice(-20)
      .reverse();
    return {
      list: this.summary(list, email),
      members,
      open_tasks,
      completed_tasks,
      completed_tasks_loaded: include_completed,
      activity,
      access_requests: this.accessRequestsForList(email, listId),
      details_loaded: true,
    };
  }

  async getListTaskSurface(email, listId) {
    this.assertAuthorized(email, listId);
    const list = this.lists.get(listId);
    const tasks = Array.from(this.tasks.values()).filter((task) => task.list_id === listId && task.status === "open" && !task.deleted_at);
    return {
      list: this.summary(list, email),
      members: this.ownerMemberForList(listId),
      open_tasks: tasks.sort(sortOpenTasks).map(taskView),
      completed_tasks: [],
      completed_tasks_loaded: false,
      completed_tasks_loading: false,
      activity: [],
      access_requests: [],
      details_loaded: false,
    };
  }

  async getListDetails(email, listId) {
    this.assertAuthorized(email, listId);
    const list = this.lists.get(listId);
    const activity = this.activities
      .filter((entry) => entry.list_id === listId)
      .slice(-20)
      .reverse();
    return {
      list: this.summary(list, email),
      members: this.membersForList(listId),
      activity,
      access_requests: this.accessRequestsForList(email, listId),
      details_loaded: true,
    };
  }

  async getCompletedTasks(email, listId) {
    this.assertAuthorized(email, listId);
    return Array.from(this.tasks.values())
      .filter((task) => task.list_id === listId && task.status === "completed" && !task.deleted_at)
      .sort((a, b) => String(b.completed_at || b.updated_at || "").localeCompare(String(a.completed_at || a.updated_at || "")))
      .map(taskView);
  }

  membersForList(listId) {
    return Array.from(this.members.get(listId).values())
      .map((member) =>
        memberView({
          email: member.email,
          role: member.role,
          can_share: member.can_share,
          display_name: this.users.get(member.email)?.display_name || displayNameFromEmail(member.email),
          created_at: member.created_at,
        }),
      )
      .sort(sortMembers);
  }

  ownerMemberForList(listId) {
    const list = this.lists.get(listId);
    const owner = list ? this.members.get(listId)?.get(list.owner_email) : null;
    if (!list || !owner) return [];
    return [
      memberView({
        email: owner.email,
        role: "owner",
        can_share: true,
        display_name: this.users.get(owner.email)?.display_name || displayNameFromEmail(owner.email),
        created_at: owner.created_at,
      }),
    ];
  }

  async deleteList(email, listId) {
    this.assertOwner(email, listId);
    const deletedTaskIds = new Set();
    for (const [taskId, task] of this.tasks.entries()) {
      if (task.list_id === listId) {
        deletedTaskIds.add(taskId);
        this.tasks.delete(taskId);
      }
    }
    for (const [key, taskId] of this.externalTaskRefs.entries()) {
      if (deletedTaskIds.has(taskId)) this.externalTaskRefs.delete(key);
    }
    this.activities = this.activities.filter((entry) => entry.list_id !== listId);
    this.members.delete(listId);
    this.lists.delete(listId);
    for (const key of [...this.accessRequests.keys()]) {
      if (key.startsWith(`${listId}:`)) this.accessRequests.delete(key);
    }
    return { ok: true };
  }

  async createTask(email, listId, payload) {
    this.ensureUserSync(email);
    this.assertAuthorized(email, listId);
    const task = {
      id: newId("task"),
      list_id: listId,
      title: validateTaskTitle(payload.title),
      due_date: normalizeDueDate(payload.due_date) ?? null,
      status: "open",
      created_by_email: normalizeEmail(email),
      completed_by_email: null,
      created_at: nowIso(),
      updated_at: nowIso(),
      completed_at: null,
      deleted_at: null,
      deleted_by_email: null,
      delete_reason: null,
      revision: 0,
      sort_order: this.nextOpenTaskSortOrder(listId),
    };
    this.tasks.set(task.id, task);
    this.touchList(listId);
    this.addActivitySync(listId, email, "created_task", { title: task.title });
    return taskView(task);
  }

  async createTaskFromExternalSource(email, payload) {
    const actor = this.ensureUserSync(email);
    const source = normalizeExternalSource(payload.source || "quick-actions");
    const externalId = normalizeExternalId(payload.external_id || payload.externalId);
    const refKey = externalTaskRefKey(actor.email, source, externalId);
    const existingTaskId = this.externalTaskRefs.get(refKey);
    if (existingTaskId) {
      const existing = this.tasks.get(existingTaskId);
      if (existing && !existing.deleted_at) {
        return {
          created: false,
          list: this.summary(this.lists.get(existing.list_id), actor.email),
          task: taskView(existing),
        };
      }
      this.externalTaskRefs.delete(refKey);
    }

    const list = this.findOrCreateOwnedListByTitle(actor.email, payload.list_title || payload.listTitle || "Quick Actions");
    const task = {
      id: newId("task"),
      list_id: list.id,
      title: validateTaskTitle(payload.title),
      due_date: normalizeDueDate(payload.due_date ?? payload.dueDate) ?? null,
      status: "open",
      created_by_email: actor.email,
      completed_by_email: null,
      created_at: nowIso(),
      updated_at: nowIso(),
      completed_at: null,
      deleted_at: null,
      deleted_by_email: null,
      delete_reason: null,
      revision: 0,
      sort_order: this.nextOpenTaskSortOrder(list.id),
    };
    this.tasks.set(task.id, task);
    this.externalTaskRefs.set(refKey, task.id);
    this.touchList(list.id);
    this.addActivitySync(list.id, actor.email, "created_task", {
      title: task.title,
      source,
      external_id: externalId,
    });
    return {
      created: true,
      list: this.summary(list, actor.email),
      task: taskView(task),
    };
  }

  async reorderOpenTasks(email, listId, taskIds) {
    this.ensureUserSync(email);
    this.assertAuthorized(email, listId);
    const orderedIds = uniqueTaskIds(taskIds);
    const tasks = Array.from(this.tasks.values()).filter(
      (task) => task.list_id === listId && task.status === "open" && !task.deleted_at,
    );
    if (orderedIds.length !== tasks.length || orderedIds.some((taskId) => !tasks.some((task) => task.id === taskId))) {
      throw new AppError(409, "Tasks changed on another device");
    }
    const reordered = orderedIds.map((taskId, index) => {
      const task = this.tasks.get(taskId);
      const next = { ...task, sort_order: (index + 1) * 1024 };
      this.tasks.set(taskId, next);
      return next;
    });
    this.touchList(listId);
    this.addActivitySync(listId, email, "reordered_tasks", { count: reordered.length });
    return { open_tasks: reordered.map(taskView) };
  }

  async getIdempotencyResponse(scope) {
    const saved = this.idempotency.get(String(scope));
    if (!saved) return null;
    return clonePlain(saved.response || saved);
  }

  async saveIdempotencyResponse(scope, response) {
    this.idempotency.set(String(scope), {
      created_at: nowIso(),
      response: clonePlain(response),
    });
  }

  async cleanupIdempotency({ olderThanHours = 72 } = {}) {
    const cutoff = Date.now() - Math.max(1, Number(olderThanHours) || 72) * 60 * 60 * 1000;
    let deleted = 0;
    for (const [scope, saved] of this.idempotency.entries()) {
      const createdAt = Date.parse(saved?.created_at || "");
      if (createdAt && createdAt < cutoff) {
        this.idempotency.delete(scope);
        deleted += 1;
      }
    }
    return { deleted_count: deleted };
  }

  async patchTask(email, taskId, patch) {
    this.ensureUserSync(email);
    const task = this.tasks.get(taskId);
    if (!task || task.deleted_at) throw new AppError(404, "Task not found");
    this.assertAuthorized(email, task.list_id);
    const expectedRevision = expectedRevisionFromPatch(patch);
    if (expectedRevision !== null && Number(task.revision || 0) !== expectedRevision) {
      throw new AppError(409, "Task changed on another device");
    }
    const next = { ...task };
    if (patch.title !== undefined) next.title = validateTaskTitle(patch.title);
    if (patch.due_date !== undefined) next.due_date = normalizeDueDate(patch.due_date);
    if (patch.status !== undefined) {
      if (!["open", "completed"].includes(patch.status)) throw new AppError(400, "Invalid task status");
      next.status = patch.status;
      next.completed_at = patch.status === "completed" ? nowIso() : null;
      next.completed_by_email = patch.status === "completed" ? normalizeEmail(email) : null;
      if (patch.status === "open" && task.status !== "open") next.sort_order = this.nextOpenTaskSortOrder(task.list_id);
    }
    next.updated_at = nowIso();
    next.revision = Number(task.revision || 0) + 1;
    this.tasks.set(taskId, next);
    this.touchList(next.list_id);
    this.addActivitySync(next.list_id, email, next.status === "completed" ? "completed_task" : "updated_task", {
      title: next.title,
    });
    return taskView(next);
  }

  async deleteTask(email, taskId, { expected_revision = null } = {}) {
    this.ensureUserSync(email);
    const task = this.tasks.get(taskId);
    if (!task || task.deleted_at) throw new AppError(404, "Task not found");
    this.assertAuthorized(email, task.list_id);
    const expectedRevision = normalizeExpectedRevision(expected_revision);
    if (expectedRevision !== null && Number(task.revision || 0) !== expectedRevision) {
      throw new AppError(409, "Task changed on another device");
    }
    if (task.status !== "completed") {
      const now = nowIso();
      this.tasks.set(taskId, {
        ...task,
        deleted_at: now,
        deleted_by_email: normalizeEmail(email),
        delete_reason: "task_deleted",
        updated_at: now,
        revision: Number(task.revision || 0) + 1,
      });
      this.touchList(task.list_id);
      this.addActivitySync(task.list_id, email, "deleted_task", {});
      return { ok: true, deleted_task_ids: [taskId], deleted_count: 1 };
    }
    return this.deleteCompletedTasks(email, task.list_id, [taskId]);
  }

  async deleteCompletedTasks(email, listId, taskIds = null) {
    this.ensureUserSync(email);
    this.assertAuthorized(email, listId);
    const now = nowIso();
    const requestedIds = Array.isArray(taskIds) ? [...new Set(taskIds.map(String).filter(Boolean))] : null;
    if (requestedIds && !requestedIds.length) return { ok: true, deleted_task_ids: [], deleted_count: 0 };
    const tasks = Array.from(this.tasks.values()).filter((task) => {
      if (task.list_id !== listId || task.status !== "completed" || task.deleted_at) return false;
      return requestedIds ? requestedIds.includes(task.id) : true;
    });
    if (requestedIds && tasks.length !== requestedIds.length) {
      throw new AppError(400, "Only completed tasks can be deleted");
    }
    for (const task of tasks) {
      this.tasks.set(task.id, {
        ...task,
        deleted_at: now,
        deleted_by_email: normalizeEmail(email),
        delete_reason: "completed_cleanup",
        updated_at: now,
        revision: Number(task.revision || 0) + 1,
      });
    }
    this.touchList(listId);
    this.addActivitySync(listId, email, "deleted_completed_tasks", { count: tasks.length });
    return { ok: true, deleted_task_ids: tasks.map((task) => task.id), deleted_count: tasks.length };
  }

  async restoreDeletedTasks(email, listId, taskIds) {
    this.ensureUserSync(email);
    this.assertAuthorized(email, listId);
    const requestedIds = [...new Set((taskIds || []).map(String).filter(Boolean))];
    if (!requestedIds.length) return { ok: true, restored_task_ids: [], restored_count: 0 };
    const now = nowIso();
    const restored = [];
    for (const taskId of requestedIds) {
      const task = this.tasks.get(taskId);
      if (!task || task.list_id !== listId || !task.deleted_at) continue;
      const next = {
        ...task,
        deleted_at: null,
        deleted_by_email: null,
        delete_reason: null,
        updated_at: now,
        revision: Number(task.revision || 0) + 1,
      };
      this.tasks.set(taskId, next);
      restored.push(next);
    }
    this.touchList(listId);
    this.addActivitySync(listId, email, "restored_completed_tasks", { count: restored.length });
    return {
      ok: true,
      restored_task_ids: restored.map((task) => task.id),
      restored_count: restored.length,
      restored_tasks: restored.map(taskView),
    };
  }

  async addMember(actorEmail, listId, memberEmail) {
    this.ensureUserSync(actorEmail);
    this.assertCanShare(actorEmail, listId);
    const user = this.ensureUserSync(memberEmail);
    const members = this.members.get(listId);
    const role = this.lists.get(listId).owner_email === user.email ? "owner" : "editor";
    const existing = members.get(user.email);
    members.set(user.email, {
      email: user.email,
      role,
      can_share: role === "owner" || Boolean(existing?.can_share),
      marker_color: existing?.marker_color || DEFAULT_LIST_MARKER_COLOR,
      marker_icon: existing?.marker_icon || DEFAULT_LIST_MARKER_ICON,
      created_at: existing?.created_at || nowIso(),
    });
    this.markAccessRequest(user.email, listId, "approved", actorEmail);
    this.touchList(listId);
    this.addActivitySync(listId, actorEmail, "added_member", { email: user.email });
    return this.getList(actorEmail, listId);
  }

  async requestAccess(requesterEmail, listId) {
    const requester = this.ensureUserSync(requesterEmail);
    if (!this.lists.has(listId)) return { ok: true, request_status: "pending" };
    if (this.isMember(requester.email, listId)) return { ok: true, request_status: "already_member" };
    const now = nowIso();
    const key = accessRequestKey(listId, requester.email);
    if (this.accessRequests.get(key)?.status === "pending") return { ok: true, request_status: "pending" };
    this.accessRequests.set(key, {
      list_id: listId,
      requester_email: requester.email,
      status: "pending",
      created_at: this.accessRequests.get(key)?.created_at || now,
      updated_at: now,
      resolved_at: null,
      resolved_by_email: null,
    });
    this.addActivitySync(listId, requester.email, "requested_access", { email: requester.email });
    return { ok: true, request_status: "pending" };
  }

  async approveAccessRequest(actorEmail, listId, requesterEmail) {
    this.ensureUserSync(actorEmail);
    this.assertCanShare(actorEmail, listId);
    const email = requireValidEmail(requesterEmail);
    const request = this.accessRequests.get(accessRequestKey(listId, email));
    if (!request || request.status !== "pending") throw new AppError(404, "Access request not found");
    const active = await this.addMember(actorEmail, listId, email);
    this.markAccessRequest(email, listId, "approved", actorEmail);
    this.addActivitySync(listId, actorEmail, "approved_access_request", { email });
    return active;
  }

  async declineAccessRequest(actorEmail, listId, requesterEmail) {
    this.ensureUserSync(actorEmail);
    this.assertCanShare(actorEmail, listId);
    const email = requireValidEmail(requesterEmail);
    const request = this.accessRequests.get(accessRequestKey(listId, email));
    if (!request || request.status !== "pending") throw new AppError(404, "Access request not found");
    this.markAccessRequest(email, listId, "declined", actorEmail);
    this.addActivitySync(listId, actorEmail, "declined_access_request", { email });
    return this.getList(actorEmail, listId);
  }

  async removeMember(ownerEmail, listId, memberEmail) {
    this.ensureUserSync(ownerEmail);
    this.assertOwner(ownerEmail, listId);
    const email = requireValidEmail(memberEmail);
    const list = this.lists.get(listId);
    if (email === list.owner_email) throw new AppError(400, "The owner cannot be removed from their list");
    this.members.get(listId).delete(email);
    this.touchList(listId);
    this.addActivitySync(listId, ownerEmail, "removed_member", { email });
    return this.getList(ownerEmail, listId);
  }

  async updateMemberSharing(ownerEmail, listId, memberEmail, canShare) {
    this.ensureUserSync(ownerEmail);
    this.assertOwner(ownerEmail, listId);
    const email = requireValidEmail(memberEmail);
    const members = this.members.get(listId);
    const member = members?.get(email);
    if (!member) throw new AppError(404, "Member not found");
    const list = this.lists.get(listId);
    if (email === list.owner_email || member.role === "owner") {
      throw new AppError(400, "The owner can always share this list");
    }
    members.set(email, { ...member, can_share: Boolean(canShare) });
    this.touchList(listId);
    this.addActivitySync(listId, ownerEmail, "updated_member_sharing", { email, can_share: Boolean(canShare) });
    return this.getList(ownerEmail, listId);
  }

  async allowAllMembersToShare(ownerEmail, listId) {
    this.ensureUserSync(ownerEmail);
    this.assertOwner(ownerEmail, listId);
    const members = this.members.get(listId);
    let count = 0;
    for (const [email, member] of members.entries()) {
      if (member.role === "owner") continue;
      if (!member.can_share) count += 1;
      members.set(email, { ...member, can_share: true });
    }
    this.touchList(listId);
    this.addActivitySync(listId, ownerEmail, "allowed_all_to_share", { count });
    return this.getList(ownerEmail, listId);
  }

  async updateListPreferences(email, listId, preferences) {
    this.ensureUserSync(email);
    this.assertAuthorized(email, listId);
    const marker = validateListMarkerPreferences(preferences);
    const normalized = normalizeEmail(email);
    const member = this.members.get(listId)?.get(normalized);
    if (!member) throw new AppError(403, "You do not have access to this list");
    this.members.get(listId).set(normalized, { ...member, ...marker });
    return { list: this.summary(this.lists.get(listId), normalized) };
  }

  findOrCreateOwnedListByTitle(ownerEmail, title) {
    const owner = this.ensureUserSync(ownerEmail);
    const cleanTitle = validateListTitle(title);
    const existing = Array.from(this.lists.values()).find(
      (list) => normalizeEmail(list.owner_email) === owner.email && list.title.toLowerCase() === cleanTitle.toLowerCase(),
    );
    if (existing) return existing;

    const list = {
      id: newId("list"),
      title: cleanTitle,
      owner_email: owner.email,
      created_at: nowIso(),
      updated_at: nowIso(),
      revision: 0,
    };
    this.lists.set(list.id, list);
    this.members.set(
      list.id,
      new Map([
        [
          owner.email,
          {
            email: owner.email,
            role: "owner",
            can_share: true,
            marker_color: DEFAULT_LIST_MARKER_COLOR,
            marker_icon: DEFAULT_LIST_MARKER_ICON,
            created_at: nowIso(),
          },
        ],
      ]),
    );
    this.addActivitySync(list.id, owner.email, "created_list", { title: list.title, source: "quick-actions" });
    return list;
  }

  summary(list, currentUserEmail) {
    const listTasks = Array.from(this.tasks.values()).filter((task) => task.list_id === list.id && !task.deleted_at);
    const currentMembership = this.members.get(list.id)?.get(normalizeEmail(currentUserEmail));
    const canShare = currentMembership?.role === "owner" || Boolean(currentMembership?.can_share);
    return listSummaryFromRecord(
      {
        ...list,
        owner_name: this.users.get(list.owner_email)?.display_name,
        current_user_can_share: canShare,
        marker_color: currentMembership?.marker_color,
        marker_icon: currentMembership?.marker_icon,
        member_count: this.members.get(list.id)?.size || 0,
        open_task_count: listTasks.filter((task) => task.status === "open").length,
        completed_task_count: listTasks.filter((task) => task.status === "completed").length,
        pending_access_request_count: canShare ? this.pendingAccessRequestCount(list.id) : 0,
      },
      currentUserEmail,
    );
  }

  pendingAccessRequestCount(listId) {
    return Array.from(this.accessRequests.values()).filter(
      (request) => request.list_id === listId && request.status === "pending",
    ).length;
  }

  accessRequestsForList(email, listId) {
    try {
      this.assertCanShare(email, listId);
    } catch {
      return [];
    }
    return Array.from(this.accessRequests.values())
      .filter((request) => request.list_id === listId && request.status === "pending")
      .sort((a, b) => String(a.created_at || "").localeCompare(String(b.created_at || "")))
      .map((request) =>
        accessRequestView({
          ...request,
          display_name: this.users.get(request.requester_email)?.display_name,
        }),
      );
  }

  markAccessRequest(requesterEmail, listId, status, actorEmail) {
    const key = accessRequestKey(listId, requesterEmail);
    const request = this.accessRequests.get(key);
    if (!request) return;
    const now = nowIso();
    this.accessRequests.set(key, {
      ...request,
      status,
      updated_at: now,
      resolved_at: now,
      resolved_by_email: normalizeEmail(actorEmail),
    });
  }

  touchList(listId) {
    const list = this.lists.get(listId);
    if (list) {
      list.updated_at = nowIso();
      list.revision = Number(list.revision || 0) + 1;
    }
  }

  nextOpenTaskSortOrder(listId) {
    return (
      Math.max(
        0,
        ...Array.from(this.tasks.values())
          .filter((task) => task.list_id === listId && task.status === "open" && !task.deleted_at)
          .map((task) => Number(task.sort_order || 0)),
      ) + 1024
    );
  }

  addActivitySync(listId, actorEmail, action, metadata) {
    this.activities.push({
      id: this.activities.length + 1,
      list_id: listId,
      actor_email: normalizeEmail(actorEmail),
      actor_name: displayNameFromEmail(actorEmail),
      action,
      metadata: metadata ? JSON.stringify(metadata) : null,
      created_at: nowIso(),
    });
  }
}

export function nowIso() {
  return new Date().toISOString();
}

function accessRequestKey(listId, email) {
  return `${listId}:${normalizeEmail(email)}`;
}

function clonePlain(value) {
  return value == null ? null : JSON.parse(JSON.stringify(value));
}

export function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function taskView(task) {
  return {
    id: task.id,
    list_id: task.list_id,
    title: task.title,
    due_date: task.due_date || null,
    status: task.status,
    created_by_email: task.created_by_email,
    completed_by_email: task.completed_by_email || null,
    created_at: task.created_at,
    updated_at: task.updated_at,
    completed_at: task.completed_at || null,
    revision: Number(task.revision || 0),
    sort_order: Number(task.sort_order || 0),
  };
}

export function memberView(member) {
  return {
    email: member.email,
    role: member.role,
    can_share: member.role === "owner" || toBoolean(member.can_share),
    display_name: member.display_name || displayNameFromEmail(member.email),
    created_at: member.created_at,
  };
}

function sortOpenTasks(a, b) {
  const order = Number(a.sort_order || 0) - Number(b.sort_order || 0);
  if (order !== 0) return order;
  const created = String(a.created_at).localeCompare(String(b.created_at));
  if (created !== 0) return created;
  return String(a.id).localeCompare(String(b.id));
}

function uniqueTaskIds(taskIds) {
  if (!Array.isArray(taskIds)) throw new AppError(400, "task_ids must be an array");
  return [...new Set(taskIds.map(String).filter(Boolean))];
}

function sortMembers(a, b) {
  if (a.role === "owner" && b.role !== "owner") return -1;
  if (a.role !== "owner" && b.role === "owner") return 1;
  const createdOrder = String(a.created_at || "").localeCompare(String(b.created_at || ""));
  if (createdOrder) return createdOrder;
  return String(a.display_name || a.email).localeCompare(String(b.display_name || b.email));
}

function sortPeopleSearchResults(a, b, query) {
  const rankA = peopleRank(a, query);
  const rankB = peopleRank(b, query);
  if (rankA !== rankB) return rankA - rankB;
  return String(a.display_name || a.email).localeCompare(String(b.display_name || b.email));
}

function peopleRank(user, query) {
  const email = normalizeEmail(user.email);
  const localPart = email.split("@")[0] || "";
  const displayName = normalizePeopleQuery(user.display_name);
  const fullName = normalizePeopleQuery(user.full_name);
  const slackHandle = normalizePeopleQuery(user.slack_handle);
  const aliases = parseAliases(user.aliases_json);
  if (email === query || localPart === query) return 0;
  if (email.startsWith(query) || localPart.startsWith(query)) return 1;
  if (fullName.startsWith(query) || displayName.startsWith(query) || slackHandle.startsWith(query) || aliases.some((alias) => alias.startsWith(query))) return 2;
  return 3;
}

function normalizeSeededPeopleProfile(profile) {
  if (!profile?.full_name && !profile?.fullName) return {};
  return normalizePeopleProfile(profile, { syncedAt: profile.profile_synced_at || profile.profileSyncedAt || nowIso() });
}

function normalizeProfileText(value, label, maxLength) {
  const normalized = String(value || "").trim().replace(/\s+/g, " ");
  if (normalized.length > maxLength || /[\r\n]/.test(normalized)) {
    throw new AppError(400, `${label} is invalid`);
  }
  return normalized;
}

function normalizeOptionalProfileValue(value, label, maxLength) {
  return normalizeProfileText(value, label, maxLength);
}

function parseAliases(value) {
  try {
    const parsed = Array.isArray(value) ? value : JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizePeopleQuery).filter(Boolean).slice(0, 20) : [];
  } catch {
    return [];
  }
}

function normalizeAuditTerms(terms) {
  return [...new Set((terms || []).map(normalizePeopleQuery).filter((term) => term.length >= 2))];
}

export function normalizeExternalSource(value) {
  const source = String(value || "").trim().toLowerCase();
  if (!/^[a-z0-9_-]{2,40}$/.test(source)) {
    throw new AppError(400, "External source is invalid");
  }
  return source;
}

export function normalizeExternalId(value) {
  const id = String(value || "").trim();
  if (!id || id.length > 200 || /[\r\n]/.test(id)) {
    throw new AppError(400, "External id is invalid");
  }
  return id;
}

export function externalTaskRefKey(ownerEmail, source, externalId) {
  return `${normalizeEmail(ownerEmail)}:${normalizeExternalSource(source)}:${normalizeExternalId(externalId)}`;
}
