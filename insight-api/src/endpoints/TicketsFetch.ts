import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

export class TicketsFetch extends OpenAPIRoute {
	schema = {
		tags: ["Data"],
		summary: "Fetch all customer support tickets",
		responses: {
			"200": {
				description: "List of tickets",
				...contentJson(z.array(z.object({
					id: z.number(),
					ticket_id: z.string(),
					content: z.string(),
					status: z.string(),
					user_id: z.string(),
					created_at: z.string(),
				}))),
			},
		},
	};

	async handle(c: any) {
		const { DB } = c.env as Env;
		const results = await DB.prepare(
			"SELECT * FROM customer_support_tickets ORDER BY created_at DESC"
		).all();
		return results.results || [];
	}
}
