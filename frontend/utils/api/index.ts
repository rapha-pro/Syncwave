import axios from "axios";

import { config } from "../config";

// Re-export all modules
export { authAPI } from "./auth";
export { tokenManager } from "./token-manager";
export { oauthFlow, callbackHandlers } from "./oauth-flow";
export { transferAPI } from "./transfer";

const API_BASE_URL = config.apiBaseUrl;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000, // 3-min timeout for transfers
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
