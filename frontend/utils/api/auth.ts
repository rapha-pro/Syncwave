import { rateLimiter } from "../rate-limiter";
import { website_url } from "../socialLinks";


/**
 * Retry configuration for OAuth token exchange
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2, // Exponential backoff
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry wrapper for async operations
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = RETRY_CONFIG.maxRetries,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx) - these won't succeed on retry
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;

        if (
          axiosError.response?.status >= 400 &&
          axiosError.response?.status < 500
        ) {
          throw error;
        }
      }

      if (attempt < maxRetries) {
        const delay =
          RETRY_CONFIG.retryDelay *
          Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1);

        await sleep(delay);
      }
    }
  }

  throw (
    lastError ||
    new Error(`${operationName} failed after ${maxRetries} attempts`)
  );
}

/**
 * Authentication API functions for OAuth operations
 */
export const authAPI = {
  /**
   * Check backend OAuth configuration status
   */
  checkStatus: async (): Promise<{
    spotify_configured: boolean;
    youtube_configured: boolean;
    message: string;
  }> => {
    return withRetry(
      async () => {
        const api = (await import("./index")).default;
        const response = await api.get("/auth/status");

        return response.data;
      },
      "checkStatus",
      2,
    ); // Fewer retries for status check
  },

  /**
   * Exchange Spotify authorization code for access token with retry logic
   */
  spotifyCallback: async (
    code: string,
    redirectUri: string,
  ): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
    user_info?: any;
  }> => {
    // Check rate limit before proceeding
    if (!rateLimiter.checkLimit("auth")) {
      const resetTime = rateLimiter.getTimeUntilReset("auth");
      const resetSeconds = Math.ceil(resetTime / 1000);

      throw new Error(
        `Too many authentication attempts. Please wait ${resetSeconds} seconds before trying again.`,
      );
    }

    return withRetry(async () => {
      const api = (await import("./index")).default;
      const response = await api.post("/auth/spotify/callback", {
        code,
        redirect_uri: redirectUri,
      });

      if (!response.data?.access_token) {
        throw new Error("Invalid response: missing access token");
      }

      return response.data;
    }, "spotifyCallback");
  },

  /**
   * Exchange YouTube authorization code for access token with retry logic
   */
  youtubeCallback: async (
    code: string,
    redirectUri: string,
  ): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
    scope: string;
    user_info?: any;
  }> => {
    // Check rate limit before proceeding
    if (!rateLimiter.checkLimit("auth")) {
      const resetTime = rateLimiter.getTimeUntilReset("auth");
      const resetSeconds = Math.ceil(resetTime / 1000);

      throw new Error(
        `Too many authentication attempts. Please wait ${resetSeconds} seconds before trying again.`,
      );
    }

    return withRetry(async () => {
      const api = (await import("./index")).default;
      const response = await api.post("/auth/youtube/callback", {
        code,
        redirect_uri: redirectUri,
      });

      if (!response.data?.access_token) {
        throw new Error("Invalid response: missing access token");
      }

      return response.data;
    }, "youtubeCallback");
  },

  /**
   * Generate Spotify OAuth URL
   */
  generateSpotifyAuthUrl: (state: string): string => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri =
      process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ||
      `${website_url}/auth/spotify/callback`;
    const scopes = [
      "playlist-modify-public",
      "playlist-modify-private",
      "playlist-read-private",
      "user-read-private",
    ].join(" ");

    if (!clientId) {
      throw new Error("Spotify client ID not configured");
    }

    const authUrl = new URL("https://accounts.spotify.com/authorize");

    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scopes);
    authUrl.searchParams.append("state", state);

    return authUrl.toString();
  },

  /**
   * Generate YouTube OAuth URL
   */
  generateYouTubeAuthUrl: (state: string): string => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    // Use environment variable, or fallback to current origin
    const redirectUri =
      process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI ||
      (typeof window !== 'undefined' ? `${window.location.origin}/auth/youtube/callback` : '');
    
    const scopes = ["https://www.googleapis.com/auth/youtube.readonly"].join(
      " ",
    );

    if (!clientId) {
      throw new Error("Google client ID not configured");
    }

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scopes);
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("access_type", "offline");

    return authUrl.toString();
  },
};
