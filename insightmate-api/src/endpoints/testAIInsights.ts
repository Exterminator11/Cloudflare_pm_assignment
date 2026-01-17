// Test minimal file to check deployment

export class TestAIInsights {
  schema = {
    tags: ["AI Insights"],
    summary: "Test AI insights endpoint",
    request: {
      query: {
        timeRange: { type: "string", optional: true, default: "7d" }
      }
    },
    responses: {
      "200": {
        description: "Test insights response",
        content: {
          "application/json": {
            schema: {
              insights: { type: "string" }
            }
          }
        }
      }
    }
  };

  async handle(c: any) {
    return c.json({ success: true, insights: "Test AI insights working" });
  }
}