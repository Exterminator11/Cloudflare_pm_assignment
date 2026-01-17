import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

export class GithubFetch extends OpenAPIRoute {
	schema = {
		tags: ["Data"],
		summary: "Fetch all GitHub issues",
		responses: {
			"200": {
				description: "List of GitHub issues",
				...contentJson(z.array(z.object({
					id: z.number(),
					issue_id: z.number(),
					repo: z.string(),
					title: z.string(),
					body: z.string(),
					state: z.string(),
					created_at: z.string(),
				}))),
			},
		},
	};

	async handle(c: any) {
		const { DB } = c.env as Env;
		const results = await DB.prepare(
			"SELECT * FROM github_issues ORDER BY created_at DESC"
		).all();
		return results.results || [];
	}
}
