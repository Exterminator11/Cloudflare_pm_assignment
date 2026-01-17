import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

export class TwitterFetch extends OpenAPIRoute {
	schema = {
		tags: ["Data"],
		summary: "Fetch all Twitter posts",
		responses: {
			"200": {
				description: "List of Twitter posts",
				...contentJson(z.array(z.object({
					id: z.number(),
					tweet_id: z.string(),
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
			"SELECT * FROM twitter_posts ORDER BY created_at DESC"
		).all();
		return results.results || [];
	}
}
