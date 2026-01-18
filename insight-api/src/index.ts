import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
	TicketCollect,
	DiscordCollect,
	GitHubCollect,
	EmailCollect,
	TwitterCollect,
	ForumCollect
} from "./endpoints/dataCollect";
import { InsightsGet } from "./endpoints/insightsGet";
import { TicketsFetch } from "./endpoints/TicketsFetch";
import { DiscordFetch } from "./endpoints/DiscordFetch";
import { DiscordAnalysis } from "./endpoints/discordAnalysis";
import { EmailAnalysis } from "./endpoints/emailAnalysis";
import { GithubAnalysis } from "./endpoints/githubAnalysis";
import { GithubFetch } from "./endpoints/GithubFetch";
import { EmailFetch } from "./endpoints/EmailFetch";
import { TwitterFetch } from "./endpoints/TwitterFetch";
import { TwitterSentimentAnalysis } from "./endpoints/TwitterSentimentAnalysis";
import { TwitterSentimentOverTime } from "./endpoints/TwitterSentimentOverTime";
import { TwitterFeatureAnalysis } from "./endpoints/TwitterFeatureAnalysis";
import { ForumFetch } from "./endpoints/ForumFetch";
import { TicketAnalysis } from "./endpoints/ticketAnalysis";
import { EmailSimilarity } from "./endpoints/EmailSimilarity";
import { TwitterOverallSentiment } from "./endpoints/TwitterOverallSentiment";
import { ForumFetch } from "./endpoints/ForumFetch";
import { ForumAnalysis } from "./endpoints/ForumAnalysis";
import { EmailIndexAll } from "./endpoints/EmailIndexAll";
import { Env } from "./types";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all origins (for local development)
app.use("/*", cors());

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Data Collection Endpoints
openapi.post("/api/collect/tickets", TicketCollect);
openapi.post("/api/collect/discord", DiscordCollect);
openapi.post("/api/collect/github", GitHubCollect);
openapi.post("/api/collect/email", EmailCollect);
openapi.post("/api/collect/twitter", TwitterCollect);
openapi.post("/api/collect/forum", ForumCollect);
openapi.post("/api/email/index-all", EmailIndexAll);

	// Data Fetch Endpoints
	openapi.get("/api/tickets", TicketsFetch);
	openapi.get("/api/discord", DiscordFetch);
	openapi.get("/api/github", GithubFetch);

 	// AI Analysis Endpoints
 	openapi.get("/api/discord/analysis", DiscordAnalysis);
 	openapi.get("/api/email/analysis", EmailAnalysis);
 	openapi.get("/api/github/analysis", GithubAnalysis);

 	openapi.get("/api/twitter/features", TwitterFeatureAnalysis);
  	openapi.get("/api/email", EmailFetch);
  	openapi.get("/api/email/similar/:email_id", EmailSimilarity);
  	openapi.get("/api/twitter", TwitterFetch);
  	openapi.get("/api/twitter/overall-sentiment", TwitterOverallSentiment);
  	openapi.get("/api/forum", ForumFetch);
  	openapi.get("/api/forum/analysis", ForumAnalysis);

 	// AI Analysis Endpoint
 	openapi.get("/api/tickets/analysis", TicketAnalysis);

	// Insights Endpoint
	openapi.get("/api/insights", InsightsGet);

// Export the Hono app
export default app;
