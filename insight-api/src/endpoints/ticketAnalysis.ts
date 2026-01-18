import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

interface CategorizedTicket {
	ticket_id: string;
	category: string;
	confidence: number;
}

interface CategoryResult {
	name: string;
	count: number;
	percentage: number;
	trend: "increasing" | "decreasing" | "stable";
	examples: Array<{ ticket_id: string; content: string }>;
}

interface TimelinePoint {
	date: string;
	total: number;
	[category: string]: number | string;
}

export class TicketAnalysis extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "AI-powered ticket analysis by product area",
		responses: {
			"200": {
				description: "Analysis results",
				...contentJson(
					z.object({
						dateRange: z.object({
							start: z.string(),
							end: z.string(),
						}),
						categories: z.array(
							z.object({
								name: z.string(),
								count: z.number(),
								percentage: z.number(),
								trend: z.enum(["increasing", "decreasing", "stable"]),
								examples: z.array(
									z.object({
										ticket_id: z.string(),
										content: z.string(),
									})
								),
							})
						),
						timeline: z.array(
							z.record(z.union([z.number(), z.string()]))
						),
						advice: z.string(),
						priorityAreas: z.array(z.string()),
					})
				),
			},
		},
	};

	async handle(c: any) {
		const { AI, DB } = c.env as Env;

		const results = await DB.prepare(
			`SELECT ticket_id, content, status, created_at
			FROM customer_support_tickets
			ORDER BY created_at DESC
			LIMIT 100`
		).all();

		const tickets = results.results || [];

		if (tickets.length === 0) {
			return {
				dateRange: {
					start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
					end: new Date().toISOString(),
				},
				categories: [],
				timeline: [],
				advice: "No tickets to analyze for the selected time period.",
				priorityAreas: [],
			};
		}

		const ticketTexts = tickets
			.map((t: any) => `[${t.ticket_id}] ${t.content}`)
			.join("\n---\n");

		const categorizationPrompt = `
Analyze these ${tickets.length} customer support tickets and discover what product areas/domains they relate to.

IMPORTANT: 
1. Let the data guide you - discover 4-8 natural categories based on actual ticket content
2. Categories should be product-focused (e.g., "Mobile App", "Billing", "API", "Dashboard", "Authentication", "Notifications", etc.)
3. Be specific and actionable - avoid vague categories like "General" or "Other"
4. Each ticket should be assigned to exactly one category

Return a valid JSON object with this structure:
{
  "categories": ["Category1", "Category2", "Category3", ...],
  "tickets": [{"ticket_id": "ticket_id_1", "category": "Category1", "confidence": 0.9}, ...]
}

Tickets to analyze:
${ticketTexts.slice(0, 8000)}
`;

		const categorizationResponse = await AI.run(
			"@cf/meta/llama-3-8b-instruct",
			{
				messages: [
					{
						role: "system",
						content:
							"You are a product analytics assistant. You must respond with valid JSON only, no markdown, no explanation.",
					},
					{ role: "user", content: categorizationPrompt },
				],
				response_format: { type: "json_object" },
				max_tokens: 2048,
			}
		);

		let categorization: { categories: string[]; tickets: CategorizedTicket[] };
		try {
			categorization = JSON.parse(categorizationResponse.response);
		} catch {
			categorization = {
				categories: ["Uncategorized"],
				tickets: tickets.map((t: any) => ({
					ticket_id: t.ticket_id,
					category: "Uncategorized",
					confidence: 1.0,
				})),
			};
		}

		const categoryCounts: Record<string, number> = {};
		const categoryTickets: Record<string, Array<{ ticket_id: string; content: string }>> = {};
		const timelineData: Record<string, Record<string, number>> = {};

		categorization.tickets.forEach((item) => {
			const cat = item.category || "Uncategorized";
			const ticket = tickets.find((t: any) => t.ticket_id === item.ticket_id);

			categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

			if (!categoryTickets[cat]) categoryTickets[cat] = [];
			if (ticket && categoryTickets[cat].length < 3) {
				categoryTickets[cat].push({
					ticket_id: ticket.ticket_id,
					content: ticket.content,
				});
			}

			if (ticket?.created_at) {
				const date = ticket.created_at.split("T")[0];
				if (!timelineData[date]) timelineData[date] = {};
				timelineData[date][cat] = (timelineData[date][cat] || 0) + 1;
			}
		});

		const sortedDates = Object.keys(timelineData).sort();
		const calculateTrend = (
			category: string,
			timeline: Record<string, Record<string, number>>,
			dates: string[]
		): "increasing" | "decreasing" | "stable" => {
			if (dates.length < 2) return "stable";

			const firstHalf = dates.slice(0, Math.floor(dates.length / 2));
			const secondHalf = dates.slice(Math.floor(dates.length / 2));

			const firstCount = firstHalf.reduce((sum, d) => sum + (timeline[d]?.[category] || 0), 0);
			const secondCount = secondHalf.reduce((sum, d) => sum + (timeline[d]?.[category] || 0), 0);

			if (secondCount > firstCount * 1.2) return "increasing";
			if (secondCount < firstCount * 0.8) return "decreasing";
			return "stable";
		};

		const total = tickets.length;
		const categories: CategoryResult[] = Object.entries(categoryCounts)
			.map(([name, count]) => ({
				name,
				count,
				percentage: Math.round((count / total) * 100),
				trend: calculateTrend(name, timelineData, sortedDates),
				examples: categoryTickets[name] || [],
			}))
			.sort((a, b) => b.count - a.count);

		const timeline: TimelinePoint[] = sortedDates.map((date) => {
			const point: TimelinePoint = {
				date,
				total: 0,
			};
			categories.forEach((cat) => {
				point[cat.name] = timelineData[date]?.[cat.name] || 0;
				point.total += timelineData[date]?.[cat.name] || 0;
			});
			return point;
		});

		const categoryCountsText = categories
			.map((c, i) => `${i + 1}. ${c.name}: ${c.count} tickets (${c.percentage}%)`)
			.join("\n");

		const trendText = categories
			.map((c) => `${c.name}: ${c.trend}`)
			.join(", ");

		const advicePrompt = `
You are a product management advisor. Analyze this ticket data and provide actionable recommendations.

## Ticket Data
Total Tickets: ${total}
${categoryCountsText}

Trends: ${trendText}

Based on this data, provide:
1. Top 3 product areas needing the most urgent attention (with reasoning)
2. 3-5 specific, actionable recommendations for improvements
3. Identify any quick wins vs. long-term investments

Keep your response concise, professional, and actionable. Format as JSON:
{
  "priorityAreas": ["Area 1", "Area 2", "Area 3"],
  "advice": "Your comprehensive advice paragraph here..."
}
`;

		const adviceResponse = await AI.run("@cf/meta/llama-3-8b-instruct", {
			messages: [
				{
					role: "system",
					content:
						"You are a product management advisor. Respond with valid JSON only.",
				},
				{ role: "user", content: advicePrompt },
			],
			response_format: { type: "json_object" },
			max_tokens: 1024,
		});

		let adviceData: { priorityAreas: string[]; advice: string };
		try {
			adviceData = JSON.parse(adviceResponse.response);
		} catch {
			adviceData = {
				priorityAreas: categories.slice(0, 3).map((c) => c.name),
				advice:
					"Focus on addressing the highest-volume categories first. Consider user feedback patterns and allocate resources accordingly.",
			};
		}

		const startDate = sortedDates[0]
			? new Date(sortedDates[0])
			: new Date(Date.now() - days * 24 * 60 * 60 * 1000);
		const endDate = sortedDates[sortedDates.length - 1]
			? new Date(sortedDates[sortedDates.length - 1])
			: new Date();

		return {
			dateRange: {
				start: startDate.toISOString(),
				end: endDate.toISOString(),
			},
			categories,
			timeline,
			advice: adviceData.advice,
			priorityAreas: adviceData.priorityAreas,
		};
	}
}
