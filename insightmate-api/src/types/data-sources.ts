// Unified data source schemas for InsightMate aggregation

export interface DataSource {
  id: string;
  type: DataSourceType;
  source: string;
  timestamp: Date;
  author: Author;
  content: Content;
  metadata: Record<string, any>;
}

export type DataSourceType = 
  | 'customer_support_ticket'
  | 'discord_message'
  | 'github_issue'
  | 'email'
  | 'twitter_post'
  | 'forum_post';

export interface Author {
  id: string;
  name: string;
  username?: string;
  email?: string;
  avatar?: string;
  platform: string;
}

export interface Content {
  title?: string;
  body: string;
  html?: string;
  url?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  size?: number;
}

// Customer Support Ticket Schema
export interface CustomerSupportTicket extends DataSource {
  type: 'customer_support_ticket';
  ticket_id: string;
  status: 'open' | 'pending' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  assigned_agent?: string;
  customer_id: string;
  tags: string[];
}

// Discord Message Schema
export interface DiscordMessage extends DataSource {
  type: 'discord_message';
  message_id: string;
  channel_id: string;
  channel_name: string;
  guild_id: string;
  guild_name: string;
  mentions: string[];
  reactions: Reaction[];
  is_thread?: boolean;
  parent_message_id?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

// GitHub Issue Schema
export interface GitHubIssue extends DataSource {
  type: 'github_issue';
  issue_id: number;
  repository: string;
  owner: string;
  state: 'open' | 'closed';
  labels: string[];
  assignees: string[];
  milestone?: string;
  pull_request?: boolean;
  issue_number: number;
}

// Email Schema
export interface Email extends DataSource {
  type: 'email';
  email_id: string;
  thread_id?: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  in_reply_to?: string;
  message_id: string;
  folder: 'inbox' | 'sent' | 'draft' | 'spam' | 'trash';
  read: boolean;
  starred: boolean;
}

export interface EmailAddress {
  email: string;
  name?: string;
}

// Twitter/X Post Schema
export interface TwitterPost extends DataSource {
  type: 'twitter_post';
  tweet_id: string;
  conversation_id?: string;
  in_reply_to_status_id?: string;
  lang: string;
  retweet_count: number;
  like_count: number;
  reply_count: number;
  quote_count: number;
  hashtags: string[];
  mentions: string[];
  media?: Media[];
  is_retweet: boolean;
  is_reply: boolean;
}

export interface Media {
  id: string;
  type: 'photo' | 'video' | 'animated_gif';
  url: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
}

// Community Forum Post Schema
export interface ForumPost extends DataSource {
  type: 'forum_post';
  post_id: string;
  topic_id: string;
  forum_name: string;
  category: string;
  tags: string[];
  view_count: number;
  reply_count: number;
  is_sticky: boolean;
  is_locked: boolean;
  last_reply_at?: Date;
  parent_post_id?: string;
}

// Aggregated Task Schema (extends existing task schema)
export interface AggregatedTask {
  id: string;
  name: string;
  slug: string;
  description?: string;
  completed: boolean;
  due_date?: string;
  source_data: DataSource;
  source_type: DataSourceType;
  priority: TaskPriority;
  status: TaskStatus;
  assigned_to?: string;
  created_at: Date;
  updated_at: Date;
  tags: string[];
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'new' | 'in_progress' | 'review' | 'completed' | 'cancelled';

// Data Source Configuration
export interface DataSourceConfig {
  type: DataSourceType;
  enabled: boolean;
  sync_interval: number; // minutes
  last_sync?: Date;
  filters: Record<string, any>;
  transformation_rules: TransformationRule[];
}

export interface TransformationRule {
  field: string;
  transform: 'map' | 'filter' | 'format' | 'calculate';
  config: Record<string, any>;
}

// Database schema definitions for D1
export const DATABASE_SCHEMAS = {
  customer_support_tickets: `
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
  `,
  
  discord_messages: `
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
  `,
  
  github_issues: `
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
  `,
  
  emails: `
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
  `,
  
  twitter_posts: `
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
  `,
  
  forum_posts: `
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
  `,
  
  aggregated_tasks: `
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
      metadata TEXT, -- JSON object
      FOREIGN KEY (source_data_id) REFERENCES customer_support_tickets(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_aggregated_tasks_source_type ON aggregated_tasks(source_type);
    CREATE INDEX IF NOT EXISTS idx_aggregated_tasks_status ON aggregated_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_aggregated_tasks_priority ON aggregated_tasks(priority);
    CREATE INDEX IF NOT EXISTS idx_aggregated_tasks_completed ON aggregated_tasks(completed);
  `
};