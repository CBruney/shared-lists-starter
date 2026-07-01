import {
  AppError,
  DEFAULT_LIST_MARKER_COLOR,
  DEFAULT_LIST_MARKER_ICON,
  accessRequestView,
  contactSourceView,
  displayNameFromEmail,
  listSummaryFromRecord,
  memberView,
  newId,
  normalizeExternalId,
  normalizeExternalSource,
  normalizeDueDate,
  normalizeEmail,
  normalizeExpectedRevision,
  normalizePeopleProfileBatch,
  normalizePeopleQuery,
  normalizePrivateContactBatch,
  partitionLists,
  PRIVATE_CONTACT_INDEX_LIMIT,
  PEOPLE_SEARCH_LIMIT,
  peopleIndexView,
  peopleProfileAdminView,
  peopleSearchView,
  privateContactIndexView,
  privateContactSearchView,
  requireValidEmail,
  taskView,
  validateListTitle,
  validateListMarkerPreferences,
  validateTaskTitle,
} from "./shared-lists-core.mjs";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY NOT NULL,
    display_name TEXT NOT NULL,
    full_name TEXT,
    slack_user_id TEXT,
    slack_handle TEXT,
    aliases_json TEXT NOT NULL DEFAULT '[]',
    profile_source TEXT NOT NULL DEFAULT 'shared-lists',
    profile_synced_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revision INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (owner_email) REFERENCES users(email)
  )`,
  `CREATE TABLE IF NOT EXISTS list_members (
    list_id TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor',
    can_share INTEGER NOT NULL DEFAULT 0,
    marker_color TEXT NOT NULL DEFAULT '${DEFAULT_LIST_MARKER_COLOR}',
    marker_icon TEXT NOT NULL DEFAULT '${DEFAULT_LIST_MARKER_ICON}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (list_id, email),
    FOREIGN KEY (list_id) REFERENCES lists(id),
    FOREIGN KEY (email) REFERENCES users(email)
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    list_id TEXT NOT NULL,
    title TEXT NOT NULL,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed')),
    created_by_email TEXT NOT NULL,
    completed_by_email TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    deleted_at TEXT,
    deleted_by_email TEXT,
    delete_reason TEXT,
    revision INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (list_id) REFERENCES lists(id),
    FOREIGN KEY (created_by_email) REFERENCES users(email),
    FOREIGN KEY (completed_by_email) REFERENCES users(email),
    FOREIGN KEY (deleted_by_email) REFERENCES users(email)
  )`,
  `CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id),
    FOREIGN KEY (actor_email) REFERENCES users(email)
  )`,
  `CREATE TABLE IF NOT EXISTS idempotency_keys (
    scope TEXT PRIMARY KEY NOT NULL,
    status INTEGER NOT NULL,
    response_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS task_external_refs (
    owner_email TEXT NOT NULL,
    source TEXT NOT NULL,
    external_id TEXT NOT NULL,
    task_id TEXT NOT NULL,
    list_id TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (owner_email, source, external_id),
    FOREIGN KEY (owner_email) REFERENCES users(email),
    FOREIGN KEY (task_id) REFERENCES tasks(id),
    FOREIGN KEY (list_id) REFERENCES lists(id)
  )`,
  `CREATE TABLE IF NOT EXISTS list_access_requests (
    list_id TEXT NOT NULL,
    requester_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT,
    resolved_by_email TEXT,
    PRIMARY KEY (list_id, requester_email),
    FOREIGN KEY (list_id) REFERENCES lists(id),
    FOREIGN KEY (requester_email) REFERENCES users(email),
    FOREIGN KEY (resolved_by_email) REFERENCES users(email)
  )`,
  `CREATE TABLE IF NOT EXISTS user_contact_sources (
    owner_email TEXT NOT NULL,
    provider TEXT NOT NULL,
    encrypted_refresh_token TEXT,
    account_email TEXT,
    contact_count INTEGER NOT NULL DEFAULT 0,
    sync_token TEXT,
    last_synced_at TEXT,
    sync_status TEXT NOT NULL DEFAULT 'idle',
    error_message TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (owner_email, provider),
    FOREIGN KEY (owner_email) REFERENCES users(email)
  )`,
  `CREATE TABLE IF NOT EXISTS user_contacts (
    owner_email TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_contact_id TEXT NOT NULL,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    search_terms_json TEXT NOT NULL DEFAULT '[]',
    synced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (owner_email, provider, email),
    FOREIGN KEY (owner_email) REFERENCES users(email)
  )`,
  `CREATE TABLE IF NOT EXISTS contact_oauth_states (
    state TEXT PRIMARY KEY NOT NULL,
    owner_email TEXT NOT NULL,
    provider TEXT NOT NULL,
    code_verifier TEXT NOT NULL,
    redirect_to TEXT NOT NULL DEFAULT '/',
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_email) REFERENCES users(email)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_lists_owner_email ON lists(owner_email)`,
  `CREATE INDEX IF NOT EXISTS idx_list_members_email ON list_members(email)`,
  `CREATE INDEX IF NOT EXISTS idx_list_members_email_list ON list_members(email, list_id)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_list_status ON tasks(list_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_list_created ON activity(list_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_list_created_id ON activity(list_id, created_at DESC, id DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_idempotency_keys_created_at ON idempotency_keys(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_task_external_refs_task ON task_external_refs(task_id)`,
  `CREATE INDEX IF NOT EXISTS idx_task_external_refs_list ON task_external_refs(list_id)`,
  `CREATE INDEX IF NOT EXISTS idx_list_access_requests_list_status ON list_access_requests(list_id, status, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_list_access_requests_requester_status ON list_access_requests(requester_email, status)`,
  `CREATE INDEX IF NOT EXISTS idx_user_contacts_owner_provider_name ON user_contacts(owner_email, provider, display_name)`,
  `CREATE INDEX IF NOT EXISTS idx_contact_oauth_states_expires ON contact_oauth_states(expires_at)`,
];

let schemaReady = null;

export class D1Store {
  constructor(db, { runtimeSchemaBootstrap = false } = {}) {
    if (!db) throw new Error("D1 binding DB is required");
    this.db = db;
    this.runtimeSchemaBootstrap = runtimeSchemaBootstrap;
  }

  async ensureReady() {
    if (!this.runtimeSchemaBootstrap) return;
    if (!schemaReady) {
      schemaReady = (async () => {
        for (const statement of SCHEMA) {
          await this.db.prepare(statement).run();
        }
        const userColumnsResult = await this.db.prepare(`PRAGMA table_info(users)`).all();
        const userColumns = userColumnsResult.results || [];
        const userColumnNames = new Set(userColumns.map((column) => column.name));
        const profileColumns = [
          ["full_name", "TEXT"],
          ["slack_user_id", "TEXT"],
          ["slack_handle", "TEXT"],
          ["aliases_json", "TEXT NOT NULL DEFAULT '[]'"],
          ["profile_source", "TEXT NOT NULL DEFAULT 'shared-lists'"],
          ["profile_synced_at", "TEXT"],
        ];
        for (const [name, definition] of profileColumns) {
          if (!userColumnNames.has(name)) {
            await this.db.prepare(`ALTER TABLE users ADD COLUMN ${name} ${definition}`).run();
          }
        }
        const columnsResult = await this.db.prepare(`PRAGMA table_info(list_members)`).all();
        const columns = columnsResult.results || [];
        if (!columns.some((column) => column.name === "can_share")) {
          await this.db.prepare(`ALTER TABLE list_members ADD COLUMN can_share INTEGER NOT NULL DEFAULT 0`).run();
        }
        if (!columns.some((column) => column.name === "marker_color")) {
          await this.db
            .prepare(`ALTER TABLE list_members ADD COLUMN marker_color TEXT NOT NULL DEFAULT '${DEFAULT_LIST_MARKER_COLOR}'`)
            .run();
        }
        if (!columns.some((column) => column.name === "marker_icon")) {
          await this.db
            .prepare(`ALTER TABLE list_members ADD COLUMN marker_icon TEXT NOT NULL DEFAULT '${DEFAULT_LIST_MARKER_ICON}'`)
            .run();
        }
        const taskColumnsResult = await this.db.prepare(`PRAGMA table_info(tasks)`).all();
        const taskColumns = taskColumnsResult.results || [];
        const taskColumnNames = new Set(taskColumns.map((column) => column.name));
        const listColumnsResult = await this.db.prepare(`PRAGMA table_info(lists)`).all();
        const listColumns = listColumnsResult.results || [];
        const listColumnNames = new Set(listColumns.map((column) => column.name));
        if (!listColumnNames.has("revision")) {
          await this.db.prepare(`ALTER TABLE lists ADD COLUMN revision INTEGER NOT NULL DEFAULT 0`).run();
        }
        if (!taskColumnNames.has("deleted_at")) {
          await this.db.prepare(`ALTER TABLE tasks ADD COLUMN deleted_at TEXT`).run();
        }
        if (!taskColumnNames.has("deleted_by_email")) {
          await this.db.prepare(`ALTER TABLE tasks ADD COLUMN deleted_by_email TEXT`).run();
        }
        if (!taskColumnNames.has("delete_reason")) {
          await this.db.prepare(`ALTER TABLE tasks ADD COLUMN delete_reason TEXT`).run();
        }
        if (!taskColumnNames.has("revision")) {
          await this.db.prepare(`ALTER TABLE tasks ADD COLUMN revision INTEGER NOT NULL DEFAULT 0`).run();
        }
        if (!taskColumnNames.has("sort_order")) {
          await this.db.prepare(`ALTER TABLE tasks ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0`).run();
          await this.db
            .prepare(
              `WITH ordered AS (
                 SELECT
                   id,
                   ROW_NUMBER() OVER (
                     PARTITION BY list_id
                     ORDER BY COALESCE(due_date, '9999-12-31'), created_at, id
                   ) * 1024 AS next_sort_order
                 FROM tasks
                 WHERE status = 'open' AND deleted_at IS NULL
               )
               UPDATE tasks
               SET sort_order = (
                 SELECT next_sort_order
                 FROM ordered
                 WHERE ordered.id = tasks.id
               )
               WHERE id IN (SELECT id FROM ordered)`,
            )
            .run();
        }
        await this.db.prepare(`CREATE INDEX IF NOT EXISTS idx_tasks_list_status_deleted ON tasks(list_id, status, deleted_at)`).run();
        await this.db
          .prepare(
            `CREATE INDEX IF NOT EXISTS idx_tasks_open_list_due_created
             ON tasks(list_id, due_date, created_at)
             WHERE status = 'open' AND deleted_at IS NULL`,
          )
          .run();
        await this.db
          .prepare(
            `CREATE INDEX IF NOT EXISTS idx_tasks_open_list_sort_order
             ON tasks(list_id, sort_order, created_at)
             WHERE status = 'open' AND deleted_at IS NULL`,
          )
          .run();
        await this.db
          .prepare(
            `CREATE INDEX IF NOT EXISTS idx_tasks_completed_list_completed
             ON tasks(list_id, completed_at DESC, updated_at DESC)
             WHERE status = 'completed' AND deleted_at IS NULL`,
          )
          .run();
        await this.db
          .prepare(
            `UPDATE list_members
             SET can_share = 1
             WHERE role = 'owner'
                OR EXISTS (
                  SELECT 1 FROM lists
                  WHERE lists.id = list_members.list_id
                    AND lists.owner_email = list_members.email
                )`,
          )
          .run();
      })().catch((error) => {
        schemaReady = null;
        throw error;
      });
    }
    return schemaReady;
  }

  async prepare(sql, ...params) {
    await this.ensureReady();
    return this.db.prepare(sql).bind(...params);
  }

  async run(sql, ...params) {
    const statement = await this.prepare(sql, ...params);
    return statement.run();
  }

  async batchRun(statements) {
    await this.ensureReady();
    if (typeof this.db.batch === "function") {
      const prepared = statements.map(([sql, ...params]) => this.db.prepare(sql).bind(...params));
      return this.db.batch(prepared);
    }
    for (const [sql, ...params] of statements) {
      await this.run(sql, ...params);
    }
    return [];
  }

  async batchAll(statements) {
    await this.ensureReady();
    const prepared = statements.map(([sql, ...params]) => this.db.prepare(sql).bind(...params));
    const results = typeof this.db.batch === "function"
      ? await this.db.batch(prepared)
      : await Promise.all(prepared.map((statement) => statement.all()));
    return results.map((result) => result?.results || []);
  }

  async first(sql, ...params) {
    const statement = await this.prepare(sql, ...params);
    return statement.first();
  }

  async all(sql, ...params) {
    const statement = await this.prepare(sql, ...params);
    const result = await statement.all();
    return result.results || [];
  }

  async ensureUser(email) {
    const normalized = requireValidEmail(email);
    const displayName = displayNameFromEmail(normalized);
    await this.run(
      `INSERT INTO users (email, display_name)
       VALUES (?, ?)
       ON CONFLICT(email) DO UPDATE SET
         updated_at = CURRENT_TIMESTAMP`,
      normalized,
      displayName,
    );
    return this.first(
      `SELECT email, display_name, full_name, slack_user_id, slack_handle, aliases_json, profile_source, profile_synced_at
       FROM users
       WHERE email = ?`,
      normalized,
    );
  }

  async hasAnyLists() {
    return Boolean(await this.first(`SELECT 1 AS value FROM lists LIMIT 1`));
  }

  async searchPeople(query, { limit = PEOPLE_SEARCH_LIMIT } = {}) {
    const normalized = normalizePeopleQuery(query);
    if (normalized.length < 2) return [];
    const cappedLimit = Math.min(Math.max(Number(limit) || PEOPLE_SEARCH_LIMIT, 1), PEOPLE_SEARCH_LIMIT);
    const contains = `%${escapeSqlLike(normalized)}%`;
    const prefix = `${escapeSqlLike(normalized)}%`;
    const rows = await this.all(
      `SELECT email, display_name, full_name, slack_user_id, slack_handle, aliases_json, profile_source, profile_synced_at
       FROM users
       WHERE LOWER(email) LIKE ? ESCAPE '\\'
          OR LOWER(display_name) LIKE ? ESCAPE '\\'
          OR LOWER(SUBSTR(email, 1, INSTR(email, '@') - 1)) LIKE ? ESCAPE '\\'
          OR LOWER(COALESCE(full_name, '')) LIKE ? ESCAPE '\\'
          OR LOWER(COALESCE(slack_handle, '')) LIKE ? ESCAPE '\\'
          OR LOWER(COALESCE(aliases_json, '[]')) LIKE ? ESCAPE '\\'
       ORDER BY
         CASE
           WHEN LOWER(email) = ? THEN 0
           WHEN LOWER(SUBSTR(email, 1, INSTR(email, '@') - 1)) = ? THEN 0
           WHEN LOWER(email) LIKE ? ESCAPE '\\' THEN 1
           WHEN LOWER(SUBSTR(email, 1, INSTR(email, '@') - 1)) LIKE ? ESCAPE '\\' THEN 1
           WHEN LOWER(COALESCE(full_name, '')) LIKE ? ESCAPE '\\' THEN 2
           WHEN LOWER(display_name) LIKE ? ESCAPE '\\' THEN 2
           WHEN LOWER(COALESCE(slack_handle, '')) LIKE ? ESCAPE '\\' THEN 2
           WHEN LOWER(COALESCE(aliases_json, '[]')) LIKE ? ESCAPE '\\' THEN 2
           ELSE 3
         END,
         LOWER(COALESCE(full_name, display_name)),
         LOWER(email)
       LIMIT ?`,
      contains,
      contains,
      contains,
      contains,
      contains,
      contains,
      normalized,
      normalized,
      prefix,
      prefix,
      prefix,
      prefix,
      prefix,
      prefix,
      cappedLimit,
    );
    return rows.map(peopleSearchView);
  }

  async getPeopleIndex() {
    const rows = await this.all(
      `SELECT email, display_name, full_name, slack_handle, aliases_json
       FROM users
       ORDER BY LOWER(COALESCE(full_name, display_name)), LOWER(email)`,
    );
    return rows.map(peopleIndexView);
  }

  async searchPeopleForUser(userEmail, query, { limit = PEOPLE_SEARCH_LIMIT } = {}) {
    const viewer = requireValidEmail(userEmail, "current user");
    const normalized = normalizePeopleQuery(query);
    if (normalized.length < 2) return [];
    const cappedLimit = Math.min(Math.max(Number(limit) || PEOPLE_SEARCH_LIMIT, 1), PEOPLE_SEARCH_LIMIT);
    const contains = `%${escapeSqlLike(normalized)}%`;
    const prefix = `${escapeSqlLike(normalized)}%`;
    const rows = await this.all(
      `WITH visible_people AS (
         SELECT DISTINCT
           users.email,
           users.display_name,
           users.full_name,
           users.slack_user_id,
           users.slack_handle,
           users.aliases_json,
           users.profile_source,
           users.profile_synced_at
         FROM list_members viewer
         INNER JOIN list_members peer ON peer.list_id = viewer.list_id
         INNER JOIN users ON users.email = peer.email
         WHERE viewer.email = ?
           AND peer.email <> ?
       )
       SELECT email, display_name, full_name, slack_user_id, slack_handle, aliases_json, profile_source, profile_synced_at
       FROM visible_people
       WHERE LOWER(email) LIKE ? ESCAPE '\\'
          OR LOWER(display_name) LIKE ? ESCAPE '\\'
          OR LOWER(SUBSTR(email, 1, INSTR(email, '@') - 1)) LIKE ? ESCAPE '\\'
          OR LOWER(COALESCE(full_name, '')) LIKE ? ESCAPE '\\'
          OR LOWER(COALESCE(slack_handle, '')) LIKE ? ESCAPE '\\'
          OR LOWER(COALESCE(aliases_json, '[]')) LIKE ? ESCAPE '\\'
       ORDER BY
         CASE
           WHEN LOWER(email) = ? THEN 0
           WHEN LOWER(SUBSTR(email, 1, INSTR(email, '@') - 1)) = ? THEN 0
           WHEN LOWER(email) LIKE ? ESCAPE '\\' THEN 1
           WHEN LOWER(SUBSTR(email, 1, INSTR(email, '@') - 1)) LIKE ? ESCAPE '\\' THEN 1
           WHEN LOWER(COALESCE(full_name, '')) LIKE ? ESCAPE '\\' THEN 2
           WHEN LOWER(display_name) LIKE ? ESCAPE '\\' THEN 2
           WHEN LOWER(COALESCE(slack_handle, '')) LIKE ? ESCAPE '\\' THEN 2
           WHEN LOWER(COALESCE(aliases_json, '[]')) LIKE ? ESCAPE '\\' THEN 2
           ELSE 3
         END,
         LOWER(COALESCE(full_name, display_name)),
         LOWER(email)
       LIMIT ?`,
      viewer,
      viewer,
      contains,
      contains,
      contains,
      contains,
      contains,
      contains,
      normalized,
      normalized,
      prefix,
      prefix,
      prefix,
      prefix,
      prefix,
      prefix,
      cappedLimit,
    );
    return rows.map(peopleSearchView);
  }

  async getPeopleIndexForUser(userEmail) {
    const viewer = requireValidEmail(userEmail, "current user");
    const rows = await this.all(
      `WITH visible_people AS (
         SELECT DISTINCT users.email, users.display_name, users.full_name, users.slack_handle, users.aliases_json
         FROM list_members viewer
         INNER JOIN list_members peer ON peer.list_id = viewer.list_id
         INNER JOIN users ON users.email = peer.email
         WHERE viewer.email = ?
           AND peer.email <> ?
       )
       SELECT email, display_name, full_name, slack_handle, aliases_json
       FROM visible_people
       ORDER BY LOWER(COALESCE(full_name, display_name)), LOWER(email)`,
      viewer,
      viewer,
    );
    return rows.map(peopleIndexView);
  }

  async searchPrivateContacts(ownerEmail, query, { provider = "google", limit = PEOPLE_SEARCH_LIMIT } = {}) {
    const owner = requireValidEmail(ownerEmail, "contact owner");
    const normalized = normalizePeopleQuery(query);
    if (normalized.length < 2) return [];
    const cappedLimit = Math.min(Math.max(Number(limit) || PEOPLE_SEARCH_LIMIT, 1), PEOPLE_SEARCH_LIMIT);
    const contains = `%${escapeSqlLike(normalized)}%`;
    const prefix = `${escapeSqlLike(normalized)}%`;
    const rows = await this.all(
      `SELECT email, display_name, search_terms_json, provider, 'Your Google contacts' AS source_label
       FROM user_contacts
       WHERE owner_email = ? AND provider = ?
         AND (
           LOWER(email) LIKE ? ESCAPE '\\'
           OR LOWER(display_name) LIKE ? ESCAPE '\\'
           OR LOWER(search_terms_json) LIKE ? ESCAPE '\\'
         )
       ORDER BY
         CASE
           WHEN LOWER(email) = ? THEN 0
           WHEN LOWER(email) LIKE ? ESCAPE '\\' THEN 1
           WHEN LOWER(display_name) LIKE ? ESCAPE '\\' THEN 2
           WHEN LOWER(search_terms_json) LIKE ? ESCAPE '\\' THEN 2
           ELSE 3
         END,
         LOWER(display_name),
         LOWER(email)
       LIMIT ?`,
      owner,
      provider,
      contains,
      contains,
      contains,
      normalized,
      prefix,
      prefix,
      prefix,
      cappedLimit,
    );
    return rows.map(privateContactSearchView);
  }

  async getPrivateContactIndex(ownerEmail, { provider = "google", limit = PRIVATE_CONTACT_INDEX_LIMIT } = {}) {
    const owner = requireValidEmail(ownerEmail, "contact owner");
    const cappedLimit = Math.min(Math.max(Number(limit) || PRIVATE_CONTACT_INDEX_LIMIT, 1), PRIVATE_CONTACT_INDEX_LIMIT);
    const rows = await this.all(
      `SELECT email, display_name, search_terms_json, provider, 'Your Google contacts' AS source_label
       FROM user_contacts
       WHERE owner_email = ? AND provider = ?
       ORDER BY LOWER(display_name), LOWER(email)
       LIMIT ?`,
      owner,
      provider,
      cappedLimit,
    );
    return rows.map(privateContactIndexView);
  }

  async getContactSource(ownerEmail, provider = "google") {
    const owner = requireValidEmail(ownerEmail, "contact owner");
    const source = await this.first(
      `SELECT
          source.*,
          (SELECT COUNT(*) FROM user_contacts contacts WHERE contacts.owner_email = source.owner_email AND contacts.provider = source.provider) AS contact_count
       FROM user_contact_sources source
       WHERE source.owner_email = ? AND source.provider = ?`,
      owner,
      provider,
    );
    return source ? contactSourceView(source, { provider }) : contactSourceView({}, { provider });
  }

  async getContactSourceSecret(ownerEmail, provider = "google") {
    const owner = requireValidEmail(ownerEmail, "contact owner");
    return this.first(
      `SELECT owner_email, provider, encrypted_refresh_token, account_email, sync_token, last_synced_at
       FROM user_contact_sources
       WHERE owner_email = ? AND provider = ?`,
      owner,
      provider,
    );
  }

  async upsertContactSource(ownerEmail, provider, patch = {}) {
    const owner = requireValidEmail(ownerEmail, "contact owner");
    const now = new Date().toISOString();
    await this.ensureUser(owner);
    await this.run(
      `INSERT INTO user_contact_sources (
         owner_email, provider, encrypted_refresh_token, account_email, contact_count,
         sync_token, last_synced_at, sync_status, error_message, created_at, updated_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(owner_email, provider) DO UPDATE SET
         encrypted_refresh_token = COALESCE(excluded.encrypted_refresh_token, user_contact_sources.encrypted_refresh_token),
         account_email = COALESCE(excluded.account_email, user_contact_sources.account_email),
         contact_count = COALESCE(excluded.contact_count, user_contact_sources.contact_count),
         sync_token = COALESCE(excluded.sync_token, user_contact_sources.sync_token),
         last_synced_at = COALESCE(excluded.last_synced_at, user_contact_sources.last_synced_at),
         sync_status = excluded.sync_status,
         error_message = excluded.error_message,
         updated_at = excluded.updated_at`,
      owner,
      provider,
      patch.encrypted_refresh_token || null,
      patch.account_email || null,
      patch.contact_count === undefined ? null : Number(patch.contact_count || 0),
      patch.sync_token || null,
      patch.last_synced_at || null,
      patch.sync_status || "idle",
      patch.error_message || "",
      now,
      now,
    );
    return this.getContactSource(owner, provider);
  }

  async disconnectContactSource(ownerEmail, provider = "google") {
    const owner = requireValidEmail(ownerEmail, "contact owner");
    await this.batchRun([
      [`DELETE FROM user_contacts WHERE owner_email = ? AND provider = ?`, owner, provider],
      [`DELETE FROM user_contact_sources WHERE owner_email = ? AND provider = ?`, owner, provider],
      [`DELETE FROM contact_oauth_states WHERE owner_email = ? AND provider = ?`, owner, provider],
    ]);
    return contactSourceView({}, { provider });
  }

  async replacePrivateContacts(ownerEmail, provider, contacts, { syncedAt = new Date().toISOString(), syncToken = null, accountEmail = "" } = {}) {
    const owner = requireValidEmail(ownerEmail, "contact owner");
    const normalizedContacts = normalizePrivateContactBatch(contacts, { ownerEmail: owner, provider, syncedAt });
    await this.ensureUser(owner);
    const statements = [
      [`DELETE FROM user_contacts WHERE owner_email = ? AND provider = ?`, owner, provider],
      ...normalizedContacts.map((contact) => [
        `INSERT INTO user_contacts (owner_email, provider, provider_contact_id, email, display_name, search_terms_json, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        contact.owner_email,
        contact.provider,
        contact.provider_contact_id,
        contact.email,
        contact.display_name,
        contact.search_terms_json,
        contact.synced_at,
      ]),
    ];
    await this.batchRun(statements);
    await this.upsertContactSource(owner, provider, {
      account_email: accountEmail,
      contact_count: normalizedContacts.length,
      sync_token: syncToken || null,
      last_synced_at: syncedAt,
      sync_status: "ok",
      error_message: "",
    });
    return {
      contact_count: normalizedContacts.length,
      contacts: normalizedContacts.map(privateContactIndexView),
    };
  }

  async createContactOAuthState(ownerEmail, state) {
    const owner = requireValidEmail(ownerEmail, "contact owner");
    await this.ensureUser(owner);
    await this.cleanupExpiredContactOAuthStates();
    await this.run(
      `INSERT INTO contact_oauth_states (state, owner_email, provider, code_verifier, redirect_to, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      state.state,
      owner,
      state.provider || "google",
      state.code_verifier,
      state.redirect_to || "/",
      state.expires_at,
    );
    return state;
  }

  async consumeContactOAuthState(ownerEmail, stateValue) {
    const owner = requireValidEmail(ownerEmail, "contact owner");
    const state = await this.first(
      `SELECT state, owner_email, provider, code_verifier, redirect_to, expires_at
       FROM contact_oauth_states
       WHERE state = ? AND owner_email = ?`,
      String(stateValue || ""),
      owner,
    );
    if (!state) return null;
    await this.run(`DELETE FROM contact_oauth_states WHERE state = ?`, state.state);
    if (new Date(state.expires_at).getTime() < Date.now()) return null;
    return state;
  }

  async cleanupExpiredContactOAuthStates() {
    await this.run(`DELETE FROM contact_oauth_states WHERE expires_at < ?`, new Date().toISOString());
  }

  async getPeopleProfiles() {
    const rows = await this.all(
      `SELECT email, display_name, full_name, slack_user_id, slack_handle, aliases_json, profile_source, profile_synced_at
       FROM users
       ORDER BY LOWER(COALESCE(full_name, display_name)), LOWER(email)`,
    );
    return rows.map(peopleProfileAdminView);
  }

  async importPeopleProfiles(profiles, { syncedAt = new Date().toISOString() } = {}) {
    const normalizedProfiles = normalizePeopleProfileBatch(profiles, { syncedAt });
    if (!normalizedProfiles.length) {
      return { imported_count: 0, created_count: 0, updated_count: 0, profiles: [] };
    }
    const emails = normalizedProfiles.map((profile) => profile.email);
    const existingRows = await this.all(
      `SELECT email FROM users WHERE email IN (${placeholders(emails.length)})`,
      ...emails,
    );
    const existingEmails = new Set(existingRows.map((row) => normalizeEmail(row.email)));
    await this.batchRun(
      normalizedProfiles.map((profile) => [
        `INSERT INTO users (
           email, display_name, full_name, slack_user_id, slack_handle, aliases_json,
           profile_source, profile_synced_at, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(email) DO UPDATE SET
           display_name = excluded.display_name,
           full_name = excluded.full_name,
           slack_user_id = CASE WHEN excluded.slack_user_id <> '' THEN excluded.slack_user_id ELSE users.slack_user_id END,
           slack_handle = CASE WHEN excluded.slack_handle <> '' THEN excluded.slack_handle ELSE users.slack_handle END,
           aliases_json = excluded.aliases_json,
           profile_source = excluded.profile_source,
           profile_synced_at = excluded.profile_synced_at,
           updated_at = CURRENT_TIMESTAMP`,
        profile.email,
        profile.display_name,
        profile.full_name,
        profile.slack_user_id,
        profile.slack_handle,
        profile.aliases_json,
        profile.profile_source,
        profile.profile_synced_at,
      ]),
    );
    return {
      imported_count: normalizedProfiles.length,
      created_count: normalizedProfiles.filter((profile) => !existingEmails.has(profile.email)).length,
      updated_count: normalizedProfiles.filter((profile) => existingEmails.has(profile.email)).length,
      profiles: normalizedProfiles.map(peopleProfileAdminView),
    };
  }

  async accessAudit(email, { related_email = "", terms = [] } = {}) {
    const targetEmail = requireValidEmail(email);
    const relatedEmail = related_email ? requireValidEmail(related_email, "related email") : "";
    const normalizedTerms = normalizeAuditTerms(terms);
    const rows = await this.all(
      `SELECT
          l.id,
          l.title,
          l.owner_email,
          owner.display_name AS owner_name,
          target.role AS target_role,
          target.can_share AS target_can_share,
          (SELECT COUNT(*) FROM list_members lm2 WHERE lm2.list_id = l.id) AS member_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.list_id = l.id AND t.status = 'open' AND t.deleted_at IS NULL) AS open_task_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.list_id = l.id AND t.status = 'completed' AND t.deleted_at IS NULL) AS completed_task_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.list_id = l.id AND t.created_by_email = ? AND t.deleted_at IS NULL) AS tasks_created_by_target_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.list_id = l.id AND t.created_by_email = ? AND t.deleted_at IS NULL) AS tasks_created_by_related_count,
          CASE WHEN l.owner_email = ? THEN 1 ELSE 0 END AS related_is_owner,
          CASE WHEN EXISTS (SELECT 1 FROM list_members rm WHERE rm.list_id = l.id AND rm.email = ?) THEN 1 ELSE 0 END AS related_is_member
       FROM lists l
       INNER JOIN list_members target ON target.list_id = l.id AND target.email = ?
       INNER JOIN users owner ON owner.email = l.owner_email
       ORDER BY LOWER(l.title)`,
      targetEmail,
      relatedEmail,
      relatedEmail,
      relatedEmail,
      targetEmail,
    );

    const lists = [];
    for (const row of rows) {
      const members = await this.all(
        `SELECT lm.email, lm.role, lm.can_share, lm.created_at, u.display_name
         FROM list_members lm
         INNER JOIN users u ON u.email = lm.email
         WHERE lm.list_id = ?
         ORDER BY CASE lm.role WHEN 'owner' THEN 0 ELSE 1 END,
                  lm.created_at,
                  LOWER(u.display_name)`,
        row.id,
      );
      lists.push({
        id: row.id,
        title: row.title,
        owner_email: row.owner_email,
        owner_name: row.owner_name || displayNameFromEmail(row.owner_email),
        target_role: row.target_role,
        target_can_share: Boolean(row.target_can_share),
        related_is_owner: Boolean(row.related_is_owner),
        related_is_member: Boolean(row.related_is_member),
        title_matches_terms: normalizedTerms.some((term) => normalizePeopleQuery(row.title).includes(term)),
        member_count: Number(row.member_count || 0),
        members: members.map(memberView),
        open_task_count: Number(row.open_task_count || 0),
        completed_task_count: Number(row.completed_task_count || 0),
        tasks_created_by_target_count: Number(row.tasks_created_by_target_count || 0),
        tasks_created_by_related_count: Number(row.tasks_created_by_related_count || 0),
        task_title_match_count: await this.countTaskTitleMatches(row.id, normalizedTerms),
      });
    }

    return {
      target_email: targetEmail,
      related_email: relatedEmail || null,
      terms: normalizedTerms,
      visible_list_count: lists.length,
      lists,
    };
  }

  async countTaskTitleMatches(listId, terms) {
    if (!terms.length) return 0;
    const matches = await this.all(`SELECT title FROM tasks WHERE list_id = ? AND deleted_at IS NULL`, listId);
    return matches.filter((task) => terms.some((term) => normalizePeopleQuery(task.title).includes(term))).length;
  }

  async getLists(email) {
    const rows = await this.all(
      `WITH visible_lists AS (
         SELECT
           l.id,
           l.title,
           l.owner_email,
           owner.display_name AS owner_name,
           l.created_at,
           l.updated_at,
           l.revision,
           lm.role,
           lm.can_share,
           lm.marker_color,
           lm.marker_icon
         FROM lists l
         INNER JOIN list_members lm ON lm.list_id = l.id AND lm.email = ?
         INNER JOIN users owner ON owner.email = l.owner_email
       ),
       member_counts AS (
         SELECT lm.list_id, COUNT(*) AS member_count
         FROM list_members lm
         INNER JOIN visible_lists visible ON visible.id = lm.list_id
         GROUP BY lm.list_id
       ),
       task_counts AS (
         SELECT
           tasks.list_id,
           SUM(CASE WHEN tasks.status = 'open' THEN 1 ELSE 0 END) AS open_task_count,
           SUM(CASE WHEN tasks.status = 'completed' THEN 1 ELSE 0 END) AS completed_task_count
         FROM tasks
         INNER JOIN visible_lists visible ON visible.id = tasks.list_id
         WHERE tasks.deleted_at IS NULL
         GROUP BY tasks.list_id
       ),
       request_counts AS (
         SELECT
           requests.list_id,
           COUNT(*) AS pending_access_request_count
         FROM list_access_requests requests
         INNER JOIN visible_lists visible ON visible.id = requests.list_id
         WHERE requests.status = 'pending'
           AND (visible.role = 'owner' OR visible.can_share = 1)
         GROUP BY requests.list_id
       )
       SELECT
         visible.id,
         visible.title,
         visible.owner_email,
         visible.owner_name,
         visible.created_at,
         visible.updated_at,
         visible.revision,
         visible.marker_color,
         visible.marker_icon,
         CASE WHEN visible.role = 'owner' THEN 1 ELSE visible.can_share END AS current_user_can_share,
         COALESCE(member_counts.member_count, 0) AS member_count,
         COALESCE(task_counts.open_task_count, 0) AS open_task_count,
         COALESCE(task_counts.completed_task_count, 0) AS completed_task_count,
         COALESCE(request_counts.pending_access_request_count, 0) AS pending_access_request_count
       FROM visible_lists visible
       LEFT JOIN member_counts ON member_counts.list_id = visible.id
       LEFT JOIN task_counts ON task_counts.list_id = visible.id
       LEFT JOIN request_counts ON request_counts.list_id = visible.id
       ORDER BY LOWER(visible.title)`,
      normalizeEmail(email),
    );
    return partitionLists(rows.map((row) => listSummaryFromRecord(row, email)), email);
  }

  async createList(ownerEmail, title) {
    const owner = await this.ensureUser(ownerEmail);
    const listId = newId("list");
    const cleanTitle = validateListTitle(title);
    const now = new Date().toISOString();
    const metadata = JSON.stringify({ title: cleanTitle });
    await this.batchRun([
      [
        `INSERT INTO lists (id, title, owner_email, created_at, updated_at, revision) VALUES (?, ?, ?, ?, ?, 0)`,
        listId,
        cleanTitle,
        owner.email,
        now,
        now,
      ],
      [
        `INSERT INTO list_members (list_id, email, role, can_share, marker_color, marker_icon, created_at)
         VALUES (?, ?, 'owner', 1, ?, ?, ?)`,
        listId,
        owner.email,
        DEFAULT_LIST_MARKER_COLOR,
        DEFAULT_LIST_MARKER_ICON,
        now,
      ],
      [
        `INSERT INTO activity (list_id, actor_email, action, metadata, created_at)
         VALUES (?, ?, 'created_list', ?, ?)`,
        listId,
        owner.email,
        metadata,
        now,
      ],
    ]);
    return {
      list: listSummaryFromRecord(
        {
          id: listId,
          title: cleanTitle,
          owner_email: owner.email,
          owner_name: owner.display_name,
          member_count: 1,
          open_task_count: 0,
          completed_task_count: 0,
          current_user_can_share: 1,
          pending_access_request_count: 0,
          marker_color: DEFAULT_LIST_MARKER_COLOR,
          marker_icon: DEFAULT_LIST_MARKER_ICON,
          created_at: now,
          updated_at: now,
          revision: 0,
        },
        owner.email,
      ),
      members: [memberView({ email: owner.email, role: "owner", can_share: 1, display_name: owner.display_name, created_at: now })],
      open_tasks: [],
      completed_tasks: [],
      completed_tasks_loaded: true,
      completed_tasks_loading: false,
      activity: [
        {
          id: null,
          list_id: listId,
          actor_email: owner.email,
          actor_name: owner.display_name,
          action: "created_list",
          metadata,
          created_at: now,
        },
      ],
      details_loaded: true,
      details_loading: false,
    };
  }

  async findOrCreateOwnedListByTitle(ownerEmail, title) {
    const owner = await this.ensureUser(ownerEmail);
    const cleanTitle = validateListTitle(title);
    const existing = await this.first(
      `SELECT
          l.*,
          owner.display_name AS owner_name,
          (SELECT COUNT(*) FROM list_members lm2 WHERE lm2.list_id = l.id) AS member_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.list_id = l.id AND t.status = 'open' AND t.deleted_at IS NULL) AS open_task_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.list_id = l.id AND t.status = 'completed' AND t.deleted_at IS NULL) AS completed_task_count,
          (SELECT COUNT(*) FROM list_access_requests requests WHERE requests.list_id = l.id AND requests.status = 'pending') AS pending_access_request_count,
          1 AS current_user_can_share,
          lm.marker_color AS marker_color,
          lm.marker_icon AS marker_icon
       FROM lists l
       INNER JOIN users owner ON owner.email = l.owner_email
       INNER JOIN list_members lm ON lm.list_id = l.id AND lm.email = l.owner_email
       WHERE l.owner_email = ? AND LOWER(l.title) = LOWER(?)
       ORDER BY l.created_at, l.id
       LIMIT 1`,
      owner.email,
      cleanTitle,
    );
    if (existing) return existing;
    return (await this.createList(owner.email, cleanTitle)).list;
  }

  async getList(email, listId, { include_completed = false } = {}) {
    const list = await this.authorizedList(email, listId);
    const [members, openTasks, completedTasks, activity, accessRequests] = await Promise.all([
      this.membersForList(listId),
      this.all(
        `SELECT * FROM tasks
         WHERE list_id = ? AND status = 'open' AND deleted_at IS NULL
         ORDER BY sort_order, created_at, id`,
        listId,
      ),
      include_completed ? this.completedTasksForList(listId) : Promise.resolve([]),
      this.all(
        `SELECT a.*, u.display_name AS actor_name
         FROM activity a
         INNER JOIN users u ON u.email = a.actor_email
         WHERE a.list_id = ?
         ORDER BY a.created_at DESC, a.id DESC
         LIMIT 20`,
        listId,
      ),
      this.accessRequestsForList(email, listId),
    ]);
    return {
      list: listSummaryFromRecord(list, email),
      members,
      open_tasks: openTasks.map(taskView),
      completed_tasks: completedTasks.map(taskView),
      completed_tasks_loaded: include_completed,
      activity,
      access_requests: accessRequests,
      details_loaded: true,
    };
  }

  async getListTaskSurface(email, listId) {
    const userEmail = normalizeEmail(email);
    const [lists, openTasks, ownerMembers] = await this.batchAll([
      [
        `SELECT
            l.*,
            owner.display_name AS owner_name,
            (SELECT COUNT(*) FROM list_members lm2 WHERE lm2.list_id = l.id) AS member_count,
            (SELECT COUNT(*) FROM tasks t WHERE t.list_id = l.id AND t.status = 'open' AND t.deleted_at IS NULL) AS open_task_count,
            (SELECT COUNT(*) FROM tasks t WHERE t.list_id = l.id AND t.status = 'completed' AND t.deleted_at IS NULL) AS completed_task_count,
            (SELECT COUNT(*) FROM list_access_requests requests WHERE requests.list_id = l.id AND requests.status = 'pending') AS pending_access_request_count,
            CASE WHEN viewer.email IS NULL THEN 0 ELSE 1 END AS authorized,
            CASE WHEN viewer.role = 'owner' THEN 1 ELSE COALESCE(viewer.can_share, 0) END AS current_user_can_share,
            viewer.marker_color AS marker_color,
            viewer.marker_icon AS marker_icon
         FROM lists l
         INNER JOIN users owner ON owner.email = l.owner_email
         LEFT JOIN list_members viewer ON viewer.list_id = l.id AND viewer.email = ?
         WHERE l.id = ?`,
        userEmail,
        listId,
      ],
      [
        `SELECT tasks.*
         FROM tasks
         INNER JOIN list_members viewer ON viewer.list_id = tasks.list_id AND viewer.email = ?
         WHERE tasks.list_id = ? AND tasks.status = 'open' AND tasks.deleted_at IS NULL
         ORDER BY tasks.sort_order, tasks.created_at, tasks.id`,
        userEmail,
        listId,
      ],
      [
        `SELECT owner_member.email, owner_member.role, owner_member.can_share, owner_member.created_at, users.display_name
         FROM list_members owner_member
         INNER JOIN users ON users.email = owner_member.email
         INNER JOIN lists ON lists.id = owner_member.list_id AND lists.owner_email = owner_member.email
         INNER JOIN list_members viewer ON viewer.list_id = owner_member.list_id AND viewer.email = ?
         WHERE owner_member.list_id = ?
         LIMIT 1`,
        userEmail,
        listId,
      ],
    ]);
    const list = lists[0];
    if (!list) throw new AppError(404, "List not found");
    if (!list.authorized) throw new AppError(403, "You do not have access to this list");
    return {
      list: listSummaryFromRecord(list, email),
      members: ownerMembers.map(memberView),
      open_tasks: openTasks.map(taskView),
      completed_tasks: [],
      completed_tasks_loaded: false,
      completed_tasks_loading: false,
      activity: [],
      access_requests: [],
      details_loaded: false,
    };
  }

  async getListDetails(email, listId) {
    const list = await this.authorizedList(email, listId);
    const [activity, members, accessRequests] = await Promise.all([
      this.all(
        `SELECT a.*, u.display_name AS actor_name
         FROM activity a
         INNER JOIN users u ON u.email = a.actor_email
         WHERE a.list_id = ?
         ORDER BY a.created_at DESC, a.id DESC
         LIMIT 20`,
        listId,
      ),
      this.membersForList(listId),
      this.accessRequestsForList(email, listId),
    ]);
    return {
      list: listSummaryFromRecord(list, email),
      members,
      activity,
      access_requests: accessRequests,
      details_loaded: true,
    };
  }

  async membersForList(listId) {
    return this.all(
      `SELECT lm.email, lm.role, lm.can_share, lm.created_at, u.display_name
       FROM list_members lm
       INNER JOIN users u ON u.email = lm.email
       WHERE lm.list_id = ?
       ORDER BY CASE lm.role WHEN 'owner' THEN 0 ELSE 1 END,
                lm.created_at,
                LOWER(u.display_name)`,
      listId,
    ).then((members) => members.map(memberView));
  }

  async ownerMemberForList(listId) {
    return this.all(
      `SELECT lm.email, lm.role, lm.can_share, lm.created_at, u.display_name
       FROM list_members lm
       INNER JOIN users u ON u.email = lm.email
       INNER JOIN lists l ON l.id = lm.list_id AND l.owner_email = lm.email
       WHERE lm.list_id = ?
       LIMIT 1`,
      listId,
    ).then((members) => members.map(memberView));
  }

  async getCompletedTasks(email, listId) {
    await this.authorizedList(email, listId);
    return this.completedTasksForList(listId).then((tasks) => tasks.map(taskView));
  }

  async completedTasksForList(listId) {
    return this.all(
      `SELECT * FROM tasks
       WHERE list_id = ? AND status = 'completed' AND deleted_at IS NULL
       ORDER BY COALESCE(completed_at, updated_at) DESC`,
      listId,
    );
  }

  async deleteList(email, listId) {
    await this.ownerList(email, listId);
    await this.run(`DELETE FROM task_external_refs WHERE list_id = ?`, listId);
    await this.run(`DELETE FROM tasks WHERE list_id = ?`, listId);
    await this.run(`DELETE FROM activity WHERE list_id = ?`, listId);
    await this.run(`DELETE FROM list_access_requests WHERE list_id = ?`, listId);
    await this.run(`DELETE FROM list_members WHERE list_id = ?`, listId);
    await this.run(`DELETE FROM lists WHERE id = ?`, listId);
    return { ok: true };
  }

  async createTask(email, listId, payload) {
    const user = await this.ensureUser(email);
    await this.authorizedList(email, listId);
    const taskId = newId("task");
    const title = validateTaskTitle(payload.title);
    const dueDate = normalizeDueDate(payload.due_date) ?? null;
    const sortOrder = await this.nextOpenTaskSortOrder(listId);
    const now = new Date().toISOString();
    await this.batchRun([
      [
        `INSERT INTO tasks (id, list_id, title, due_date, created_by_email, created_at, updated_at, revision, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        taskId,
        listId,
        title,
        dueDate,
        user.email,
        now,
        now,
        sortOrder,
      ],
      [`UPDATE lists SET updated_at = ?, revision = revision + 1 WHERE id = ?`, now, listId],
      [
        `INSERT INTO activity (list_id, actor_email, action, metadata, created_at)
         VALUES (?, ?, 'created_task', ?, ?)`,
        listId,
        user.email,
        JSON.stringify({ title }),
        now,
      ],
    ]);
    return taskView({
      id: taskId,
      list_id: listId,
      title,
      due_date: dueDate,
      status: "open",
      created_by_email: user.email,
      completed_by_email: null,
      created_at: now,
      updated_at: now,
      completed_at: null,
      revision: 0,
      sort_order: sortOrder,
    });
  }

  async createTaskFromExternalSource(email, payload) {
    const user = await this.ensureUser(email);
    const source = normalizeExternalSource(payload.source || "quick-actions");
    const externalId = normalizeExternalId(payload.external_id || payload.externalId);
    const existing = await this.first(
      `SELECT t.*, r.list_id AS ref_list_id
       FROM task_external_refs r
       INNER JOIN tasks t ON t.id = r.task_id
       WHERE r.owner_email = ? AND r.source = ? AND r.external_id = ? AND t.deleted_at IS NULL`,
      user.email,
      source,
      externalId,
    );
    if (existing) {
      return {
        created: false,
        list: listSummaryFromRecord(await this.authorizedList(user.email, existing.ref_list_id), user.email),
        task: taskView(existing),
      };
    }

    const list = await this.findOrCreateOwnedListByTitle(user.email, payload.list_title || payload.listTitle || "Quick Actions");
    const taskId = newId("task");
    const title = validateTaskTitle(payload.title);
    const dueDate = normalizeDueDate(payload.due_date ?? payload.dueDate) ?? null;
    const sortOrder = await this.nextOpenTaskSortOrder(list.id);
    const now = new Date().toISOString();
    await this.batchRun([
      [
        `INSERT INTO tasks (id, list_id, title, due_date, created_by_email, created_at, updated_at, revision, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        taskId,
        list.id,
        title,
        dueDate,
        user.email,
        now,
        now,
        sortOrder,
      ],
      [
        `INSERT INTO task_external_refs (owner_email, source, external_id, task_id, list_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        user.email,
        source,
        externalId,
        taskId,
        list.id,
        now,
      ],
      [`UPDATE lists SET updated_at = ?, revision = revision + 1 WHERE id = ?`, now, list.id],
      [
        `INSERT INTO activity (list_id, actor_email, action, metadata, created_at)
         VALUES (?, ?, 'created_task', ?, ?)`,
        list.id,
        user.email,
        JSON.stringify({ title, source, external_id: externalId }),
        now,
      ],
    ]);
    return {
      created: true,
      list: listSummaryFromRecord(await this.authorizedList(user.email, list.id), user.email),
      task: taskView({
        id: taskId,
        list_id: list.id,
        title,
        due_date: dueDate,
        status: "open",
        created_by_email: user.email,
        completed_by_email: null,
        created_at: now,
        updated_at: now,
        completed_at: null,
        revision: 0,
        sort_order: sortOrder,
      }),
    };
  }

  async reorderOpenTasks(email, listId, taskIds) {
    await this.ensureUser(email);
    await this.authorizedList(email, listId);
    const orderedIds = uniqueTaskIds(taskIds);
    const tasks = await this.all(
      `SELECT * FROM tasks
       WHERE list_id = ? AND status = 'open' AND deleted_at IS NULL
       ORDER BY sort_order, created_at, id`,
      listId,
    );
    if (orderedIds.length !== tasks.length || orderedIds.some((taskId) => !tasks.some((task) => task.id === taskId))) {
      throw new AppError(409, "Tasks changed on another device");
    }
    const byId = new Map(tasks.map((task) => [task.id, task]));
    await this.batchRun(
      orderedIds.map((taskId, index) => [
        `UPDATE tasks SET sort_order = ? WHERE id = ? AND list_id = ? AND status = 'open' AND deleted_at IS NULL`,
        (index + 1) * 1024,
        taskId,
        listId,
      ]),
    );
    await this.touchList(listId);
    await this.addActivity(listId, email, "reordered_tasks", { count: orderedIds.length });
    return {
      open_tasks: orderedIds.map((taskId, index) => taskView({ ...byId.get(taskId), sort_order: (index + 1) * 1024 })),
    };
  }

  async getIdempotencyResponse(scope) {
    const row = await this.first(`SELECT status, response_json FROM idempotency_keys WHERE scope = ?`, String(scope));
    if (!row) return null;
    try {
      return {
        status: Number(row.status || 200),
        body: JSON.parse(row.response_json),
      };
    } catch {
      return null;
    }
  }

  async saveIdempotencyResponse(scope, response) {
    await this.run(
      `INSERT INTO idempotency_keys (scope, status, response_json)
       VALUES (?, ?, ?)
       ON CONFLICT(scope) DO NOTHING`,
      String(scope),
      Number(response.status || 200),
      JSON.stringify(response.body || {}),
    );
  }

  async cleanupIdempotency({ olderThanHours = 72 } = {}) {
    const hours = Math.min(Math.max(Number(olderThanHours) || 72, 1), 24 * 30);
    const result = await this.run(
      `DELETE FROM idempotency_keys
       WHERE created_at < datetime('now', ?)`,
      `-${hours} hours`,
    );
    return { deleted_count: result?.meta?.changes || 0 };
  }

  async patchTask(email, taskId, patch) {
    await this.ensureUser(email);
    const existing = await this.taskWithList(taskId);
    await this.authorizedList(email, existing.list_id);
    const expectedRevision = normalizeExpectedRevision(patch.expected_revision);
    if (expectedRevision !== null && Number(existing.revision || 0) !== expectedRevision) {
      throw new AppError(409, "Task changed on another device");
    }
    const title = patch.title !== undefined ? validateTaskTitle(patch.title) : existing.title;
    const dueDate = patch.due_date !== undefined ? normalizeDueDate(patch.due_date) : existing.due_date;
    const status = patch.status !== undefined ? String(patch.status) : existing.status;
    if (!["open", "completed"].includes(status)) throw new AppError(400, "Invalid task status");
    let completedAt = existing.completed_at || null;
    let completedBy = existing.completed_by_email || null;
    if (patch.status !== undefined) {
      completedAt = status === "completed" ? new Date().toISOString() : null;
      completedBy = status === "completed" ? normalizeEmail(email) : null;
    }
    const sortOrder = status === "open" && existing.status !== "open" ? await this.nextOpenTaskSortOrder(existing.list_id) : existing.sort_order;
    await this.run(
      `UPDATE tasks
       SET title = ?, due_date = ?, status = ?, completed_at = ?, completed_by_email = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP, revision = revision + 1
       WHERE id = ?`,
      title,
      dueDate,
      status,
      completedAt,
      completedBy,
      sortOrder,
      taskId,
    );
    await this.touchList(existing.list_id);
    await this.addActivity(existing.list_id, email, status === "completed" ? "completed_task" : "updated_task", {
      title,
    });
    return this.first(`SELECT * FROM tasks WHERE id = ?`, taskId).then(taskView);
  }

  async deleteTask(email, taskId, { expected_revision = null } = {}) {
    await this.ensureUser(email);
    const task = await this.taskWithList(taskId);
    await this.authorizedList(email, task.list_id);
    const expectedRevision = normalizeExpectedRevision(expected_revision);
    if (expectedRevision !== null && Number(task.revision || 0) !== expectedRevision) {
      throw new AppError(409, "Task changed on another device");
    }
    if (task.status !== "completed") {
      const now = new Date().toISOString();
      await this.run(
        `UPDATE tasks
         SET deleted_at = ?, deleted_by_email = ?, delete_reason = 'task_deleted', updated_at = ?, revision = revision + 1
         WHERE id = ? AND deleted_at IS NULL`,
        now,
        normalizeEmail(email),
        now,
        taskId,
      );
      await this.touchList(task.list_id);
      await this.addActivity(task.list_id, email, "deleted_task", {});
      return { ok: true, deleted_task_ids: [taskId], deleted_count: 1 };
    }
    return this.deleteCompletedTasks(email, task.list_id, [taskId]);
  }

  async deleteCompletedTasks(email, listId, taskIds = null) {
    await this.ensureUser(email);
    await this.authorizedList(email, listId);
    const requestedIds = Array.isArray(taskIds) ? [...new Set(taskIds.map(String).filter(Boolean))] : null;
    if (requestedIds && !requestedIds.length) return { ok: true, deleted_task_ids: [], deleted_count: 0 };

    const idFilter = requestedIds ? ` AND id IN (${placeholders(requestedIds.length)})` : "";
    const tasks = await this.all(
      `SELECT id, title
       FROM tasks
       WHERE list_id = ? AND status = 'completed' AND deleted_at IS NULL${idFilter}`,
      listId,
      ...(requestedIds || []),
    );
    if (requestedIds && tasks.length !== requestedIds.length) {
      throw new AppError(400, "Only completed tasks can be deleted");
    }
    if (!tasks.length) return { ok: true, deleted_task_ids: [], deleted_count: 0 };

    const taskIdsToDelete = tasks.map((task) => task.id);
    const now = new Date().toISOString();
    await this.run(
      `UPDATE tasks
       SET deleted_at = ?, deleted_by_email = ?, delete_reason = 'completed_cleanup', updated_at = ?, revision = revision + 1
       WHERE list_id = ? AND status = 'completed' AND deleted_at IS NULL AND id IN (${placeholders(taskIdsToDelete.length)})`,
      now,
      normalizeEmail(email),
      now,
      listId,
      ...taskIdsToDelete,
    );
    await this.touchList(listId);
    await this.addActivity(listId, email, "deleted_completed_tasks", { count: taskIdsToDelete.length });
    return { ok: true, deleted_task_ids: taskIdsToDelete, deleted_count: taskIdsToDelete.length };
  }

  async restoreDeletedTasks(email, listId, taskIds) {
    await this.ensureUser(email);
    await this.authorizedList(email, listId);
    const requestedIds = [...new Set((taskIds || []).map(String).filter(Boolean))];
    if (!requestedIds.length) return { ok: true, restored_task_ids: [], restored_count: 0, restored_tasks: [] };
    const now = new Date().toISOString();
    const restorable = await this.all(
      `SELECT id FROM tasks
       WHERE list_id = ? AND deleted_at IS NOT NULL AND id IN (${placeholders(requestedIds.length)})`,
      listId,
      ...requestedIds,
    );
    const restorableIds = restorable.map((task) => task.id);
    if (!restorableIds.length) return { ok: true, restored_task_ids: [], restored_count: 0, restored_tasks: [] };
    await this.run(
      `UPDATE tasks
       SET deleted_at = NULL, deleted_by_email = NULL, delete_reason = NULL, updated_at = ?, revision = revision + 1
       WHERE list_id = ? AND deleted_at IS NOT NULL AND id IN (${placeholders(restorableIds.length)})`,
      now,
      listId,
      ...restorableIds,
    );
    const restored = await this.all(
      `SELECT * FROM tasks
       WHERE list_id = ? AND deleted_at IS NULL AND id IN (${placeholders(restorableIds.length)})`,
      listId,
      ...restorableIds,
    );
    await this.touchList(listId);
    await this.addActivity(listId, email, "restored_completed_tasks", { count: restored.length });
    return {
      ok: true,
      restored_task_ids: restored.map((task) => task.id),
      restored_count: restored.length,
      restored_tasks: restored.map(taskView),
    };
  }

  async addMember(actorEmail, listId, memberEmail) {
    await this.ensureUser(actorEmail);
    const list = await this.shareableList(actorEmail, listId);
    const member = await this.ensureUser(memberEmail);
    const role = member.email === list.owner_email ? "owner" : "editor";
    await this.run(
      `INSERT INTO list_members (list_id, email, role, can_share, marker_color, marker_icon)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(list_id, email) DO UPDATE SET
          role = excluded.role,
          can_share = CASE
            WHEN excluded.role = 'owner' THEN 1
            ELSE list_members.can_share
          END`,
      listId,
      member.email,
      role,
      role === "owner" ? 1 : 0,
      DEFAULT_LIST_MARKER_COLOR,
      DEFAULT_LIST_MARKER_ICON,
    );
    await this.markAccessRequest(member.email, listId, "approved", actorEmail);
    await this.touchList(listId);
    await this.addActivity(listId, actorEmail, "added_member", { email: member.email });
    return this.getList(actorEmail, listId);
  }

  async requestAccess(requesterEmail, listId) {
    const requester = await this.ensureUser(requesterEmail);
    const list = await this.first(`SELECT id FROM lists WHERE id = ?`, listId);
    if (!list) return { ok: true, request_status: "pending" };
    const existingMember = await this.first(
      `SELECT 1 FROM list_members WHERE list_id = ? AND email = ?`,
      listId,
      requester.email,
    );
    if (existingMember) return { ok: true, request_status: "already_member" };
    const existingRequest = await this.first(
      `SELECT status FROM list_access_requests WHERE list_id = ? AND requester_email = ?`,
      listId,
      requester.email,
    );
    if (existingRequest?.status === "pending") return { ok: true, request_status: "pending" };
    await this.run(
      `INSERT INTO list_access_requests (list_id, requester_email, status, created_at, updated_at, resolved_at, resolved_by_email)
       VALUES (?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL)
       ON CONFLICT(list_id, requester_email) DO UPDATE SET
         status = 'pending',
         updated_at = CURRENT_TIMESTAMP,
         resolved_at = NULL,
         resolved_by_email = NULL`,
      listId,
      requester.email,
    );
    await this.addActivity(listId, requester.email, "requested_access", { email: requester.email });
    return { ok: true, request_status: "pending" };
  }

  async approveAccessRequest(actorEmail, listId, requesterEmail) {
    await this.ensureUser(actorEmail);
    await this.shareableList(actorEmail, listId);
    const email = requireValidEmail(requesterEmail);
    const request = await this.first(
      `SELECT requester_email FROM list_access_requests WHERE list_id = ? AND requester_email = ? AND status = 'pending'`,
      listId,
      email,
    );
    if (!request) throw new AppError(404, "Access request not found");
    const active = await this.addMember(actorEmail, listId, email);
    await this.markAccessRequest(email, listId, "approved", actorEmail);
    await this.addActivity(listId, actorEmail, "approved_access_request", { email });
    return active;
  }

  async declineAccessRequest(actorEmail, listId, requesterEmail) {
    await this.ensureUser(actorEmail);
    await this.shareableList(actorEmail, listId);
    const email = requireValidEmail(requesterEmail);
    const request = await this.first(
      `SELECT requester_email FROM list_access_requests WHERE list_id = ? AND requester_email = ? AND status = 'pending'`,
      listId,
      email,
    );
    if (!request) throw new AppError(404, "Access request not found");
    await this.markAccessRequest(email, listId, "declined", actorEmail);
    await this.addActivity(listId, actorEmail, "declined_access_request", { email });
    return this.getList(actorEmail, listId);
  }

  async accessRequestsForList(email, listId) {
    try {
      await this.shareableList(email, listId);
    } catch {
      return [];
    }
    const rows = await this.all(
      `SELECT requests.requester_email, requests.created_at, users.display_name
       FROM list_access_requests requests
       INNER JOIN users ON users.email = requests.requester_email
       WHERE requests.list_id = ?
         AND requests.status = 'pending'
       ORDER BY requests.created_at ASC, LOWER(users.display_name)`,
      listId,
    );
    return rows.map(accessRequestView);
  }

  async markAccessRequest(requesterEmail, listId, status, actorEmail) {
    await this.run(
      `UPDATE list_access_requests
       SET status = ?, updated_at = CURRENT_TIMESTAMP, resolved_at = CURRENT_TIMESTAMP, resolved_by_email = ?
       WHERE list_id = ? AND requester_email = ? AND status = 'pending'`,
      status,
      normalizeEmail(actorEmail),
      listId,
      normalizeEmail(requesterEmail),
    );
  }

  async removeMember(ownerEmail, listId, memberEmail) {
    await this.ensureUser(ownerEmail);
    const list = await this.ownerList(ownerEmail, listId);
    const email = requireValidEmail(memberEmail);
    if (email === list.owner_email) throw new AppError(400, "The owner cannot be removed from their list");
    await this.run(`DELETE FROM list_members WHERE list_id = ? AND email = ?`, listId, email);
    await this.touchList(listId);
    await this.addActivity(listId, ownerEmail, "removed_member", { email });
    return this.getList(ownerEmail, listId);
  }

  async updateMemberSharing(ownerEmail, listId, memberEmail, canShare) {
    await this.ensureUser(ownerEmail);
    const list = await this.ownerList(ownerEmail, listId);
    const email = requireValidEmail(memberEmail);
    const member = await this.first(`SELECT email, role FROM list_members WHERE list_id = ? AND email = ?`, listId, email);
    if (!member) throw new AppError(404, "Member not found");
    if (email === list.owner_email || member.role === "owner") {
      throw new AppError(400, "The owner can always share this list");
    }
    await this.run(`UPDATE list_members SET can_share = ? WHERE list_id = ? AND email = ?`, canShare ? 1 : 0, listId, email);
    await this.touchList(listId);
    await this.addActivity(listId, ownerEmail, "updated_member_sharing", { email, can_share: Boolean(canShare) });
    return this.getList(ownerEmail, listId);
  }

  async allowAllMembersToShare(ownerEmail, listId) {
    await this.ensureUser(ownerEmail);
    await this.ownerList(ownerEmail, listId);
    const result = await this.run(`UPDATE list_members SET can_share = 1 WHERE list_id = ? AND role <> 'owner'`, listId);
    await this.touchList(listId);
    await this.addActivity(listId, ownerEmail, "allowed_all_to_share", {
      count: result?.meta?.changes || 0,
    });
    return this.getList(ownerEmail, listId);
  }

  async patchList(ownerEmail, listId, patch) {
    await this.ensureUser(ownerEmail);
    await this.ownerList(ownerEmail, listId);
    const title = patch.title !== undefined ? validateListTitle(patch.title) : null;
    if (title !== null) {
      await this.run(
        `UPDATE lists
         SET title = ?, updated_at = CURRENT_TIMESTAMP, revision = revision + 1
         WHERE id = ?`,
        title,
        listId,
      );
      await this.addActivity(listId, ownerEmail, "updated_list", { title });
    }
    return this.getList(ownerEmail, listId);
  }

  async updateListPreferences(email, listId, preferences) {
    await this.ensureUser(email);
    await this.authorizedList(email, listId);
    const marker = validateListMarkerPreferences(preferences);
    await this.run(
      `UPDATE list_members
       SET marker_color = ?, marker_icon = ?
       WHERE list_id = ? AND email = ?`,
      marker.marker_color,
      marker.marker_icon,
      listId,
      normalizeEmail(email),
    );
    return {
      list: listSummaryFromRecord(await this.authorizedList(email, listId), email),
    };
  }

  async authorizedList(email, listId) {
    const list = await this.first(
      `SELECT
          l.*,
          owner.display_name AS owner_name,
          (SELECT COUNT(*) FROM list_members lm2 WHERE lm2.list_id = l.id) AS member_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.list_id = l.id AND t.status = 'open' AND t.deleted_at IS NULL) AS open_task_count,
          (SELECT COUNT(*) FROM tasks t WHERE t.list_id = l.id AND t.status = 'completed' AND t.deleted_at IS NULL) AS completed_task_count,
          (SELECT COUNT(*) FROM list_access_requests requests WHERE requests.list_id = l.id AND requests.status = 'pending') AS pending_access_request_count,
          CASE WHEN lm.email IS NULL THEN 0 ELSE 1 END AS authorized,
          CASE WHEN lm.role = 'owner' THEN 1 ELSE COALESCE(lm.can_share, 0) END AS current_user_can_share,
          lm.marker_color AS marker_color,
          lm.marker_icon AS marker_icon
       FROM lists l
       INNER JOIN users owner ON owner.email = l.owner_email
       LEFT JOIN list_members lm ON lm.list_id = l.id AND lm.email = ?
       WHERE l.id = ?`,
      normalizeEmail(email),
      listId,
    );
    if (!list) throw new AppError(404, "List not found");
    if (!list.authorized) throw new AppError(403, "You do not have access to this list");
    return list;
  }

  async shareableList(email, listId) {
    const list = await this.authorizedList(email, listId);
    if (normalizeEmail(list.owner_email) === normalizeEmail(email) || Number(list.current_user_can_share) === 1) {
      return list;
    }
    throw new AppError(403, "You do not have sharing rights for this list");
  }

  async ownerList(email, listId) {
    const list = await this.authorizedList(email, listId);
    if (normalizeEmail(list.owner_email) !== normalizeEmail(email)) {
      throw new AppError(403, "Only the list owner can do that");
    }
    return list;
  }

  async taskWithList(taskId) {
    const task = await this.first(`SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL`, taskId);
    if (!task) throw new AppError(404, "Task not found");
    return task;
  }

  async nextOpenTaskSortOrder(listId) {
    const result = await this.first(
      `SELECT COALESCE(MAX(sort_order), 0) + 1024 AS sort_order
       FROM tasks
       WHERE list_id = ? AND status = 'open' AND deleted_at IS NULL`,
      listId,
    );
    return Number(result?.sort_order || 1024);
  }

  async touchList(listId) {
    await this.run(`UPDATE lists SET updated_at = CURRENT_TIMESTAMP, revision = revision + 1 WHERE id = ?`, listId);
  }

  async addActivity(listId, actorEmail, action, metadata) {
    await this.run(
      `INSERT INTO activity (list_id, actor_email, action, metadata)
       VALUES (?, ?, ?, ?)`,
      listId,
      normalizeEmail(actorEmail),
      action,
      metadata ? JSON.stringify(metadata) : null,
    );
  }
}

function escapeSqlLike(value) {
  return String(value).replace(/[\\%_]/g, "\\$&");
}

function placeholders(count) {
  return Array.from({ length: count }, () => "?").join(", ");
}

function uniqueTaskIds(taskIds) {
  if (!Array.isArray(taskIds)) throw new AppError(400, "task_ids must be an array");
  return [...new Set(taskIds.map(String).filter(Boolean))];
}

function normalizeAuditTerms(terms) {
  return [...new Set((terms || []).map(normalizePeopleQuery).filter((term) => term.length >= 2))];
}
