import {
  Fira_Code as FontMono,
  Inter as FontSans,
  Kaushan_Script,
  Bad_Script,
} from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const kaushanScript = Kaushan_Script({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kaushan-script",
});

export const badScript = Bad_Script({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-badScript",
});
