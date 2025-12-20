import { createLogger } from "../useLogger";

const logger = createLogger("utils/api/token-manager");

// Track if we're currently refreshing tokens to prevent multiple simultaneous refresh attempts
let isRefreshingSpotify = false;
let isRefreshingYouTube = false;

/**
 * Token management utilities for storing and retrieving authentication tokens
 * Note: Tokens are stored in localStorage. In production, consider more secure storage options.
 */
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

    // Check if tokens exist and are not expired
    const spotifyValid =
      spotifyToken && !tokenManager.isTokenExpired("spotify");
    const youtubeValid =
      youtubeToken && !tokenManager.isTokenExpired("youtube");

    return {
      spotify: !!spotifyValid,
      youtube: !!youtubeValid,
    };
  },

  /**
   * Check if a token is expired
   */
  isTokenExpired: (platform: "spotify" | "youtube"): boolean => {
    const expiryKey = `${platform}_token_expiry`;
    const expiryTimeStr = localStorage.getItem(expiryKey);

    if (!expiryTimeStr) {
      // No expiry time stored, assume token is valid (for backwards compatibility)
      return false;
    }

    const expiryTime = parseInt(expiryTimeStr, 10);
    const now = Date.now();

    // Add a 5-minute buffer before actual expiry
    const bufferMs = 5 * 60 * 1000;

    return now >= expiryTime - bufferMs;
  },

  /**
   * Get stored tokens for API requests
   * Returns actual token strings (or null if not found/expired)
   * Note: Use with caution - do not log the returned values
   */
  getTokens: (): {
    spotify: string | null;
    youtube: string | null;
  } => {
    // Check if tokens are expired before returning
    const spotifyExpired = tokenManager.isTokenExpired("spotify");
    const youtubeExpired = tokenManager.isTokenExpired("youtube");

    if (spotifyExpired) {
      logger.warn("[tokenManager] - Spotify token is expired");
      tokenManager.clearSpotifyTokens();
    }

    if (youtubeExpired) {
      logger.warn("[tokenManager] - YouTube token is expired");
      tokenManager.clearYouTubeTokens();
    }

    return {
      spotify: spotifyExpired
        ? null
        : localStorage.getItem("spotify_access_token"),
      youtube: youtubeExpired
        ? null
        : localStorage.getItem("youtube_access_token"),
    };
  },

  /**
   * Store Spotify tokens with expiration tracking
   */
  storeSpotifyTokens: (data: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
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

    // Store expiration time (current time + expires_in seconds)
    if (data.expires_in) {
      const expiryTime = Date.now() + data.expires_in * 1000;

      localStorage.setItem("spotify_token_expiry", expiryTime.toString());
      logger.log(
        `[tokenManager] - Spotify token will expire in ${data.expires_in} seconds`,
      );
    }
  },

  /**
   * Store YouTube tokens with expiration tracking
   */
  storeYouTubeTokens: (data: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
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

    // Store expiration time (current time + expires_in seconds)
    if (data.expires_in) {
      const expiryTime = Date.now() + data.expires_in * 1000;

      localStorage.setItem("youtube_token_expiry", expiryTime.toString());
      logger.log(
        `[tokenManager] - YouTube token will expire in ${data.expires_in} seconds`,
      );
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
    localStorage.removeItem("spotify_token_expiry");
  },

  /**
   * Clear YouTube tokens
   */
  clearYouTubeTokens: (): void => {
    logger.log("[tokenManager] - Clearing YouTube tokens");

    localStorage.removeItem("youtube_access_token");
    localStorage.removeItem("youtube_refresh_token");
    localStorage.removeItem("youtube_user");
    localStorage.removeItem("youtube_token_expiry");
  },

  /**
   * Get stored user info
   */
  getUserInfo: (platform: "spotify" | "youtube"): any | null => {
    const userJson = localStorage.getItem(`${platform}_user`);

    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Check if token needs refresh (within 10 minutes of expiry)
   */
  needsRefresh: (platform: "spotify" | "youtube"): boolean => {
    const expiryKey = `${platform}_token_expiry`;
    const expiryTimeStr = localStorage.getItem(expiryKey);

    if (!expiryTimeStr) {
      return false;
    }

    const expiryTime = parseInt(expiryTimeStr, 10);
    const now = Date.now();

    // Refresh if within 10 minutes of expiry
    const refreshBufferMs = 10 * 60 * 1000;

    return now >= expiryTime - refreshBufferMs;
  },

  /**
   * Attempt to refresh Spotify token
   * Note: Currently Spotify refresh tokens are not fully implemented in backend
   * This is a placeholder for future implementation
   */
  refreshSpotifyToken: async (): Promise<boolean> => {
    if (isRefreshingSpotify) {
      logger.warn("[tokenManager] - Spotify token refresh already in progress");

      return false;
    }

    const refreshToken = localStorage.getItem("spotify_refresh_token");

    if (!refreshToken) {
      logger.warn("[tokenManager] - No Spotify refresh token available");

      return false;
    }

    try {
      isRefreshingSpotify = true;
      logger.log("[tokenManager] - Attempting to refresh Spotify token");

      // TODO: Implement backend endpoint for token refresh
      // For now, this is a placeholder that returns false
      // In production, you would call the backend refresh endpoint here

      logger.warn(
        "[tokenManager] - Spotify token refresh not yet implemented in backend",
      );

      return false;
    } catch (error) {
      logger.error("[tokenManager] - Failed to refresh Spotify token:", error);

      return false;
    } finally {
      isRefreshingSpotify = false;
    }
  },

  /**
   * Attempt to refresh YouTube token
   * Note: Currently YouTube refresh tokens are not fully implemented in backend
   * This is a placeholder for future implementation
   */
  refreshYouTubeToken: async (): Promise<boolean> => {
    if (isRefreshingYouTube) {
      logger.warn("[tokenManager] - YouTube token refresh already in progress");

      return false;
    }

    const refreshToken = localStorage.getItem("youtube_refresh_token");

    if (!refreshToken) {
      logger.warn("[tokenManager] - No YouTube refresh token available");

      return false;
    }

    try {
      isRefreshingYouTube = true;
      logger.log("[tokenManager] - Attempting to refresh YouTube token");

      // TODO: Implement backend endpoint for token refresh
      // For now, this is a placeholder that returns false
      // In production, you would call the backend refresh endpoint here

      logger.warn(
        "[tokenManager] - YouTube token refresh not yet implemented in backend",
      );

      return false;
    } catch (error) {
      logger.error("[tokenManager] - Failed to refresh YouTube token:", error);

      return false;
    } finally {
      isRefreshingYouTube = false;
    }
  },
};
