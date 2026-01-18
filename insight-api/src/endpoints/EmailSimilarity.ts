import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

export class EmailSimilarity extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "Find similar emails using semantic search",
		request: {
			params: z.object({
				email_id: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "Similar emails found",
				...contentJson(
					z.object({
						similar: z.array(
							z.object({
								email_id: z.string(),
								subject: z.string(),
								sender: z.string(),
								received_at: z.string(),
								similarity: z.number(),
							})
						),
					})
				),
			},
		},
	};

	async handle(c: any) {
		const { email_id } = c.req.param();
		const { DB, EMAIL_VECTORS } = c.env as Env;

		try {
			// Get the vector for the reference email
			const referenceVector = await EMAIL_VECTORS.getByIds([email_id]);
			if (!referenceVector.length) {
				return { similar: [] };
			}

			// Query for similar vectors
			const similar = await EMAIL_VECTORS.query(referenceVector[0].values, { topK: 11 });

			// Get email details for similar results, excluding self
			const similarIds = similar.matches
				.filter(match => match.id !== email_id)
				.slice(0, 10)
				.map(match => match.id);

			if (similarIds.length === 0) {
				return { similar: [] };
			}

			const placeholders = similarIds.map(() => '?').join(',');
			const emails = await DB.prepare(
				`SELECT email_id, subject, sender, received_at FROM emails WHERE email_id IN (${placeholders})`
			).bind(...similarIds).all();

			const emailMap = new Map(emails.results.map((email: any) => [email.email_id, email]));

			// Combine with similarity scores
			const similarEmails = similar.matches
				.filter(match => match.id !== email_id)
				.slice(0, 10)
				.map(match => {
					const email = emailMap.get(match.id);
					return {
						email_id: match.id,
						subject: email?.subject || '',
						sender: email?.sender || '',
						received_at: email?.received_at || '',
						similarity: match.score,
					};
				});

			return { similar: similarEmails };
		} catch (err) {
			// Fallback for local development or when Vectorize is not available
			console.error('Vectorize error:', err);
			return { similar: [] };
		}
	}
}