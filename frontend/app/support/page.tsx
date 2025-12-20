"use client";

import { useEffect, useRef } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import {
  ArrowLeft,
  Heart,
  Coffee,
  Server,
  Globe,
  Code,
  Mail,
  Twitter,
} from "lucide-react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";

import { emailAddress, twitterUsername } from "@/utils/socialLinks";
import Logo from "@/components/logo";

export default function Support() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Helper to open external links in a new window/tab safely
  const openExternal = (url: string) => {
    if (typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    // Only run animations once
    const hasAnimated = sessionStorage.getItem("supportPageAnimated");

    if (hasAnimated) return;

    // Kill any existing animations first
    gsap.killTweensOf([".page-header", ".main-content", ".support-card"]);

    // Animate page elements - run synchronously without delay
    gsap.fromTo(
      ".page-header",
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
    );

    gsap.fromTo(
      ".main-content",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        delay: 0.1,
        ease: "power3.out",
      },
    );

    gsap.fromTo(
      ".support-card",
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08,
        delay: 0.2,
        ease: "power3.out",
      },
    );

    // Mark as animated
    sessionStorage.setItem("supportPageAnimated", "true");
  }, []);

  const handleBackClick = () => {
    router.push("/");
  };

  const supportItems = [
    {
      icon: Server,
      title: "Server Hosting",
      description:
        "Maintaining reliable backend infrastructure for playlist transfers",
    },
    {
      icon: Globe,
      title: "Domain & SSL",
      description:
        "Keeping the website secure and accessible with premium domain services",
    },
    {
      icon: Code,
      title: "Development",
      description:
        "Adding new features, fixing bugs, and improving user experience",
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="page-header relative z-10 pt-8 pb-4 px-4">
        <div className="container mx-auto max-w-4xl pt-20">
          <Button
            className="group mb-6"
            startContent={
              <ArrowLeft
                className="group-hover:-translate-x-1 transition-transform"
                size={18}
              />
            }
            variant="ghost"
            onPress={handleBackClick}
          >
            Back to Home
          </Button>

          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center group">
                <div className="relative">
                  {/* Outline Heart (default) */}
                  <Heart
                    className="text-red-400 group-hover:opacity-0 transition-opacity duration-200"
                    fill="none"
                    size={32}
                  />
                  {/* Filled Heart (on hover) */}
                  <Heart
                    className="absolute inset-0 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    fill="currentColor"
                    size={32}
                  />
                </div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-500">
                Support Syncwave
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Help us keep this service free and continuously improving
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content relative z-10 px-4 pb-16">
        <div className="container mx-auto max-w-4xl space-y-12">
          {/* Introduction */}
          <Card className="support-card bg-gray-800/50 border border-gray-700">
            <CardBody className="p-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                Why We Need Your Support
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Syncwave is provided completely free to users worldwide because
                we believe everyone should have easy access to their music,
                regardless of which platform they prefer. This app is made
                possible by a dedicated team that maintains and improves the
                service in their spare time.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                By supporting us through donations, you directly help sustain
                this service and enable us to add exciting new features, improve
                performance, and expand compatibility with more music platforms.
                Every contribution, no matter how small, makes a meaningful
                difference in keeping Syncwave running smoothly for everyone.
              </p>
            </CardBody>
          </Card>

          {/* What we use money for */}
          <Card className="support-card bg-gray-800/50 border border-gray-700">
            <CardBody className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                What We Use Donations For
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {supportItems.map((item, index) => {
                  const IconComponent = item.icon;

                  return (
                    <div key={index} className="text-center">
                      <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                        <IconComponent className="text-blue-400" size={24} />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-300 text-center">
                  <strong>Every dollar counts!</strong> Even a small donation of
                  $1 helps cover server costs and shows that you value this free
                  service. Your support directly impacts our ability to keep
                  Syncwave running and evolving.
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Support Options */}
          <Card className="support-card bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30">
            <CardBody className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <Coffee className="text-orange-400" size={48} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Buy Me a Coffee
              </h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                The easiest way to show your appreciation and help keep Syncwave
                running. Every coffee helps fund server costs and development
                time.
              </p>
              <Button
                className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold px-8 py-3 text-lg"
                size="lg"
                onPress={() =>
                  openExternal("https://buymeacoffee.com/yourusername")
                }
              >
                <Coffee className="mr-2" size={20} />
                Buy Me a Coffee
              </Button>
            </CardBody>
          </Card>

          {/* Contact Information */}
          <Card className="support-card bg-gray-800/50 border border-gray-700">
            <CardBody className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Get in Touch
              </h2>
              <p className="text-gray-300 text-center mb-8 max-w-2xl mx-auto">
                Have questions, suggestions, or feedback? We&apos;d love to hear
                from you. Reach out through any of these channels:
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="flex items-center gap-3"
                  size="lg"
                  variant="bordered"
                  onPress={() => openExternal(`mailto:${emailAddress}`)}
                >
                  <Mail className="text-blue-400" size={20} />
                  <span>{emailAddress}</span>
                </Button>

                <Button
                  className="flex items-center gap-3"
                  size="lg"
                  variant="bordered"
                  onPress={() =>
                    openExternal(`https://twitter.com/${twitterUsername}`)
                  }
                >
                  <Twitter className="text-blue-400" size={20} />
                  <span>@{twitterUsername}</span>
                </Button>
              </div>

              <div className="mt-8 text-center text-gray-400 text-sm">
                <p>We typically respond within 24-48 hours</p>
              </div>
            </CardBody>
          </Card>

          {/* Thank You Message */}
          <div className="support-card text-center py-12">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Thank You for Your Support
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Whether you donate, share Syncwave with friends, or simply use
                the service, you&apos;re helping us build something meaningful
                for the music community. Every playlist transferred is a
                testament to the power of making music more accessible across
                platforms.
              </p>
              <div className="mt-6 justify-center flex">
                <Logo height={12} showText={false} size={20} width={12} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
