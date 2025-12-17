# Backend Development for NewsPortal

## Overview
Create a Node.js Express backend that allows easy content uploading, stores data locally in JSON files, provides APIs for fetching/uploading content, serves the static frontend, and updates the frontend to load content dynamically.

## Steps to Complete

### 1. Set Up Backend Directory Structure
- [x] Create `backend/` directory
- [x] Create `backend/data/` subdirectory for JSON files
- [x] Create `backend/server.js` for the Express server
- [x] Create `backend/package.json` for dependencies

### 2. Initialize JSON Data Files
- [x] Extract hardcoded news data from index.html and create `backend/data/news.json`
- [x] Extract hardcoded podcasts data and create `backend/data/podcasts.json`
- [x] Extract hardcoded videos data and create `backend/data/videos.json`
- [x] Extract hardcoded trending data and create `backend/data/trending.json`

### 3. Implement Express Server and Routes
- [x] Set up Express server in `server.js` with CORS and JSON parsing
- [x] Implement GET routes: `/api/news`, `/api/podcasts`, `/api/videos`, `/api/trending`
- [x] Implement POST routes: `/api/news`, `/api/podcasts`, `/api/videos`, `/api/trending` for uploading content
- [x] Add static file serving for the frontend (serve `index.html` and assets from root directory)

### 4. Update Frontend (index.html)
- [x] Remove hardcoded news, podcasts, videos, and trending data from HTML
- [x] Add JavaScript functions to fetch data from APIs on page load
- [x] Update DOM manipulation to dynamically populate content sections
- [x] Ensure interactive functions (readArticle, playPodcast, etc.) work with dynamic data

### 5. Install Dependencies and Test
- [x] Install Express and CORS via npm
- [x] Test server startup and API endpoints
- [x] Verify frontend loads and displays dynamic content
- [x] Test POST endpoints for uploading new content

### 6. Documentation and Instructions
- [x] Provide README.md with setup and usage instructions
- [x] Include examples for uploading content via API calls
- [x] Document API endpoints and data formats

## Completion Criteria
- [x] Backend server runs successfully
- [x] Frontend loads dynamic content from APIs
- [x] POST endpoints allow easy content uploading
- [x] All original functionality preserved
- [x] Data persists in local JSON files
