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

    return {
      spotify: !!spotifyToken,
      youtube: !!youtubeToken,
    };
  },

  /**
   * Get stored tokens for API requests
   * Returns token existence status only, not the actual tokens to prevent logging
   */
  getTokens: (): {
    spotify: string | null;
    youtube: string | null;
  } => {
    return {
      spotify: localStorage.getItem("spotify_access_token"),
      youtube: localStorage.getItem("youtube_access_token"),
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
