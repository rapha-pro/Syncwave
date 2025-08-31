"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { TvMinimalPlay, Check, LogOut, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";

import { SpotifyIcon } from "@/components/icons";
import Phone from "@/components/phone";
import { authAPI, tokenManager, oauthFlow } from "@/utils/api_routes.ts/api";
import { AuthStatus } from "@/types";
import { killAnimations } from "@/utils/cleaning_animations";
import { useLogger } from "@/utils/useLogger";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const celebrationRef = useRef<HTMLDivElement>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    spotify: false,
    youtube: false,
  });
  const [isLoading, setIsLoading] = useState({
    spotify: false,
    youtube: false,
  });
  const [backendStatus, setBackendStatus] = useState<{
    spotify_configured: boolean;
    youtube_configured: boolean;
    message: string;
  } | null>(null);

  const router = useRouter();
  // instantiate logger
  const logger = useLogger("sections/Hero");

  useEffect(() => {
    logger.log("[Hero] - Component mounted, checking auth status");
    gsap.registerPlugin(ScrollTrigger);

    // Check authentication status
    checkAuthStatus();

    // Check if animation has already played in this session
    const hasPlayedAnimation = sessionStorage.getItem("heroAnimated");

    if (hasPlayedAnimation) {
      logger.log("[Hero] - Animation already played this session, skipping");

      return;
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      gsap.fromTo(
        ".hero-title",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        ".hero-description",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.4,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        ".hero-buttons",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.6,
          ease: "power3.out",
        },
      );

      gsap.fromTo(
        ".hero-image",
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          delay: 0.4,
          ease: "elastic.out(1, 0.75)",
        },
      );

      // Mark animation as played in session storage
      sessionStorage.setItem("heroAnimated", "true");
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      logger.log("[Hero] - Cleaning up animations");

      ["hero-title", "hero-description", "hero-buttons", "hero-image"].forEach(
        (selector) => {
          killAnimations(selector);
        },
      );
    };
  }, []);

  const canProceed = authStatus.spotify && authStatus.youtube;
  var hasPlayedCelebration = sessionStorage.getItem("heroAuthenticationCelebrationPlayed");

  // Trigger celebration animation when both accounts are connected
  useEffect(() => {
    if (canProceed && celebrationRef.current) {
      hasPlayedCelebration = sessionStorage.getItem("heroAuthenticationCelebrationPlayed");
      if (hasPlayedCelebration) return;

      triggerCelebration();
    }
  }, [canProceed]);

  const triggerCelebration = () => {
    // Mark celebration as played in session storage to avoid repeating
    sessionStorage.setItem("heroAuthenticationCelebrationPlayed", "true");

    // Create floating particles
    if (celebrationRef.current) {
      for (let i = 0; i < 15; i++) {
        const particle = document.createElement("div");

        particle.className = "absolute w-3 h-3 rounded-full opacity-0";
        particle.style.background = i % 2 === 0 ? "#22c55e" : "#3b82f6";
        particle.style.left = "50%";
        particle.style.top = "50%";
        celebrationRef.current.appendChild(particle);

        gsap.to(particle, {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
          opacity: 1,
          scale: Math.random() * 1.5 + 0.5,
          duration: 2,
          ease: "power2.out",
          onComplete: () => {
            particle.remove();
            router.push("/get-started");
          },
        });
      }
    }

    // Animate the celebration text
    gsap.fromTo(
      ".celebration-text",
      { scale: 0, opacity: 0, rotation: -10 },
      {
        scale: 1,
        opacity: 1,
        rotation: 0,
        duration: 1,
        ease: "back.out(1.7)",
        onComplete: () => {
          // Auto-hide after 3 seconds
          setTimeout(() => {
            gsap.to(".celebration-text", {
              scale: 0.8,
              opacity: 0,
              duration: 0.5,
              ease: "power2.in",
            });
          }, 2000);
        },
      },
    );
  };

  const checkAuthStatus = async () => {
    logger.log("[Hero] - Checking authentication status");

    // Check local storage for tokens
    const localAuthStatus = tokenManager.getAuthStatus();

    setAuthStatus(localAuthStatus);

    // Check backend OAuth configuration
    try {
      const status = await authAPI.checkStatus();

      setBackendStatus(status);
      logger.info("[Hero] - Backend OAuth status:", status);
    } catch (error) {
      logger.error("[Hero] - Failed to check backend OAuth status:", error);
    }
  };

  const handleSpotifyLogin = async () => {
    logger.log("[Hero] - Starting Spotify OAuth flow");
    setIsLoading((prev) => ({ ...prev, spotify: true }));

    try {
      oauthFlow.startSpotifyAuth();
    } catch (error) {
      logger.error("[Hero] - Spotify OAuth error:", error);
      setIsLoading((prev) => ({ ...prev, spotify: false }));
      alert("Failed to start Spotify login. Please check your configuration.");
    }
  };

  const handleYouTubeLogin = async () => {
    logger.log("[Hero] - Starting YouTube OAuth flow");
    setIsLoading((prev) => ({ ...prev, youtube: true }));

    try {
      oauthFlow.startYouTubeAuth();
    } catch (error) {
      logger.error("[Hero] - YouTube OAuth error:", error);
      setIsLoading((prev) => ({ ...prev, youtube: false }));
      alert("Failed to start YouTube login. Please check your configuration.");
    }
  };

  const handleLogout = (
    service: "spotify" | "youtube",
    event?: React.MouseEvent,
  ) => {
    if (event) {
      event.stopPropagation(); // Prevent button click propagation
    }

    logger.info(`[Hero] - Logging out from ${service}`);

    if (service === "spotify") {
      tokenManager.clearSpotifyTokens();
    } else {
      tokenManager.clearYouTubeTokens();
    }

    checkAuthStatus();
  };

  // Add useEffect for heartbeat animation
  useEffect(() => {
    if (canProceed) {
      const heartbeat = gsap.timeline({ repeat: -1 });

      heartbeat
        .to(".heartbeat-text", {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
        })
        .to(".heartbeat-text", {
          opacity: 1,
          duration: 1.5,
          ease: "power2.inOut",
        });

      return () => heartbeat.kill();
    }
  }, []);

  return (
    <section
      ref={heroRef}
      className="pt-32 pb-24 px-4 lg:px-16 md:pt-40 md:pb-32"
    >
      <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="hero-title w-full text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            <span className="block">Transfer Your</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600">
              YouTube
            </span>
            <span className="block">Playlists to</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-500">
              Spotify
            </span>
          </h1>
          <p className="hero-description text-gray-300 text-lg md:text-xl mb-8">
            Seamlessly migrate your music collections between platforms with
            just a few clicks. No more manual searching and rebuilding
            playlists.
          </p>

          {/* Celebration Animation - Fixed spacing */}
          <div
            ref={celebrationRef}
            className="relative mb-6 flex justify-center h-0"
          >
            {canProceed && hasPlayedCelebration && (
              <div className="celebration-text absolute flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md rounded-full border border-green-500/30 -top-12">
                <Sparkles className="text-yellow-400 animate-pulse" size={20} />
                <span className="text-white font-medium">
                  All Set! Ready to transfer your playlists
                </span>
                <Sparkles className="text-yellow-400 animate-pulse" size={20} />
              </div>
            )}
          </div>

          <div
            className="hero-buttons flex flex-col sm:flex-row gap-4"
            id="get-started"
          >
            {/* Spotify Button */}
            <div className="flex rounded-lg overflow-hidden">
              {authStatus.spotify ? (
                // Connected State - Side by Side Buttons
                <>
                  <Button
                    disabled
                    className="flex-1 rounded-none border-r-0 pointer-events-non"
                    color="success"
                    size="lg"
                    variant="solid"
                  >
                    <div className="flex items-center gap-2">
                      <Check size={20} />
                      <span>Spotify Connected</span>
                    </div>
                  </Button>
                  <Button
                    className="w-8 px-1 rounded-none bg-gray-500/20 backdrop-blur-sm hover:bg-yellow-500/10 transition-colors"
                    size="lg"
                    title="Logout from Spotify"
                    variant="ghost"
                    onPress={() => handleLogout("spotify")}
                  >
                    <LogOut className="text-yellow-400" size={20} />
                  </Button>
                </>
              ) : (
                // Not Connected State
                <Button
                  className="group flex items-center gap-2 w-full rounded-lg"
                  color="success"
                  isLoading={isLoading.spotify}
                  size="lg"
                  variant="shadow"
                  onPress={handleSpotifyLogin}
                >
                  {!isLoading.spotify && (
                    <SpotifyIcon
                      className="group-hover:scale-110 transition-transform"
                      size={20}
                    />
                  )}
                  <span>Login with Spotify</span>
                </Button>
              )}
            </div>

            {/* YouTube Button */}
            <div className="flex rounded-lg overflow-hidden">
              {authStatus.youtube ? (
                // Connected State - Side by Side Buttons
                <>
                  <Button
                    disabled
                    className="flex-1 rounded-none border-r-0 pointer-events-non"
                    color="danger"
                    size="lg"
                    variant="solid"
                  >
                    <div className="flex items-center gap-2">
                      <Check size={20} />
                      <span>YouTube Connected</span>
                    </div>
                  </Button>
                  <Button
                    className="w-8 px-1 rounded-none bg-gray-500/20 backdrop-blur-sm hover:bg-yellow-500/10 transition-colors"
                    size="lg"
                    title="Logout from YouTube"
                    variant="ghost"
                    onPress={() => handleLogout("youtube")}
                  >
                    <LogOut className="text-yellow-400" size={20} />
                  </Button>
                </>
              ) : (
                // Not Connected State
                <Button
                  className="group flex items-center gap-2 w-full rounded-lg"
                  color="danger"
                  isLoading={isLoading.youtube}
                  size="lg"
                  variant="shadow"
                  onPress={handleYouTubeLogin}
                >
                  {!isLoading.youtube && (
                    <TvMinimalPlay
                      className="group-hover:scale-110 transition-transform"
                      size={20}
                    />
                  )}
                  <span>Login with YouTube</span>
                </Button>
              )}
            </div>
          </div>

          {/* Help Text */}
          <p className="text-gray-400 text-sm mt-4 mb-16 lg:mb-0 heartbeat-text">
            {!canProceed &&
              "Connect both accounts to start transferring your playlists"}
            {canProceed &&
              "Head to Get Started in the navigation to begin transferring!"}
          </p>
        </div>

        <div className="hero-image relative">
          <div className="relative h-[400px] w-full">
            <div className="absolute top-0 right-0 h-64 w-64 bg-green-500/20 rounded-full filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 h-64 w-64 bg-red-500/20 rounded-full filter blur-3xl animate-pulse" />

            <div className="absolute inset-0 flex items-center justify-center">
              <Phone />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl mt-20 text-center">
        <div className="inline-flex gap-2 items-center px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-sm">
            <span className="font-bold text-green-400">100+</span> playlists
            transferred today
          </p>
        </div>
      </div>

      {/* Development Debug Info - Consolidated */}
      {process.env.NODE_ENV === "development" && (
        <div className="container mx-auto max-w-6xl mt-8">
          <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
            <h4 className="text-yellow-400 font-medium mb-2">
              OAuth Debug Info
            </h4>

            {/* Technical Debug Info */}
            <div className="text-xs text-gray-400 space-y-1">
              <p>
                Spotify Account:{" "}
                {authStatus.spotify ? "Connected" : "Not Connected"}
              </p>
              <p>
                YouTube Account:{" "}
                {authStatus.youtube ? "Connected" : "Not Connected"}
              </p>
              <p>
                Spotify Client ID:{" "}
                {process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ? "Set" : "Missing"}
              </p>
              <p>
                Google Client ID:{" "}
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Set" : "Missing"}
              </p>
              <p>
                Backend Status:{" "}
                {backendStatus ? JSON.stringify(backendStatus) : "Loading..."}
              </p>
              <p>
                Current Origin:{" "}
                {typeof window !== "undefined"
                  ? window.location.origin
                  : "Server"}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
