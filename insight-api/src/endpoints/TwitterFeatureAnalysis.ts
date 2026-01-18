import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { Env } from "../types";

export class TwitterFeatureAnalysis extends OpenAPIRoute {
	schema = {
		tags: ["AI"],
		summary: "Comprehensive Twitter feature extraction and analysis",
		request: {
			query: z.object({
				days: z.string().default("90"),
			}),
		},
		responses: {
			"200": {
				description: "Comprehensive Twitter feature analysis",
				...contentJson(
					z.object({
						dateRange: z.object({
							days: z.number(),
							totalTweets: z.number(),
						}),
						sentiment: z.object({
							distribution: z.object({
								positive: z.number(),
								negative: z.number(),
								neutral: z.number(),
							}),
							averageScore: z.number(),
							trend: z.string(),
						}),
						contentAnalysis: z.object({
							topWords: z.array(z.object({
								word: z.string(),
								frequency: z.number(),
								sentiment: z.string(),
							})),
							topHashtags: z.array(z.object({
								hashtag: z.string(),
								frequency: z.number(),
							})),
							contentTypes: z.object({
								questions: z.number(),
								announcements: z.number(),
								complaints: z.number(),
								praise: z.number(),
								general: z.number(),
							}),
							avgLength: z.number(),
							containsLinks: z.number(),
							containsMentions: z.number(),
						}),
						authorAnalysis: z.object({
							totalAuthors: z.number(),
							topAuthors: z.array(z.object({
								author: z.string(),
								tweetCount: z.number(),
								avgSentiment: z.number(),
							})),
							authorDiversity: z.number(),
						}),
						temporalAnalysis: z.object({
							peakHours: z.array(z.string()),
							peakDays: z.array(z.string()),
							activityTrend: z.string(),
						}),
						insights: z.array(z.string()),
					})
				),
			},
		},
	};

	async handle(c: any) {
		const { AI, DB } = c.env as Env;
		const days = parseInt(c.req.query("days") || "90", 10);

		// Get all tweets
		const tweetResults = await DB.prepare(
			`SELECT tweet_id, content, author, created_at
			FROM twitter_posts
			WHERE created_at >= datetime('now', '-${days} days')
			ORDER BY created_at ASC`
		).all();

		const tweets = tweetResults.results || [];

		if (tweets.length === 0) {
			return {
				dateRange: { days, totalTweets: 0 },
				sentiment: { distribution: { positive: 0, negative: 0, neutral: 0 }, averageScore: 0, trend: "insufficient_data" },
				contentAnalysis: { topWords: [], topHashtags: [], contentTypes: { questions: 0, announcements: 0, complaints: 0, praise: 0, general: 0 }, avgLength: 0, containsLinks: 0, containsMentions: 0 },
				authorAnalysis: { totalAuthors: 0, topAuthors: [], authorDiversity: 0 },
				temporalAnalysis: { peakHours: [], peakDays: [], activityTrend: "insufficient_data" },
				insights: ["No tweets found for the selected time period"],
			};
		}

		// Analyze sentiment for all tweets
		const sentimentResults: any[] = [];
		const batchSize = 10;

		for (let i = 0; i < tweets.length; i += batchSize) {
			const batch = tweets.slice(i, i + batchSize);
			const batchTexts = batch.map((t: any, idx: number) => `Tweet ${idx + 1}: ${t.content}`).join("\n\n");

			const sentimentPrompt = `
Analyze the sentiment of these Twitter posts and classify each as POSITIVE, NEGATIVE, or NEUTRAL.
Also provide a sentiment score from -1 (very negative) to +1 (very positive).

Return JSON with this exact structure:
{
  "analyses": [
    {
      "tweet_index": 1,
      "sentiment": "POSITIVE",
      "sentiment_score": 0.85,
      "reason": "Brief explanation"
    }
  ]
}

Tweets to analyze:
${batchTexts.slice(0, 8000)}
`;

			try {
				const aiResponse = await AI.run(
					"@cf/meta/llama-3-8b-instruct",
					{
						messages: [
							{
								role: "system",
								content: "You are a sentiment analysis expert. Analyze Twitter posts and respond with valid JSON only, no markdown, no explanation.",
							},
							{ role: "user", content: sentimentPrompt },
						],
						response_format: { type: "json_object" },
						max_tokens: 2048,
					}
				);

				const analysis = JSON.parse(aiResponse.response);
				const batchResults = (analysis.analyses || []).map((item: any) => {
					const tweetIndex = item.tweet_index - 1;
					const tweet = batch[tweetIndex];
					if (tweet) {
						return {
							...tweet,
							sentiment: item.sentiment?.toLowerCase() || "neutral",
							sentiment_score: item.sentiment_score || 0,
							reason: item.reason || "",
						};
					}
					return null;
				}).filter(Boolean);

				sentimentResults.push(...batchResults);
			} catch (error) {
				console.error("Batch analysis failed:", error);
				// Add neutral sentiment for failed batch
				batch.forEach((tweet: any) => {
					sentimentResults.push({
						...tweet,
						sentiment: "neutral",
						sentiment_score: 0,
					});
				});
			}
		}

		// Extract features from tweets
		const features = this.extractFeatures(sentimentResults);

		return {
			dateRange: { days, totalTweets: tweets.length },
			...features,
		};
	}

