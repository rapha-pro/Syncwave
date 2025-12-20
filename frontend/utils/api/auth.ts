import { createLogger } from "../useLogger";

const logger = createLogger("utils/api/auth");

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
    logger.log("[authAPI] - Checking backend OAuth status");
    // Import api here to avoid circular dependency
    const api = (await import("./index")).default;
    const response = await api.get("/auth/status");

    return response.data;
  },

  /**
   * Exchange Spotify authorization code for access token
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
    logger.log("[authAPI] - Exchanging Spotify authorization code");
    // Import api here to avoid circular dependency
    const api = (await import("./index")).default;
    const response = await api.post("/auth/spotify/callback", {
      code,
      redirect_uri: redirectUri,
    });

    return response.data;
  },

  /**
   * Exchange YouTube authorization code for access token
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
    logger.log("[authAPI] - Exchanging YouTube authorization code");
    // Import api here to avoid circular dependency
    const api = (await import("./index")).default;
    const response = await api.post("/auth/youtube/callback", {
      code,
      redirect_uri: redirectUri,
    });

    return response.data;
  },

  /**
   * Generate Spotify OAuth URL
   */
  generateSpotifyAuthUrl: (state: string): string => {
    logger.log("[authAPI] - Generating Spotify OAuth URL");

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = `http://127.0.0.1:3000/auth/spotify/callback`;
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
    logger.log("[authAPI] - Generating YouTube OAuth URL");

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `http://127.0.0.1:3000/auth/youtube/callback`;
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
