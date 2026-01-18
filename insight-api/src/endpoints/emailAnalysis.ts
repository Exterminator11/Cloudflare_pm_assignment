import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

interface ClassifiedEmail {
	email_id: string;
	priority: "high" | "medium" | "low";
	confidence: number;
	reason: string;
}

interface PriorityGroup {
	high: any[];
	medium: any[];
	low: any[];
}

export class EmailAnalysis extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "AI-powered email priority analysis",
		responses: {
			"200": {
				description: "Priority analysis results",
				...contentJson(
					z.object({
						dateRange: z.object({
							emailCount: z.number(),
						}),
						priorities: z.object({
							high: z.array(z.any()),
							medium: z.array(z.any()),
							low: z.array(z.any()),
						}),
						summary: z.string(),
						insights: z.object({
							highCount: z.number(),
							mediumCount: z.number(),
							lowCount: z.number(),
							highPercentage: z.number(),
							urgentSenders: z.array(z.string()),
						}),
					})
				),
			},
		},
	};

	async handle(c: any) {
		const { AI, DB } = c.env as Env;

		const results = await DB.prepare(
			`SELECT email_id, subject, body, sender, received_at
			FROM emails
			ORDER BY received_at DESC
			LIMIT 100`
		).all();

		const emails = results.results || [];

		if (emails.length === 0) {
			return {
				dateRange: { emailCount: 0 },
				priorities: { high: [], medium: [], low: [] },
				summary: "No emails found for the selected time period.",
				insights: {
					highCount: 0,
					mediumCount: 0,
					lowCount: 0,
					highPercentage: 0,
					urgentSenders: [],
				},
			};
		}

		const emailTexts = emails
			.map((e: any) => `[Subject] ${e.subject}\n[Body] ${e.body?.substring(0, 500) || ""}`)
			.join("\n---\n");

		const priorityPrompt = `
Analyze these emails and classify each by priority level: HIGH, MEDIUM, or LOW.

Priority Guidelines:
- HIGH: Urgent matters, deadlines, complaints, critical issues, executive communications, security alerts, payment problems, emergency notifications
- MEDIUM: Regular business updates, meeting requests, informational emails, moderate importance, routine communications
- LOW: Newsletters, automated notifications, marketing, general announcements, low urgency, promotional content

Return JSON with this exact structure:
{
  "classifications": [
    {
      "email_id": "email_123",
      "priority": "HIGH",
      "confidence": 0.92,
      "reason": "Brief explanation why this is high priority"
    }
  ],
  "summary": "Overall email priority distribution and key observations"
}

Emails to analyze:
${emailTexts.slice(0, 6000)}
`;

		const aiResponse = await AI.run(
			"@cf/meta/llama-3-8b-instruct",
			{
				messages: [
					{
						role: "system",
						content:
							"You are an email triage assistant. Respond with valid JSON only, no markdown, no explanation.",
					},
					{ role: "user", content: priorityPrompt },
				],
				response_format: { type: "json_object" },
				max_tokens: 1024,
			}
		);

		let analysis: { classifications: ClassifiedEmail[]; summary: string };
		try {
			analysis = JSON.parse(aiResponse.response);
		} catch (error) {
			console.error("AI response parsing failed:", error);
			analysis = {
				classifications: [],
				summary: "Analysis completed but no significant classifications detected.",
			};
		}

		const priorities: PriorityGroup = { high: [], medium: [], low: [] };
		const classificationMap: Record<string, ClassifiedEmail> = {};

		(analysis.classifications || []).forEach((item: ClassifiedEmail) => {
			const email = emails.find((e: any) => e.email_id === item.email_id);
			if (email) {
				const priority = item.priority?.toLowerCase() || 'low';
				if (priorities[priority as keyof PriorityGroup]) {
					priorities[priority as keyof PriorityGroup].push({
						...email,
						priority,
						confidence: item.confidence,
						reason: item.reason,
					});
				}
				classificationMap[item.email_id] = item;
			}
		});

		const highCount = priorities.high.length;
		const mediumCount = priorities.medium.length;
		const lowCount = priorities.low.length;
		const total = highCount + mediumCount + lowCount;

		const insights = {
			highCount,
			mediumCount,
			lowCount,
			highPercentage: total > 0 ? Math.round((highCount / total) * 100) : 0,
			urgentSenders: [...new Set(priorities.high.map((e: any) => e.sender))].slice(0, 5),
		};

		return {
			dateRange: { emailCount: emails.length },
			priorities,
			summary: analysis.summary || "Analysis complete.",
			insights,
		};
	}
}
