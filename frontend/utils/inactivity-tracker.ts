import { createLogger } from "./useLogger";
import { config } from "./config";
import { tokenManager } from "./api/token-manager";

const logger = createLogger("utils/inactivity-tracker");

/**
 * Inactivity tracker that monitors user activity and logs out after a period of inactivity
 */
class InactivityTracker {
  private timeoutId: NodeJS.Timeout | null = null;
  private lastActivityTime: number = Date.now();
  private isTracking: boolean = false;
  private timeoutMinutes: number;

  constructor(timeoutMinutes: number = config.inactivityTimeoutMinutes) {
    this.timeoutMinutes = timeoutMinutes;
  }

  /**
   * Start tracking user activity
   */
  start(): void {
    if (this.isTracking) {
      logger.log("[InactivityTracker] - Already tracking");
      return;
    }

    logger.log(
      `[InactivityTracker] - Starting inactivity tracking (timeout: ${this.timeoutMinutes} minutes)`,
    );

    this.isTracking = true;
    this.lastActivityTime = Date.now();

    // Set up activity listeners
    this.setupActivityListeners();

    // Start the inactivity check
    this.resetTimeout();
  }

  /**
   * Stop tracking user activity
   */
  stop(): void {
    if (!this.isTracking) return;

    logger.log("[InactivityTracker] - Stopping inactivity tracking");

    this.isTracking = false;
    this.removeActivityListeners();

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Reset the inactivity timeout
   */
  private resetTimeout(): void {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Set new timeout
    const timeoutMs = this.timeoutMinutes * 60 * 1000;

    this.timeoutId = setTimeout(() => {
      this.handleInactivity();
    }, timeoutMs);
  }

  /**
   * Handle user activity
   */
  private handleActivity = (): void => {
    this.lastActivityTime = Date.now();
    this.resetTimeout();
  };

  /**
   * Handle inactivity timeout
   */
  private handleInactivity(): void {
    logger.info(
      `[InactivityTracker] - User inactive for ${this.timeoutMinutes} minutes, logging out`,
    );

    // Clear all tokens
    tokenManager.clearSpotifyTokens();
    tokenManager.clearYouTubeTokens();

    // Stop tracking
    this.stop();

    // Optionally, redirect to home or show a message
    if (typeof window !== "undefined") {
      // Clear celebration flag so user sees the login buttons again
      sessionStorage.removeItem("heroAuthenticationCelebrationPlayed");

      // Reload the page to reflect logged out state
      window.location.href = "/";
    }
  }

  /**
   * Set up event listeners for user activity
   */
  private setupActivityListeners(): void {
    if (typeof window === "undefined") return;

    // Listen to various user activity events
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  /**
   * Remove event listeners
   */
  private removeActivityListeners(): void {
    if (typeof window === "undefined") return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.removeEventListener(event, this.handleActivity);
    });
  }

  /**
   * Get time remaining until inactivity timeout (in milliseconds)
   */
  getTimeRemaining(): number {
    const timeoutMs = this.timeoutMinutes * 60 * 1000;
    const elapsed = Date.now() - this.lastActivityTime;

    return Math.max(0, timeoutMs - elapsed);
  }

  /**
   * Check if user is currently authenticated
   */
  private isAuthenticated(): boolean {
    const authStatus = tokenManager.getAuthStatus();

    return authStatus.spotify || authStatus.youtube;
  }
}

// Export a singleton instance
export const inactivityTracker = new InactivityTracker();
