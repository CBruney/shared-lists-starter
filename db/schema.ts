export const schemaStatements = [
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
    marker_color TEXT NOT NULL DEFAULT 'blue',
    marker_icon TEXT NOT NULL DEFAULT 'app',
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
    sort_order INTEGER NOT NULL DEFAULT 0,
    revision INTEGER NOT NULL DEFAULT 0,
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
  `CREATE INDEX IF NOT EXISTS idx_tasks_list_status_deleted ON tasks(list_id, status, deleted_at)`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_open_list_due_created
    ON tasks(list_id, due_date, created_at)
    WHERE status = 'open' AND deleted_at IS NULL`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_completed_list_completed
    ON tasks(list_id, completed_at DESC, updated_at DESC)
    WHERE status = 'completed' AND deleted_at IS NULL`,
  `CREATE INDEX IF NOT EXISTS idx_tasks_open_list_sort_order
    ON tasks(list_id, sort_order, created_at)
    WHERE status = 'open' AND deleted_at IS NULL`,
  `CREATE INDEX IF NOT EXISTS idx_activity_list_created ON activity(list_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_activity_list_created_id ON activity(list_id, created_at DESC, id DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_idempotency_keys_created_at ON idempotency_keys(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_list_access_requests_list_status
    ON list_access_requests(list_id, status, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_list_access_requests_requester_status
    ON list_access_requests(requester_email, status)`,
  `CREATE INDEX IF NOT EXISTS idx_task_external_refs_task ON task_external_refs(task_id)`,
  `CREATE INDEX IF NOT EXISTS idx_task_external_refs_list ON task_external_refs(list_id)`,
  `CREATE INDEX IF NOT EXISTS idx_user_contacts_owner_provider_name
    ON user_contacts(owner_email, provider, display_name)`,
  `CREATE INDEX IF NOT EXISTS idx_contact_oauth_states_expires
    ON contact_oauth_states(expires_at)`,
];
