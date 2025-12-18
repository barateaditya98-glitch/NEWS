import { getStore } from "@netlify/blobs";

// Admin authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Simple session management using Blobs
async function validateSession(sessionId) {
  if (!sessionId) return false;
  try {
    const store = getStore("sessions");
    const session = await store.get(sessionId, { type: "json" });
    if (session && session.expiresAt > Date.now()) {
      return true;
    }
  } catch (e) {
    // Session not found or expired
  }
  return false;
}

async function createSession() {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  const session = {
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  try {
    const store = getStore("sessions");
    await store.setJSON(sessionId, session);
  } catch (e) {
    console.error("Failed to create session:", e);
  }
  return sessionId;
}

async function deleteSession(sessionId) {
  if (!sessionId) return;
  try {
    const store = getStore("sessions");
    await store.delete(sessionId);
  } catch (e) {
    // Ignore errors when deleting session
  }
}

// Authentication handlers
async function handleAuth(method, action, req) {
  switch (action) {
    case "login": {
      if (method !== "POST") {
        return errorResponse("Method not allowed", 405);
      }
      try {
        const body = await req.json();
        if (body.password === ADMIN_PASSWORD) {
          const sessionId = await createSession();
          return jsonResponse({
            success: true,
            sessionId,
            message: "Login successful"
          });
        }
        return jsonResponse({ success: false, message: "Invalid password" }, 401);
      } catch (e) {
        return errorResponse("Login failed");
      }
    }

    case "logout": {
      if (method !== "POST") {
        return errorResponse("Method not allowed", 405);
      }
      const sessionId = req.headers.get("X-Session-Id");
      await deleteSession(sessionId);
      return jsonResponse({ success: true, message: "Logged out" });
    }

    case "verify": {
      const sessionId = req.headers.get("X-Session-Id");
      const isValid = await validateSession(sessionId);
      return jsonResponse({ authenticated: isValid });
    }

    default:
      return errorResponse("Invalid auth action", 400);
  }
}

// Default content (initial data)
const defaultContent = {
  news: [
    {
      _id: "news_1",
      title: "Global Climate Summit Reaches Historic Agreement",
      category: "Environment",
      time: "2 hours ago",
      excerpt: "World leaders unite on unprecedented climate action plan, setting ambitious targets for carbon neutrality by 2035...",
      href: "articles/climate-summit.html"
    },
    {
      _id: "news_2",
      title: "Tech Giants Announce AI Ethics Initiative",
      category: "Technology",
      time: "5 hours ago",
      excerpt: "Major technology companies collaborate on new standards for responsible AI development and deployment...",
      href: "articles/ai-ethics-initiative.html"
    },
    {
      _id: "news_3",
      title: "Space Tourism Industry Sees Major Breakthrough",
      category: "Space",
      time: "8 hours ago",
      excerpt: "New propulsion technology makes space travel more accessible and affordable for civilian passengers...",
      href: "articles/space-tourism-breakthrough.html"
    },
    {
      _id: "news_4",
      title: "Revolutionary Medical Treatment Shows Promise",
      category: "Health",
      time: "12 hours ago",
      excerpt: "Clinical trials reveal breakthrough therapy could transform treatment for rare genetic disorders...",
      href: "articles/medical-treatment-promise.html"
    },
    {
      _id: "news_5",
      title: "Breakthrough in AI Research Promises Safer Autonomous Systems",
      category: "Technology",
      time: "1 hour ago",
      excerpt: "New framework introduces multiple safety layers for AI systems, reducing critical incidents by 95%...",
      href: "breakthrough-in-ai.html"
    },
    {
      _id: "news_6",
      title: "Green Energy Revolution Accelerates Global Transition",
      category: "Environment",
      time: "3 hours ago",
      excerpt: "Renewable energy investments exceed $300 billion as solar and wind power installations hit record levels...",
      href: "green-energy-revolution.html"
    }
  ],
  videos: [
    {
      _id: "video_1",
      youtubeId: "JjH8AfUIB8E",
      title: "News Podcast Episode",
      channel: "Your Channel",
      description: "Embedded YouTube episode."
    },
    {
      _id: "video_2",
      youtubeId: "45OISlCdnDk",
      title: "News Podcast Episode 2",
      channel: "Your Channel",
      description: "Embedded YouTube episode."
    },
    {
      _id: "video_3",
      youtubeId: "fuRRCZRcE0qMAUPn",
      title: "News Podcast Episode 3",
      channel: "Your Channel",
      description: "Embedded YouTube episode."
    }
  ],
  trending: [
    {
      _id: "trending_1",
      number: 1,
      title: "AI Safety Framework Gains Industry Support",
      description: "Major tech companies adopt new safety protocols for autonomous systems",
      href: "articles/breakthrough-in-ai.html"
    },
    {
      _id: "trending_2",
      number: 2,
      title: "Global Climate Agreement Implementation Begins",
      description: "Nations start rolling out carbon neutrality measures after historic summit",
      href: "articles/climate-summit.html"
    },
    {
      _id: "trending_3",
      number: 3,
      title: "Space Tourism Prices Expected to Drop",
      description: "New propulsion technology makes civilian space travel more accessible",
      href: "articles/space-tourism-breakthrough.html"
    },
    {
      _id: "trending_4",
      number: 4,
      title: "Gene Therapy Breakthrough Advances",
      description: "Clinical trials show promising results for rare genetic disorders treatment",
      href: "articles/medical-treatment-promise.html"
    },
    {
      _id: "trending_5",
      number: 5,
      title: "Renewable Energy Investments Surge",
      description: "Solar and wind installations reach record highs globally",
      href: "articles/green-energy-revolution.html"
    }
  ]
};

// Helper to generate unique IDs
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get content from Blobs or return default
async function getContent() {
  try {
    const store = getStore("content");
    const data = await store.get("data", { type: "json" });
    if (data) {
      return data;
    }
  } catch (error) {
    console.log("Using default content (Blobs not available or empty)");
  }
  return { ...defaultContent };
}

// Save content to Blobs
async function saveContent(content) {
  try {
    const store = getStore("content");
    await store.setJSON("data", content);
  } catch (error) {
    console.error("Failed to save to Blobs:", error);
    throw error;
  }
}

// Parse request path to extract resource and id
function parseApiPath(path) {
  // Remove /api/ prefix and clean up
  const cleanPath = path.replace(/^\/api\//, "").replace(/\/$/, "");
  const parts = cleanPath.split("/");

  return {
    resource: parts[0] || "",
    id: parts[1],
    subResource: parts[2]
  };
}

// Create JSON response
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

// Error response
function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

// News handlers
async function handleNews(method, id, req) {
  const content = await getContent();

  switch (method) {
    case "GET":
      if (id) {
        const item = content.news.find(n => n._id === id);
        return item ? jsonResponse(item) : errorResponse("Not found", 404);
      }
      return jsonResponse(content.news);

    case "POST": {
      const body = await req.json();
      const newItem = {
        _id: generateId("news"),
        title: body.title || "",
        category: body.category || "",
        time: body.time || "",
        excerpt: body.excerpt || "",
        href: body.href || ""
      };
      content.news.unshift(newItem);
      await saveContent(content);
      return jsonResponse(newItem, 201);
    }

    case "PUT": {
      if (!id) return errorResponse("ID required");
      const idx = content.news.findIndex(n => n._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      const updates = await req.json();
      content.news[idx] = { ...content.news[idx], ...updates };
      await saveContent(content);
      return jsonResponse(content.news[idx]);
    }

    case "DELETE": {
      if (!id) return errorResponse("ID required");
      const idx = content.news.findIndex(n => n._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      content.news.splice(idx, 1);
      await saveContent(content);
      return jsonResponse({ success: true });
    }

    default:
      return errorResponse("Method not allowed", 405);
  }
}

// Videos handlers
async function handleVideos(method, id, req) {
  const content = await getContent();

  switch (method) {
    case "GET":
      if (id) {
        const item = content.videos.find(v => v._id === id);
        return item ? jsonResponse(item) : errorResponse("Not found", 404);
      }
      return jsonResponse(content.videos);

    case "POST": {
      const body = await req.json();
      const newItem = {
        _id: generateId("video"),
        youtubeId: body.youtubeId || "",
        title: body.title || "",
        channel: body.channel || "",
        description: body.description || ""
      };
      content.videos.push(newItem);
      await saveContent(content);
      return jsonResponse(newItem, 201);
    }

    case "PUT": {
      if (!id) return errorResponse("ID required");
      const idx = content.videos.findIndex(v => v._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      const updates = await req.json();
      content.videos[idx] = { ...content.videos[idx], ...updates };
      await saveContent(content);
      return jsonResponse(content.videos[idx]);
    }

    case "DELETE": {
      if (!id) return errorResponse("ID required");
      const idx = content.videos.findIndex(v => v._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      content.videos.splice(idx, 1);
      await saveContent(content);
      return jsonResponse({ success: true });
    }

    default:
      return errorResponse("Method not allowed", 405);
  }
}

// Trending handlers
async function handleTrending(method, id, req) {
  const content = await getContent();

  switch (method) {
    case "GET":
      if (id) {
        const item = content.trending.find(t => t._id === id);
        return item ? jsonResponse(item) : errorResponse("Not found", 404);
      }
      return jsonResponse(content.trending);

    case "POST": {
      const body = await req.json();
      const newItem = {
        _id: generateId("trending"),
        number: body.number || content.trending.length + 1,
        title: body.title || "",
        description: body.description || "",
        href: body.href || ""
      };
      content.trending.push(newItem);
      await saveContent(content);
      return jsonResponse(newItem, 201);
    }

    case "PUT": {
      if (!id) return errorResponse("ID required");
      const idx = content.trending.findIndex(t => t._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      const updates = await req.json();
      content.trending[idx] = { ...content.trending[idx], ...updates };
      await saveContent(content);
      return jsonResponse(content.trending[idx]);
    }

    case "DELETE": {
      if (!id) return errorResponse("ID required");
      const idx = content.trending.findIndex(t => t._id === id);
      if (idx === -1) return errorResponse("Not found", 404);
      content.trending.splice(idx, 1);
      await saveContent(content);
      return jsonResponse({ success: true });
    }

    default:
      return errorResponse("Method not allowed", 405);
  }
}

// Static article content (fallback for when Blobs storage is empty)
const staticArticles = {
  "ai-ethics-initiative.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tech Giants Announce AI Ethics Initiative - NewsPortal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: #ffffff;
            line-height: 1.8;
            min-height: 100vh;
        }
        .article-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        .back-link {
            display: inline-block;
            color: #4ecdc4;
            text-decoration: none;
            margin-bottom: 2rem;
            font-weight: 500;
        }
        .back-link:hover { text-decoration: underline; }
        .article-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            color: #888;
        }
        .category {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            color: white;
        }
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .article-content { color: #b8b8b8; }
        .article-content p { margin-bottom: 1.5rem; }
    </style>
</head>
<body>
    <article class="article-container">
        <a href="/" class="back-link">← Back to News</a>
        <div class="article-meta">
            <span class="category">Technology</span>
            <span>5 hours ago</span>
        </div>
        <h1>Tech Giants Announce AI Ethics Initiative</h1>
        <div class="article-content">
            <p>In a landmark move that signals a new era of responsible artificial intelligence development, the world's leading technology companies have come together to announce a comprehensive AI Ethics Initiative. This collaborative effort aims to establish industry-wide standards for the ethical development and deployment of AI systems.</p>
            <p>The initiative, which includes participation from major players across the tech industry, focuses on several key areas: transparency in AI decision-making, protection of user privacy, prevention of algorithmic bias, and ensuring AI systems are developed with human welfare as the primary consideration.</p>
            <p>"We recognize that artificial intelligence has the power to transform our world in profound ways," said one of the initiative's founding members. "With that power comes an immense responsibility to ensure these technologies benefit humanity as a whole."</p>
            <p>The framework established by the initiative includes mandatory ethics reviews for AI projects, regular third-party audits, and the creation of an independent oversight board comprised of ethicists, technologists, and civil society representatives.</p>
            <p>Industry analysts have praised the move as a significant step forward in addressing growing public concerns about AI safety and accountability. The initiative is expected to influence regulatory discussions worldwide and may serve as a model for international AI governance frameworks.</p>
        </div>
    </article>
</body>
</html>`,
  "climate-summit.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Global Climate Summit Reaches Historic Agreement - NewsPortal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: #ffffff;
            line-height: 1.8;
            min-height: 100vh;
        }
        .article-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        .back-link {
            display: inline-block;
            color: #4ecdc4;
            text-decoration: none;
            margin-bottom: 2rem;
            font-weight: 500;
        }
        .back-link:hover { text-decoration: underline; }
        .article-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            color: #888;
        }
        .category {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            color: white;
        }
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .article-content { color: #b8b8b8; }
        .article-content p { margin-bottom: 1.5rem; }
    </style>
</head>
<body>
    <article class="article-container">
        <a href="/" class="back-link">← Back to News</a>
        <div class="article-meta">
            <span class="category">Environment</span>
            <span>2 hours ago</span>
        </div>
        <h1>Global Climate Summit Reaches Historic Agreement</h1>
        <div class="article-content">
            <p>World leaders have achieved what many considered impossible: a comprehensive, binding agreement on climate action that commits nations to achieving carbon neutrality by 2035. The historic accord, reached after intense negotiations, represents the most ambitious climate commitment in history.</p>
            <p>The agreement includes specific targets for emissions reductions, substantial funding commitments from developed nations to support climate adaptation in vulnerable countries, and mechanisms for monitoring and enforcing compliance.</p>
            <p>"Today marks a turning point in our collective response to the climate crisis," announced the summit chair. "For the first time, we have a truly global commitment backed by concrete action plans and accountability measures."</p>
            <p>Key provisions of the agreement include a phase-out of coal power by 2030, massive investments in renewable energy infrastructure, and the establishment of a global carbon pricing mechanism. Developing nations will receive unprecedented financial and technical support to transition to clean energy.</p>
            <p>Environmental groups have cautiously welcomed the agreement while emphasizing the importance of immediate implementation. The coming months will be critical as nations begin translating these commitments into national policies and action plans.</p>
        </div>
    </article>
</body>
</html>`,
  "space-tourism-breakthrough.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Space Tourism Industry Sees Major Breakthrough - NewsPortal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: #ffffff;
            line-height: 1.8;
            min-height: 100vh;
        }
        .article-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        .back-link {
            display: inline-block;
            color: #4ecdc4;
            text-decoration: none;
            margin-bottom: 2rem;
            font-weight: 500;
        }
        .back-link:hover { text-decoration: underline; }
        .article-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            color: #888;
        }
        .category {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            color: white;
        }
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .article-content { color: #b8b8b8; }
        .article-content p { margin-bottom: 1.5rem; }
    </style>
</head>
<body>
    <article class="article-container">
        <a href="/" class="back-link">← Back to News</a>
        <div class="article-meta">
            <span class="category">Space</span>
            <span>8 hours ago</span>
        </div>
        <h1>Space Tourism Industry Sees Major Breakthrough</h1>
        <div class="article-content">
            <p>A revolutionary new propulsion system promises to transform space tourism from an exclusive experience for billionaires into an accessible adventure for middle-class travelers. The breakthrough technology, developed after years of research, could reduce the cost of space flights by up to 90%.</p>
            <p>The new propulsion system utilizes advanced plasma technology combined with reusable components, dramatically cutting both fuel costs and manufacturing expenses. Early projections suggest that within five years, suborbital flights could cost as little as a luxury vacation.</p>
            <p>"We're witnessing the dawn of a new era in human spaceflight," said the lead engineer on the project. "Our goal has always been to democratize access to space, and this technology brings us closer than ever to that dream."</p>
            <p>Several space tourism companies have already expressed interest in licensing the technology, with the first commercial flights expected within two years. Industry analysts predict this could spark a boom in the space tourism sector, with millions of passengers taking to the stars by the end of the decade.</p>
            <p>Safety testing is currently underway, with regulators working closely with developers to establish new standards for this emerging form of travel. The technology has already passed initial safety reviews with flying colors.</p>
        </div>
    </article>
</body>
</html>`,
  "medical-treatment-promise.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Revolutionary Medical Treatment Shows Promise - NewsPortal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: #ffffff;
            line-height: 1.8;
            min-height: 100vh;
        }
        .article-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
        }
        .back-link {
            display: inline-block;
            color: #4ecdc4;
            text-decoration: none;
            margin-bottom: 2rem;
            font-weight: 500;
        }
        .back-link:hover { text-decoration: underline; }
        .article-meta {
            display: flex;
            gap: 1rem;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
            color: #888;
        }
        .category {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            color: white;
        }
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .article-content { color: #b8b8b8; }
        .article-content p { margin-bottom: 1.5rem; }
    </style>
</head>
<body>
    <article class="article-container">
        <a href="/" class="back-link">← Back to News</a>
        <div class="article-meta">
            <span class="category">Health</span>
            <span>12 hours ago</span>
        </div>
        <h1>Revolutionary Medical Treatment Shows Promise</h1>
        <div class="article-content">
            <p>Clinical trials have revealed breakthrough results for a new gene therapy treatment targeting rare genetic disorders. The therapy, which has shown remarkable success in early trials, could offer hope to millions of patients worldwide who currently have limited treatment options.</p>
            <p>The treatment works by using advanced gene-editing technology to correct the underlying genetic mutations responsible for these conditions. In trials, over 80% of patients showed significant improvement, with many experiencing complete remission of symptoms.</p>
            <p>"These results exceed our most optimistic expectations," said the lead researcher. "We're seeing patients who were previously facing a lifetime of debilitating symptoms now living normal, healthy lives."</p>
            <p>The therapy targets a class of genetic disorders that affect approximately 1 in 10,000 people worldwide. While individually rare, collectively these conditions impact millions of families globally. Current treatments have been limited to managing symptoms rather than addressing the root cause.</p>
            <p>Regulatory agencies are fast-tracking the approval process, with the treatment potentially available to patients within the next two years. Researchers are also exploring applications of the technology for more common genetic conditions.</p>
        </div>
    </article>
</body>
</html>`,
  "breakthrough-in-ai.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Breakthrough in AI Research Promises Safer Autonomous Systems - NewsPortal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: #ffffff;
            line-height: 1.8;
            padding: 2rem;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 3rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .back-link {
            display: inline-block;
            color: #4ecdc4;
            text-decoration: none;
            margin-bottom: 2rem;
            font-weight: 600;
        }
        .back-link:hover { text-decoration: underline; }
        .category {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            line-height: 1.2;
        }
        .meta {
            color: #888;
            margin-bottom: 2rem;
            font-size: 0.95rem;
        }
        .content {
            font-size: 1.1rem;
            line-height: 1.8;
        }
        .content p { margin-bottom: 1.5rem; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← Back to Home</a>
        <div class="category">Technology</div>
        <h1>Breakthrough in AI Research Promises Safer Autonomous Systems</h1>
        <div class="meta">Published 1 hour ago</div>
        <div class="content">
            <p>In a major advancement for artificial intelligence safety, researchers at leading tech institutions have developed a groundbreaking framework for ensuring the reliability of autonomous AI systems. The new approach, dubbed "Adaptive Safety Layers," represents a significant leap forward in addressing one of the most pressing challenges in AI deployment.</p>

            <p>The framework introduces multiple redundant safety mechanisms that work in concert to prevent unintended consequences in AI decision-making processes. Unlike previous safety measures that focused on single-point interventions, this multi-layered approach provides comprehensive protection against a wide range of potential failure modes.</p>

            <p>Early testing results are promising, with the system demonstrating a 95% reduction in critical safety incidents during simulated autonomous vehicle operations. The technology has already attracted interest from major automotive manufacturers and could accelerate the adoption of self-driving cars worldwide.</p>

            <p>Experts in the field are calling this development a "game-changer" for the AI industry, potentially opening new avenues for deploying AI in high-stakes applications such as healthcare, finance, and critical infrastructure management. The research team plans to make the framework open-source, allowing broader adoption and further refinement by the global AI community.</p>

            <p>While the breakthrough addresses many safety concerns, researchers emphasize that ongoing vigilance and continuous improvement will remain essential as AI systems become increasingly sophisticated and integrated into daily life.</p>
        </div>
    </div>
</body>
</html>`,
  "green-energy-revolution.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Green Energy Revolution Accelerates Global Transition - NewsPortal</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
            color: #ffffff;
            line-height: 1.8;
            padding: 2rem;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 3rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .back-link {
            display: inline-block;
            color: #4ecdc4;
            text-decoration: none;
            margin-bottom: 2rem;
            font-weight: 600;
        }
        .back-link:hover { text-decoration: underline; }
        .category {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            line-height: 1.2;
        }
        .meta {
            color: #888;
            margin-bottom: 2rem;
            font-size: 0.95rem;
        }
        .content {
            font-size: 1.1rem;
            line-height: 1.8;
        }
        .content p { margin-bottom: 1.5rem; }
    </style>
</head>
<body>
    <div class="container">
        <a href="/" class="back-link">← Back to Home</a>
        <div class="category">Environment</div>
        <h1>Green Energy Revolution Accelerates Global Transition</h1>
        <div class="meta">Published 3 hours ago</div>
        <div class="content">
            <p>The global energy landscape is undergoing a dramatic transformation as renewable energy sources surge ahead of traditional fossil fuels. Recent reports indicate that solar and wind power installations reached record levels in the past year, with investments in clean energy infrastructure exceeding $300 billion worldwide.</p>

            <p>Governments and private sectors are collaborating on ambitious initiatives to accelerate the transition to sustainable energy. Breakthroughs in battery storage technology and smart grid systems are making renewable energy more reliable and cost-effective than ever before.</p>

            <p>Developing nations are particularly benefiting from this revolution, with many leapfrogging traditional energy infrastructure to adopt cutting-edge renewable solutions. This shift is not only reducing carbon emissions but also creating millions of new jobs in the green energy sector.</p>

            <p>Industry analysts predict that by 2030, renewable energy could account for over 50% of global electricity generation, marking a historic turning point in humanity's relationship with energy production and consumption.</p>

            <p>While challenges remain in scaling up these technologies and managing the transition for fossil fuel-dependent regions, the momentum behind green energy continues to build, promising a cleaner, more sustainable future for generations to come.</p>
        </div>
    </div>
</body>
</html>`
};

// Articles handlers (for article editor and serving article pages)
async function handleArticles(method, filename, req) {
  if (!filename) return errorResponse("Filename required");

  const store = getStore("articles");

  switch (method) {
    case "GET": {
      // Check if this is an API request (wants JSON) or a page request (wants HTML)
      const acceptHeader = req.headers.get("Accept") || "";
      const wantsJson = acceptHeader.includes("application/json");

      try {
        // First, try to get from Blobs storage
        const content = await store.get(filename, { type: "text" });
        if (content) {
          if (wantsJson) {
            return jsonResponse({ content });
          }
          // Return HTML directly for page requests
          return new Response(content, {
            status: 200,
            headers: { "Content-Type": "text/html; charset=utf-8" }
          });
        }
      } catch (e) {
        // Blobs storage doesn't have the article
      }

      // Fall back to static article content
      if (staticArticles[filename]) {
        if (wantsJson) {
          return jsonResponse({ content: staticArticles[filename] });
        }
        // Return HTML directly for page requests
        return new Response(staticArticles[filename], {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }

      // For new articles that don't exist yet, return empty content for JSON requests (article editor)
      // This allows users to create new articles through the editor
      if (wantsJson) {
        return jsonResponse({ content: "" });
      }

      return errorResponse("Article not found", 404);
    }

    case "PUT": {
      try {
        const body = await req.json();
        await store.set(filename, body.content);
        return jsonResponse({ success: true, filename });
      } catch (error) {
        return errorResponse("Failed to save article");
      }
    }

    default:
      return errorResponse("Method not allowed", 405);
  }
}

// Newsletter subscription handler
async function handleSubscribe(method, req) {
  if (method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = await req.json();
    const email = body.email;

    if (!email || !email.includes("@")) {
      return errorResponse("Valid email required");
    }

    // Store subscription in Blobs
    const store = getStore("subscriptions");
    let subscriptions = [];
    try {
      subscriptions = await store.get("emails", { type: "json" }) || [];
    } catch (e) {
      subscriptions = [];
    }

    if (!subscriptions.includes(email)) {
      subscriptions.push(email);
      await store.setJSON("emails", subscriptions);
    }

    return jsonResponse({
      success: true,
      message: "Thank you for subscribing! You'll be notified when new podcasts are added."
    });
  } catch (error) {
    return errorResponse("Subscription failed");
  }
}

// File upload handler (placeholder - actual file uploads need different handling)
async function handleUpload(method, uploadType, req) {
  if (method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  // Note: Actual file upload handling requires multipart form data parsing
  // This is a placeholder that acknowledges the upload request
  return jsonResponse({
    success: true,
    message: `Upload endpoint for ${uploadType} received. For production use, implement proper file handling.`,
    filename: `uploaded_${Date.now()}`
  });
}

export default async (req, context) => {
  const url = new URL(req.url);
  const method = req.method;
  const { resource, id } = parseApiPath(url.pathname);

  // Auth endpoints don't require authentication
  if (resource === "auth") {
    return handleAuth(method, id, req);
  }

  // Public read-only endpoints (GET requests for content)
  const isPublicRead = method === "GET" && ["news", "videos", "trending", "articles"].includes(resource);
  const isSubscribe = resource === "subscribe";

  // For non-public endpoints, require authentication
  if (!isPublicRead && !isSubscribe) {
    const sessionId = req.headers.get("X-Session-Id");
    const isAuthenticated = await validateSession(sessionId);
    if (!isAuthenticated) {
      return jsonResponse({ error: "Authentication required" }, 401);
    }
  }

  // Handle different resources
  switch (resource) {
    case "news":
      return handleNews(method, id, req);
    case "videos":
      return handleVideos(method, id, req);
    case "trending":
      return handleTrending(method, id, req);
    case "articles":
      return handleArticles(method, id, req);
    case "subscribe":
      return handleSubscribe(method, req);
    case "upload":
      return handleUpload(method, id, req);
    default:
      return errorResponse("Not found", 404);
  }
};

export const config = {
  path: "/api/*"
};
