import axios from "axios";

import { config } from "../config";
import { createLogger } from "../useLogger";

import {
  PlaylistTransferRequestProps,
  TransferResultResponseProps,
} from "@/types";

const API_BASE_URL = config.apiBaseUrl;
const logger = createLogger("utils/api");

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3-min timeout for transfers
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for logging
api.interceptors.request.use((config) => {
  logger.info(
    `[API] - Making ${config.method?.toUpperCase()} request to ${config.url}`,
  );

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    logger.error("[API] - Error:", error.response?.data || error.message);

    return Promise.reject(error);
  },
);

// Authentication API functions
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
      throw new Error("Spotify client ID not configured", clientId);
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
    logger.warn("[authAPI] - Generating YouTube OAuth URL");

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

// Token management utilities
export const tokenManager = {
  /**
   * Check if user has valid authentication tokens
   */
  getAuthStatus: (): {
    spotify: boolean;
    youtube: boolean;
  } => {
    logger.log("[tokenManager] - Checking stored auth tokens");

    const spotifyToken = localStorage.getItem("spotify_access_token");
    const youtubeToken = localStorage.getItem("youtube_access_token");

    return {
      spotify: !!spotifyToken,
      youtube: !!youtubeToken,
    };
  },

  /**
   * Store Spotify tokens
   */
  storeSpotifyTokens: (data: {
    access_token: string;
    refresh_token?: string;
    user_info?: any;
  }): void => {
    logger.log("[tokenManager] - Storing Spotify tokens");

    localStorage.setItem("spotify_access_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("spotify_refresh_token", data.refresh_token);
    }
    if (data.user_info) {
      localStorage.setItem("spotify_user", JSON.stringify(data.user_info));
    }
  },

  /**
   * Store YouTube tokens
   */
  storeYouTubeTokens: (data: {
    access_token: string;
    refresh_token?: string;
    user_info?: any;
  }): void => {
    logger.log("[tokenManager] - Storing YouTube tokens");

    localStorage.setItem("youtube_access_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("youtube_refresh_token", data.refresh_token);
    }
    if (data.user_info) {
      localStorage.setItem("youtube_user", JSON.stringify(data.user_info));
    }
  },

  /**
   * Clear Spotify tokens
   */
  clearSpotifyTokens: (): void => {
    logger.log("[tokenManager] - Clearing Spotify tokens");

    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_user");
  },

  /**
   * Clear YouTube tokens
   */
  clearYouTubeTokens: (): void => {
    logger.log("[tokenManager] - Clearing YouTube tokens");

    localStorage.removeItem("youtube_access_token");
    localStorage.removeItem("youtube_refresh_token");
    localStorage.removeItem("youtube_user");
  },

  /**
   * Get stored user info
   */
  getUserInfo: (platform: "spotify" | "youtube"): any | null => {
    const userJson = localStorage.getItem(`${platform}_user`);

    return userJson ? JSON.parse(userJson) : null;
  },
};

// OAuth flow utilities
export const oauthFlow = {
  /**
   * Start Spotify OAuth flow
   */
  startSpotifyAuth: (): void => {
    logger.log("[oauthFlow] - Starting Spotify OAuth flow");

    try {
      const state = Math.random().toString(36).substring(2, 15);

      localStorage.setItem("oauth_state", state);

      const authUrl = authAPI.generateSpotifyAuthUrl(state);

      window.location.href = authUrl;
    } catch (error) {
      logger.error("[oauthFlow] - Failed to start Spotify auth:", error);
      throw error;
    }
  },

  /**
   * Start YouTube OAuth flow
   */
  startYouTubeAuth: (): void => {
    logger.log("[oauthFlow] - Starting YouTube OAuth flow");

    try {
      const state = Math.random().toString(36).substring(2, 15);

      localStorage.setItem("oauth_state", state);

      const authUrl = authAPI.generateYouTubeAuthUrl(state);

      window.location.href = authUrl;
    } catch (error) {
      logger.error("[oauthFlow] - Failed to start YouTube auth:", error);
      throw error;
    }
  },

  /**
   * Handle OAuth callback (for callback pages)
   */
  handleCallback: async (
    platform: "spotify" | "youtube",
    code: string,
    state: string,
  ): Promise<void> => {
    logger.info(`[oauthFlow] - Handling ${platform} OAuth callback`);

    // Verify state parameter for security
    const storedState = localStorage.getItem("oauth_state");

    if (state !== storedState) {
      throw new Error("Invalid state parameter - possible CSRF attack");
    }

    const redirectUri = `${window.location.origin}/auth/${platform}/callback`;

    try {
      let tokenData;

      if (platform === "spotify") {
        tokenData = await authAPI.spotifyCallback(code, redirectUri);
        tokenManager.storeSpotifyTokens(tokenData);
      } else {
        tokenData = await authAPI.youtubeCallback(code, redirectUri);
        tokenManager.storeYouTubeTokens(tokenData);
      }

      // Clean up OAuth state
      localStorage.removeItem("oauth_state");

      logger.success(`[oauthFlow] - ${platform} authentication successful`);
      // No return - function completes successfully
    } catch (error) {
      logger.error(`[oauthFlow] - ${platform} authentication failed:`, error);
      throw error;
    }
  },
};

