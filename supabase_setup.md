# 🗄️ Supabase Database Setup for NewsPortal

## Why Supabase?
- **Free tier** with generous limits (500MB database, 50MB file storage)
- **PostgreSQL** database with real-time capabilities
- **Built-in authentication** (optional for admin panel)
- **File storage** for images and documents
- **RESTful API** automatically generated
- **Real-time subscriptions** for live updates

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub, Google, or email
3. Verify your email

## Step 2: Create New Project

1. Click "New Project"
2. Choose your organization
3. Fill in project details:
   - **Name**: `newsportal` (or your choice)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users (e.g., `West US (Oregon)`)

4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 3: Get API Keys

1. In your project dashboard, go to **Settings → API**
2. Copy these values (keep them secret):
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 4: Set Environment Variables in Netlify

### For Netlify Deployment:

1. In Netlify dashboard, go to **Site Settings → Environment variables**
2. Add these variables:
   ```
   SUPABASE_URL = https://your-project-id.supabase.co
   SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### For Local Development:

1. Create `.env` file in your project root:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 5: Create Database Tables

### Method 1: SQL Editor (Recommended)

1. In Supabase dashboard, go to **SQL Editor**
2. Run this SQL script:

```sql
-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  excerpt TEXT,
  href TEXT,
  time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  channel TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trending table
CREATE TABLE IF NOT EXISTS trending (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  href TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional, for production)
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (adjust for production)
CREATE POLICY "Allow all operations on news" ON news FOR ALL USING (true);
CREATE POLICY "Allow all operations on videos" ON videos FOR ALL USING (true);
CREATE POLICY "Allow all operations on trending" ON trending FOR ALL USING (true);
CREATE POLICY "Allow insert on subscriptions" ON subscriptions FOR INSERT WITH CHECK (true);
```

### Method 2: Table Editor

1. Go to **Table Editor** in Supabase dashboard
2. Click "New table" for each table
3. Define columns as shown above

## Step 6: Import Existing Data (Optional)

If you have existing data in your JSON files, you can import it:

1. Go to **Table Editor → [table name] → Insert**
2. Or use the SQL Editor to insert data:

```sql
-- Example: Insert sample news
INSERT INTO news (title, category, excerpt, href, time) VALUES
('Global Climate Summit Reaches Historic Agreement', 'Environment', 'World leaders unite on unprecedented climate action plan...', 'articles/climate-summit.html', '2 hours ago'),
('Tech Giants Announce AI Ethics Initiative', 'Technology', 'Major technology companies collaborate on new standards...', 'articles/ai-ethics-initiative.html', '5 hours ago');
```

## Step 7: Test Database Connection

### Test API Endpoints:

After deploying to Netlify with environment variables set:

- **News**: `https://yoursite.netlify.app/.netlify/functions/api/news`
- **Videos**: `https://yoursite.netlify.app/.netlify/functions/api/videos`
- **Trending**: `https://yoursite.netlify.app/.netlify/functions/api/trending`

### Test Admin Panel:

1. Go to `https://yoursite.netlify.app/admin.html`
2. Try adding news/videos
3. Check if data persists after page refresh

## Step 8: Set Up File Storage (Optional)

For file uploads (images, documents):

1. In Supabase dashboard, go to **Storage**
2. Create buckets:
   - `articles` (for HTML files)
   - `images` (for images)
3. Set up policies for public access

## Monitoring & Management

### View Data:
- **Table Editor**: Browse and edit data
- **SQL Editor**: Run queries
- **Logs**: Monitor API usage

### Backup:
- Supabase provides automatic backups
- Export data via SQL Editor

## Cost Structure

- **Free Tier**: 500MB database, 50MB storage, 50,000 monthly active users
- **Pro**: $25/month for higher limits
- **Pay as you go**: Additional usage billed monthly

## Security Considerations

### For Production:
1. **Enable Row Level Security** properly
2. **Create specific policies** for data access
3. **Use service role key** for server-side operations
4. **Set up authentication** for admin panel
5. **Monitor usage** and set up alerts

### Environment Variables:
- Never commit API keys to Git
- Use different keys for development/production
- Rotate keys regularly

## Troubleshooting

### Common Issues:

1. **Connection failed**: Check environment variables
2. **Table not found**: Verify table creation
3. **Permission denied**: Check RLS policies
4. **Data not saving**: Check function logs in Netlify

### Useful Queries:

```sql
-- Check table contents
SELECT * FROM news LIMIT 5;

-- Count records
SELECT COUNT(*) FROM news;

-- Clear all data (careful!)
DELETE FROM news;
```

## Next Steps

1. **Deploy to Netlify** with environment variables
2. **Test the admin panel** thoroughly
3. **Set up file storage** if needed
4. **Configure authentication** for production
5. **Monitor performance** and optimize queries

---

**🎉 Your NewsPortal now has persistent data storage!** Changes made via the admin panel will be saved to Supabase and persist across deployments.
