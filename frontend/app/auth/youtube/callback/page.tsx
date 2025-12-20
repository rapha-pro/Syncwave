"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardBody, Spinner } from "@heroui/react";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";

import { callbackHandlers } from "@/utils/api";
import { useLogger } from "@/utils/useLogger";

export default function YouTubeCallback() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState(
    "Processing YouTube authentication...",
  );

  const logger = useLogger("Hero");

  useEffect(() => {
    logger.log("[YouTubeCallback] - Component mounted");
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      setMessage("Exchanging authorization code for access token...");

      // Use the centralized callback handler
      const result = await callbackHandlers.handleYouTubeCallback(searchParams);

      setStatus(result.status);
      setMessage(result.message);

      // Redirect back to home page after 2 seconds on success
      if (result.status === "success") {
        setTimeout(() => {
          logger.log("[YouTubeCallback] - Redirecting to home page");
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      logger.error("[YouTubeCallback] - Unexpected error:", error);
      setStatus("error");
      setMessage("An unexpected error occurred");
    }
  };

  const handleGoBack = () => {
    logger.log("[YouTubeCallback] - User clicked go back");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-gray-800/50 border border-gray-700">
        <CardBody className="p-8 text-center">
          <div className="mb-6">
            {status === "loading" && (
              <div className="flex flex-col items-center gap-4">
                <Spinner color="danger" size="lg" />
                <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            {status === "loading" && "Connecting to YouTube"}
            {status === "success" && "Success!"}
            {status === "error" && "Authentication Failed"}
          </h2>

          <p className="text-gray-300 mb-6">{message}</p>

          {status === "success" && (
            <p className="text-sm text-gray-400 mb-6">
              Redirecting you back to the home page...
            </p>
          )}

          {status === "error" && (
            <button
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mx-auto"
              onClick={handleGoBack}
            >
              <ArrowLeft size={16} />
              Go Back to Home
            </button>
          )}

          {/* Debug info in development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-600 text-left">
              <h4 className="text-white font-medium mb-2">Debug Info</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Status: {status}</p>
                <p>Code: {searchParams.get("code") ? "Present" : "Missing"}</p>
                <p>State: {searchParams.get("state") || "Missing"}</p>
                <p>Error: {searchParams.get("error") || "None"}</p>
                <p>Backend URL: {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
