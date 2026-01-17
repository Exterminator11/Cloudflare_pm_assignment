import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

export class InsightsGet extends OpenAPIRoute {
	schema = {
		tags: ["Insights"],
		summary: "Get Actionable Insights",
		responses: {
			"200": {
				description: "Aggregated events retrieved successfully",
				...contentJson(z.object({
					events: z.array(z.object({
						source: z.string(),
						id: z.string(),
						content: z.string(),
						status: z.string(),
						user_id: z.string(),
						created_at: z.string(),
						extras: z.string(), // JSON string
					})),
					total_events: z.number(),
				})),
			},
		},
	};

	async handle(c: any) {
		const { DB } = c.env as Env;

		// Query all tables and aggregate with matched fields
		const queries = [
			{ source: "tickets", sql: "SELECT 'tickets' as source, ticket_id as id, content, status, user_id, created_at, json_object('status', status, 'user_id', user_id) as extras FROM customer_support_tickets" },
			{ source: "discord", sql: "SELECT 'discord' as source, message_id as id, content, '' as status, author_id as user_id, created_at, json_object('channel_id', channel_id, 'author_id', author_id) as extras FROM discord_messages" },
			{ source: "github", sql: "SELECT 'github' as source, issue_id as id, body as content, state as status, '' as user_id, created_at, json_object('repo', repo, 'title', title, 'state', state) as extras FROM github_issues" },
			{ source: "email", sql: "SELECT 'email' as source, email_id as id, body as content, '' as status, sender as user_id, received_at as created_at, json_object('subject', subject, 'sender', sender) as extras FROM emails" },
			{ source: "twitter", sql: "SELECT 'twitter' as source, tweet_id as id, content, '' as status, author as user_id, created_at, json_object('author', author) as extras FROM twitter_posts" },
			{ source: "forum", sql: "SELECT 'forum' as source, post_id as id, content, '' as status, author as user_id, created_at, json_object('forum', forum, 'title', title, 'author', author) as extras FROM forum_posts" },
		];

		const allEvents = [];
		for (const { source, sql } of queries) {
			const results = await DB.prepare(sql).all();
			allEvents.push(...(results.results || []));
		}

		// Store aggregated events with full persistence
		if (allEvents.length > 0) {
			const insertStmt = DB.prepare(
				"INSERT INTO insights_events (source, source_id, content, status, user_id, created_at, extras) VALUES (?, ?, ?, ?, ?, ?, ?)"
			);

			for (const event of allEvents) {
				await insertStmt.bind(
					event.source,
					event.id.toString(),
					event.content,
					event.status,
					event.user_id,
					event.created_at,
					event.extras
				).run();
			}
		}

		return {
			events: allEvents,
			total_events: allEvents.length,
			persisted: true,
		};
	}
}
