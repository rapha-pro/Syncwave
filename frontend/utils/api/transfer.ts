import { createLogger } from "../useLogger";
import { rateLimiter } from "../rate-limiter";

import { tokenManager } from "./token-manager";

import {
  PlaylistTransferRequestProps,
  TransferResultResponseProps,
} from "@/types";

const logger = createLogger("utils/api/transfer");

/**
 * Transfer API functions
 * These handle the actual playlist transfer logic and communicate with the backend.
 */
export const transferAPI = {
  /**
   * Direct transfer using POST with enhanced backend
   */
  directTransfer: async (
    data: PlaylistTransferRequestProps,
  ): Promise<TransferResultResponseProps> => {
    logger.info("[transferAPI] - Sending transfer request");

    // Check rate limit before proceeding
    if (!rateLimiter.checkLimit("transfer")) {
      const resetTime = rateLimiter.getTimeUntilReset("transfer");
      const resetSeconds = Math.ceil(resetTime / 1000);

      throw new Error(
        `Rate limit exceeded. Please wait ${resetSeconds} seconds before trying again.`,
      );
    }

    // Get user's tokens from localStorage
    const tokens = tokenManager.getTokens();

    if (!tokens.spotify || !tokens.youtube) {
      throw new Error(
        "Missing authentication tokens. Please reconnect your accounts on the home page.",
      );
    }

    // Import api here to avoid circular dependency
    const api = (await import("./index")).default;

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
          "X-Spotify-Token": tokens.spotify,
          "X-YouTube-Token": tokens.youtube,
        },
      },
    );

    logger.success("[transferAPI] - Backend response received");

    // Backend returns the exact format we need
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
