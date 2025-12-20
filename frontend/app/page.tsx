"use client";

import Cta from "./sections/cta";
import Faq from "./sections/faq";

import Features from "@/app/sections/Features";
import Hero from "@/app/sections/Hero";
import HowItWorks from "@/app/sections/HowItWorks";
import Testimonial from "@/app/sections/Testimonial";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-x-hidden">
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonial />
      <Faq />
      <Cta />
    </div>
  );
}
