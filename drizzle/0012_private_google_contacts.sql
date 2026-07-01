CREATE TABLE IF NOT EXISTS user_contact_sources (
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
);

CREATE TABLE IF NOT EXISTS user_contacts (
  owner_email TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_contact_id TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  search_terms_json TEXT NOT NULL DEFAULT '[]',
  synced_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (owner_email, provider, email),
  FOREIGN KEY (owner_email) REFERENCES users(email)
);

CREATE TABLE IF NOT EXISTS contact_oauth_states (
  state TEXT PRIMARY KEY NOT NULL,
  owner_email TEXT NOT NULL,
  provider TEXT NOT NULL,
  code_verifier TEXT NOT NULL,
  redirect_to TEXT NOT NULL DEFAULT '/',
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_email) REFERENCES users(email)
);

CREATE INDEX IF NOT EXISTS idx_user_contacts_owner_provider_name
  ON user_contacts(owner_email, provider, display_name);

CREATE INDEX IF NOT EXISTS idx_contact_oauth_states_expires
  ON contact_oauth_states(expires_at);
