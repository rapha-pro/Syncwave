"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, CardBody, Chip, Divider, Image } from "@heroui/react";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  RotateCcw,
  Share2,
  Music,
  Clock,
  Calendar,
} from "lucide-react";
import { gsap } from "gsap";

import { TransferResultResponseProps } from "@/types";
import { useLogger } from "@/utils/useLogger";

interface TransferResultsProps {
  results: TransferResultResponseProps;
  onStartOver: () => void;
}

export default function TransferResults({
  results,
  onStartOver,
}: TransferResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAllSongs, setShowAllSongs] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const logger = useLogger("components/get-started/TransferResults");

  // Animation constants
  const CONFETTI_PARTICLE_COUNT = 30;
  const CONFETTI_COLORS = ["#22c55e", "#3b82f6", "#a855f7", "#eab308", "#ef4444"];

  useEffect(() => {
    // Reset GSAP context and clear any existing animations
    const ctx = gsap.context(() => {
      // Kill any existing animations on these elements
      gsap.killTweensOf([".success-header", ".stats-card", ".song-item", ".action-buttons"]);

      // Reset elements to visible state first
      gsap.set([".success-header", ".stats-card", ".song-item", ".action-buttons"], {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        clearProps: "all",
      });

      // Enhanced success header animation with bounce
      gsap.fromTo(
        ".success-header",
        { scale: 0.7, opacity: 0, rotationZ: -10 },
        { 
          scale: 1, 
          opacity: 1, 
          rotationZ: 0,
          duration: 1.2, 
          ease: "elastic.out(1, 0.5)" 
        },
      );

      // Enhanced stats cards with 3D effect
      gsap.fromTo(
        ".stats-card",
        { y: 60, opacity: 0, rotationX: -15 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 0.9,
          stagger: 0.12,
          delay: 0.3,
          ease: "back.out(1.4)",
        },
      );

      // Enhanced song items animation
      gsap.fromTo(
        ".song-item",
        { x: -40, opacity: 0, scale: 0.95 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.05,
          delay: 0.6,
          ease: "back.out(1.2)",
        },
      );

      // Action buttons animation
      gsap.fromTo(
        ".action-buttons",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.8,
          ease: "power3.out",
        },
      );
    }, containerRef);

    // Enhanced celebration particles effect
    createCelebrationEffect();

    // Cleanup function
    return () => ctx.revert();
  }, [results]); // ← Key change: depend on results so it re-runs when new results come in

  const createCelebrationEffect = () => {
    const container = containerRef.current;

    if (!container) return;

    // Create confetti-like particles with multiple colors
    for (let i = 0; i < CONFETTI_PARTICLE_COUNT; i++) {
      const particle = document.createElement("div");
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

      particle.className = "absolute w-3 h-3 rounded-full opacity-0";
      particle.style.backgroundColor = color;
      particle.style.left = "50%";
      particle.style.top = "10%";
      particle.style.pointerEvents = "none";
      container.appendChild(particle);

      // Random trajectory with rotation
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 600,
        y: Math.random() * 400 + 200,
        opacity: 1,
        scale: Math.random() * 2.5 + 0.5,
        rotation: Math.random() * 720,
        duration: Math.random() * 2.5 + 1.5,
        ease: "power2.out",
        onComplete: () => {
          particle.remove();
        },
      });

      // Fade out as they fall
      gsap.to(particle, {
        opacity: 0,
        delay: Math.random() * 1 + 1,
        duration: 0.5,
      });
    }
  };

  const handleSharePlaylist = async () => {
    try {
      await navigator.clipboard.writeText(results.playlistUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      logger.error("Failed to copy to clipboard:", error);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);

      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);

      return date.toLocaleDateString() + " at " + date.toLocaleTimeString();
    } catch {
      return "Just now";
    }
  };

  const successRate = Math.round(
    (results.transferredSongs / results.totalSongs) * 100,
  );
  const displayedSongs = showAllSongs
    ? results.songs
    : results.songs.slice(0, 5);

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto space-y-6 relative">
      {/* Success Header - REDUCED SPACING */}
      <div className="success-header text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
          <CheckCircle className="text-green-400" size={40} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          Transfer Complete!
        </h2>
        <p className="text-gray-400 text-lg">
          Your playlist has been successfully transferred to Spotify
        </p>

        {/* Transfer Summary */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Completed in {formatDuration(results.transferDuration)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{formatDate(results.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="stats-card bg-green-500/30 backdrop-blur-md border border-green-500/40">
          <CardBody className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {results.transferredSongs}
            </div>
            <div className="text-green-300 text-sm">
              Successfully Transferred
            </div>
          </CardBody>
        </Card>

        <Card className="stats-card bg-red-500/30 backdrop-blur-md border border-red-500/60">
          <CardBody className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {results.failedSongs}
            </div>
            <div className="text-red-300 text-sm">Not Found</div>
          </CardBody>
        </Card>

        <Card className="stats-card bg-blue-500/30 backdrop-blur-md border border-blue-500/60">
          <CardBody className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {results.totalSongs}
            </div>
            <div className="text-blue-300 text-sm">Total Songs</div>
          </CardBody>
        </Card>

        <Card className="stats-card bg-purple-500/30 backdrop-blur-md border border-purple-500/60">
          <CardBody className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">
              {successRate}%
            </div>
            <div className="text-purple-300 text-sm">Success Rate</div>
          </CardBody>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          className="group"
          color="success"
          size="lg"
          startContent={
            <ExternalLink
              className="group-hover:scale-110 transition-transform"
              size={18}
            />
          }
          variant="shadow"
          onPress={() => window.open(results.playlistUrl, "_blank")}
        >
          Open in Spotify
        </Button>

        <Button
          className="group"
          color="primary"
          size="lg"
          startContent={
            <Share2
              className="group-hover:scale-110 transition-transform"
              size={18}
            />
          }
          variant="bordered"
          onPress={handleSharePlaylist}
        >
          {copySuccess ? "Copied!" : "Share Playlist"}
        </Button>

        <Button
          className="group"
          size="lg"
          startContent={
            <RotateCcw
              className="group-hover:rotate-180 transition-transform duration-500"
              size={18}
            />
          }
          variant="ghost"
          onPress={onStartOver}
        >
          Transfer Another
        </Button>
      </div>

      {/* Songs List */}
      <Card className="bg-gray-800/80 backdrop-blur-md border border-gray-600/60">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Music size={20} />
              Transferred Songs
            </h3>
            {results.songs.length > 5 && (
              <Button
                size="sm"
                variant="ghost"
                onPress={() => setShowAllSongs(!showAllSongs)}
              >
                {showAllSongs
                  ? "Show Less"
                  : `Show All (${results.songs.length})`}
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {displayedSongs.map((song, index) => (
              <div
                key={song.id}
                className="song-item flex items-center gap-4 p-4 rounded-lg bg-gray-700/60 hover:bg-gray-600/70 transition-colors border border-gray-600/40 backdrop-blur-sm"
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                  {song.thumbnail ? (
                    <Image
                      alt={song.title}
                      className="w-12 h-12 rounded-md object-cover"
                      src={song.thumbnail}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-600/80 rounded-md flex items-center justify-center border border-gray-500/50">
                      <Music className="text-gray-300" size={20} />
                    </div>
                  )}
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-base">
                    {song.title}
                  </p>
                  <p className="text-gray-300 text-sm truncate">
                    {song.artist}
                  </p>
                  {song.album && (
                    <p className="text-gray-400 text-xs truncate">
                      {song.album}
                    </p>
                  )}
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-2">
                  {song.status === "success" ? (
                    <>
                      <Chip
                        className="bg-green-500/25 text-green-300 border border-green-500/30"
                        startContent={<CheckCircle size={14} />}
                        variant="flat"
                      >
                        Added
                      </Chip>
                      <div className="flex gap-1">
                        {song.spotifyUrl && (
                          <Button
                            isIconOnly
                            className="hover:bg-white/10"
                            size="sm"
                            title="Open in Spotify"
                            variant="ghost"
                            onPress={() =>
                              window.open(song.spotifyUrl, "_blank")
                            }
                          >
                            <ExternalLink size={14} />
                          </Button>
                        )}
                        {song.youtubeUrl && (
                          <Button
                            isIconOnly
                            className="hover:bg-white/10"
                            size="sm"
                            title="Open original YouTube video"
                            variant="ghost"
                            onPress={() =>
                              window.open(song.youtubeUrl, "_blank")
                            }
                          >
                            <svg
                              fill="currentColor"
                              height="14"
                              viewBox="0 0 24 24"
                              width="14"
                            >
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Chip
                        className="bg-red-500/25 text-red-300 border border-red-500/30"
                        startContent={<XCircle size={14} />}
                        variant="flat"
                      >
                        Not Found
                      </Chip>
                      {song.youtubeUrl && (
                        <Button
                          isIconOnly
                          className="hover:bg-white/10"
                          size="sm"
                          title="Open original YouTube video"
                          variant="ghost"
                          onPress={() => window.open(song.youtubeUrl, "_blank")}
                        >
                          <svg
                            fill="currentColor"
                            height="14"
                            viewBox="0 0 24 24"
                            width="14"
                          >
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {results.failedSongs > 0 && (
            <>
              <Divider className="my-6 bg-gray-500/60" />
              <div className="text-center p-4 bg-gray-700/40 rounded-lg border border-gray-600/40 backdrop-blur-sm">
                <p className="text-gray-200 text-sm mb-2 font-medium">
                  {results.failedSongs} song(s) couldn&apos;t be found on
                  Spotify
                </p>
                <p className="text-gray-400 text-xs">
                  This usually happens when songs are not available in your
                  region or have different titles. You can click the YouTube
                  icon to find them manually.
                </p>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Performance Stats */}
      <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md border border-blue-500/50">
        <CardBody className="p-6">
          <h4 className="text-lg font-semibold text-white mb-3">
            Transfer Statistics
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/40 backdrop-blur-sm">
              <p className="font-medium text-blue-400 mb-1">Processing Speed</p>
              <p className="text-gray-200">
                {(results.transferDuration / results.totalSongs).toFixed(1)}s
                per song
              </p>
            </div>
            <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/40 backdrop-blur-sm">
              <p className="font-medium text-green-400 mb-1">Match Accuracy</p>
              <p className="text-gray-200">
                {successRate}% of songs found successfully
              </p>
            </div>
            <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/40 backdrop-blur-sm">
              <p className="font-medium text-purple-400 mb-1">Total Duration</p>
              <p className="text-gray-200">
                {formatDuration(results.transferDuration)}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tips Card */}
      <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md border border-green-500/50">
        <CardBody className="p-6">
          <h4 className="text-lg font-semibold text-white mb-3">Tips</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/40 backdrop-blur-sm">
              <p className="font-medium text-green-400 mb-1">Missing songs?</p>
              <p className="text-gray-200">
                Click the YouTube icon next to failed songs to find and add them
                manually to your Spotify playlist.
              </p>
            </div>
            <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600/40 backdrop-blur-sm">
              <p className="font-medium text-blue-400 mb-1">Love the tool?</p>
              <p className="text-gray-200">
                Share it with friends who also want to transfer their playlists!
                The more the merrier.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
