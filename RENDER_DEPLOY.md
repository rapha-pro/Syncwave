# Quick Render Deployment Guide

## Prerequisites

You need:
1. Your `credentials/youtube_client_secret.json` file
2. Your Spotify Client ID and Secret
3. GitHub account with this repository
4. Render account (free tier) - sign up at https://render.com

## Step 1: Convert YouTube Credentials to Environment Variable

Since Render free tier doesn't support file uploads, convert your JSON file to a string:

```bash
# Run this in your project root (where credentials/ folder is)
python -c "import json; print(json.dumps(json.load(open('credentials/youtube_client_secret.json')), separators=(',', ':')))"
```

**Copy the entire output** - you'll need it in Step 3.

## Step 2: Deploy Backend to Render

### Option A: Using Blueprint (Easiest)

1. Go to https://dashboard.render.com/
2. Click **New** → **Blueprint**
3. Connect your GitHub repository (`rapha-pro/Syncwave`)
4. Render will detect `render.yaml` automatically
5. Click **Apply**

### Option B: Manual Setup

1. Go to https://dashboard.render.com/
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `syncwave-backend`
   - **Region**: Choose closest to you
   - **Branch**: `copilot/update-cors-configuration` (or `main` after merge)
   - **Root Directory**: Leave empty
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**

## Step 3: Add Environment Variables

In your Render service dashboard, go to **Environment** tab and add:

| Variable | Value |
|----------|-------|
| `SPOTIFY_CLIENT_ID` | Your Spotify client ID |
| `SPOTIFY_CLIENT_SECRET` | Your Spotify client secret |
| `SPOTIFY_REDIRECT_URI` | `https://your-app.vercel.app/auth/spotify/callback` (update after frontend deploy) |
| `SPOTIFY_SCOPE` | `playlist-modify-public playlist-modify-private user-read-private` |
| `GOOGLE_CLIENT_ID` | Your Google client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google client secret |
| `YOUTUBE_CLIENT_CONFIG` | **Paste the minified JSON from Step 1** |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` (update after frontend deploy) |
| `ENVIRONMENT` | `production` |

**Note**: Leave `YOUTUBE_CLIENT_JSON` unset - we're using `YOUTUBE_CLIENT_CONFIG` instead for Render.

Click **Save Changes** - Render will automatically redeploy.

## Step 4: Note Your Backend URL

After deployment completes (2-3 minutes), you'll get a URL like:
- `https://syncwave-backend-xxxxx.onrender.com`

**Copy this URL** - you'll need it for frontend deployment.

## Step 5: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: Leave default
   - **Output Directory**: Leave default

4. Add environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | Your Render backend URL (e.g., `https://syncwave-backend-xxxxx.onrender.com`) |
| `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` | Same as backend `SPOTIFY_CLIENT_ID` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same as backend `GOOGLE_CLIENT_ID` |
| `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` | `https://your-app.vercel.app/auth/spotify/callback` |
| `NEXT_PUBLIC_YOUTUBE_REDIRECT_URI` | `https://your-app.vercel.app/auth/youtube/callback` |

5. Click **Deploy**

## Step 6: Update Environment Variables

After Vercel deployment, you'll get a URL like `https://your-app.vercel.app`.

Go back to **Render** → **Environment** and update:
- `SPOTIFY_REDIRECT_URI` → `https://your-app.vercel.app/auth/spotify/callback`
- `ALLOWED_ORIGINS` → `https://your-app.vercel.app`

Save changes and Render will redeploy.

## Step 7: Update OAuth Redirect URIs

### Spotify
1. Go to https://developer.spotify.com/dashboard
2. Select your app
3. Click **Edit Settings**
4. Add to Redirect URIs: `https://your-app.vercel.app/auth/spotify/callback`
5. Save

### Google/YouTube
1. Go to https://console.cloud.google.com/
2. Navigate to **APIs & Services** → **Credentials**
3. Select your OAuth 2.0 Client ID
4. Add to Authorized redirect URIs: `https://your-app.vercel.app/auth/youtube/callback`
5. Save

## Testing

Visit `https://your-app.vercel.app` and test:
1. Spotify authentication
2. YouTube authentication
3. Playlist transfer

## Troubleshooting

### Backend won't start
- Check Render logs: Dashboard → Logs tab
- Verify all environment variables are set
- Ensure `YOUTUBE_CLIENT_CONFIG` is valid JSON (no extra quotes)

### OAuth fails
- Verify redirect URIs match exactly in:
  - Render environment variables
  - Vercel environment variables
  - Spotify/Google dashboards
- No trailing slashes in URLs

### CORS errors
- Ensure `ALLOWED_ORIGINS` in Render matches your Vercel URL
- No http:// prefix in `ALLOWED_ORIGINS`, use full URL: `https://your-app.vercel.app`

## Cost

- **Render Free Tier**: 750 hours/month (enough for one service 24/7)
- **Vercel Free Tier**: Unlimited for personal projects
- **Total**: $0/month

**Note**: Render free tier services spin down after 15 minutes of inactivity. First request may take 30-60 seconds.