	extractFeatures(tweets: any[]) {
		// Sentiment analysis
		const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
		let totalSentimentScore = 0;

		tweets.forEach(tweet => {
			sentimentCounts[tweet.sentiment]++;
			totalSentimentScore += tweet.sentiment_score;
		});

		const avgSentimentScore = tweets.length > 0 ? totalSentimentScore / tweets.length : 0;

		// Trend calculation (simplified)
		let trend = "stable";
		if (tweets.length > 10) {
			const firstHalf = tweets.slice(0, Math.floor(tweets.length / 2));
			const secondHalf = tweets.slice(Math.floor(tweets.length / 2));

			const firstAvg = firstHalf.reduce((sum, t) => sum + t.sentiment_score, 0) / firstHalf.length;
			const secondAvg = secondHalf.reduce((sum, t) => sum + t.sentiment_score, 0) / secondHalf.length;

			const diff = secondAvg - firstAvg;
			if (diff > 0.1) trend = "improving";
			else if (diff < -0.1) trend = "declining";
		}

		// Content analysis
		const wordFreq: { [key: string]: { count: number; sentiment: number } } = {};
		const hashtagFreq: { [key: string]: number } = {};
		let totalLength = 0;
		let containsLinks = 0;
		let containsMentions = 0;

		const contentTypes = { questions: 0, announcements: 0, complaints: 0, praise: 0, general: 0 };

		tweets.forEach(tweet => {
			const content = tweet.content.toLowerCase();
			totalLength += content.length;

			// Check for links and mentions
			if (content.includes('http') || content.includes('www.')) containsLinks++;
			if (content.includes('@')) containsMentions++;

			// Content type classification
			if (content.includes('?')) contentTypes.questions++;
			else if (content.includes('announcing') || content.includes('launch') || content.includes('new')) contentTypes.announcements++;
			else if (content.includes('issue') || content.includes('problem') || content.includes('bug')) contentTypes.complaints++;
			else if (content.includes('great') || content.includes('awesome') || content.includes('amazing')) contentTypes.praise++;
			else contentTypes.general++;

			// Word frequency (excluding common words)
			const words = content.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(word =>
				word.length > 3 &&
				!['that', 'this', 'with', 'from', 'they', 'have', 'been', 'will', 'their', 'what', 'there', 'when', 'would', 'could', 'should', 'about', 'which', 'after', 'before', 'while', 'where', 'here', 'then', 'than', 'them', 'these', 'those', 'though'].includes(word)
			);

			words.forEach(word => {
				if (!wordFreq[word]) wordFreq[word] = { count: 0, sentiment: 0 };
				wordFreq[word].count++;
				wordFreq[word].sentiment += tweet.sentiment_score;
			});

			// Hashtag extraction
			const hashtags = content.match(/#\w+/g) || [];
			hashtags.forEach((tag: string) => {
				hashtagFreq[tag] = (hashtagFreq[tag] || 0) + 1;
			});
		});

		// Top words with average sentiment
		const topWords = Object.entries(wordFreq)
			.map(([word, data]) => ({
				word,
				frequency: data.count,
				sentiment: data.sentiment / data.count > 0.1 ? 'positive' : data.sentiment / data.count < -0.1 ? 'negative' : 'neutral'
			}))
			.sort((a, b) => b.frequency - a.frequency)
			.slice(0, 10);

		// Top hashtags
		const topHashtags = Object.entries(hashtagFreq)
			.map(([hashtag, frequency]) => ({ hashtag, frequency }))
			.sort((a, b) => b.frequency - a.frequency)
			.slice(0, 10);

		// Author analysis
		const authorStats: { [key: string]: { count: number; totalSentiment: number } } = {};
		tweets.forEach(tweet => {
			if (!authorStats[tweet.author]) authorStats[tweet.author] = { count: 0, totalSentiment: 0 };
			authorStats[tweet.author].count++;
			authorStats[tweet.author].totalSentiment += tweet.sentiment_score;
		});

		const topAuthors = Object.entries(authorStats)
			.map(([author, stats]) => ({
				author,
				tweetCount: stats.count,
				avgSentiment: stats.totalSentiment / stats.count
			}))
			.sort((a, b) => b.tweetCount - a.tweetCount)
			.slice(0, 5);

		const authorDiversity = Object.keys(authorStats).length / tweets.length;

		// Temporal analysis
		const hourCounts: { [key: string]: number } = {};
		const dayCounts: { [key: string]: number } = {};

		tweets.forEach(tweet => {
			const date = new Date(tweet.created_at);
			const hour = date.getHours().toString();
			const day = date.toLocaleLowerCase('en-US', { weekday: 'long' });

			hourCounts[hour] = (hourCounts[hour] || 0) + 1;
			dayCounts[day] = (dayCounts[day] || 0) + 1;
		});

		const peakHours = Object.entries(hourCounts)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3)
			.map(([hour]) => `${hour}:00`);

		const peakDays = Object.entries(dayCounts)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3)
			.map(([day]) => day);

