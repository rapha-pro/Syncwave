import { Music, Rocket, CheckCircle, TvMinimalPlay } from "lucide-react";

import { successfulTransferPercent } from "./site";

import { SpotifyIcon } from "@/components/icons";
import { FeatureCardProps } from "@/types";

export const featuresData: FeatureCardProps[] = [
  {
    id: "lightning-fast",
    icon: Rocket,
    iconColor: "text-green-400",
    bgColor: "bg-green-900/30",
    title: "Lightning Fast",
    description:
      "Transfer your playlists in seconds, not hours. Our matching algorithm works at an excellent speed.",
  },
  {
    id: "safe-secure",
    icon: CheckCircle,
    iconColor: "text-yellow-400",
    bgColor: "bg-yellow-900/30",
    title: "Safe & Secure",
    description:
      "We NEVER store your passwords. We use OAuth for secure authentication with both platforms.",
  },
  {
    id: "effortless-process",
    icon: CheckCircle,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-900/30",
    title: "Effortless Process",
    description:
      "Just two logins and you're done. No complicated setup nor further configuration required.",
  },
  {
    id: "match-rate",
    icon: Music,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-900/30",
    title: `${successfulTransferPercent}% Match Rate`,
    description:
      "Our optimized algorithm ensures nearly perfect matching",
  },
  {
    id: "youtube-integration",
    icon: TvMinimalPlay,
    iconColor: "text-red-400",
    bgColor: "bg-red-900/30",
    title: "YouTube Integration",
    description:
      "Access all your YouTube Music playlists and liked videos with a simple Google login.",
  },
  {
    id: "spotify-integration",
    icon: SpotifyIcon,
    iconColor: "text-green-400",
    bgColor: "bg-green-900/30",
    title: "Spotify Integration",
    description:
      "Seamlessly create new playlists in your Spotify account with all your favorite tracks.",
  },
];
