# NewsPortal Deployment Guide

## 🚀 Deploy to Google App Engine (GAE)

### Prerequisites
1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud SDK**: Install from [cloud.google.com/sdk](https://cloud.google.com/sdk)
3. **Project Setup**: Create a new GCP project

### Step-by-Step Deployment

#### 1. Install Google Cloud SDK
```bash
# Download and install gcloud CLI
# Follow instructions at: https://cloud.google.com/sdk/docs/install
```

#### 2. Authenticate and Set Project
```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# List projects to verify
gcloud projects list
```

#### 3. Enable Required APIs
```bash
# Enable App Engine API
gcloud services enable appengine.googleapis.com

# Enable Cloud Build API (for deployment)
gcloud services enable cloudbuild.googleapis.com
```

#### 4. Initialize App Engine (First Time Only)
```bash
# Initialize App Engine in your project
gcloud app create --region=us-central

# Choose a region when prompted (us-central is recommended)
```

#### 5. Deploy Your Application
```bash
# From your project root directory
gcloud app deploy

# This will upload your files and deploy to GAE
# The first deployment may take several minutes
```

#### 6. Access Your Live Website
```bash
# Get your app URL
gcloud app browse

# Or visit: https://YOUR_PROJECT_ID.appspot.com
```

### File Structure for Deployment
```
your-project/
├── app.yaml              # App Engine configuration
├── backend/
│   ├── server.js         # Express server
│   ├── package.json      # Dependencies
│   └── data/            # JSON data files
├── articles/            # HTML article files
├── index.html           # Main page
├── admin.html           # Admin panel
└── ...other static files
```

### Important Notes

#### Static File Serving
- App Engine serves static files from the root directory
- API routes are handled by your Express server
- All files in root directory are publicly accessible

#### Data Persistence
- JSON files in `backend/data/` are stored with your app
- Changes made via admin panel will persist
- Uploaded files go to `articles/` and `images/` directories

#### Custom Domain (Optional)
```bash
# Add custom domain
gcloud app domain-mappings create yourdomain.com

# Follow the DNS setup instructions provided
```

#### SSL Certificate
- GAE provides free SSL certificates automatically
- Your site will be available at `https://` by default

### Troubleshooting

#### Common Issues:
1. **Deployment Fails**: Check `gcloud app logs read`
2. **App Not Loading**: Verify `app.yaml` configuration
3. **API Not Working**: Check server logs with `gcloud app logs tail -s default`

#### Useful Commands:
```bash
# View app logs
gcloud app logs read

# View app status
gcloud app describe

# Redeploy after changes
gcloud app deploy

# Stop the app (optional)
gcloud app versions stop v1
```

### Cost Considerations
- **Free Tier**: First 28 instance-hours per day are free
- **Pricing**: See [App Engine pricing](https://cloud.google.com/appengine/pricing)
- **Monitoring**: Use GCP Console to monitor usage

### Alternative Deployment Options

#### Option 1: Firebase Hosting (Static Only)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

#### Option 2: Vercel (Static + Serverless)
```bash
npm install -g vercel
vercel --prod
```

#### Option 3: Netlify (Static)
- Drag & drop your files to [netlify.com](https://netlify.com)
- Or use Netlify CLI

### Security Considerations
- Keep admin panel access secure
- Regularly update dependencies
- Monitor GCP billing and usage
- Use environment variables for sensitive data

### Support
- [Google App Engine Documentation](https://cloud.google.com/appengine/docs)
- [GCP Support](https://cloud.google.com/support)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-app-engine)
