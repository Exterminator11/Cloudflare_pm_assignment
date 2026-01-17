import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { DataSource, DataSourceType, AggregatedTask } from "../types/data-sources";
import { type AppContext } from "../types";

// Mock data sources for demonstration
const mockDataSources: DataSource[] = [
  {
    id: "cs-001",
    type: "customer_support_ticket",
    source: "zendesk",
    timestamp: new Date("2024-01-15T10:30:00Z"),
    author: {
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      platform: "zendesk"
    },
    content: {
      title: "Login issue with mobile app",
      body: "I'm unable to login to the mobile app using my credentials. I keep getting an authentication error.",
      url: "https://zendesk.example.com/tickets/123"
    },
    metadata: {
      ticket_id: "123",
      status: "open",
      priority: "high",
      category: "authentication",
      assigned_agent: null,
      customer_id: "cust-123"
    }
  },
  {
    id: "discord-001",
    type: "discord_message",
    source: "discord",
    timestamp: new Date("2024-01-15T11:15:00Z"),
    author: {
      id: "user-456",
      name: "Jane Smith",
      username: "janesmith",
      platform: "discord"
    },
    content: {
      body: "Is anyone else experiencing slow load times on the dashboard?",
      url: "https://discord.com/channels/123/456/789"
    },
    metadata: {
      message_id: "789",
      channel_id: "456",
      channel_name: "general",
      guild_id: "123",
      guild_name: "InsightMate Community",
      mentions: [],
      reactions: [],
      is_thread: false,
      parent_message_id: null
    }
  },
  {
    id: "github-001",
    type: "github_issue",
    source: "github",
    timestamp: new Date("2024-01-15T09:45:00Z"),
    author: {
      id: "user-789",
      name: "Bob Wilson",
      username: "bobwilson",
      platform: "github"
    },
    content: {
      title: "Bug: Data export fails for large datasets",
      body: "When trying to export datasets larger than 10MB, the export fails with a timeout error.",
      url: "https://github.com/insightmate/app/issues/456"
    },
    metadata: {
      issue_id: 456,
      repository: "app",
      owner: "insightmate",
      state: "open",
      labels: ["bug", "export"],
      assignees: [],
      milestone: null,
      pull_request: false,
      issue_number: 456
    }
  }
];

// Data source collection service
class DataSourceCollectionService {
  constructor(private env: Env) {}

  async collectFromAllPlatforms(): Promise<DataSource[]> {
    const collectedData: DataSource[] = [];
    
    // In a real implementation, this would:
    // 1. Connect to various platform APIs (Zendesk, Discord, GitHub, etc.)
    // 2. Fetch new data since last collection
    // 3. Normalize data to unified schema
    // 4. Store in database
    
    // For now, return mock data
    collectedData.push(...mockDataSources);
    
    return collectedData;
  }

  async collectFromPlatform(platform: DataSourceType): Promise<DataSource[]> {
    // In a real implementation, this would collect from a specific platform
    return mockDataSources.filter(source => source.type === platform);
  }

  async storeDataSource(dataSource: DataSource): Promise<void> {
    // Store in appropriate database based on type
    switch (dataSource.type) {
      case 'customer_support_ticket':
        await this.storeCustomerSupportTicket(dataSource);
        break;
      case 'discord_message':
        await this.storeDiscordMessage(dataSource);
        break;
      case 'github_issue':
        await this.storeGitHubIssue(dataSource);
        break;
      case 'email':
        await this.storeEmail(dataSource);
        break;
      case 'twitter_post':
        await this.storeTwitterPost(dataSource);
        break;
      case 'forum_post':
        await this.storeForumPost(dataSource);
        break;
    }
  }

