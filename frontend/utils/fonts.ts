import { Fira_Code as FontMono, Inter as FontSans, Kaushan_Script, Courgette, Merienda, Bad_Script } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const kaushanScript = Kaushan_Script({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-kaushan-script',
});

export const courgette = Courgette({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-courgette',
});

export const merienda = Merienda({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-merienda',
});

export const badScript = Bad_Script({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-badScript',
});