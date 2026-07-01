ALTER TABLE lists ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE tasks ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_created_at ON idempotency_keys(created_at);
