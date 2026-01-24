"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import axios from "axios";

import PlaylistForm from "@/components/get-started/playlistForm";
import TransferProgress from "@/components/get-started/transferProgress";
import TransferResults from "@/components/get-started/transferResults";
import AnimatedBackground from "@/components/get-started/animatedBackground";
import { transferAPI } from "@/utils/api";
import {
  TransferResultResponseProps,
  PlaylistTransferRequestProps,
} from "@/types";

type TransferStep = "form" | "progress" | "results";

export default function GetStarted() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<TransferStep>("form");
  const [playlistData, setPlaylistData] =
    useState<PlaylistTransferRequestProps | null>(null);
  const [transferResults, setTransferResults] =
    useState<TransferResultResponseProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const animatePageElements = () => {
      // Kill any existing animations first
      gsap.killTweensOf([".page-header", ".main-content"]);

      // Reset elements to initial state WITHOUT clearing all props
      gsap.set([".page-header", ".main-content"], {
        y: 0,
        opacity: 1,
        // Removed clearProps: "all" - this was likely causing the issue
      });

      // Only animate if elements exist
      const pageHeader = document.querySelector(".page-header");
      const mainContent = document.querySelector(".main-content");

      if (pageHeader && mainContent) {
        gsap.fromTo(
          ".page-header",
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
        );

        gsap.fromTo(
          ".main-content",
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" },
        );
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      animatePageElements();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [currentStep]);

  const handleBackToHome = () => {
    gsap.killTweensOf([".page-header", ".main-content"]);
    // Next.js router for client-side navigation (no page refresh)
    router.push("/");
  };

  const handleFormSubmit = async (data: PlaylistTransferRequestProps) => {
    try {
      setError(null);
      setPlaylistData(data);
      setIsTransferring(true);
      setCurrentStep("progress");

      const results = await transferAPI.directTransfer(data);

      setTransferResults(results);
      setCurrentStep("results");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          `HTTP ${error.response?.status}: ${error.message}`;

        setError(`Transfer failed: ${errorMessage}`);
      } else {
        setError("Transfer failed: An unexpected error occurred");
      }

      setCurrentStep("form");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleStartOver = () => {
    // Kill all GSAP animations first
    gsap.killTweensOf("*");

    // Reset state
    setCurrentStep("form");
    setPlaylistData(null);
    setTransferResults(null);
    setError(null);
    setIsTransferring(false);
    setFormKey((prev) => prev + 1);

    // Force scroll to top
    window.scrollTo(0, 0);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "form":
        return "Fill in your playlist details to begin the transfer";
      case "progress":
        return "Transferring your playlist...";
      case "results":
        return "Transfer completed successfully!";
      default:
        return "";
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-900 relative overflow-hidden"
    >
      <AnimatedBackground />

      {/* Header */}
      <header className="page-header relative z-10 pt-8 pb-4 px-4">
        <div className="container mx-auto max-w-4xl pt-20">
          <Button
            className="group mb-6 text-gray-300 hover:bg-transparent"
            startContent={
              <ArrowLeft
                className="group-hover:-translate-x-1 transition-transform"
                size={18}
              />
            }
            variant="light"
            onPress={handleBackToHome}
          >
            Back to Home
          </Button>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
                Get Started
              </span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
              {getStepTitle()}
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm max-w-md mx-auto">
                {error}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content relative z-10 px-4 pb-16">
        <div className="container mx-auto max-w-4xl">
          {currentStep === "form" && (
            <div
              style={{ display: "block", visibility: "visible", opacity: 1 }}
            >
              <PlaylistForm key={formKey} onSubmit={handleFormSubmit} />
            </div>
          )}

          {currentStep === "progress" && playlistData && (
            <TransferProgress
              isTransferring={isTransferring}
              playlistData={playlistData}
            />
          )}

          {currentStep === "results" && transferResults && (
            <TransferResults
              key={`results-${formKey}`}
              results={transferResults}
              onStartOver={handleStartOver}
            />
          )}
        </div>
      </main>
    </div>
  );
}