		// Activity trend (simplified)
		let activityTrend = "stable";
		const sortedTweets = tweets.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
		if (sortedTweets.length > 10) {
			const firstThird = sortedTweets.slice(0, Math.floor(sortedTweets.length / 3));
			const lastThird = sortedTweets.slice(-Math.floor(sortedTweets.length / 3));

			const firstAvg = firstThird.length;
			const lastAvg = lastThird.length;

			const ratio = lastAvg / firstAvg;
			if (ratio > 1.2) activityTrend = "increasing";
			else if (ratio < 0.8) activityTrend = "decreasing";
		}

		// Generate insights
		const insights = [];

		if (avgSentimentScore > 0.2) {
			insights.push("Overall positive sentiment in Twitter discussions");
		} else if (avgSentimentScore < -0.2) {
			insights.push("Overall negative sentiment detected");
		} else {
			insights.push("Neutral sentiment in Twitter conversations");
		}

		if (contentTypes.questions > contentTypes.general * 0.5) {
			insights.push("High engagement with many questions being asked");
		}

		if (authorDiversity < 0.3) {
			insights.push("Limited author diversity - mostly from same users");
		}

		if (topHashtags.length > 0) {
			insights.push(`Popular hashtags: ${topHashtags.slice(0, 3).map(h => h.hashtag).join(', ')}`);
		}

		if (activityTrend === "increasing") {
			insights.push("Twitter activity is increasing over time");
		}

		return {
			sentiment: {
				distribution: sentimentCounts,
				averageScore: Math.round(avgSentimentScore * 100) / 100,
				trend,
			},
			contentAnalysis: {
				topWords,
				topHashtags,
				contentTypes,
				avgLength: Math.round(totalLength / tweets.length),
				containsLinks: Math.round((containsLinks / tweets.length) * 100),
				containsMentions: Math.round((containsMentions / tweets.length) * 100),
			},
			authorAnalysis: {
				totalAuthors: Object.keys(authorStats).length,
				topAuthors,
				authorDiversity: Math.round(authorDiversity * 100) / 100,
			},
			temporalAnalysis: {
				peakHours,
				peakDays,
				activityTrend,
			},
			insights,
		};
	}
}