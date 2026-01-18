-- Customer Support Tickets
CREATE TABLE IF NOT EXISTS customer_support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insights Events for Persistence
CREATE TABLE IF NOT EXISTS insights_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    source_id TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    extras TEXT NOT NULL
);

-- Discord Messages
CREATE TABLE IF NOT EXISTS discord_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE NOT NULL,
    channel_id TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GitHub Issues
CREATE TABLE IF NOT EXISTS github_issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    issue_id INTEGER UNIQUE NOT NULL,
    repo TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Emails
CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_id TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sender TEXT NOT NULL,
    vector_id TEXT,
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add vector_id column if it doesn't exist (for existing databases)
ALTER TABLE emails ADD COLUMN vector_id TEXT;

-- Twitter Posts
CREATE TABLE IF NOT EXISTS twitter_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tweet_id TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Community Forums
CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id TEXT UNIQUE NOT NULL,
    forum TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Aggregated Insights
CREATE TABLE IF NOT EXISTS insights_aggregated (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE UNIQUE NOT NULL,
    total_tickets INTEGER DEFAULT 0,
    total_discord INTEGER DEFAULT 0,
    total_issues INTEGER DEFAULT 0,
    total_emails INTEGER DEFAULT 0,
    total_tweets INTEGER DEFAULT 0,
    total_forum INTEGER DEFAULT 0,
    avg_sentiment REAL DEFAULT 0.0
);

-- Dummy Data
INSERT OR IGNORE INTO customer_support_tickets (ticket_id, content, status, user_id, created_at) VALUES 
('TKT-001', 'Cannot login to my account', 'open', 'user_123', '2023-10-26 10:00:00'),
('TKT-002', 'Feature request: dark mode', 'closed', 'user_456', '2023-10-26 11:30:00'),
('TKT-003', 'Payment failed during checkout', 'open', 'user_789', '2023-10-27 09:15:00'),
('TKT-004', 'How to reset my password?', 'closed', 'user_321', '2023-10-27 10:45:00'),
('TKT-005', 'Bug report: page not loading', 'in_progress', 'user_654', '2023-10-28 13:20:00'),
('TKT-006', 'Account upgrade request', 'pending', 'user_987', '2023-10-28 14:30:00'),
('TKT-007', 'Cannot access billing section', 'open', 'user_111', '2023-10-29 11:10:00'),
('TKT-008', 'Refund request for order #1234', 'resolved', 'user_222', '2023-10-29 12:25:00'),
('TKT-009', 'Integration with third-party API failing', 'open', 'user_333', '2023-10-30 08:40:00'),
('TKT-010', 'User role permissions not working', 'in_progress', 'user_444', '2023-10-30 09:55:00');

INSERT OR IGNORE INTO discord_messages (message_id, channel_id, content, author_id, created_at) VALUES 
('MSG-001', 'CHAN-001', 'Hello everyone!', 'author_1', '2023-10-26 12:00:00'),
('MSG-002', 'CHAN-001', 'Check out this new feature', 'author_2', '2023-10-26 12:05:00'),
('MSG-003', 'CHAN-002', 'Anyone available for code review?', 'author_3', '2023-10-27 15:30:00'),
('MSG-004', 'CHAN-001', 'Database migration completed successfully', 'author_4', '2023-10-27 16:45:00'),
('MSG-005', 'CHAN-003', 'Server maintenance scheduled for tonight', 'author_5', '2023-10-28 20:00:00'),
('MSG-006', 'CHAN-001', 'New PR ready for review #42', 'author_6', '2023-10-28 21:15:00'),
('MSG-007', 'CHAN-002', 'Found a potential security issue', 'author_7', '2023-10-29 09:10:00'),
('MSG-008', 'CHAN-003', 'Celebrating 1000th deployment! 🎉', 'author_8', '2023-10-29 18:30:00'),
('MSG-009', 'CHAN-001', 'API documentation updated with examples', 'author_9', '2023-10-30 11:20:00'),
('MSG-010', 'CHAN-002', 'Running performance tests on staging', 'author_10', '2023-10-30 14:40:00');

INSERT OR IGNORE INTO github_issues (issue_id, repo, title, body, state, created_at) VALUES 
(101, 'cloudflare/wrangler', 'Bug: d1 execution failing', 'I am seeing an error when running d1 execute', 'open', '2023-10-26 09:00:00'),
(102, 'cloudflare/hono', 'Feat: add more middleware', 'Can we have a new middleware for auth?', 'closed', '2023-10-26 14:00:00'),
(103, 'cloudflare/wrangler', 'Feature request: improve local dev experience', 'Hot reload would be amazing for development', 'open', '2023-10-27 10:00:00'),
(104, 'cloudflare/hono', 'Docs: update CORS examples', 'Current examples are outdated', 'closed', '2023-10-27 11:30:00'),
(105, 'cloudflare/wrangler', 'Bug: environment variables not loading', 'Variables work locally but not on deploy', 'open', '2023-10-28 08:15:00'),
(106, 'cloudflare/hono', 'Question: websocket support?', 'Is there a plan for websockets?', 'open', '2023-10-28 12:00:00'),
(107, 'cloudflare/wrangler', 'Chore: upgrade dependencies', 'Package dependencies are outdated', 'closed', '2023-10-29 16:45:00'),
(108, 'cloudflare/hono', 'Perf: optimize JSON parsing', 'Large payloads are slow', 'open', '2023-10-29 17:30:00'),
(109, 'cloudflare/wrangler', 'Docs: add D1 migration guide', 'Need step-by-step migration tutorial', 'closed', '2023-10-30 10:20:00'),
(110, 'cloudflare/hono', 'Bug: middleware ordering', 'Order of execution seems inconsistent', 'open', '2023-10-30 13:50:00');

