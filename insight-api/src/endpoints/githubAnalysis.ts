import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

interface CategorizedIssue {
	issue_id: string;
	category: string;
	confidence: number;
}

interface CategoryResult {
	name: string;
	count: number;
	percentage: number;
	trend: "increasing" | "decreasing" | "stable";
	examples: Array<{ issue_id: string; title: string; state: string }>;
}

interface TimelinePoint {
	date: string;
	total: number;
	[category: string]: number | string;
}

export class GithubAnalysis extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "AI-powered GitHub issues analysis by application area",
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
										issue_id: z.string(),
										title: z.string(),
										state: z.string(),
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
			`SELECT issue_id, title, body, state, created_at
			FROM github_issues
			ORDER BY created_at DESC
			LIMIT 100`
		).all();

		const issues = results.results || [];

		if (issues.length === 0) {
			return {
				dateRange: {
					start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
					end: new Date().toISOString(),
				},
				categories: [],
				timeline: [],
				advice: "No GitHub issues found for the selected time period.",
				priorityAreas: [],
			};
		}

		const issueTexts = issues
			.map((i: any) => `[${i.issue_id}] ${i.title}: ${i.body || ""}`)
			.join("\n---\n");

		const categorizationPrompt = `
Analyze these GitHub issues and categorize each by application area/component.

IMPORTANT:
1. Let the data guide you - discover 4-8 natural categories based on actual issue content
2. Categories should be application-focused (e.g., "Frontend/UI", "API/Backend", "Database", "Authentication", "Mobile", "Testing", "Documentation", "Performance", "Security")
3. Be specific and actionable - avoid vague categories like "General" or "Other"
4. Each issue should be assigned to exactly one category

Return JSON with this exact structure:
{
  "categories": ["Category1", "Category2", "Category3", ...],
  "issues": [{"issue_id": "issue_id_1", "category": "Category1", "confidence": 0.9}, ...]
}

Issues to analyze:
${issueTexts.slice(0, 8000)}
`;

		const categorizationResponse = await AI.run(
			"@cf/meta/llama-3-8b-instruct",
			{
				messages: [
					{
						role: "system",
						content:
							"You are a software engineering analyst. Respond with valid JSON only, no markdown, no explanation.",
					},
					{ role: "user", content: categorizationPrompt },
				],
				response_format: { type: "json_object" },
				max_tokens: 2048,
			}
		);

		let categorization: { categories: string[]; issues: CategorizedIssue[] };
		try {
			categorization = JSON.parse(categorizationResponse.response);
		} catch {
			categorization = {
				categories: ["Uncategorized"],
				issues: issues.map((i: any) => ({
					issue_id: i.issue_id.toString(),
					category: "Uncategorized",
					confidence: 1.0,
				})),
			};
		}

		const categoryCounts: Record<string, number> = {};
		const categoryIssues: Record<string, Array<{ issue_id: string; title: string; state: string }>> = {};
		const timelineData: Record<string, Record<string, number>> = {};

		categorization.issues.forEach((item) => {
			const cat = item.category || "Uncategorized";
			const issue = issues.find((i: any) => i.issue_id.toString() === item.issue_id);

			categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

			if (!categoryIssues[cat]) categoryIssues[cat] = [];
			if (issue && categoryIssues[cat].length < 3) {
				categoryIssues[cat].push({
					issue_id: issue.issue_id.toString(),
					title: issue.title,
					state: issue.state,
				});
			}

			if (issue?.created_at) {
				const date = issue.created_at.split("T")[0];
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

		const total = issues.length;
		const categories: CategoryResult[] = Object.entries(categoryCounts)
			.map(([name, count]) => ({
				name,
				count,
				percentage: Math.round((count / total) * 100),
				trend: calculateTrend(name, timelineData, sortedDates),
				examples: categoryIssues[name] || [],
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
			.slice(0, 5)
			.map((c, i) => `${i + 1}. ${c.name}: ${c.count} issues (${c.percentage}%)`)
			.join("\n");

		const trendText = categories
			.slice(0, 3)
			.map((c) => `${c.name}: ${c.trend}`)
			.join(", ");

		const advicePrompt = `
You are a software engineering manager. Analyze this GitHub issues data and provide actionable insights.

## Issues Data
Total Issues: ${total}
${categoryCountsText}

Trends: ${trendText}

Based on this data, provide:
1. Top 3 application areas needing the most urgent attention (with reasoning)
2. 3-5 specific, actionable recommendations for each area
3. Identify any quick wins vs. long-term improvements

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
						"You are a software engineering advisor. Respond with valid JSON only.",
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
					"Focus on addressing the highest-volume categories first. Consider allocating engineering resources accordingly.",
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
