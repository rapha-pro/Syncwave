import { CheckCircle, ArrowRightLeft, TvMinimalPlay } from "lucide-react";

import Logo from "./logo";

import { areaProps } from "@/types";
import { SpotifyIcon } from "@/components/icons";
import { playlistDescription } from "@/utils/site";

export default function Phone(area: areaProps) {
  const { width = 280, height = 500 } = area;

  const style = {
    width: `${width}px`,
    height: `${height}px`,
  };

  return (
    <div className={`relative md:scale-110`} style={style}>
      {/* Phone mockup */}
      <div className="absolute inset-0 bg-gray-800 rounded-[40px] border-4 border-gray-700 shadow-2xl overflow-hidden">
        {/* App Screen */}
        <div className="absolute inset-2 bg-black rounded-[32px] overflow-hidden">
          {/* App Content */}
          <div className="h-full w-full flex flex-col">
            {/* App Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <Logo height={8} size={14} text_size="text-md" width={8} />
              <div className="h-6 w-6 rounded-full bg-gray-800" />
            </div>

            {/* App Body */}
            <div className="flex-1 p-4 flex flex-col gap-4">
              {/* YouTube Playlist */}
              <div className="rounded-lg bg-red-900/20 border border-red-800/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <TvMinimalPlay className="text-red-500" size={20} />
                  <span className="text-red-200 font-medium">
                    {playlistDescription}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-6 bg-red-800/30 rounded-md w-full" />
                  <div className="h-6 bg-red-800/30 rounded-md w-[85%]" />
                  <div className="h-6 bg-red-800/30 rounded-md w-[90%]" />
                </div>
              </div>

              {/* Transfer Animation */}
              <div className="flex justify-center my-2">
                <div className="relative h-10 w-10 bg-purple-900/30 rounded-full flex items-center justify-center animate-pulse">
                  <ArrowRightLeft className="text-purple-400" size={20} />
                </div>
              </div>

              {/* Spotify Playlist */}
              <div className="rounded-lg bg-green-900/20 border border-green-800/50 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <SpotifyIcon className="text-green-500" size={20} />
                  <span className="text-green-200 font-medium">
                    {playlistDescription}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-6 bg-green-800/30 rounded-md w-full flex items-center">
                    <div className="ml-auto mr-2 flex items-center gap-1">
                      <CheckCircle className="text-green-400" size={16} />
                    </div>
                  </div>
                  <div className="h-6 bg-green-800/30 rounded-md w-[85%] flex items-center">
                    <div className="ml-auto mr-2 flex items-center gap-1">
                      <CheckCircle className="text-green-400" size={16} />
                    </div>
                  </div>
                  <div className="h-6 bg-green-800/30 rounded-md w-[90%] flex items-center">
                    <div className="ml-auto mr-2 flex items-center gap-1">
                      <CheckCircle className="text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="mt-auto mx-auto px-6 py-3 bg-green-500/20 rounded-full text-green-400 flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Transfer Complete!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
