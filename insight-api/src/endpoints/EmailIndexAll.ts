import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

export class EmailIndexAll extends OpenAPIRoute {
	schema = {
		tags: ["Collection"],
		summary: "Index all emails into Vectorize for similarity search",
		responses: {
			"200": {
				description: "Emails indexed successfully",
				...contentJson(
					z.object({
						success: z.boolean(),
						indexed: z.number(),
						errors: z.number(),
					})
				),
			},
		},
	};

	async handle(c: any) {
		const { DB, AI, EMAIL_VECTORS } = c.env as Env;

		// Fetch all emails without vectors
		const results = await DB.prepare(
			"SELECT id, email_id, subject, body FROM emails"
		).all();

		const emails = results.results || [];
		if (emails.length === 0) {
			return { success: true, indexed: 0, errors: 0 };
		}

		let indexed = 0;
		let errors = 0;

		// Process emails in batches of 10
		for (const email of emails) {
			try {
				const text = `${email.subject} ${email.body}`;
				const embedding = await AI.run("@cf/baai/bge-base-en-v1.5", { text: text });

				// Insert into Vectorize
				await EMAIL_VECTORS.insert([{ id: email.email_id, values: embedding.data[0] }]);

				// Update vector_id in database
				await DB.prepare(
					"UPDATE emails SET vector_id = ? WHERE id = ?"
				).bind(email.email_id, email.id).run();

				indexed++;
			} catch (err) {
				console.error(`Failed to index email ${email.email_id}:`, err);
				errors++;
			}
		}

		return { success: errors === 0, indexed, errors };
	}
}
