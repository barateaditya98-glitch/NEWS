# NewsPortal Backend

A Node.js Express backend for NewsPortal that enables dynamic content management without redeployment.

## Features

- RESTful API for news, videos, and trending content
- Local JSON file storage (no database required)
- CORS enabled for frontend integration
- Static file serving for the frontend
- Newsletter subscription endpoint
- Deployable on free tiers (Render, Railway)

## API Endpoints

### News
- `GET /api/news` - Get all news items
- `POST /api/news` - Add new news item

### Videos
- `GET /api/videos` - Get all videos
- `POST /api/videos` - Add new video

### Trending
- `GET /api/trending` - Get trending items
- `POST /api/trending` - Add trending item

### Newsletter
- `POST /api/subscribe` - Subscribe to newsletter

## Data Format Examples

### News Item
```json
{
  "title": "Article Title",
  "category": "Technology",
  "excerpt": "Brief description...",
  "href": "articles/article-name.html"
}
```

### Video Item
```json
{
  "youtubeId": "VIDEO_ID",
  "title": "Video Title",
  "channel": "Channel Name",
  "description": "Video description"
}
```

### Trending Item
```json
{
  "number": 1,
  "title": "Trending Title",
  "description": "Trending description",
  "href": "articles/article-name.html"
}
```

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on port 3000 by default, or use the PORT environment variable.

## Deployment

### Render
1. Connect your GitHub repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variable: `NODE_ENV=production`

### Railway
1. Connect your GitHub repository
2. Railway will automatically detect Node.js
3. Set start command: `npm start`

## Adding Content

Use POST requests to add new content. Example using curl:

```bash
# Add news item
curl -X POST http://localhost:3000/api/news \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Article",
    "category": "Tech",
    "excerpt": "Description...",
    "href": "articles/new-article.html"
  }'

# Add video
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "youtubeId": "VIDEO_ID",
    "title": "Video Title",
    "channel": "Channel",
    "description": "Description"
  }'
```

## File Structure

```
backend/
├── server.js          # Express server
├── package.json       # Dependencies
└── data/              # JSON data files
    ├── news.json
    ├── videos.json
    └── trending.json
```

## Development

The backend serves static files from the parent directory, so place your frontend files (index.html, articles/, etc.) in the project root.

Data is stored in JSON files in the `backend/data/` directory and persists between server restarts.
