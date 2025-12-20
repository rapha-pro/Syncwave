"use client";

import { useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import { ArrowLeft, Shield, Eye, Lock, Database } from "lucide-react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";

import { emailAddress } from "@/utils/socialLinks";
import { termsUpdateDate } from "@/utils/site";

export default function PrivacyPolicy() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Only run animations once
    const hasAnimated = sessionStorage.getItem("privacyPageAnimated");

    if (hasAnimated) return;

    // Kill any existing animations first
    gsap.killTweensOf([".page-header", ".main-content"]);

    // Animate page elements - run synchronously without delay
    gsap.fromTo(
      ".page-header",
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
    );

    gsap.fromTo(
      ".main-content",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: "power3.out" },
    );

    // Mark as animated
    sessionStorage.setItem("privacyPageAnimated", "true");
  }, []);

  const handleBackClick = () => {
    router.push("/");
  };

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
              <div className="h-16 w-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Shield className="text-blue-400" size={32} />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Privacy Policy
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Your privacy is important to us. Learn how we protect your data.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content relative z-10 px-4 pb-16">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-invert max-w-none">
            <div className="bg-gray-800/50 rounded-lg p-8 space-y-8">
              <div className="text-sm text-gray-400 mb-6">
                Last updated: {termsUpdateDate}
              </div>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="text-green-400" size={24} />
                  <h2 className="text-2xl font-bold text-white">
                    What We Collect
                  </h2>
                </div>
                <p className="text-gray-300">
                  Syncwave only collects the minimum data necessary to provide
                  our playlist transfer service:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>
                    • OAuth tokens from Spotify and YouTube (stored temporarily
                    during transfer)
                  </li>
                  <li>
                    • Playlist metadata (names, descriptions)
                  </li>
                  <li>
                    • Basic usage analytics (anonymous transfer statistics like page views, 
                    performance metrics, etc..) to provide reliability of our service
                  </li>
                  <li>• User Profile data (name, email) used in the transfer process</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="text-yellow-400" size={24} />
                  <h2 className="text-2xl font-bold text-white">
                    How We Protect Your Data
                  </h2>
                </div>
                <p className="text-gray-300">
                  We implement industry-standard security measures:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• All data transmission uses HTTPS encryption</li>
                  <li>
                    • OAuth tokens are stored securely and deleted after use
                  </li>
                  <li>• We NEVER store your Spotify or YouTube passwords</li>
                  <li>• Regular security audits and updates</li>
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Database className="text-purple-400" size={24} />
                  <h2 className="text-2xl font-bold text-white">Data Usage</h2>
                </div>
                <p className="text-gray-300">
                  Your data is used exclusively for:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Transferring playlists between platforms</li>
                  <li>• Improving our service quality</li>
                  <li>• Anonymous usage statistics</li>
                  <li>
                    • We NEVER sell or share your personal data with third
                    parties
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Data Retention
                </h2>
                <p className="text-gray-300">
                  We keep your data only as long as necessary:
                </p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>
                    • OAuth tokens are deleted couple hours after transfer
                    completion
                  </li>
                  <li>
                    • Transfer logs are kept for 30 days for troubleshooting
                  </li>
                  <li>
                    • Anonymous usage statistics may be retained indefinitely
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Your Rights</h2>
                <p className="text-gray-300">You have the right to:</p>
                <ul className="text-gray-300 space-y-2 ml-6">
                  <li>• Request deletion of your data</li>
                  <li>• Access information about data we have collected</li>
                  <li>• Revoke OAuth permissions at any time</li>
                  <li>• Contact us with privacy concerns</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Contact Us</h2>
                <p className="text-gray-300">
                  If you have questions about this Privacy Policy, please
                  contact us at:
                </p>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-white">{emailAddress}</p>
                </div>
              </section>

              <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
                <p>
                  This Privacy Policy is effective as of{" "}
                  {termsUpdateDate} and will remain in effect
                  except with respect to any changes in its provisions in the
                  future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
