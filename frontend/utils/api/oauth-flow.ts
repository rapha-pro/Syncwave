import { authAPI } from "./auth";
import { tokenManager } from "./token-manager";

/**
 * OAuth flow utilities for handling authentication flows
 */
export const oauthFlow = {
  /**
   * Start Spotify OAuth flow
   */
  startSpotifyAuth: (): void => {
    try {
      const state = Math.random().toString(36).substring(2, 15);

      localStorage.setItem("oauth_state", state);

      const authUrl = authAPI.generateSpotifyAuthUrl(state);

      window.location.href = authUrl;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Start YouTube OAuth flow
   */
  startYouTubeAuth: (): void => {
    try {
      const state = Math.random().toString(36).substring(2, 15);

      localStorage.setItem("oauth_state", state);

      const authUrl = authAPI.generateYouTubeAuthUrl(state);

      window.location.href = authUrl;
    } catch (error) {
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
    // Verify state parameter for security
    const storedState = localStorage.getItem("oauth_state");

    if (state !== storedState) {
      throw new Error("Authentication validation failed. Please try again.");
    }

    const redirectUri = `${window.location.origin}/auth/${platform}/callback`;

    // Add debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[OAuth Flow] Redirect URI:', redirectUri);
      console.log('[OAuth Flow] Authorization code received');
    }

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
    } catch (error) {
      throw error;
    }
  },
};

/**
 * Get user-friendly error message for OAuth errors
 */
function getUserFriendlyErrorMessage(error: any): string {
  if (!error) return "Unknown error occurred";

  // Handle Axios errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 400) {
      return "happens sometime. Please try authenticating again.";
    } else if (status === 401) {
      return "Authentication failed. Please check your credentials and try again.";
    } else if (status === 403) {
      return "Access denied. Please ensure you've granted the necessary permissions.";
    } else if (status === 500) {
      return "Server error occurred. Please try again in a few moments.";
    } else if (status === 503) {
      return "Service temporarily unavailable. Please try again later.";
    }

    // Try to extract error message from response
    if (data?.detail) {
      return data.detail;
    } else if (data?.error_description) {
      return data.error_description;
    } else if (data?.message) {
      return data.message;
    }
  }

  // Handle network errors
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return "Connection timeout. Please check your internet connection and try again.";
  } else if (
    error.code === "ERR_NETWORK" ||
    error.message?.includes("Network Error")
  ) {
    return "Network error. Please check your internet connection.";
  }

  // Handle authentication validation failures
  if (error.message?.includes("validation failed")) {
    return "Authentication validation failed. Please try again.";
  }

  // Default to error message if available
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * OAuth callback handlers for callback pages
 */
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
      // Extract URL parameters
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      // Check for errors from Spotify
      if (error) {
        const errorDescription = searchParams.get("error_description") || error;

        throw new Error(`Spotify authorization error: ${errorDescription}`);
      }

      if (!code || !state) {
        throw new Error(
          "Missing required parameters from Spotify. Please try authenticating again.",
        );
      }

      // Use the centralized OAuth flow handler
      await oauthFlow.handleCallback("spotify", code, state);

      return {
        status: "success",
        message: "Successfully connected to Spotify! Redirecting...",
      };
    } catch (error) {
      return {
        status: "error",
        message: getUserFriendlyErrorMessage(error),
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
      // Extract URL parameters
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const error = searchParams.get("error");

      // Check for errors from Google
      if (error) {
        const errorDescription = searchParams.get("error_description") || error;

        throw new Error(`Google authorization error: ${errorDescription}`);
      }

      if (!code || !state) {
        throw new Error(
          "Missing required parameters from Google. Please try authenticating again.",
        );
      }

      // Use the centralized OAuth flow handler
      await oauthFlow.handleCallback("youtube", code, state);

      return {
        status: "success",
        message: "Successfully connected to YouTube! Redirecting...",
      };
    } catch (error) {
      return {
        status: "error",
        message: getUserFriendlyErrorMessage(error),
      };
    }
  },
};
