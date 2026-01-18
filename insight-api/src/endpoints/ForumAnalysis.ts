import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

interface ForumPost {
	post_id: string;
	forum: string;
	title: string;
	content: string;
	author: string;
	created_at: string;
}

interface ForumSummary {
	summary: string;
	topTopics: string[];
}

export class ForumAnalysis extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "Analyze and group forum posts by forum type with AI summaries",
		responses: {
			"200": {
				description: "Forum analysis results grouped by forum type",
				...contentJson(
					z.object({
						totalPosts: z.number(),
						forums: z.array(
							z.object({
								forum: z.string(),
								postCount: z.number(),
								summary: z.string(),
								topTopics: z.array(z.string()),
								posts: z.array(
									z.object({
										id: z.number(),
										post_id: z.string(),
										title: z.string(),
										content: z.string(),
										author: z.string(),
										created_at: z.string(),
									})
								),
							})
						),
					})
				),
			},
		},
	};

	async handle(c: any) {
		const { AI, DB } = c.env as Env;

		const results = await DB.prepare(
			"SELECT id, post_id, forum, title, content, author, created_at FROM forum_posts ORDER BY created_at DESC"
		).all();

		const posts = results.results || [];
		if (posts.length === 0) {
			return {
				totalPosts: 0,
				forums: [],
			};
		}

		const forumGroups = new Map<string, ForumPost[]>();
		posts.forEach((post: any) => {
			const forum = post.forum || "General";
			if (!forumGroups.has(forum)) {
				forumGroups.set(forum, []);
			}
			forumGroups.get(forum)!.push(post);
		});

		const forumAnalysisPromises = Array.from(forumGroups.entries()).map(
			async ([forumName, forumPosts]) => {
				const summary = await this.generateForumSummary(forumPosts, AI);
				return {
					forum: forumName,
					postCount: forumPosts.length,
					summary: summary.summary,
					topTopics: summary.topTopics,
					posts: forumPosts.slice(0, 10),
				};
			}
		);

		const forums = await Promise.all(forumAnalysisPromises);

		return {
			totalPosts: posts.length,
			forums: forums.sort((a, b) => b.postCount - a.postCount),
		};
	}

	private async generateForumSummary(forumPosts: ForumPost[], AI: any): Promise<ForumSummary> {
		const postTexts = forumPosts
			.slice(0, 30)
			.map((post, index) => `[${index}] ${post.title}: ${post.content}`)
			.join("\n---\n");

		const prompt = `
You are analyzing forum posts from the "${forumPosts[0]?.forum || 'General'}" forum section.

Provide a comprehensive summary of what people are discussing. Your summary should be 4-5 lines deep, covering:
1. Main topics and themes being discussed
2. Key concerns, questions, or highlights
3. Overall sentiment and nature of conversations

Also identify the top 5 specific topics/themes (1-2 words each).

Posts to analyze:
${postTexts.slice(0, 8000)}

Respond with valid JSON only (no markdown, no explanation):
{
  "summary": "A 4-5 line comprehensive summary of the discussion topics, concerns, and highlights in this forum section...",
  "topics": ["Topic1", "Topic2", "Topic3", "Topic4", "Topic5"]
}
`;

		try {
			const response = await AI.run("@cf/meta/llama-3-8b-instruct", {
				messages: [
					{
						role: "system",
						content: "You are a forum analysis assistant. Provide detailed, comprehensive summaries. Respond with valid JSON only.",
					},
					{ role: "user", content: prompt },
				],
				response_format: { type: "json_object" },
				max_tokens: 1024,
			});

			const result = JSON.parse(response.response);
			return {
				summary: result.summary || "Unable to generate summary.",
				topTopics: result.topics || [],
			};
		} catch (error) {
			console.error("Forum summary generation failed:", error);
			return {
				summary: "Unable to generate summary at this time.",
				topTopics: [],
			};
		}
	}
}
