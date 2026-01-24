"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function AnimatedBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);

  // Animation constants
  const PARTICLE_COUNT = 20;
  const PARTICLE_COLORS = [
    "bg-green-400",
    "bg-blue-400",
    "bg-purple-400",
    "bg-red-400",
    "bg-yellow-400",
  ];

  useEffect(() => {
    const container = backgroundRef.current;

    if (!container) return;

    // Create floating particles with enhanced animation
    const createParticles = () => {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = document.createElement("div");

        particle.className = "absolute rounded-full opacity-20";

        // Random size and color
        const size = Math.random() * 24 + 4;
        const color =
          PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

        particle.classList.add(color);
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;

        container.appendChild(particle);

        // Enhanced floating animation
        const tl = gsap.timeline({ repeat: -1, yoyo: true });

        tl.to(particle, {
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
          rotation: Math.random() * 360,
          duration: Math.random() * 25 + 15,
          ease: "sine.inOut",
        });

        // Pulsing opacity
        gsap.to(particle, {
          opacity: Math.random() * 0.4 + 0.1,
          duration: Math.random() * 3 + 2,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });

        // Scale animation
        gsap.to(particle, {
          scale: Math.random() * 0.5 + 0.8,
          duration: Math.random() * 4 + 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
    };

    createParticles();

    // Cleanup function
    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div
      ref={backgroundRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
    >
      {/* Enhanced Gradient Orbs with pulsing animation */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-green-500/10 rounded-full filter blur-3xl animate-pulse" />
      <div
        className="absolute top-3/4 right-1/4 h-72 w-72 bg-blue-500/10 rounded-full filter blur-3xl animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className="absolute top-1/2 right-1/3 h-56 w-56 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-1/4 left-1/3 h-64 w-64 bg-red-500/10 rounded-full filter blur-3xl animate-pulse"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Enhanced Mesh Gradient Background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 60% 70%, rgba(239, 68, 68, 0.1) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  );
}
