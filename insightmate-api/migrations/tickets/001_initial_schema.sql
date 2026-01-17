-- Customer Support Tickets Database Schema
-- Migration: 001_initial_schema

CREATE TABLE IF NOT EXISTS customer_support_tickets (
  id TEXT PRIMARY KEY,
  ticket_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT,
  author_email TEXT,
  author_avatar TEXT,
  author_platform TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  html TEXT,
  url TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'pending', 'closed', 'escalated')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL,
  assigned_agent TEXT,
  customer_id TEXT NOT NULL,
  tags TEXT, -- JSON array
  metadata TEXT, -- JSON object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_support_tickets_status ON customer_support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_customer_support_tickets_priority ON customer_support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_customer_support_tickets_timestamp ON customer_support_tickets(timestamp);
CREATE INDEX IF NOT EXISTS idx_customer_support_tickets_customer_id ON customer_support_tickets(customer_id);