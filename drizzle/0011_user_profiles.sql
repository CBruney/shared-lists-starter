ALTER TABLE users ADD COLUMN full_name TEXT;
ALTER TABLE users ADD COLUMN slack_user_id TEXT;
ALTER TABLE users ADD COLUMN slack_handle TEXT;
ALTER TABLE users ADD COLUMN aliases_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE users ADD COLUMN profile_source TEXT NOT NULL DEFAULT 'shared-lists';
ALTER TABLE users ADD COLUMN profile_synced_at TEXT;
