// types/index.ts (updated)
import { SVGProps } from "react";
import { LucideIcon } from 'lucide-react';
import { SpotifyIcon } from "@/components/icons";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
}

export interface FeatureCardProps {
  id: string;
  icon: LucideIcon | typeof SpotifyIcon;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
}

export interface FaqItemProps {
  id: string;
  question: string;
  answer: string;
}

export interface FaqCardProps {
  faq: FaqItemProps;
}

export interface areaProps {
  width?: number;
  height?: number;
}

export interface LogoProps {
  width?: number;
  height?: number;
  classname?: string;
  size?: number;
  showText?: boolean;
  showImage?: boolean;
  text_size?: string;
}

export interface PlaylistTransferRequestProps {
  url: string;
  name: string;
  description: string;
  isPublic: boolean;
}

export interface TransferProgressResponseProps {
  status: "processing" | "completed" | "failed";
  progress: number;
  currentStep: string;
  totalSongs: number;
  processedSongs: number;
  foundSongs: number;
  message?: string;
}

export interface TransferResultResponseProps {
  playlistId: string;
  playlistUrl: string;
  totalSongs: number;
  transferredSongs: number;
  failedSongs: number;
  songs: Array<{
    id: string;
    title: string;
    artist: string;
    album?: string;
    thumbnail?: string;
    status: "success" | "failed";
    spotifyUrl?: string;
    youtubeUrl?: string;
    error?: string;
  }>;
  transferDuration: number;
  createdAt: string;
}

export interface PlaylistDataProps {
  url: string;
  name: string;
  description: string;
  isPublic: boolean;
}

export interface PlaylistFormProps {
  onSubmit: (data: PlaylistDataProps) => void;
}

export interface TransferResultsProps {
  results: TransferResultResponseProps;
  onStartOver: () => void;
}

export interface TransferProgressProps {
  playlistData: PlaylistTransferRequestProps;
  isTransferring: boolean;
}

export interface ProgressStepProps {
  id: string;
  label: string;
  status: "pending" | "active" | "completed";
  icon: React.ReactNode;
}

export interface AuthStatus {
  spotify: boolean;
  youtube: boolean;
}
