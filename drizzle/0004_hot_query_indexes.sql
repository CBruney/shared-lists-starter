CREATE INDEX IF NOT EXISTS idx_list_members_email_list ON list_members(email, list_id);

CREATE INDEX IF NOT EXISTS idx_tasks_open_list_due_created
  ON tasks(list_id, due_date, created_at)
  WHERE status = 'open' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_completed_list_completed
  ON tasks(list_id, completed_at DESC, updated_at DESC)
  WHERE status = 'completed' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_activity_list_created_id
  ON activity(list_id, created_at DESC, id DESC);
