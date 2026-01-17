-- Emails Database Schema
-- Migration: 001_initial_schema

CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  email_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT,
  author_email TEXT NOT NULL,
  author_avatar TEXT,
  author_platform TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  html TEXT,
  url TEXT,
  thread_id TEXT,
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_emails TEXT NOT NULL, -- JSON array
  cc_emails TEXT, -- JSON array
  bcc_emails TEXT, -- JSON array
  in_reply_to TEXT,
  message_id TEXT NOT NULL,
  folder TEXT NOT NULL CHECK (folder IN ('inbox', 'sent', 'draft', 'spam', 'trash')),
  read BOOLEAN DEFAULT FALSE,
  starred BOOLEAN DEFAULT FALSE,
  metadata TEXT, -- JSON object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emails_folder ON emails(folder);
CREATE INDEX IF NOT EXISTS idx_emails_read ON emails(read);
CREATE INDEX IF NOT EXISTS idx_emails_timestamp ON emails(timestamp);
CREATE INDEX IF NOT EXISTS idx_emails_from_email ON emails(from_email);