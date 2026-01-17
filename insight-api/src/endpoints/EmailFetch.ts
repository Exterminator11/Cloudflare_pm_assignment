import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

export class EmailFetch extends OpenAPIRoute {
	schema = {
		tags: ["Data"],
		summary: "Fetch all emails",
		responses: {
			"200": {
				description: "List of emails",
				...contentJson(z.array(z.object({
					id: z.number(),
					email_id: z.string(),
					subject: z.string(),
					body: z.string(),
					sender: z.string(),
					received_at: z.string(),
				}))),
			},
		},
	};

	async handle(c: any) {
		const { DB } = c.env as Env;
		const results = await DB.prepare(
			"SELECT * FROM emails ORDER BY received_at DESC"
		).all();
		return results.results || [];
	}
}
