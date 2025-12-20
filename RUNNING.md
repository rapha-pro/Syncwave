# Running Syncwave - Complete Guide

This guide provides step-by-step instructions for running Syncwave locally.

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Spotify Developer Account
- Google Cloud Project with YouTube Data API enabled

## Backend Setup

### 1. Install Python Dependencies

```bash
cd /path/to/Syncwave
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# YouTube API Configuration
YOUTUBE_CLIENT_JSON=credentials/client_secret.json

# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8080/callback
SPOTIFY_SCOPE=playlist-modify-public playlist-modify-private

# Application Configuration
API_BASE_URL=http://localhost:8000
```

### 3. Set Up API Credentials

**Google Cloud (YouTube)**:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Download the client secret JSON file
6. Save it as `backend/credentials/client_secret.json`

**Spotify**:
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:8080/callback`
4. Copy Client ID and Client Secret to `.env`

### 4. Start the Backend Server

**From the project root directory**:
```bash
cd /path/to/Syncwave
uvicorn backend.main:app --reload --port 8000
```

The backend should now be running at `http://localhost:8000`

**Important**: Always run `uvicorn` from the project root directory, NOT from inside the `backend` directory. The command should be:
```bash
uvicorn backend.main:app --reload --port 8000
```

NOT:
```bash
cd backend
uvicorn main:app --reload --port 8000  # This will fail!
```

### Verify Backend is Running

Open your browser and go to:
- API docs: http://localhost:8000/docs
- Root endpoint: http://localhost:8000

You should see the API documentation and a welcome message.

## Frontend Setup

### 1. Install Node Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
# Backend API
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000

# OAuth Client IDs (for frontend OAuth flow)
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**Note**: Use the same Spotify Client ID as in the backend `.env`.

### 3. Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend should now be running at `http://localhost:3000`

### Verify Frontend is Running

Open your browser and go to: http://localhost:3000

You should see the Syncwave landing page.

## Using the Application

### 1. Authenticate with Services

On the homepage:
1. Click "Connect Spotify" and authorize the application
2. Click "Connect YouTube" and authorize the application
3. Wait for both connections to show as "Connected"

### 2. Transfer a Playlist

1. Click "Get Started" button
2. Enter a YouTube playlist URL
3. Provide a name for the new Spotify playlist
4. Choose visibility settings (Public/Private)
5. Click "Start Transfer"
6. Wait for the transfer to complete
7. View the results with success/failure details

## Troubleshooting

### Backend Issues

**Issue**: `ModuleNotFoundError: No module named 'backend'`
**Solution**: Make sure you're running `uvicorn` from the project root directory:
```bash
cd /path/to/Syncwave
uvicorn backend.main:app --reload --port 8000
```

**Issue**: `No module named 'fastapi'`
**Solution**: Install dependencies:
```bash
pip install -r requirements.txt
```

**Issue**: Backend starts but authentication fails
**Solution**: 
1. Check that your `.env` file exists in the `backend` directory
2. Verify all API credentials are correct
3. Check the backend logs for specific error messages

### Frontend Issues

**Issue**: Cannot connect to backend
**Solution**: 
1. Verify backend is running at http://localhost:8000
2. Check `NEXT_PUBLIC_API_BASE_URL` in frontend `.env.local`
3. Ensure CORS is properly configured in backend

**Issue**: Authentication redirects fail
**Solution**:
1. Verify redirect URIs match in:
   - Spotify Developer Dashboard
   - Google Cloud Console
   - Frontend code (should be `http://127.0.0.1:3000/auth/{platform}/callback`)

**Issue**: "Missing authentication tokens" error
**Solution**:
1. Clear browser localStorage: `localStorage.clear()`
2. Re-authenticate with both services
3. Check browser console for errors

### Authentication Issues

**Issue**: OAuth flow fails on first attempt
**Solution**: 
- This has been fixed with retry logic (up to 3 attempts)
- If it still fails, check your internet connection
- Verify API credentials are correct

**Issue**: Token expiration errors
**Solution**:
- Tokens expire after 1 hour (default)
- The app now automatically detects and handles expiration
- Re-authenticate when prompted

## Development Commands

### Backend

```bash
# Start backend
uvicorn backend.main:app --reload --port 8000

# From project root, not from backend directory!
cd /path/to/Syncwave
uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
# Development server
npm run dev

# Linting
npm run lint

# Build for production
npm run build

# Start production server
npm run start
```

## Environment Variables Reference

### Backend (.env)
```env
YOUTUBE_CLIENT_JSON=credentials/client_secret.json
SPOTIFY_CLIENT_ID=<your_client_id>
SPOTIFY_CLIENT_SECRET=<your_client_secret>
SPOTIFY_REDIRECT_URI=http://localhost:8080/callback
SPOTIFY_SCOPE=playlist-modify-public playlist-modify-private
API_BASE_URL=http://localhost:8000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=<your_client_id>
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your_client_id>.apps.googleusercontent.com
```

## Port Configuration

- Backend: 8000 (configurable via `--port` flag)
- Frontend: 3000 (configurable in package.json)

Make sure these ports are not in use by other applications.

## Next Steps

1. Test the authentication flow with both Spotify and YouTube
2. Try transferring a small playlist (5-10 songs) first
3. Check the results page for any failed songs
4. Review the backend logs for any errors

## Need Help?

If you encounter issues:
1. Check the browser console (F12) for frontend errors
2. Check the backend terminal for server errors
3. Review the logs in the application
4. Ensure all environment variables are correctly set
5. Verify API credentials are valid and not expired

---

**Last Updated**: 2025-12-20
