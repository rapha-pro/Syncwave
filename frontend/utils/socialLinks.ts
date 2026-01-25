import { Mail } from "lucide-react";

import { TwitterIcon } from "@/components/icons";

export const emailAddress = "contact@FloTunes.com";
export const twitterUsername = "rapha_pro_";
export const buyMeCoffeeLink = "https://buymeacoffee.com/rapha_pro"
export const website_url = "https://flotunes.com"

const socialLinks = [
  {
    name: "Twitter",
    href: `https://twitter.com/${twitterUsername}`,
    icon: TwitterIcon,
    color: "text-gray-400 hover:text-blue-400",
  },
  {
    name: "Email",
    href: `mailto:${emailAddress}`,
    icon: Mail,
    color: "text-gray-400 hover:text-green-400",
  },
];

export default socialLinks;