// OAuth callback handlers (for callback pages)
export const callbackHandlers = {
  /**
   * Handle Spotify OAuth callback - complete flow
   */
  handleSpotifyCallback: async (
    searchParams: URLSearchParams,
  ): Promise<{
    status: "success" | "error";
    message: string;
  }> => {
    try {
      logger.log("[callbackHandlers] - Processing Spotify OAuth callback");

      // Extract URL parameters
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      logger.info("[callbackHandlers] - URL parameters:", {
        code: !!code,
        state,
        error,
      });

      // Check for errors from Spotify
      if (error) {
        throw new Error(`Spotify error: ${error}`);
      }

      if (!code || !state) {
        throw new Error("Missing required parameters from Spotify");
      }

      // Use the centralized OAuth flow handler
      await oauthFlow.handleCallback("spotify", code, state);

      return {
        status: "success",
        message: "Successfully connected to Spotify!",
      };
    } catch (error) {
      logger.error(
        "[callbackHandlers] - Spotify authentication failed:",
        error,
      );

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        status: "error",
        message: `Authentication failed: ${errorMessage}`,
      };
    }
  },

  /**
   * Handle YouTube OAuth callback - complete flow
   */
  handleYouTubeCallback: async (
    searchParams: URLSearchParams,
  ): Promise<{
    status: "success" | "error";
    message: string;
  }> => {
    try {
      logger.log("[callbackHandlers] - Processing YouTube OAuth callback");

      // Extract URL parameters
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      logger.log("[callbackHandlers] - URL parameters:", {
        code: !!code,
        state,
        error,
      });

      // Check for errors from Google
      if (error) {
        throw new Error(`Google error: ${error}`);
      }

      if (!code || !state) {
        throw new Error("Missing required parameters from Google");
      }

      // Use the centralized OAuth flow handler
      await oauthFlow.handleCallback("youtube", code, state);

      return {
        status: "success",
        message: "Successfully connected to YouTube!",
      };
    } catch (error) {
      logger.error(
        "[callbackHandlers] - YouTube authentication failed:",
        error,
      );

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      return {
        status: "error",
        message: `Authentication failed: ${errorMessage}`,
      };
    }
  },
};

/**
 * Transfer API functions
 * These handle the actual playlist transfer logic and communicate with the backend.
 */
export const transferAPI = {
  // Direct transfer using POST with enhanced backend
  directTransfer: async (
    data: PlaylistTransferRequestProps,
  ): Promise<TransferResultResponseProps> => {
    logger.info("[transferAPI] - Sending transfer request:", data);

    // Get user's tokens from localStorage
    const spotifyToken = localStorage.getItem("spotify_access_token");
    const youtubeToken = localStorage.getItem("youtube_access_token");

    logger.warn("spotifyToken = ", spotifyToken, "youtubeToken = ", youtubeToken);

    if (!spotifyToken || !youtubeToken) {
      throw new Error(
        "Missing authentication tokens. Please reconnect your accounts on the home page.",
      );
    }

    const response = await api.post(
      "/transfer",
      {
        playlist_url: data.url,
        playlist_name: data.name,
        is_public: data.isPublic,
        description: data.description || "",
      },
      {
        headers: {
          "X-Spotify-Token": spotifyToken,
          "X-YouTube-Token": youtubeToken,
        },
      },
    );

    logger.success("[transferAPI] - Backend response:", response.data);

    // Backend now returns the exact format we need!
    const backendData = response.data;

    return {
      playlistId: backendData.playlist_id,
      playlistUrl: backendData.playlist_url,
      totalSongs: backendData.total_songs,
      transferredSongs: backendData.transferred_songs,
      failedSongs: backendData.failed_songs,
      songs: backendData.songs.map((song: any) => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        album: song.album,
        thumbnail: song.thumbnail,
        status: song.status,
        spotifyUrl: song.spotify_url,
        youtubeUrl: song.youtube_url,
        error: song.error,
      })),
      transferDuration: backendData.transfer_duration,
      createdAt: backendData.created_at,
    };
  },
};

export default api;
