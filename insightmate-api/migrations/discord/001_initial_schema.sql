-- Discord Messages Database Schema
-- Migration: 001_initial_schema

CREATE TABLE IF NOT EXISTS discord_messages (
  id TEXT PRIMARY KEY,
  message_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT,
  author_avatar TEXT,
  author_platform TEXT NOT NULL,
  body TEXT NOT NULL,
  html TEXT,
  url TEXT,
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  guild_name TEXT NOT NULL,
  mentions TEXT, -- JSON array
  reactions TEXT, -- JSON array
  is_thread BOOLEAN DEFAULT FALSE,
  parent_message_id TEXT,
  metadata TEXT, -- JSON object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_discord_messages_channel ON discord_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_discord_messages_guild ON discord_messages(guild_id);
CREATE INDEX IF NOT EXISTS idx_discord_messages_timestamp ON discord_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_discord_messages_author_id ON discord_messages(author_id);