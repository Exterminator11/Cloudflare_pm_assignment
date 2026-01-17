-- Forum Posts Database Schema
-- Migration: 001_initial_schema

CREATE TABLE IF NOT EXISTS forum_posts (
  id TEXT PRIMARY KEY,
  post_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT,
  author_avatar TEXT,
  author_platform TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  html TEXT,
  url TEXT,
  topic_id TEXT NOT NULL,
  forum_name TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT, -- JSON array
  view_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_sticky BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  last_reply_at DATETIME,
  parent_post_id TEXT,
  metadata TEXT, -- JSON object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON forum_posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts(category);
CREATE INDEX IF NOT EXISTS idx_forum_posts_timestamp ON forum_posts(timestamp);
CREATE INDEX IF NOT EXISTS idx_forum_posts_author_id ON forum_posts(author_id);