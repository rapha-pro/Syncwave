export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Syncwave",
  description: "Transfer your YouTube playlists to Spotify in seconds.",
  slogan: "Anywhere, everywhere — keep your vibe",
  navItems: [
    {
      label: "Features",
      href: "/#features",
      icon: "Sparkles",
    },
    {
      label: "How It Works",
      href: "/#how-it-works",
      icon: "Workflow",
    },
    {
      label: "FAQ",
      href: "/#faq",
      icon: "HelpCircle",
    },
  ],
};

export const successfulTransferPercent = 80;
export const playlistDescription = "Summer vibe " + new Date().getFullYear().toString();
export const termsUpdateDate = "09/01/2025";
