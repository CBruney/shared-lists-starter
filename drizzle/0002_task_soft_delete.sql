ALTER TABLE tasks ADD COLUMN deleted_at TEXT;
ALTER TABLE tasks ADD COLUMN deleted_by_email TEXT;
ALTER TABLE tasks ADD COLUMN delete_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_tasks_list_status_deleted ON tasks(list_id, status, deleted_at);
