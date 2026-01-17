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
import { GithubFetch } from "./endpoints/GithubFetch";
import { EmailFetch } from "./endpoints/EmailFetch";
import { TwitterFetch } from "./endpoints/TwitterFetch";
import { ForumFetch } from "./endpoints/ForumFetch";
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

// Data Fetch Endpoints
openapi.get("/api/tickets", TicketsFetch);
openapi.get("/api/discord", DiscordFetch);
openapi.get("/api/github", GithubFetch);
openapi.get("/api/email", EmailFetch);
openapi.get("/api/twitter", TwitterFetch);
openapi.get("/api/forum", ForumFetch);

// Insights Endpoint
openapi.get("/api/insights", InsightsGet);

// Export the Hono app
export default app;
