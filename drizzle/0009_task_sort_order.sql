ALTER TABLE tasks ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

WITH ordered AS (
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
WHERE id IN (SELECT id FROM ordered);

CREATE INDEX IF NOT EXISTS idx_tasks_open_list_sort_order
ON tasks(list_id, sort_order, created_at)
WHERE status = 'open' AND deleted_at IS NULL;
