"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardBody, Spinner } from "@heroui/react";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";

import { callbackHandlers } from "@/utils/api";
import { useLogger } from "@/utils/useLogger";

function SpotifyCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState(
    "Processing Spotify authentication...",
  );
  const logger = useLogger("Hero");

  useEffect(() => {
    logger.log("[SpotifyCallback] - Component mounted");
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      setMessage("Exchanging authorization code for access token...");

      // Use the centralized callback handler
      const result = await callbackHandlers.handleSpotifyCallback(searchParams);

      setStatus(result.status);
      setMessage(result.message);

      // Redirect back to home page after 2 seconds on success
      if (result.status === "success") {
        setTimeout(() => {
          logger.log("[SpotifyCallback] - Redirecting to home page");
          window.location.href = "/";
        }, 2000);
      }
    } catch (error) {
      logger.error("[SpotifyCallback] - Unexpected error:", error);
      setStatus("error");
      setMessage("An unexpected error occurred");
    }
  };

  const handleGoBack = () => {
    logger.log("[SpotifyCallback] - User clicked go back");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <Card className="max-w-md w-full bg-gray-800/50 border border-gray-700">
        <CardBody className="p-8 text-center">
          <div className="mb-6">
            {status === "loading" && (
              <div className="flex flex-col items-center gap-4">
                <Spinner color="success" size="lg" />
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.6 0-.359.24-.66.6-.78 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02l-.119.159zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-.78.599-1.2.3z" />
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
            {status === "loading" && "Connecting to Spotify"}
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

export default function SpotifyCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
          <Card className="max-w-md w-full bg-gray-800/50 border border-gray-700">
            <CardBody className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <Spinner color="success" size="lg" />
                <h2 className="text-2xl font-bold text-white mb-4">
                  Loading...
                </h2>
              </div>
            </CardBody>
          </Card>
        </div>
      }
    >
      <SpotifyCallbackContent />
    </Suspense>
  );
}
