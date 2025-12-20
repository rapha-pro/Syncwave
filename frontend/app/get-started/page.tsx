import GetStarted from "@/components/get-started/get-started";

// Force static generation for faster initial load
export const dynamic = "force-static";

export default function GetStartedPage() {
  return <GetStarted />;
}

export const metadata = {
  title: "Get Started",
  description: "Transfer your YouTube playlists to Spotify easily",
};