INSERT OR IGNORE INTO emails (email_id, subject, body, sender, received_at) VALUES 
('EML-001', 'Welcome to the platform', 'Thanks for signing up!', 'welcome@platform.com', '2023-10-26 08:00:00'),
('EML-002', 'Your invoice is ready', 'Please find your invoice attached.', 'billing@platform.com', '2023-10-26 15:00:00'),
('EML-003', 'Security alert: new login', 'We detected a new login to your account', 'security@platform.com', '2023-10-27 06:30:00'),
('EML-004', 'Product update: v2.1 released', 'Check out our latest features and improvements', 'updates@platform.com', '2023-10-27 12:00:00'),
('EML-005', 'Password reset request', 'Use this link to reset your password', 'auth@platform.com', '2023-10-28 09:15:00'),
('EML-006', 'Downtime notification', 'Scheduled maintenance tomorrow 2-4 AM', 'ops@platform.com', '2023-10-28 18:45:00'),
('EML-007', 'Beta invitation', 'Join our new beta program for early features', 'beta@platform.com', '2023-10-29 10:30:00'),
('EML-008', 'Billing reminder', 'Your subscription renews in 7 days', 'billing@platform.com', '2023-10-29 14:20:00'),
('EML-009', 'User feedback request', 'Help us improve by taking a quick survey', 'feedback@platform.com', '2023-10-30 11:00:00'),
('EML-010', 'Welcome email template update', 'We updated our onboarding email flow', 'product@platform.com', '2023-10-30 16:30:00');

INSERT OR IGNORE INTO twitter_posts (tweet_id, content, author, created_at) VALUES 
('TWT-001', 'Cloudflare D1 is amazing! #cloudflare #d1', 'cf_fan', '2023-10-26 16:00:00'),
('TWT-002', 'Just deployed my first worker.', 'dev_guy', '2023-10-26 17:00:00'),
('TWT-003', 'Serverless architecture changed how we build #serverless', 'cloudlover', '2023-10-27 09:30:00'),
('TWT-004', 'Anyone else excited about WebAssembly?', 'tech_enthusiast', '2023-10-27 10:45:00'),
('TWT-005', 'Spent the whole day debugging CORS 😅', 'frontend_dev', '2023-10-28 13:20:00'),
('TWT-006', 'New blog post: Edge computing for beginners', 'tech_blogger', '2023-10-28 14:15:00'),
('TWT-007', 'Just hit 10k requests/sec with Workers! 🚀', 'perf_engineer', '2023-10-29 08:00:00'),
('TWT-008', 'Zero-downtime deployment checklist thread 🧵', 'devops_guru', '2023-10-29 11:30:00'),
('TWT-009', 'Edge SQL with D1: Game changer for global apps', 'data_engineer', '2023-10-30 07:45:00'),
('TWT-010', 'Why our team switched from containers to Workers', 'team_lead', '2023-10-30 09:10:00');

INSERT OR IGNORE INTO forum_posts (post_id, forum, title, content, author, created_at) VALUES 
('FRM-001', 'General Discussion', 'How to use D1?', 'I have a question about D1 schemas.', 'user_1', '2023-10-26 18:00:00'),
('FRM-002', 'Showcase', 'My new app built with Cloudflare', 'Check it out at example.com', 'user_2', '2023-10-26 19:00:00'),
('FRM-003', 'Help & Support', 'Database connection issues', 'My Workers cannot connect to D1 database', 'user_3', '2023-10-27 20:30:00'),
('FRM-004', 'Feature Requests', 'Environment variables in preview', 'Need ability to set env vars per preview', 'user_4', '2023-10-27 21:45:00'),
('FRM-005', 'Tutorials', 'Step-by-step Workers guide', 'I wrote a comprehensive tutorial for beginners', 'user_5', '2023-10-28 15:20:00'),
('FRM-006', 'General Discussion', 'Best practices for API design', 'What are your favorite design patterns?', 'user_6', '2023-10-28 16:35:00'),
('FRM-007', 'Help & Support', 'CORS issues with Workers', 'Getting blocked by browser CORS policies', 'user_7', '2023-10-29 09:10:00'),
('FRM-008', 'Showcase', 'E-commerce platform on Workers', 'Built a full store without servers', 'user_8', '2023-10-29 10:25:00'),
('FRM-009', 'Tutorials', 'Real-time collaboration with Durable Objects', 'How to build collaborative apps', 'user_9', '2023-10-30 12:40:00'),
('FRM-010', 'General Discussion', 'Performance monitoring tips', 'How do you monitor edge performance?', 'user_10', '2023-10-30 13:55:00');


