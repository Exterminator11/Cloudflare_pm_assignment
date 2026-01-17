import { fromHono } from "chanfana";
import { Hono } from "hono";
import { AggregationTrigger } from "./endpoints/aggregationTrigger";
import { AIInsights } from "./endpoints/aiInsights";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post("/api/aggregate", AggregationTrigger);
openapi.get("/api/insights", AIInsights);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
