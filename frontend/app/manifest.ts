import type { MetadataRoute } from "next";

import { siteConfig } from "@/utils/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} - Where music moves`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#111827",
    theme_color: "#1f2937",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/flotunes.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["music", "entertainment", "utilities"],
    shortcuts: [
      {
        name: "Get Started",
        short_name: "Start",
        description: "Begin transferring playlists",
        url: "/get-started",
        icons: [
          {
            src: "/flotunes.png",
            sizes: "192x192",
          },
        ],
      },
      {
        name: "Privacy Policy",
        short_name: "Privacy",
        description: "View our privacy policy",
        url: "/privacy",
        icons: [
          {
            src: "/flotunes.png",
            sizes: "192x192",
          },
        ],
      },
      {
        name: "Terms of Service",
        short_name: "Terms",
        description: "Read our terms of service",
        url: "/terms",
        icons: [
          {
            src: "/flotunes.png",
            sizes: "192x192",
          },
        ],
      },
      {
        name: "Support our work",
        short_name: "Support",
        description: "Donate to support our work",
        url: "/support",
        icons: [
          {
            src: "/flotunes.png",
            sizes: "192x192",
          },
        ],
      },
    ],
  };
}
