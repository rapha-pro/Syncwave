"use client";

import { useRouter } from "next/navigation";

import { siteConfig } from "@/utils/site";
import Logo from "@/components/logo";
import { useLogger } from "@/utils/useLogger";
import socialLinks from "@/utils/socialLinks";

export default function Footer() {
  // instantiate logger
  const logger = useLogger("sections/Footer");
  const router = useRouter();

  const handleNavClick = (href: string) => {
    logger.info("[Footer] - Nav clicked:", href);

    router.push(href);
  };

  const handleLogoClick = () => {
    logger.log("[Footer] - Logo clicked, navigating to home");
    if (window.location.pathname === "/")
      window.scrollTo({ top: 0, behavior: "smooth" });
    else router.push("/");
  };

  return (
    <footer className="py-12 bg-gray-900 border-t border-gray-800">
      <div className="mx-auto w-full px-16">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand Section */}
          <div className="text-center md:text-left mb-6 md:mb-0">
            <button
              aria-label="Syncwave"
              className="cursor-pointer mb-6 md:mb-0"
              onClick={handleLogoClick}
            >
              <Logo showImage={false} />
            </button>
            <p className="text-gray-400 text-sm max-w-xs">
              Transfer your playlists seamlessly between Spotify and YouTube.
            </p>
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

        <div className="w-full border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Syncwave. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
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
          </div>
        </div>
      </div>
    </footer>
  );
}
