# API Module

This directory contains the frontend API client and utilities for communicating with the backend.

## Structure

- **`index.ts`** - Main entry point that exports all API modules and the configured axios instance
- **`auth.ts`** - Authentication API functions for OAuth operations with retry logic
- **`token-manager.ts`** - Token storage and management utilities with expiration tracking
- **`oauth-flow.ts`** - OAuth flow utilities and callback handlers with user-friendly error messages
- **`transfer.ts`** - Playlist transfer API functions

## Features

### Retry Logic
Authentication operations automatically retry up to 3 times with exponential backoff:
- Initial retry delay: 1 second
- Exponential backoff multiplier: 2x
- Client errors (4xx) are not retried

### Token Expiration Handling
- Tokens are automatically validated before use
- Expired tokens are cleared and require re-authentication
- 5-minute buffer before actual expiry to prevent mid-request expiration

## Usage

### Basic Import

```typescript
import api, { authAPI, tokenManager, oauthFlow, transferAPI } from "@/utils/api";
```

### Examples

#### Check Authentication Status
```typescript
const status = tokenManager.getAuthStatus();
// Returns: { spotify: boolean, youtube: boolean }
// Automatically checks token expiration
```

#### Start OAuth Flow
```typescript
// Start Spotify authentication
oauthFlow.startSpotifyAuth();

// Start YouTube authentication
oauthFlow.startYouTubeAuth();
```

#### Handle OAuth Callback
```typescript
const result = await callbackHandlers.handleSpotifyCallback(searchParams);
// Returns: { status: "success" | "error", message: string }
// Includes user-friendly error messages and automatic retries
```

#### Transfer Playlist
```typescript
const result = await transferAPI.directTransfer({
  url: "https://youtube.com/playlist?list=...",
  name: "My Playlist",
  isPublic: true,
  description: "Transferred from YouTube"
});
```

## Security Notes

- Tokens are stored in localStorage (consider more secure storage for production)
- Never log actual token values (only log existence/status)
- Always validate state parameter in OAuth callbacks to prevent CSRF attacks
- Tokens are sent as custom headers (X-Spotify-Token, X-YouTube-Token) to the backend
- Token expiration is tracked to prevent using expired credentials

## Configuration

The API base URL is configured in `@/utils/config.ts` via the `NEXT_PUBLIC_API_BASE_URL` environment variable.

Default timeout: 180 seconds (3 minutes) for transfer operations.

## Error Handling

All API operations include comprehensive error handling:
- Automatic retry for transient failures
- User-friendly error messages
- Detailed logging for debugging
- CSRF protection validation


## API Documentation

### Transfer Endpoint
```http
POST /transfer
Content-Type: application/json

{
  "playlist_url": "https://www.youtube.com/playlist?list=...",
  "playlist_name": "My Transferred Playlist",
  "is_public": true,
  "description": "Transferred from YouTube"
}
```

### Response Format
```json
{
  "success": true,
  "playlist_id": "spotify_playlist_id",
  "playlist_url": "https://open.spotify.com/playlist/...",
  "total_songs": 25,
  "transferred_songs": 22,
  "failed_songs": 3,
  "songs": [
    {
      "id": "song_1",
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "status": "success",
      "spotify_url": "https://open.spotify.com/track/...",
      "youtube_url": "https://www.youtube.com/watch?v=...",
      "thumbnail": "https://i.scdn.co/image/..."
    }
  ],
  "transfer_duration": 45.7,
  "created_at": "2024-01-15T10:30:00Z"
}
```