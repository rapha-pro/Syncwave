import axios from "axios";

import { config } from "../config";
import { createLogger } from "../useLogger";

// Re-export all modules
export { authAPI } from "./auth";
export { tokenManager } from "./token-manager";
export { oauthFlow, callbackHandlers } from "./oauth-flow";
export { transferAPI } from "./transfer";

const logger = createLogger("utils/api");
const API_BASE_URL = config.apiBaseUrl;

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

export default api;
