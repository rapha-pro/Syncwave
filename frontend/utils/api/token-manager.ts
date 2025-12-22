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
      tokenManager.clearSpotifyTokens();
    }

    if (youtubeExpired) {
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
    }
  },

  /**
   * Clear Spotify tokens
   */
  clearSpotifyTokens: (): void => {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_user");
    localStorage.removeItem("spotify_token_expiry");
  },

  /**
   * Clear YouTube tokens
   */
  clearYouTubeTokens: (): void => {
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
    if (isRefreshingSpotify) return false;

    const refreshToken = localStorage.getItem("spotify_refresh_token");

    if (!refreshToken) return false;

    try {
      isRefreshingSpotify = true;

      // TODO: Implement backend endpoint for token refresh
      // For now, this is a placeholder that returns false
      // In production, you would call the backend refresh endpoint here

      return false;
    } catch (error) {
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
    if (isRefreshingYouTube) return false;

    const refreshToken = localStorage.getItem("youtube_refresh_token");

    if (!refreshToken) return false;

    try {
      isRefreshingYouTube = true;

      // TODO: Implement backend endpoint for token refresh
      // For now, this is a placeholder that returns false
      // In production, you would call the backend refresh endpoint here

      return false;
    } catch (error) {
      return false;
    } finally {
      isRefreshingYouTube = false;
    }
  },
};
