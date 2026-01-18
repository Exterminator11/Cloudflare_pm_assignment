import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

interface Announcement {
	title: string;
	description: string;
	channel: string;
	confidence: number;
	key_points: string[];
	message_id?: string;
}

interface ChannelInfo {
	channelId: string;
	count: number;
	lastActivity: string;
}

export class DiscordAnalysis extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "AI-powered Discord message analysis for announcements",
		responses: {
			"200": {
				description: "Analysis results",
				...contentJson(
					z.object({
						dateRange: z.object({
							messageCount: z.number(),
						}),
						channels: z.array(
							z.object({
								channelId: z.string(),
								count: z.number(),
								lastActivity: z.string(),
							})
						),
						announcements: z.array(
							z.object({
								title: z.string(),
								description: z.string(),
								channel: z.string(),
								confidence: z.number(),
								key_points: z.array(z.string()),
								message_id: z.string().optional(),
							})
						),
						summary: z.string(),
					})
				),
			},
		},
	};

	async handle(c: any) {
		const { AI, DB } = c.env as Env;

		// 1. Fetch messages (limit to reduce token usage)
		const results = await DB.prepare(
			`SELECT message_id, channel_id, content, author_id, created_at
			FROM discord_messages
			ORDER BY created_at DESC
			LIMIT 100`
		).all();

		const messages = results.results || [];

		if (messages.length === 0) {
			return {
				dateRange: { messageCount: 0 },
				channels: [],
				announcements: [],
				summary: "No messages found for the selected time period.",
			};
		}

		// 2. Group by channel for frontend display
		const channels: Record<string, any[]> = {};
		messages.forEach((m: any) => {
			if (!channels[m.channel_id]) channels[m.channel_id] = [];
			channels[m.channel_id].push(m);
		});

		const channelInfo: ChannelInfo[] = Object.entries(channels).map(([channelId, msgs]) => ({
			channelId,
			count: msgs.length,
			lastActivity: msgs[0]?.created_at,
		}));

		// 3. Prepare sample messages for AI analysis (limit to 50 for token efficiency)
		const sampleMessages = messages.slice(0, 50).map((m: any) =>
			`[${m.channel_id}] ${m.author_id}: ${m.content}`
		).join("\n---\n");

		// 4. AI announcement detection
		const announcementPrompt = `
Analyze these Discord messages and identify important announcements and milestones.

IMPORTANT: Look for:
- New feature launches or updates
- Product releases or changes
- Important policy changes
- Event announcements (conferences, webinars, etc.)
- Major community updates
- Bug alerts or maintenance notices
- Security-related announcements
- Partnership announcements

For each announcement found:
- Extract the key message that contains the announcement
- Identify the channel where it was posted
- Create a brief but informative title
- Provide a detailed description
- List 2-4 key points
- Rate confidence 0-1 (only include if confidence > 0.7)

Return JSON with this exact structure:
{
  "announcements": [
    {
      "title": "Brief title (5-10 words)",
      "description": "Detailed description of what was announced (20-50 words)",
      "channel": "channel_id where the message was posted",
      "confidence": 0.95,
      "key_points": ["point1", "point2", "point3"],
      "message_id": "the actual message_id from the data"
    }
  ],
  "summary": "Brief overall summary of announcements detected (10-20 words)"
}

If no significant announcements are found, return empty announcements array.

Messages to analyze:
${sampleMessages}
`;

		const aiResponse = await AI.run(
			"@cf/meta/llama-3-8b-instruct",
			{
				messages: [
					{
						role: "system",
						content:
							"You are a Discord announcement analyzer. Respond with valid JSON only, no markdown, no explanation.",
					},
					{ role: "user", content: announcementPrompt },
				],
				response_format: { type: "json_object" },
				max_tokens: 1024,
			}
		);

		let analysis: { announcements: Announcement[]; summary: string };
		try {
			analysis = JSON.parse(aiResponse.response);
		} catch (error) {
			console.error("AI response parsing failed:", error);
			analysis = {
				announcements: [],
				summary: "Analysis completed but no significant announcements detected.",
			};
		}

		// Filter announcements by confidence > 0.7
		const filteredAnnouncements = (analysis.announcements || []).filter(
			(a: Announcement) => a.confidence > 0.7
		);

		return {
			dateRange: { messageCount: messages.length },
			channels: channelInfo,
			announcements: filteredAnnouncements,
			summary: analysis.summary || "Analysis completed.",
		};
	}
}
