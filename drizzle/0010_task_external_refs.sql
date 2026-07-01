CREATE TABLE IF NOT EXISTS task_external_refs (
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
);

CREATE INDEX IF NOT EXISTS idx_task_external_refs_task
ON task_external_refs(task_id);

CREATE INDEX IF NOT EXISTS idx_task_external_refs_list
ON task_external_refs(list_id);
