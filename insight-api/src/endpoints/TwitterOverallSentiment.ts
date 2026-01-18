import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

interface TweetScore {
	tweet_id: string;
	score: number;
}

export class TwitterOverallSentiment extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "Analyze overall sentiment of all tweets with individual scores",
		responses: {
			"200": {
				description: "Overall sentiment analysis results",
				...contentJson(
					z.object({
						overall_score: z.number(),
						tweet_scores: z.array(
							z.object({
								tweet_id: z.string(),
								score: z.number(),
							})
						),
					})
				),
			},
		},
	};

	async handle(c: any) {
		const { AI, DB } = c.env as Env;

		// Fetch all tweets
		const results = await DB.prepare(
			"SELECT tweet_id, content FROM twitter_posts ORDER BY created_at DESC"
		).all();

		const tweets = results.results || [];
		if (tweets.length === 0) {
			return {
				overall_score: 0,
				tweet_scores: [],
			};
		}

		const BATCH_SIZE = 50;
		const tweetScores: TweetScore[] = [];
		let totalScore = 0;
		let processedCount = 0;

		// Process tweets in batches
		for (let i = 0; i < tweets.length; i += BATCH_SIZE) {
			const batch = tweets.slice(i, i + BATCH_SIZE);
			const batchScores = await this.analyzeBatchSentiment(batch, AI);

			batchScores.forEach((score, index) => {
				const tweet = batch[index];
				const scaledScore = Math.round(((score + 1) / 2) * 4) + 1; // Convert -1/+1 to 1-5
				tweetScores.push({
					tweet_id: tweet.tweet_id,
					score: scaledScore,
				});
				totalScore += scaledScore;
				processedCount++;
			});
		}

		const overallScore = processedCount > 0 ? totalScore / processedCount : 0;

		return {
			overall_score: Math.round(overallScore * 10) / 10, // Round to 1 decimal
			tweet_scores: tweetScores,
		};
	}

	private async analyzeBatchSentiment(batch: any[], AI: any): Promise<number[]> {
		const tweetTexts = batch
			.map((tweet, index) => `[${index}] ${tweet.content}`)
			.join("\n---\n");

		const prompt = `
Analyze the sentiment of these tweets and return scores from -1 (very negative) to +1 (very positive).

Return a valid JSON object with this structure:
{
  "scores": [-0.5, 0.8, 0.2, ...]
}

Where each score corresponds to the tweet at that index.

Tweets to analyze:
${tweetTexts.slice(0, 6000)}
`;

		try {
			const response = await AI.run("@cf/meta/llama-3-8b-instruct", {
				messages: [
					{
						role: "system",
						content: "You are a sentiment analysis assistant. Respond with valid JSON only.",
					},
					{ role: "user", content: prompt },
				],
				response_format: { type: "json_object" },
				max_tokens: 1024,
			});

			const result = JSON.parse(response.response);
			return result.scores || batch.map(() => 0); // Default to neutral if parsing fails
		} catch (error) {
			console.error("Batch sentiment analysis failed:", error);
			return batch.map(() => 0); // Return neutral scores for failed batches
		}
	}
}