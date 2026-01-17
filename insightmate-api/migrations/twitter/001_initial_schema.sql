-- Twitter Posts Database Schema
-- Migration: 001_initial_schema

CREATE TABLE IF NOT EXISTS twitter_posts (
  id TEXT PRIMARY KEY,
  tweet_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_username TEXT NOT NULL,
  author_avatar TEXT,
  author_platform TEXT NOT NULL,
  body TEXT NOT NULL,
  html TEXT,
  url TEXT,
  conversation_id TEXT,
  in_reply_to_status_id TEXT,
  lang TEXT NOT NULL,
  retweet_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  quote_count INTEGER DEFAULT 0,
  hashtags TEXT, -- JSON array
  mentions TEXT, -- JSON array
  media TEXT, -- JSON array
  is_retweet BOOLEAN DEFAULT FALSE,
  is_reply BOOLEAN DEFAULT FALSE,
  metadata TEXT, -- JSON object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_twitter_tweets_author ON twitter_posts(author_username);
CREATE INDEX IF NOT EXISTS idx_twitter_tweets_conversation ON twitter_posts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_twitter_tweets_timestamp ON twitter_posts(timestamp);
CREATE INDEX IF NOT EXISTS idx_twitter_tweets_lang ON twitter_posts(lang);