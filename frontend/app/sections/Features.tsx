"use client";

import { useEffect, useRef } from "react";
import { Card } from "@heroui/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { featuresData } from "@/utils/features-data";
import { killAnimations } from "@/utils/cleaning_animations";
import { kaushanScript } from "@/utils/fonts";

export default function Features() {
  const featureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Check if animation has already played in this session
    const hasPlayedAnimation = sessionStorage.getItem("featuresAnimated");

    if (hasPlayedAnimation) {
      return;
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      const features = document.querySelectorAll(".feature-card");

      if (features.length > 0) {
        features.forEach((feature, index) => {
          // Then animate from the desired start state
          gsap.fromTo(
            feature,
            { y: 100, opacity: 0 },
            {
              scrollTrigger: {
                trigger: feature,
                start: "top bottom-=100",
                id: `feature-${index}`, // ID for easier debugging
                once: true,
              },
              y: 0,
              opacity: 1,
              duration: 0.6,
              delay: index * 0.2,
              ease: "power3.out",
            },
          );
        });

        // Mark animation as played in session storage
        sessionStorage.setItem("featuresAnimated", "true");
      }
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      killAnimations("feature-card");
    };
  }, []);

  return (
    <section
      ref={featureRef}
      className="py-20 bg-gradient-to-b from-black to-gray-900"
      id="features"
      style={{ opacity: 1 }} // Ensure section is always visible
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${kaushanScript.className}`}>
            Why Choose{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-purple-500">
              Syncwave
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The easiest and most reliable way to transfer your music collections
            between streaming platforms.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => {
            const IconComponent = feature.icon;

            return (
              <Card
                key={feature.id}
                className="feature-card bg-gray-800/50 border border-gray-700 p-6 hover:-translate-y-3 hover:border-green-500/50 transition-all duration-300"
                style={{ opacity: 1 }} // Ensure cards are always visible
              >
                <div
                  className={`h-12 w-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                >
                  <IconComponent className={feature.iconColor} size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
