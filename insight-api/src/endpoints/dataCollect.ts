import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env, TicketSchema, DiscordSchema, GitHubSchema, EmailSchema, TwitterSchema, ForumSchema } from "../types";

async function updateAggregated(db: D1Database, column: string) {
	const today = new Date().toISOString().split('T')[0];
	await db.prepare(`
		INSERT INTO insights_aggregated (date, ${column})
		VALUES (?, 1)
		ON CONFLICT(date) DO UPDATE SET ${column} = ${column} + 1
	`).bind(today).run();
}

export class TicketCollect extends OpenAPIRoute {
	schema = {
		tags: ["Collection"],
		summary: "Collect Customer Support Ticket",
		request: {
			body: {
				content: {
					"application/json": {
						schema: TicketSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Ticket collected successfully",
				...contentJson(z.object({
					success: z.boolean(),
				})),
			},
		},
	};

	async handle(c: any) {
		const data = await this.getValidatedData<typeof this.schema>();
		const body = data.body;
		const { DB } = c.env as Env;

		await DB.prepare(
			"INSERT INTO customer_support_tickets (ticket_id, content, status, user_id) VALUES (?, ?, ?, ?)"
		).bind(body.ticket_id, body.content, body.status, body.user_id).run();

		await updateAggregated(DB, 'total_tickets');

		return { success: true };
	}
}

export class DiscordCollect extends OpenAPIRoute {
	schema = {
		tags: ["Collection"],
		summary: "Collect Discord Message",
		request: {
			body: {
				content: {
					"application/json": {
						schema: DiscordSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Message collected successfully",
				...contentJson(z.object({
					success: z.boolean(),
				})),
			},
		},
	};

	async handle(c: any) {
		const data = await this.getValidatedData<typeof this.schema>();
		const body = data.body;
		const { DB } = c.env as Env;

		await DB.prepare(
			"INSERT INTO discord_messages (message_id, channel_id, content, author_id) VALUES (?, ?, ?, ?)"
		).bind(body.message_id, body.channel_id, body.content, body.author_id).run();

		await updateAggregated(DB, 'total_discord');

		return { success: true };
	}
}

export class GitHubCollect extends OpenAPIRoute {
	schema = {
		tags: ["Collection"],
		summary: "Collect GitHub Issue",
		request: {
			body: {
				content: {
					"application/json": {
						schema: GitHubSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Issue collected successfully",
				...contentJson(z.object({
					success: z.boolean(),
				})),
			},
		},
	};

	async handle(c: any) {
		const data = await this.getValidatedData<typeof this.schema>();
		const body = data.body;
		const { DB } = c.env as Env;

		await DB.prepare(
			"INSERT INTO github_issues (issue_id, repo, title, body, state) VALUES (?, ?, ?, ?, ?)"
		).bind(body.issue_id, body.repo, body.title, body.body, body.state).run();

		await updateAggregated(DB, 'total_issues');

		return { success: true };
	}
}

export class EmailCollect extends OpenAPIRoute {
	schema = {
		tags: ["Collection"],
		summary: "Collect Email",
		request: {
			body: {
				content: {
					"application/json": {
						schema: EmailSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Email collected successfully",
				...contentJson(z.object({
					success: z.boolean(),
				})),
			},
		},
	};

	async handle(c: any) {
		const data = await this.getValidatedData<typeof this.schema>();
		const body = data.body;
		const { DB } = c.env as Env;

		await DB.prepare(
			"INSERT INTO emails (email_id, subject, body, sender) VALUES (?, ?, ?, ?)"
		).bind(body.email_id, body.subject, body.body, body.sender).run();

		await updateAggregated(DB, 'total_emails');

		return { success: true };
	}
}

export class TwitterCollect extends OpenAPIRoute {
	schema = {
		tags: ["Collection"],
		summary: "Collect Twitter Post",
		request: {
			body: {
				content: {
					"application/json": {
						schema: TwitterSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Post collected successfully",
				...contentJson(z.object({
					success: z.boolean(),
				})),
			},
		},
	};

	async handle(c: any) {
		const data = await this.getValidatedData<typeof this.schema>();
		const body = data.body;
		const { DB } = c.env as Env;

		await DB.prepare(
			"INSERT INTO twitter_posts (tweet_id, content, author) VALUES (?, ?, ?)"
		).bind(body.tweet_id, body.content, body.author).run();

		await updateAggregated(DB, 'total_tweets');

		return { success: true };
	}
}

export class ForumCollect extends OpenAPIRoute {
	schema = {
		tags: ["Collection"],
		summary: "Collect Forum Post",
		request: {
			body: {
				content: {
					"application/json": {
						schema: ForumSchema,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Post collected successfully",
				...contentJson(z.object({
					success: z.boolean(),
				})),
			},
		},
	};

	async handle(c: any) {
		const data = await this.getValidatedData<typeof this.schema>();
		const body = data.body;
		const { DB } = c.env as Env;

		await DB.prepare(
			"INSERT INTO forum_posts (post_id, forum, title, content, author) VALUES (?, ?, ?, ?, ?)"
		).bind(body.post_id, body.forum, body.title, body.content, body.author).run();

		await updateAggregated(DB, 'total_forum');

		return { success: true };
	}
}
