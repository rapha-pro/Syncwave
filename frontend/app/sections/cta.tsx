import { Button } from "@heroui/react";
import { Rocket } from "lucide-react";

import { kaushanScript } from "@/utils/fonts";

export default function Cta() {
  const handleStart = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h2
          className={`text-3xl md:text-4xl font-bold mb-6 ${kaushanScript.className}`}
        >
          Ready to Transfer Your Music?
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of music lovers who have already seamlessly migrated
          their playlists.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 w-48 mx-auto"
            color="primary"
            size="lg"
            startContent={
              <Rocket
                className="group-hover:scale-110 transition-transform text-white"
                size={20}
              />
            }
            variant="shadow"
            onPress={handleStart}
          >
            Start
          </Button>
        </div>
      </div>
    </section>
  );
}
