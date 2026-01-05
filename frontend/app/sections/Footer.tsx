"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { siteConfig } from "@/utils/site";
import socialLinks from "@/utils/socialLinks";
import { kaushanScript } from "@/utils/fonts";

export default function Footer() {
  const router = useRouter();
  const sloganRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const animateSlogan = () => {
      if (!sloganRef.current) return;

      // Split the slogan text into individual characters
      const text = sloganRef.current.textContent || "";

      sloganRef.current.innerHTML = text
        .split("")
        .map((char, index) => {
          if (char === " ") {
            return `<span class="slogan-char" data-index="${index}">&nbsp;</span>`;
          }

          return `<span class="slogan-char" data-index="${index}">${char}</span>`;
        })
        .join("");

      const chars = sloganRef.current.querySelectorAll(".slogan-char");

      // Set initial state for all characters
      gsap.set(chars, {
        color: "#9ca3af", // gray-400
        textShadow: "none",
      });

      // Create the wave animation
      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: 3, // Wait 3 seconds between cycles
        scrollTrigger: {
          trigger: sloganRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse",
        },
      });

      // Animate each character with a stagger
      chars.forEach((char, index) => {
        tl.to(
          char,
          {
            color: "#10b981", // green-500
            textShadow:
              "0 0 20px rgba(16, 185, 129, 0.8), 0 0 40px rgba(16, 185, 129, 0.4)",
            duration: 0.3,
            ease: "power2.out",
          },
          index * 0.05,
        ) // Stagger timing
          .to(
            char,
            {
              color: "#9ca3af", // back to gray-400
              textShadow: "none",
              duration: 0.3,
              ease: "power2.out",
            },
            index * 0.05 + 0.3,
          ); // Return to original after highlight
      });
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      animateSlogan();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      gsap.killTweensOf(".slogan-char");
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === sloganRef.current) {
          trigger.kill();
        }
      });
    };
  }, []);

  const handleNavClick = (href: string, openInNewTab: boolean = false) => {
    if (openInNewTab) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  };

  const handleLogoClick = () => {
    if (window.location.pathname === "/")
      window.scrollTo({ top: 0, behavior: "smooth" });
    else router.push("/");
  };

  return (
    <footer className="py-12 bg-gray-900 border-t border-gray-800">
      <div className="mx-auto w-full px-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 lg:gap-0">
          {/* Brand Section */}
          <div className="text-center md:text-left mb-6 md:mb-0 italic">
            <p
              ref={sloganRef}
              className={`text-gray-400 text-sm max-w-xs select-none tracking-wider cursor-default ${kaushanScript.className}`}
            >
              {siteConfig.slogan}
            </p>
            <p className="text-gray-400 text-sm mt-2">{siteConfig.name}</p>
          </div>

          <div className="flex gap-6 items-center mb-6 md:mb-0 lg:mr-56">
            {siteConfig.navItems.map((item) => (
              <button
                key={item.href}
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => handleNavClick(item.href)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map((social) => {
              const IconComponent = social.icon;

              return (
                <a
                  key={social.name}
                  className={`h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors ${social.color}`}
                  href={social.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  title={social.name}
                >
                  <IconComponent size={18} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Syncwave. All rights reserved.</p>
        <div className="flex justify-center text-blue-500 gap-6 mt-4">
          <button
            className="hover:text-gray-300 transition-colors"
            onClick={() => handleNavClick("/privacy")}
          >
            Privacy Policy
          </button>
          <button
            className="hover:text-gray-300 transition-colors"
            onClick={() => handleNavClick("/terms")}
          >
            Terms of Service
          </button>
          <button
            className="hover:text-gray-300 transition-colors"
            onClick={() => handleNavClick("/support")}
          >
            Support
          </button>
          <button
            className="hover:text-gray-300 transition-colors"
            onClick={() =>
              handleNavClick("https://merge.picbreezy.com/en", true)
            }
          >
            Discover PicBreezy
          </button>
        </div>
      </div>
    </footer>
  );
}
