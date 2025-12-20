import { createLogger } from "../useLogger";

const logger = createLogger("utils/api/token-manager");

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
   * Returns token existence status only, not the actual tokens to prevent logging
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
};
