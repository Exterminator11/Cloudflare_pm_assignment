import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

export class ForumFetch extends OpenAPIRoute {
	schema = {
		tags: ["Data"],
		summary: "Fetch all forum posts",
		responses: {
			"200": {
				description: "List of forum posts",
				...contentJson(z.array(z.object({
					id: z.number(),
					post_id: z.string(),
					forum: z.string(),
					title: z.string(),
					content: z.string(),
					author: z.string(),
					created_at: z.string(),
				}))),
			},
		},
	};

	async handle(c: any) {
		const { DB } = c.env as Env;
		const results = await DB.prepare(
			"SELECT * FROM forum_posts ORDER BY created_at DESC"
		).all();
		return results.results || [];
	}
}
