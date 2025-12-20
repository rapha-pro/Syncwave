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
      "Transfer your playlists in seconds, not hours. Our optimized matching algorithm works at incredible speeds.",
  },
  {
    id: "match-rate",
    icon: Music,
    iconColor: "text-purple-400",
    bgColor: "bg-purple-900/30",
    title: `${successfulTransferPercent}% Match Rate`,
    description:
      "Our advanced audio fingerprinting ensures nearly perfect matching, even for obscure tracks and remixes.",
  },
  {
    id: "effortless-process",
    icon: CheckCircle,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-900/30",
    title: "Effortless Process",
    description:
      "Just two logins and you're done. No complicated setup or configuration required.",
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
  {
    id: "safe-secure",
    icon: CheckCircle,
    iconColor: "text-yellow-400",
    bgColor: "bg-yellow-900/30",
    title: "Safe & Secure",
    description:
      "We never store your passwords and use OAuth for secure authentication with both platforms.",
  },
];
