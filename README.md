# Insight Dashboard

A unified customer insights platform aggregating data from 6 communication channels with AI-powered analysis.

## Features

### Multi-Channel Data Aggregation
- **Twitter** - Tweet sentiment analysis with overall platform score
- **Forums** - Discussion summaries and topic detection
- **Tickets** - Support ticket tracking with high-priority detection
- **GitHub** - Issue tracking with open/closed metrics
- **Discord** - Message analytics and channel distribution
- **Email** - Email data with similarity search

### AI-Powered Insights
- **Sentiment Scoring** - Twitter posts scored 1-5 using Llama 3
- **Semantic Search** - Find similar emails using Vectorize embeddings
- **Forum Summaries** - AI-generated discussion overviews
- **Platform Health Score** - Weighted average across all 6 sources (16.67% each)

### Performance
- **30-minute client-side caching** - Fast page loads
- **Batch processing** - Efficient handling of large datasets
- **Responsive design** - Works on desktop, tablet, and mobile

## Tech Stack

- **Cloudflare Workers** - Serverless runtime
- **D1 Database** - SQLite database for data storage
- **Vectorize** - AI embeddings for semantic search
- **Workers AI** - Llama 3 and BGE embeddings
- **Chart.js** - Data visualization

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/twitter` | All tweets |
| GET | `/api/twitter/overall-sentiment` | Tweet sentiment scores |
| GET | `/api/forum` | All forum posts |
| GET | `/api/forum/analysis` | Forum summaries with AI |
| GET | `/api/tickets` | All support tickets |
| GET | `/api/email` | All emails |
| GET | `/api/email/similar/:email_id` | Similar emails search |
| GET | `/api/github` | All GitHub issues |
| GET | `/api/discord` | All Discord messages |

## Project Structure

```
Cloudflare_pm_assignment/
├── insight-api/              # Backend API Worker
│   ├── src/
│   │   ├── index.ts          # API routes
│   │   ├── endpoints/        # Route handlers
│   │   └── types.ts          # Type definitions
│   ├── wrangler.jsonc        # Worker configuration
│   └── schema.sql            # Database schema
│
└── insightmate-dashboard/    # Frontend Dashboard
    ├── public/
    │   ├── index.html        # Landing page
    │   ├── insights.html     # All insights page
    │   ├── shared.js         # API utilities
    │   └── *.html            # Individual tab pages
    └── wrangler.jsonc        # Pages configuration
```

## Development

```bash
# Start API (runs on port 8787)
cd insight-api
npm install
npx wrangler dev

# Start Dashboard (runs on port 8790)
cd insightmate-dashboard
npm install
npx wrangler dev
```

## Deployment

```bash
# Deploy API
cd insight-api
npx wrangler deploy

# Deploy Dashboard
cd insightmate-dashboard
npx wrangler deploy
```

## Database Setup

```bash
# Create database and apply schema
cd insight-api
npx wrangler d1 execute insights-db --file=schema.sql --remote
```

## Environment

- **Node.js**: Required for npm dependencies
- **Wrangler CLI**: `npm install -g wrangler`
- **Cloudflare Account**: Required for Workers, D1, and AI
