CREATE TABLE IF NOT EXISTS list_access_requests (
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
);

CREATE INDEX IF NOT EXISTS idx_list_access_requests_list_status
ON list_access_requests(list_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_list_access_requests_requester_status
ON list_access_requests(requester_email, status);
