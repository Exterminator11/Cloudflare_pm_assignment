import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

export class DiscordFetch extends OpenAPIRoute {
	schema = {
		tags: ["Data"],
		summary: "Fetch all Discord messages",
		responses: {
			"200": {
				description: "List of Discord messages",
				...contentJson(z.array(z.object({
					id: z.number(),
					message_id: z.string(),
					channel_id: z.string(),
					content: z.string(),
					author_id: z.string(),
					created_at: z.string(),
				}))),
			},
		},
	};

	async handle(c: any) {
		const { DB } = c.env as Env;
		const results = await DB.prepare(
			"SELECT * FROM discord_messages ORDER BY created_at DESC"
		).all();
		return results.results || [];
	}
}
