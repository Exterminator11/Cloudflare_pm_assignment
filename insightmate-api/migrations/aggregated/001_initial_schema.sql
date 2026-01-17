-- Aggregated Tasks Database Schema
-- Migration: 001_initial_schema

CREATE TABLE IF NOT EXISTS aggregated_tasks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  due_date DATETIME,
  source_data_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL CHECK (status IN ('new', 'in_progress', 'review', 'completed', 'cancelled')),
  assigned_to TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  tags TEXT, -- JSON array
  metadata TEXT -- JSON object
);

CREATE INDEX IF NOT EXISTS idx_aggregated_tasks_source_type ON aggregated_tasks(source_type);
CREATE INDEX IF NOT EXISTS idx_aggregated_tasks_status ON aggregated_tasks(status);
CREATE INDEX IF NOT EXISTS idx_aggregated_tasks_priority ON aggregated_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_aggregated_tasks_completed ON aggregated_tasks(completed);
CREATE INDEX IF NOT EXISTS idx_aggregated_tasks_source_data_id ON aggregated_tasks(source_data_id);