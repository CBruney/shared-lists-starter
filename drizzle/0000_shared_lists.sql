CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lists (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_email) REFERENCES users(email)
);

CREATE TABLE IF NOT EXISTS list_members (
  list_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (list_id, email),
  FOREIGN KEY (list_id) REFERENCES lists(id),
  FOREIGN KEY (email) REFERENCES users(email)
);

CREATE TABLE IF NOT EXISTS tasks (
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
  FOREIGN KEY (list_id) REFERENCES lists(id),
  FOREIGN KEY (created_by_email) REFERENCES users(email),
  FOREIGN KEY (completed_by_email) REFERENCES users(email)
);

CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (list_id) REFERENCES lists(id),
  FOREIGN KEY (actor_email) REFERENCES users(email)
);

CREATE INDEX IF NOT EXISTS idx_lists_owner_email ON lists(owner_email);
CREATE INDEX IF NOT EXISTS idx_list_members_email ON list_members(email);
CREATE INDEX IF NOT EXISTS idx_tasks_list_status ON tasks(list_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_activity_list_created ON activity(list_id, created_at);
