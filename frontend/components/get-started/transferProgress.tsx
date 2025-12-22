"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardBody, Progress, Chip } from "@heroui/react";
import { Music, Search, CheckCircle, Download, Loader2 } from "lucide-react";
import { gsap } from "gsap";

import { ProgressStepProps, PlaylistTransferRequestProps } from "@/types";

interface TransferProgressProps {
  playlistData: PlaylistTransferRequestProps;
  isTransferring: boolean;
}

export default function TransferProgress({
  playlistData,
  isTransferring,
}: TransferProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [foundSongs, setFoundSongs] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  const [currentMessage, setCurrentMessage] = useState("Starting transfer...");
  const progressTime = 1000;

  const steps: ProgressStepProps[] = [
    {
      id: "fetch",
      label: "Fetching YouTube playlist",
      status: currentStepIndex >= 0 ? "completed" : "pending",
      icon: <Download size={20} />,
    },
    {
      id: "search",
      label: "Searching songs on Spotify",
      status:
        currentStepIndex >= 1
          ? currentStepIndex === 1
            ? "active"
            : "completed"
          : "pending",
      icon: <Search size={20} />,
    },
    {
      id: "create",
      label: "Creating Spotify playlist",
      status:
        currentStepIndex >= 2
          ? currentStepIndex === 2
            ? "active"
            : "completed"
          : "pending",
      icon: <Music size={20} />,
    },
    {
      id: "complete",
      label: "Transfer completed",
      status: currentStepIndex >= 3 ? "completed" : "pending",
      icon: <CheckCircle size={20} />,
    },
  ];

  useEffect(() => {
    // Reset GSAP context and clear any existing animations
    const ctx = gsap.context(() => {
      // Kill any existing animations
      gsap.killTweensOf([".progress-container", ".step-item", ".stats-card"]);

      // Reset elements to visible state first
      gsap.set([".progress-container", ".step-item", ".stats-card"], {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        clearProps: "all",
      });

      // Enhanced progress container animation
      gsap.fromTo(
        ".progress-container",
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 1, ease: "back.out(1.5)" },
      );

      // Enhanced step items with 3D rotation
      gsap.fromTo(
        ".step-item",
        { x: -60, opacity: 0, rotationY: -20 },
        {
          x: 0,
          opacity: 1,
          rotationY: 0,
          duration: 0.8,
          stagger: 0.12,
          delay: 0.3,
          ease: "back.out(1.3)",
        },
      );

      // Animate stats cards
      gsap.fromTo(
        ".stats-card",
        { y: 30, opacity: 0, scale: 0.9 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          delay: 0.5,
          ease: "back.out(1.4)",
        },
      );
    }, containerRef);

    // Cleanup function
    return () => ctx.revert();
  }, []); // Only run once on mount

  useEffect(() => {
    // Realistic progress simulation
    const progressSteps = [
      {
        step: 0,
        progress: 10,
        message: "Extracting playlist ID from URL...",
        duration: progressTime * 5,
      },
      {
        step: 0,
        progress: 25,
        message: "Fetching YouTube video details...",
        duration: progressTime * 10,
      },
      {
        step: 1,
        progress: 35,
        message: "Analyzing video titles...",
        duration: progressTime * 6,
      },
      {
        step: 1,
        progress: 50,
        message: "Searching for songs on Spotify...",
        duration: progressTime * 8,
      },
      {
        step: 1,
        progress: 75,
        message: "Matching songs with high confidence...",
        duration: progressTime * 6,
      },
      {
        step: 2,
        progress: 85,
        message: "Creating Spotify playlist...",
        duration: progressTime * 2.5,
      },
      {
        step: 2,
        progress: 95,
        message: "Adding songs to playlist...",
        duration: progressTime * 4,
      },
      {
        step: 3,
        progress: 100,
        message: "Transfer completed successfully!",
        duration: progressTime,
      },
    ];

    let currentProgressIndex = 0;
    let songCounter = 0;
    const estimatedTotal = 0; // Estimated total songs

    // Set initial total
    setTotalSongs(estimatedTotal);

    const progressInterval = setInterval(() => {
      if (currentProgressIndex >= progressSteps.length) {
        clearInterval(progressInterval);

        return;
      }

      const currentProgressStep = progressSteps[currentProgressIndex];

      // Update step, progress, and message
      setCurrentStepIndex(currentProgressStep.step);
      setProgress(currentProgressStep.progress);
      setCurrentMessage(currentProgressStep.message);

      // Simulate song counting during search phase
      if (currentProgressStep.step === 1) {
        // Increment total songs first
        const newTotal = currentProgressIndex + 1;

        setTotalSongs(currentProgressIndex + 1);

        /** 
        Normally we would calculate found songs (e.g., 80% of total)
        const foundCount = Math.floor(newTotal * 1);

        But we will use 100% for simplicity for the moment since we don't
        have real data yet. We will show the real stats in the results page.
        */
        setFoundSongs(newTotal);
      }

      currentProgressIndex++;
    }, 1500);

    // Cleanup interval on unmount
    return () => {
      clearInterval(progressInterval);
    };
  }, [isTransferring, progressTime]);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "active";

    return "pending";
  };

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto space-y-8">
      {/* Debug Info */}
      <div className="bg-gray-800/20 p-2 rounded text-xs text-gray-500 font-mono">
        Step={currentStepIndex}, Progress={Math.round(progress)}%, Transferring=
        {isTransferring.toString()}
      </div>

      {/* Main Progress Card */}
      <Card className="progress-container bg-gray-800/50 backdrop-blur-sm border border-gray-700">
        <CardBody className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Transferring &quot;{playlistData.name}&quot;
            </h2>
            <p className="text-gray-400">{currentMessage}</p>
          </div>

          {/* Overall Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Overall Progress</span>
              <span className="text-gray-400">{Math.round(progress)}%</span>
            </div>
            <Progress
              className="w-full"
              classNames={{
                track: "bg-gray-700",
                indicator: "bg-gradient-to-r from-green-500 to-blue-500",
              }}
              value={progress}
            />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(index);

              return (
                <div
                  key={step.id}
                  className={`step-item flex items-center gap-4 p-4 rounded-lg transition-all duration-500 ${
                    status === "active"
                      ? "bg-blue-500/20 border border-blue-500/50"
                      : status === "completed"
                        ? "bg-green-500/20 border border-green-500/50"
                        : "bg-gray-700/30 border border-gray-600"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 ${
                      status === "active"
                        ? "bg-blue-500 text-white animate-pulse"
                        : status === "completed"
                          ? "bg-green-500 text-white"
                          : "bg-gray-600 text-gray-400"
                    }`}
                  >
                    {status === "active" ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      step.icon
                    )}
                  </div>

                  <div className="flex-1">
                    <p
                      className={`font-medium transition-colors duration-500 ${
                        status === "completed"
                          ? "text-green-400"
                          : status === "active"
                            ? "text-blue-400"
                            : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>

                  <Chip
                    className={
                      status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : status === "active"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-500/20 text-gray-400"
                    }
                    variant="flat"
                  >
                    {status === "completed"
                      ? "Done"
                      : status === "active"
                        ? "Processing"
                        : "Waiting"}
                  </Chip>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="stats-card bg-gray-800/30 border border-gray-700">
          <CardBody className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {totalSongs}
            </div>
            <div className="text-gray-400 text-sm">Total Songs</div>
          </CardBody>
        </Card>

        <Card className="stats-card bg-gray-800/30 border border-gray-700">
          <CardBody className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {foundSongs}
            </div>
            <div className="text-gray-400 text-sm">Songs Found</div>
          </CardBody>
        </Card>

        <Card className="stats-card bg-gray-800/30 border border-gray-700">
          <CardBody className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {totalSongs - foundSongs}
            </div>
            <div className="text-gray-400 text-sm">Not Found</div>
          </CardBody>
        </Card>
      </div>

      {/* Current Activity */}
      {currentStepIndex === 1 && (
        <Card className="bg-gray-800/30 border border-gray-700">
          <CardBody className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="animate-spin text-blue-400" size={20} />
              <h3 className="font-semibold text-white">Currently Processing</h3>
            </div>
            <p className="text-gray-400 text-sm">
              {currentMessage} This may take a few moments depending on your
              playlist size.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
