import { createLogger } from "../useLogger";

import { authAPI } from "./auth";
import { tokenManager } from "./token-manager";

const logger = createLogger("utils/api/oauth-flow");

/**
 * OAuth flow utilities for handling authentication flows
 */
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
    } catch (error) {
      logger.error(`[oauthFlow] - ${platform} authentication failed:`, error);
      throw error;
    }
  },
};

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