  private async storeCustomerSupportTicket(dataSource: DataSource): Promise<void> {
    const ticket = dataSource as any;
    await this.env.insightmate_tickets.prepare(`
      INSERT OR REPLACE INTO customer_support_tickets (
        id, ticket_id, source, timestamp, author_id, author_name, author_username, 
        author_email, author_avatar, author_platform, title, body, html, url, 
        status, priority, category, assigned_agent, customer_id, tags, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      ticket.id,
      ticket.metadata.ticket_id,
      ticket.source,
      ticket.timestamp.toISOString(),
      ticket.author.id,
      ticket.author.name,
      ticket.author.username || null,
      ticket.author.email || null,
      ticket.author.avatar || null,
      ticket.author.platform,
      ticket.content.title || null,
      ticket.content.body,
      ticket.content.html || null,
      ticket.content.url || null,
      ticket.metadata.status,
      ticket.metadata.priority,
      ticket.metadata.category,
      ticket.metadata.assigned_agent || null,
      ticket.metadata.customer_id,
      JSON.stringify(ticket.metadata.tags || []),
      JSON.stringify(ticket.metadata),
      new Date().toISOString()
    ).run();
  }

  private async storeDiscordMessage(dataSource: DataSource): Promise<void> {
    const message = dataSource as any;
    await this.env.insightmate_discord.prepare(`
      INSERT OR REPLACE INTO discord_messages (
        id, message_id, source, timestamp, author_id, author_name, author_username, 
        author_avatar, author_platform, body, html, url, channel_id, channel_name, 
        guild_id, guild_name, mentions, reactions, is_thread, parent_message_id, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      message.id,
      message.metadata.message_id,
      message.source,
      message.timestamp.toISOString(),
      message.author.id,
      message.author.name,
      message.author.username || null,
      message.author.avatar || null,
      message.author.platform,
      message.content.body,
      message.content.html || null,
      message.content.url || null,
      message.metadata.channel_id,
      message.metadata.channel_name,
      message.metadata.guild_id,
      message.metadata.guild_name,
      JSON.stringify(message.metadata.mentions || []),
      JSON.stringify(message.metadata.reactions || []),
      message.metadata.is_thread || false,
      message.metadata.parent_message_id || null,
      JSON.stringify(message.metadata),
      new Date().toISOString()
    ).run();
  }

  private async storeGitHubIssue(dataSource: DataSource): Promise<void> {
    const issue = dataSource as any;
    await this.env.insightmate_github.prepare(`
      INSERT OR REPLACE INTO github_issues (
        id, issue_id, source, timestamp, author_id, author_name, author_username, 
        author_avatar, author_platform, title, body, html, url, repository, owner, 
        state, labels, assignees, milestone, pull_request, issue_number, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      issue.id,
      issue.metadata.issue_id,
      issue.source,
      issue.timestamp.toISOString(),
      issue.author.id,
      issue.author.name,
      issue.author.username || null,
      issue.author.avatar || null,
      issue.author.platform,
      issue.content.title,
      issue.content.body || null,
      issue.content.html || null,
      issue.content.url,
      issue.metadata.repository,
      issue.metadata.owner,
      issue.metadata.state,
      JSON.stringify(issue.metadata.labels || []),
      JSON.stringify(issue.metadata.assignees || []),
      issue.metadata.milestone || null,
      issue.metadata.pull_request || false,
      issue.metadata.issue_number,
      JSON.stringify(issue.metadata),
      new Date().toISOString()
    ).run();
  }

  private async storeEmail(dataSource: DataSource): Promise<void> {
    const email = dataSource as any;
    await this.env.insightmate_email.prepare(`
      INSERT OR REPLACE INTO emails (
        id, email_id, source, timestamp, author_id, author_name, author_username, 
        author_email, author_avatar, author_platform, subject, body, html, url, thread_id, 
        from_email, from_name, to_emails, cc_emails, bcc_emails, in_reply_to, 
        message_id, folder, read, starred, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `    ).bind(
      email.id,
      email.metadata.email_id,
      email.source,
      email.timestamp.toISOString(),
      email.author.id,
      email.author.name,
      email.author.username || null,
      email.author.email,
      email.author.avatar || null,
      email.author.platform,
      email.content.subject,
      email.content.body,
      email.content.html || null,
      email.content.url || null,
      email.metadata.thread_id || null,
      email.metadata.from_email,
      email.metadata.from_name || null,
      JSON.stringify(email.metadata.to_emails || []),
      JSON.stringify(email.metadata.cc_emails || []),
      JSON.stringify(email.metadata.bcc_emails || []),
      email.metadata.in_reply_to || null,
      email.metadata.message_id,
      email.metadata.folder,
      email.metadata.read || false,
      email.metadata.starred || false,
      JSON.stringify(email.metadata),
      new Date().toISOString()
    ).run();
  }

  private async storeTwitterPost(dataSource: DataSource): Promise<void> {
    const tweet = dataSource as any;
    await this.env.insightmate_twitter.prepare(`
      INSERT OR REPLACE INTO twitter_posts (
        id, tweet_id, source, timestamp, author_id, author_name, author_username, 
        author_avatar, author_platform, body, html, url, conversation_id, in_reply_to_status_id, 
        lang, retweet_count, like_count, reply_count, quote_count, hashtags, mentions, 
        media, is_retweet, is_reply, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      tweet.id,
      tweet.metadata.tweet_id,
      tweet.source,
      tweet.timestamp.toISOString(),
      tweet.author.id,
      tweet.author.name,
      tweet.author.username,
      tweet.author.avatar || null,
      tweet.author.platform,
      tweet.content.body,
      tweet.content.html || null,
      tweet.content.url || null,
      tweet.metadata.conversation_id || null,
      tweet.metadata.in_reply_to_status_id || null,
      tweet.metadata.lang,
      tweet.metadata.retweet_count || 0,
      tweet.metadata.like_count || 0,
      tweet.metadata.reply_count || 0,
      tweet.metadata.quote_count || 0,
      JSON.stringify(tweet.metadata.hashtags || []),
      JSON.stringify(tweet.metadata.mentions || []),
      JSON.stringify(tweet.metadata.media || []),
      tweet.metadata.is_retweet || false,
      tweet.metadata.is_reply || false,
      JSON.stringify(tweet.metadata),
      tweet.timestamp.toISOString(),
      new Date().toISOString()
    ).run();
  }

  private async storeForumPost(dataSource: DataSource): Promise<void> {
    const post = dataSource as any;
    await this.env.insightmate_forums.prepare(`
      INSERT OR REPLACE INTO forum_posts (
        id, post_id, source, timestamp, author_id, author_name, author_username, 
        author_avatar, author_platform, title, body, html, url, topic_id, forum_name, 
        category, tags, view_count, reply_count, is_sticky, is_locked, last_reply_at, 
        parent_post_id, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      post.id,
      post.metadata.post_id,
      post.source,
      post.timestamp.toISOString(),
      post.author.id,
      post.author.name,
      post.author.username || null,
      post.author.avatar || null,
      post.author.platform,
      post.content.title || null,
      post.content.body,
      post.content.html || null,
      post.content.url || null,
      post.metadata.topic_id,
      post.metadata.forum_name,
      post.metadata.category,
      JSON.stringify(post.metadata.tags || []),
      post.metadata.view_count || 0,
      post.metadata.reply_count || 0,
      post.metadata.is_sticky || false,
      post.metadata.is_locked || false,
      post.metadata.last_reply_at || null,
      post.metadata.parent_post_id || null,
      JSON.stringify(post.metadata),
      post.timestamp.toISOString(),
      new Date().toISOString()
    ).run();
  }
}

// Data transformation service
class DataTransformationService {
  transformToTask(dataSource: DataSource): AggregatedTask {
    // Transform data source into aggregated task
    const priority = this.determinePriority(dataSource);
    const status = this.determineStatus(dataSource);
    
    return {
      id: `task-${dataSource.id}`,
      name: dataSource.content.title || this.generateTitleFromContent(dataSource.content.body),
      slug: `task-${dataSource.id}`,
      description: dataSource.content.body,
      completed: false,
      source_data: dataSource,
      source_type: dataSource.type,
      priority,
      status,
      created_at: dataSource.timestamp,
      updated_at: new Date(),
      tags: this.extractTags(dataSource)
    };
  }

  private determinePriority(dataSource: DataSource): 'low' | 'medium' | 'high' | 'urgent' {
    // Priority determination logic based on data source type and content
    if (dataSource.type === 'customer_support_ticket') {
      const ticket = dataSource as any;
      return ticket.metadata?.priority || 'medium';
    }
    
    if (dataSource.type === 'github_issue') {
      const issue = dataSource as any;
      if (issue.metadata?.labels?.includes('bug')) return 'high';
      if (issue.metadata?.labels?.includes('critical')) return 'urgent';
    }
    
    // Default priority based on content analysis
    const body = dataSource.content.body.toLowerCase();
    if (body.includes('urgent') || body.includes('critical')) return 'urgent';
    if (body.includes('bug') || body.includes('issue')) return 'high';
    if (body.includes('question') || body.includes('help')) return 'medium';
    
    return 'low';
  }

  private determineStatus(dataSource: DataSource): 'new' | 'in_progress' | 'review' | 'completed' | 'cancelled' {
    // Status determination logic
    if (dataSource.type === 'customer_support_ticket') {
      const ticket = dataSource as any;
      const ticketStatus = ticket.metadata?.status;
      if (ticketStatus === 'closed') return 'completed';
      if (ticketStatus === 'pending') return 'review';
      if (ticketStatus === 'open') return 'new';
    }
    
    if (dataSource.type === 'github_issue') {
      const issue = dataSource as any;
      return issue.metadata?.state === 'closed' ? 'completed' : 'new';
    }
    
    return 'new';
  }

  private generateTitleFromContent(body: string): string {
    // Generate title from first 50 characters of content
    return body.length > 50 ? body.substring(0, 47) + "..." : body;
  }

  private extractTags(dataSource: DataSource): string[] {
    const tags: string[] = [];
    
    // Add platform as tag
    tags.push(dataSource.type);
    
    // Extract tags from metadata
    if (dataSource.metadata.tags) {
      tags.push(...dataSource.metadata.tags);
    }
    
    if (dataSource.metadata.labels) {
      tags.push(...dataSource.metadata.labels);
    }
    
    // Extract hashtags from content
    const hashtagRegex = /#(\w+)/g;
    const hashtags = dataSource.content.body.match(hashtagRegex);
    if (hashtags) {
      tags.push(...hashtags.map(tag => tag.substring(1)));
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }
}

// Aggregation service
class AggregationService {
  private collectionService: DataSourceCollectionService;
  private transformationService: DataTransformationService;

  constructor(private env: Env) {
    this.collectionService = new DataSourceCollectionService(env);
    this.transformationService = new DataTransformationService();
  }

  async triggerAggregation(platforms?: DataSourceType[]): Promise<{
    success: boolean;
    message: string;
    aggregated_tasks: AggregatedTask[];
    sources_processed: number;
    platforms_processed: DataSourceType[];
  }> {
    try {
      // Collect data from platforms
      let collectedData: DataSource[];
      let platformsProcessed: DataSourceType[];
      
      if (platforms && platforms.length > 0) {
        // Collect from specific platforms
        collectedData = [];
        platformsProcessed = platforms;
        
        for (const platform of platforms) {
          const platformData = await this.collectionService.collectFromPlatform(platform);
          collectedData.push(...platformData);
        }
      } else {
        // Collect from all platforms
        collectedData = await this.collectionService.collectFromAllPlatforms();
        platformsProcessed = [...new Set(collectedData.map(item => item.type))];
      }
      
      // Store data sources in databases
      for (const dataSource of collectedData) {
        await this.collectionService.storeDataSource(dataSource);
      }
      
      // Transform data into tasks
      const aggregatedTasks = collectedData.map(dataSource => 
        this.transformationService.transformToTask(dataSource)
      );

      // Store aggregated tasks
      for (const task of aggregatedTasks) {
        await this.storeAggregatedTask(task);
      }
      
      return {
        success: true,
        message: `Successfully aggregated and stored data from ${platformsProcessed.length} platform(s)`,
        aggregated_tasks: aggregatedTasks,
        sources_processed: collectedData.length,
        platforms_processed: platformsProcessed
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Aggregation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        aggregated_tasks: [],
        sources_processed: 0,
        platforms_processed: []
      };
    }
  }

  private async storeAggregatedTask(task: AggregatedTask): Promise<void> {
    await this.env.insightmate_aggregated.prepare(`
      INSERT OR REPLACE INTO aggregated_tasks (
        id, name, slug, description, completed, due_date, source_data_id, 
        source_type, priority, status, assigned_to, created_at, updated_at, tags, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      task.id,
      task.name,
      task.slug,
      task.description || null,
      task.completed,
      task.due_date ? task.due_date.toISOString() : null,
      task.source_data.id,
      task.source_type,
      task.priority,
      task.status,
      task.assigned_to || null,
      task.created_at.toISOString(),
      task.updated_at.toISOString(),
      JSON.stringify(task.tags),
      JSON.stringify(task)
    ).run();
  }
}

export class AggregationTrigger extends OpenAPIRoute {
  schema = {
    tags: ["Aggregation"],
    summary: "Trigger data aggregation from all platforms",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              platforms: z.array(z.enum(['customer_support_ticket', 'discord_message', 'github_issue', 'email', 'twitter_post', 'forum_post'])).optional(),
              force_refresh: z.boolean().optional().default(false)
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Aggregation triggered successfully",
        content: {
          "application/json": {
            schema: z.object({
              series: z.object({
                success: Bool(),
                result: z.object({
                  message: z.string(),
                  aggregated_tasks: z.array(z.object({
                    id: z.string(),
                    name: z.string(),
                    slug: z.string(),
                    description: z.string().optional(),
                    completed: z.boolean(),
                    source_type: z.string(),
                    priority: z.enum(['low', 'medium', 'high', 'urgent']),
                    status: z.enum(['new', 'in_progress', 'review', 'completed', 'cancelled']),
                    created_at: z.string(),
                    updated_at: z.string(),
                    tags: z.array(z.string())
                  })),
                  sources_processed: z.number(),
                  platforms_processed: z.array(z.string())
                }),
              }),
            }),
          },
        },
      },
      "400": {
        description: "Invalid request",
        content: {
          "application/json": {
            schema: z.object({
              series: z.object({
                success: Bool(false),
                error: z.string(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    try {
      // Get validated data
      const data = await this.getValidatedData<typeof this.schema>();
      
      // Retrieve the validated request body
      const { platforms, force_refresh } = data.body;
      
      const aggregationService = new AggregationService(c.env);
      const result = await aggregationService.triggerAggregation(platforms);
      
      return {
        success: result.success,
        result: {
          message: result.message,
          aggregated_tasks: result.aggregated_tasks,
          sources_processed: result.sources_processed,
          platforms_processed: result.platforms_processed
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
}