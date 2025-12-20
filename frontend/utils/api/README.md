# API Module

This directory contains the frontend API client and utilities for communicating with the backend.

## Structure

- **`index.ts`** - Main entry point that exports all API modules and the configured axios instance
- **`auth.ts`** - Authentication API functions for OAuth operations
- **`token-manager.ts`** - Token storage and management utilities
- **`oauth-flow.ts`** - OAuth flow utilities and callback handlers
- **`transfer.ts`** - Playlist transfer API functions

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
// or
const result = await callbackHandlers.handleYouTubeCallback(searchParams);
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

## Configuration

The API base URL is configured in `@/utils/config.ts` via the `NEXT_PUBLIC_API_BASE_URL` environment variable.

Default timeout: 180 seconds (3 minutes) for transfer operations.
