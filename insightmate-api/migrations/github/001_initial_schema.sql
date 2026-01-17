-- GitHub Issues Database Schema
-- Migration: 001_initial_schema

CREATE TABLE IF NOT EXISTS github_issues (
  id TEXT PRIMARY KEY,
  issue_id INTEGER UNIQUE NOT NULL,
  source TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT,
  author_avatar TEXT,
  author_platform TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  html TEXT,
  url TEXT NOT NULL,
  repository TEXT NOT NULL,
  owner TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('open', 'closed')),
  labels TEXT, -- JSON array
  assignees TEXT, -- JSON array
  milestone TEXT,
  pull_request BOOLEAN DEFAULT FALSE,
  issue_number INTEGER NOT NULL,
  metadata TEXT, -- JSON object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_github_issues_repository ON github_issues(repository);
CREATE INDEX IF NOT EXISTS idx_github_issues_state ON github_issues(state);
CREATE INDEX IF NOT EXISTS idx_github_issues_timestamp ON github_issues(timestamp);
CREATE INDEX IF NOT EXISTS idx_github_issues_author_id ON github_issues(author_id);