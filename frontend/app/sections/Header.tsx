"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import {
  Sparkles,
  Workflow,
  HelpCircle,
  ArrowRight,
  Heart,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { siteConfig } from "@/utils/site";
import Logo from "@/components/logo";
import { useLogger } from "@/utils/useLogger";

const iconMap = {
  Sparkles: <Sparkles size={16} />,
  Workflow: <Workflow size={16} />,
  HelpCircle: <HelpCircle size={16} />,
};

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const logger = useLogger("sections/Header");

  useEffect(() => {
    logger.log("[Header] - Component mounted/remounted");
    gsap.registerPlugin(ScrollTrigger);

    // Kill any existing animations on this element first
    if (headerRef.current) {
      gsap.killTweensOf(headerRef.current);

      // Reset to visible state first
      gsap.set(headerRef.current, {
        y: 0,
        opacity: 1,
      });

      // Only animate on initial load, not on every navigation
      gsap.fromTo(
        headerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      );
    }

    return () => {
      if (headerRef.current) {
        gsap.killTweensOf(headerRef.current);
      }
    };
  }, []);

  const handleGetStarted = () => {
    logger.log("[Header] - Navigating to get-started");
    // Kill animations before navigation
    if (headerRef.current) {
      gsap.killTweensOf(headerRef.current);
    }
    router.push("/get-started");
  };

  const handleLogoClick = () => {
    logger.log("[Header] - Logo clicked, navigating to home");
    // Kill animations before navigation
    if (headerRef.current) {
      gsap.killTweensOf(headerRef.current);
    }
    router.push("/");
  };

  const handleNavClick = (href: string) => {
    logger.info("[Header] - Nav clicked:", href);
    // Kill animations before navigation
    if (headerRef.current) {
      gsap.killTweensOf(headerRef.current);
    }
    router.push(href);
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 w-full bg-black/80 backdrop-blur-md z-50 border-b border-gray-800"
      style={{ opacity: 1, transform: "translateY(0px)" }} // Ensure header is always visible
    >
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <button
          aria-label="Syncwave"
          className="cursor-pointer"
          onClick={handleLogoClick}
        >
          <Logo size={14}/>
        </button>

        <div className="hidden md:flex gap-6 items-center">
          {/* Navigation Links */}
          {siteConfig.navItems.map((item) => (
            <button
              key={item.href}
              className="flex items-center gap-2 hover:text-green-400 transition-colors"
              onClick={() => handleNavClick(item.href)}
            >
              {iconMap[item.icon as keyof typeof iconMap]}
              {item.label}
            </button>
          ))}

          {/* Support Link with Heart Icon */}
          <div className="ml-4 pl-4 border-l border-gray-600">
            <button
              className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-colors group"
              title="Support Syncwave"
              onClick={() => handleNavClick("/support")}
            >
              <div className="relative">
                {/* Outline Heart (default) */}
                <Heart
                  className="text-red-500 group-hover:opacity-0 transition-opacity duration-200"
                  fill="none"
                  size={18}
                />
                {/* Filled Heart (on hover) */}
                <Heart
                  className="absolute inset-0 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  fill="currentColor"
                  size={18}
                />
              </div>
              <span className="text-sm font-medium">Support</span>
            </button>
          </div>
        </div>

        <Button
          color="success"
          endContent={
            <ArrowRight
              className="group-hover:translate-x-1 transition-transform"
              size={20}
            />
          }
          variant="shadow"
          onPress={handleGetStarted}
        >
          Get Started
        </Button>
      </div>
    </header>
  );
}
