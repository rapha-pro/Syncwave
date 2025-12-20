"use client";

import { useState, useEffect, useRef } from "react";
import {
  Button,
  Input,
  Textarea,
  Checkbox,
  Card,
  CardBody,
} from "@heroui/react";
import {
  Link2,
  Music,
  Globe,
  Lock,
  ArrowRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import { gsap } from "gsap";

import { PlaylistDataProps, PlaylistFormProps } from "@/types";
import { useLogger } from "@/utils/useLogger";

export default function PlaylistForm({ onSubmit }: PlaylistFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  // Create fresh initial state function to avoid reference issues
  const createInitialFormData = (): PlaylistDataProps => ({
    url: "",
    name: "",
    description: "",
    isPublic: true,
  });

  const [formData, setFormData] = useState<PlaylistDataProps>(
    createInitialFormData(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<PlaylistDataProps>>({});
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "unknown" | "connected" | "disconnected"
  >("unknown");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const logger = useLogger("components/get-started/PlaylistForm");

  useEffect(() => {
    logger.log("[PlaylistForm] - Component mounted/remounted");

    // Force reset with new object reference
    setFormData(createInitialFormData());
    setErrors({});
    setIsLoading(false);
    setIsValidatingUrl(false);

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Kill any existing animations first
      gsap.killTweensOf([".form-field", ".form-card"]);

      // Check if elements exist before animating
      const formFields = document.querySelectorAll(".form-field");
      const formCard = document.querySelector(".form-card");

      if (formFields.length > 0) {
        gsap.fromTo(
          ".form-field",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out" },
        );
      }

      if (formCard) {
        gsap.fromTo(
          ".form-card",
          { scale: 0.95, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
        );
      }
    }, 100);

    // Test backend connection on component mount
    testBackendConnection();

    return () => {
      clearTimeout(timeoutId);
      gsap.killTweensOf([".form-field", ".form-card"]);
    };
  }, []); // Remove dependencies to only run on mount

  const testBackendConnection = async () => {
    logger.log("[PlaylistForm] - Testing backend connection...");
    setIsTestingConnection(true);
    try {
      const response = await fetch("http://localhost:8000/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        logger.success("[PlaylistForm] - Backend connected:", data);
        setBackendStatus("connected");
      } else {
        logger.error(
          "[PlaylistForm] - Backend returned error:",
          response.status,
        );
        setBackendStatus("disconnected");
      }
    } catch (error) {
      logger.error("[PlaylistForm] - Backend connection failed:", error);
      setBackendStatus("disconnected");
    } finally {
      setIsTestingConnection(false);
    }
  };

  const validateForm = async (): Promise<boolean> => {
    logger.info("[PlaylistForm] - Validating form data:", formData);
    const newErrors: Partial<PlaylistDataProps> = {};

    if (!formData.url.trim()) {
      newErrors.url = "Playlist URL is required";
    } else if (!isValidYouTubeURL(formData.url)) {
      newErrors.url = "Please enter a valid YouTube playlist URL";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Playlist name is required";
    }

    setErrors(newErrors);

    const isValid = Object.keys(newErrors).length === 0;

    logger.info("[PlaylistForm] - Form validation result:", isValid, newErrors);

    return isValid;
  };

  const isValidYouTubeURL = (url: string): boolean => {
    const youtubePlaylistRegex =
      /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/.*[?&]list=([a-zA-Z0-9_-]+)(?:[&#]|$)/i;

    // return youtubePlaylistRegex.test(url);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.success("[PlaylistForm] - Form submitted with data:", formData);

    // Check backend connection before submitting
    if (backendStatus !== "connected") {
      logger.error("[PlaylistForm] - Backend not connected, aborting submit");
      setErrors({
        url: "Backend server is not connected. Please check if your FastAPI server is running.",
      });

      return;
    }

    const isValid = await validateForm();

    if (!isValid) {
      logger.error("[PlaylistForm] - Form validation failed, aborting submit");

      return;
    }

    setIsLoading(true);

    // Add loading animation
    const submitButton = document.querySelector(".submit-button");

    if (submitButton) {
      gsap.to(".submit-button", {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
    }

    setTimeout(() => {
      logger.info("[PlaylistForm] - Calling onSubmit with data:", formData);
      onSubmit(formData);
    }, 500);
  };

  const handleInputChange = (
    field: keyof PlaylistDataProps,
    value: string | boolean,
  ) => {
    logger.log(`[PlaylistForm] - Input changed: ${field} = ${value}`);
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getConnectionStatusColor = () => {
    switch (backendStatus) {
      case "connected":
        return "text-green-400";
      case "disconnected":
        return "text-red-400";
      default:
        return "text-yellow-400";
    }
  };

  const getConnectionStatusText = () => {
    switch (backendStatus) {
      case "connected":
        return "Backend Connected";
      case "disconnected":
        return "Backend Disconnected";
      default:
        return "Checking Connection...";
    }
  };

  return (
    <div
      className="max-w-2xl mx-auto"
      style={{ display: "block", visibility: "visible", opacity: 1 }}
    >
      {/* Connection Status Card */}
      <Card className="mb-6 bg-gray-800/30 border border-gray-700">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {backendStatus === "connected" ? (
                <Wifi className="text-green-400" size={20} />
              ) : (
                <WifiOff className="text-red-400" size={20} />
              )}
              <div>
                <p className={`font-medium ${getConnectionStatusColor()}`}>
                  {getConnectionStatusText()}
                </p>
                <p className="text-gray-400 text-sm">
                  {backendStatus === "connected"
                    ? "Ready to transfer playlists"
                    : "Make sure FastAPI server is running on port 8000"}
                </p>
              </div>
            </div>
            <Button
              className="min-w-fit"
              isLoading={isTestingConnection}
              size="sm"
              variant="bordered"
              onPress={testBackendConnection}
            >
              {isTestingConnection ? "Testing..." : "Test"}
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="form-card bg-gray-800/50 backdrop-blur-sm border border-gray-700">
        <CardBody className="p-8">
          <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
            {/* Playlist URL */}
            <div className="form-field">
              <Input
                classNames={{
                  input: "text-white",
                  inputWrapper:
                    "border-gray-600 bg-gray-700/50 hover:border-gray-500 focus-within:border-blue-500",
                  label: "text-gray-300",
                }}
                endContent={
                  isValidatingUrl && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                  )
                }
                errorMessage={errors.url}
                isInvalid={!!errors.url}
                label="YouTube Playlist URL"
                placeholder="https://www.youtube.com/playlist?list=..."
                startContent={<Link2 className="text-gray-400" size={18} />}
                value={formData.url}
                variant="bordered"
                onValueChange={(value) => handleInputChange("url", value)}
              />
            </div>

            {/* Playlist Name */}
            <div className="form-field">
              <Input
                classNames={{
                  input: "text-white",
                  inputWrapper:
                    "border-gray-600 bg-gray-700/50 hover:border-gray-500 focus-within:border-blue-500",
                  label: "text-gray-300",
                }}
                errorMessage={errors.name}
                isInvalid={!!errors.name}
                label="Playlist Name"
                placeholder="My Awesome Playlist"
                startContent={<Music className="text-gray-400" size={18} />}
                value={formData.name}
                variant="bordered"
                onValueChange={(value) => handleInputChange("name", value)}
              />
            </div>

            {/* Description */}
            <div className="form-field">
              <Textarea
                classNames={{
                  input: "text-white",
                  inputWrapper:
                    "border-gray-600 bg-gray-700/50 hover:border-gray-500 focus-within:border-blue-500",
                  label: "text-gray-300",
                }}
                label="Description (Optional)"
                minRows={3}
                placeholder="Tell us about your playlist..."
                value={formData.description}
                variant="bordered"
                onValueChange={(value) =>
                  handleInputChange("description", value)
                }
              />
            </div>

            {/* Public/Private Checkbox */}
            <div className="form-field">
              <div className="flex items-start gap-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                <Checkbox
                  classNames={{
                    wrapper: "border-gray-500",
                  }}
                  isSelected={formData.isPublic}
                  onValueChange={(value) =>
                    handleInputChange("isPublic", value)
                  }
                >
                  <div className="flex items-center gap-2">
                    {formData.isPublic ? (
                      <Globe className="text-green-400" size={16} />
                    ) : (
                      <Lock className="text-yellow-400" size={16} />
                    )}
                    <span className="text-white font-medium">
                      Make playlist public
                    </span>
                  </div>
                </Checkbox>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                {formData.isPublic
                  ? "Your playlist will be visible to others on Spotify"
                  : "You can change this setting later in your Spotify account"}
              </p>
            </div>

            {/* Submit Button */}
            <div className="form-field pt-4">
              <Button
                className="submit-button w-full group"
                classNames={{
                  base: `bg-gradient-to-r ${
                    backendStatus === "connected"
                      ? "from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      : "from-gray-500 to-gray-600"
                  } shadow-lg`,
                }}
                color="primary"
                endContent={
                  !isLoading &&
                  backendStatus === "connected" && (
                    <ArrowRight
                      className="group-hover:translate-x-1 transition-transform"
                      size={18}
                    />
                  )
                }
                isDisabled={backendStatus !== "connected"}
                isLoading={isLoading}
                loadingText="Starting Transfer..."
                size="lg"
                type="submit"
              >
                {isLoading
                  ? "Starting Transfer..."
                  : backendStatus === "connected"
                    ? "Start Transfer"
                    : "Backend Disconnected"}
              </Button>

              {backendStatus === "disconnected" && (
                <p className="text-red-400 text-sm mt-2 text-center">
                  Start your FastAPI server:{" "}
                  <code className="bg-gray-700 px-2 py-1 rounded">
                    uvicorn main:app --reload
                  </code>
                </p>
              )}
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Card className="bg-gray-800/30 border border-gray-700">
          <CardBody className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Music className="text-green-400" size={16} />
              </div>
              <h3 className="font-semibold text-white">
                High Quality Transfer
              </h3>
            </div>
            <p className="text-gray-400 text-sm">
              We match songs by title, artist, and album for the most accurate
              results
            </p>
          </CardBody>
        </Card>

        <Card className="bg-gray-800/30 border border-gray-700">
          <CardBody className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Globe className="text-blue-400" size={16} />
              </div>
              <h3 className="font-semibold text-white">Privacy Friendly</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Your data is processed securely and never stored permanently
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="mt-4 bg-gray-900/50 border border-gray-600">
          <CardBody className="p-4">
            <h4 className="text-white font-medium mb-2">Debug Info</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <p>
                Backend Status:{" "}
                <span className={getConnectionStatusColor()}>
                  {backendStatus}
                </span>
              </p>
              <p>
                API Base URL:{" "}
                {process.env.NEXT_PUBLIC_API_BASE_URL ||
                  "http://localhost:8000"}
              </p>
              <p>
                Form Valid: {Object.keys(errors).length === 0 ? "Yes" : "No"}
              </p>
              <p>Current Errors: {JSON.stringify(errors)}</p>
              <p>Form Data: {JSON.stringify(formData)}</p>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
