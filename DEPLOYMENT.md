# Production Deployment Guide

This guide will help you deploy the FloTunes app to production using Vercel (frontend) and Render (backend).

## Prerequisites

Before deploying, ensure you have:

1. **Spotify Developer Account** - [Create one here](https://developer.spotify.com/)
2. **Google Cloud Account** - [Create one here](https://console.cloud.google.com/)
3. **Vercel Account** - [Sign up here](https://vercel.com/)
4. **Render Account** - [Sign up here](https://render.com/)

## Step 1: Configure OAuth Applications

### Spotify Configuration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app or use an existing one
3. Note your **Client ID** and **Client Secret**
4. Add your production redirect URI to the app settings:
   - `https://your-app.vercel.app/auth/spotify/callback`
   - Keep `http://localhost:3000/auth/spotify/callback` for local development

### Google/YouTube Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **YouTube Data API v3**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if not already done
6. Add authorized redirect URIs:
   - `https://your-app.vercel.app/auth/youtube/callback`
   - Keep `http://localhost:3000/auth/youtube/callback` for local development
7. Download the credentials JSON file or note the **Client ID** and **Client Secret**

## Step 2: Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Blueprint**
4. Connect your GitHub repository
5. Render will detect the `render.yaml` file automatically
6. Set the following environment variables:
   - `SPOTIFY_CLIENT_ID` - Your Spotify Client ID
   - `SPOTIFY_CLIENT_SECRET` - Your Spotify Client Secret
   - `SPOTIFY_REDIRECT_URI` - `https://your-app.vercel.app/auth/spotify/callback`
   - `GOOGLE_CLIENT_ID` - Your Google Client ID
   - `GOOGLE_CLIENT_SECRET` - Your Google Client Secret
   - `YOUTUBE_CLIENT_CONFIG` - **Minified JSON** from your Google credentials file (see below)
   - `ALLOWED_ORIGINS` - `https://your-app.vercel.app` (update after deploying frontend)

7. Click **Apply** to create the service

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `FloTunes-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or set to repository root)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Add the environment variables listed in Option A
6. Click **Create Web Service**

### Converting YouTube Credentials to Environment Variable

To convert your `youtube_client_secret.json` to an environment variable:

```bash
# Minify the JSON (remove all whitespace and newlines)
cat credentials/youtube_client_secret.json | jq -c '.' > youtube_config_minified.json

# Copy the contents of youtube_config_minified.json
# Set it as YOUTUBE_CLIENT_CONFIG environment variable in Render
```

Or use this Python script:

```python
import json

with open('credentials/youtube_client_secret.json', 'r') as f:
    config = json.load(f)

# Print minified JSON
print(json.dumps(config, separators=(',', ':')))
```

### Note Your Backend URL

After deployment, Render will provide you with a URL like:
- `https://FloTunes-backend.onrender.com`

**Important**: Free tier services on Render will spin down after 15 minutes of inactivity. The first request after spinning down may take 30-60 seconds.

## Step 3: Deploy Frontend to Vercel

### Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Navigate to your project:
```bash
cd /path/to/FloTunes
```

3. Login to Vercel:
```bash
vercel login
```

4. Deploy:
```bash
vercel
```

5. Follow the prompts:
   - **Set up and deploy?** Yes
   - **Which scope?** Select your account
   - **Link to existing project?** No
   - **Project name?** FloTunes (or your preferred name)
   - **Directory?** `./frontend`
   - **Override settings?** No

6. Add environment variables:
```bash
vercel env add NEXT_PUBLIC_API_BASE_URL
# Enter: https://FloTunes-backend.onrender.com (your Render backend URL)

vercel env add NEXT_PUBLIC_SPOTIFY_CLIENT_ID
# Enter: your_spotify_client_id

vercel env add NEXT_PUBLIC_GOOGLE_CLIENT_ID
# Enter: your_google_client_id

vercel env add NEXT_PUBLIC_SPOTIFY_REDIRECT_URI
# Enter: https://your-app.vercel.app/auth/spotify/callback

vercel env add NEXT_PUBLIC_YOUTUBE_REDIRECT_URI
# Enter: https://your-app.vercel.app/auth/youtube/callback
```

7. Deploy to production:
```bash
vercel --prod
```

### Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
5. Add environment variables (see list below)
6. Click **Deploy**

### Environment Variables for Vercel

Add these in the Vercel dashboard under **Settings** → **Environment Variables**:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://FloTunes-backend.onrender.com` | Production |
| `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` | Your Spotify Client ID | Production |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Google Client ID | Production |
| `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` | `https://your-app.vercel.app/auth/spotify/callback` | Production |
| `NEXT_PUBLIC_YOUTUBE_REDIRECT_URI` | `https://your-app.vercel.app/auth/youtube/callback` | Production |

**Note**: Replace `your-app.vercel.app` with your actual Vercel domain.

## Step 4: Update CORS Settings

After deploying the frontend, update the `ALLOWED_ORIGINS` environment variable in Render:

1. Go to your Render service dashboard
2. Navigate to **Environment** tab
3. Update `ALLOWED_ORIGINS` to: `https://your-app.vercel.app`
4. Save changes (Render will automatically redeploy)

## Step 5: Update OAuth Redirect URIs

Go back to your OAuth app configurations and ensure the production redirect URIs are added:

### Spotify
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app
3. Click **Edit Settings**
4. Add to **Redirect URIs**: `https://your-app.vercel.app/auth/spotify/callback`
5. Save

### Google/YouTube
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**: `https://your-app.vercel.app/auth/youtube/callback`
5. Save

## Step 6: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Try authenticating with Spotify
3. Try authenticating with YouTube
4. Test transferring a playlist

## Troubleshooting

### Backend Errors

If you encounter backend errors:

1. Check Render logs:
   - Go to your service dashboard
   - Click on **Logs** tab
   - Look for error messages

2. Common issues:
   - Missing environment variables
   - Incorrect `YOUTUBE_CLIENT_CONFIG` format
   - CORS issues (check `ALLOWED_ORIGINS`)

### Frontend Errors

If you encounter frontend errors:

1. Check Vercel deployment logs:
   - Go to your project dashboard
   - Click on **Deployments**
   - Select the latest deployment
   - Check build logs

2. Check browser console for errors

3. Common issues:
   - Incorrect API base URL
   - Missing environment variables
   - OAuth redirect URI mismatch

### OAuth Errors

If OAuth fails:

1. Verify redirect URIs match exactly in:
   - Spotify/Google dashboards
   - Environment variables
   - No trailing slashes

2. Check that Client IDs/Secrets are correct

3. Ensure OAuth apps are not in development mode (Google)

## Alternative Deployment Options

### Railway

[Railway](https://railway.app/) is another excellent option for both frontend and backend:

1. **Backend Deployment**:
   - Connect your GitHub repository
   - Railway will auto-detect the Python project
   - Set environment variables (same as Render)
   - Railway provides $5 free credit monthly

2. **Frontend Deployment**:
   - Can deploy Next.js alongside backend
   - Or use Vercel for frontend (recommended)

### Fly.io

[Fly.io](https://fly.io/) offers a generous free tier:

1. Install Fly CLI: `brew install flyctl` (Mac) or see [docs](https://fly.io/docs/getting-started/installing-flyctl/)
2. Create `fly.toml` configuration
3. Deploy: `fly deploy`

### Heroku

[Heroku](https://www.heroku.com/) is a classic option (paid after free tier sunset):

1. Install Heroku CLI
2. Create `Procfile` for backend
3. Deploy with `git push heroku main`

## Security Checklist

Before going live, ensure:

- [ ] All environment variables are set correctly
- [ ] `ENVIRONMENT=production` is set in backend
- [ ] HTTPS is enforced (Vercel/Render do this automatically)
- [ ] OAuth redirect URIs are updated in provider dashboards
- [ ] CORS is configured correctly
- [ ] No secrets are committed to GitHub
- [ ] `.gitignore` includes `.env*` files

## Monitoring and Maintenance

### Logs

- **Render**: Built-in logs in dashboard
- **Vercel**: Logs available in deployment details
- **Consider**: [Sentry](https://sentry.io/) for error tracking

### Uptime Monitoring

Free tier services may spin down. Consider:
- [UptimeRobot](https://uptimerobot.com/) - Free uptime monitoring
- [Cronitor](https://cronitor.io/) - Cron job monitoring

### Database (Future)

If you add a database:
- **Render**: Offers free PostgreSQL
- **Supabase**: Free PostgreSQL with generous limits
- **PlanetScale**: Free MySQL (hobby tier)

## Support

If you encounter issues:

1. Check the logs in Render/Vercel dashboards
2. Review environment variable configuration
3. Ensure OAuth apps are configured correctly
4. Check that all URLs match across configurations

## Costs

### Free Tier Summary

- **Vercel**: Free for personal projects, unlimited bandwidth
- **Render**: Free tier includes 750 hours/month (enough for one service 24/7)
- **Total**: $0/month for hobby projects

### Paid Options

If you need more resources:
- **Render**: $7/month for 512MB RAM, always-on
- **Vercel**: $20/month for team features
- **Railway**: Pay as you go after $5 credit

## Next Steps

After successful deployment:

1. Set up a custom domain (Vercel supports this for free)
2. Add analytics (Vercel Analytics, Google Analytics)
3. Set up error monitoring (Sentry)
4. Configure automated deployments on push to main branch
5. Add a staging environment for testing

---

**Congratulations!** 🎉 Your FloTunes app is now live in production!
