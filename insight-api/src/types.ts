import { Str } from "chanfana";
import { z } from "zod";

export interface Env {
	DB: D1Database;
	AI: Ai;
	EMAIL_VECTORS: Vectorize;
}

export const TicketSchema = z.object({
	ticket_id: Str(),
	content: Str(),
	status: Str(),
	user_id: Str(),
});

export const DiscordSchema = z.object({
	message_id: Str(),
	channel_id: Str(),
	content: Str(),
	author_id: Str(),
});

export const GitHubSchema = z.object({
	issue_id: z.number(),
	repo: Str(),
	title: Str(),
	body: Str(),
	state: Str(),
});

export const EmailSchema = z.object({
	email_id: Str(),
	subject: Str(),
	body: Str(),
	sender: Str(),
});

export const TwitterSchema = z.object({
	tweet_id: Str(),
	content: Str(),
	author: Str(),
});

export const ForumSchema = z.object({
	post_id: Str(),
	forum: Str(),
	title: Str(),
	content: Str(),
	author: Str(),
});
