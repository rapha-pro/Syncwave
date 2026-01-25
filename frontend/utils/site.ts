export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "FloTunes",
  description: "Migrate your playlists across platforms in seconds.",
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

// Get current season based on month
function getCurrentSeason(): string {
  const month = new Date().getMonth(); // 0-11

  // December, January, February = Winter
  if (month === 11 || month === 0 || month === 1) {
    return "Winter Chill";
  }
  // March, April, May = Spring
  else if (month >= 2 && month <= 4) {
    return "Spring vibe";
  }
  // June, July, August = Summer
  else if (month >= 5 && month <= 7) {
    return "Summer vibe";
  }
  // September, October, November = Fall
  else {
    return "Fall mood";
  }
}

export const successfulTransferPercent = 80;
export const playlistDescription = `${getCurrentSeason()} ${new Date().getFullYear()}`;
export const termsUpdateDate = "09/01/2025";
export const numPlaylistTransfered = 100;
