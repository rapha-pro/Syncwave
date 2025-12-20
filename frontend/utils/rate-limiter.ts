import { createLogger } from "./useLogger";

const logger = createLogger("utils/rate-limiter");

/**
 * Rate limiter configuration
 */
interface RateLimiterConfig {
  maxRequests: number; // Maximum number of requests
  windowMs: number; // Time window in milliseconds
}

/**
 * Rate Limiter Class
 * Implements client-side rate limiting to prevent API abuse
 */
class RateLimiter {
  private requests: Map<string, number[]>;
  private configs: Map<string, RateLimiterConfig>;

  constructor() {
    this.requests = new Map();
    this.configs = new Map();

    // Default configurations for different API endpoints
    this.configs.set("transfer", { maxRequests: 5, windowMs: 60000 }); // 5 requests per minute
    this.configs.set("auth", { maxRequests: 10, windowMs: 60000 }); // 10 requests per minute
    this.configs.set("default", { maxRequests: 30, windowMs: 60000 }); // 30 requests per minute
  }

  /**
   * Set custom rate limit configuration for an endpoint
   */
  setConfig(endpoint: string, config: RateLimiterConfig): void {
    this.configs.set(endpoint, config);
    logger.log(
      `[RateLimiter] - Config set for ${endpoint}: ${config.maxRequests} requests per ${config.windowMs}ms`,
    );
  }

  /**
   * Check if a request is allowed
   * @param endpoint - The API endpoint identifier
   * @returns true if request is allowed, false if rate limit exceeded
   */
  checkLimit(endpoint: string): boolean {
    const config = this.configs.get(endpoint) || this.configs.get("default")!;
    const now = Date.now();

    // Get or initialize request timestamps for this endpoint
    let timestamps = this.requests.get(endpoint) || [];

    // Remove timestamps outside the current window
    timestamps = timestamps.filter(
      (timestamp) => now - timestamp < config.windowMs,
    );

    // Check if we've exceeded the limit
    if (timestamps.length >= config.maxRequests) {
      const oldestTimestamp = timestamps[0];
      const timeUntilReset = config.windowMs - (now - oldestTimestamp);

      logger.warn(
        `[RateLimiter] - Rate limit exceeded for ${endpoint}. Try again in ${Math.ceil(timeUntilReset / 1000)}s`,
      );

      return false;
    }

    // Add current request timestamp
    timestamps.push(now);
    this.requests.set(endpoint, timestamps);

    logger.log(
      `[RateLimiter] - Request allowed for ${endpoint} (${timestamps.length}/${config.maxRequests})`,
    );

    return true;
  }

  /**
   * Get time until rate limit resets
   * @param endpoint - The API endpoint identifier
   * @returns milliseconds until reset, or 0 if not rate limited
   */
  getTimeUntilReset(endpoint: string): number {
    const config = this.configs.get(endpoint) || this.configs.get("default")!;
    const now = Date.now();
    const timestamps = this.requests.get(endpoint) || [];

    if (timestamps.length < config.maxRequests) {
      return 0;
    }

    const oldestTimestamp = timestamps[0];

    return Math.max(0, config.windowMs - (now - oldestTimestamp));
  }

  /**
   * Reset rate limit for an endpoint
   */
  reset(endpoint: string): void {
    this.requests.delete(endpoint);
    logger.log(`[RateLimiter] - Rate limit reset for ${endpoint}`);
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.requests.clear();
    logger.log("[RateLimiter] - All rate limits reset");
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
