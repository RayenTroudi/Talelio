"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/app/components/LocaleProvider";

const Hero = () => {
  const { t } = useTranslation();

  return (
    <div className="relative w-full min-h-[90vh] flex items-center overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/talelparfume.mp4"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Subtle gradient vignette for extra depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 lg:px-16 py-24">
        <div className="flex items-center justify-center">

          {/* Brand Message (Centered) */}
          <div className="text-center space-y-10">
            {/* Decorative Line */}
            <div
              className="flex justify-center animate-fade-in-up"
              style={{ animationDelay: "0.15s", animationFillMode: "both" }}
            >
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
            </div>

            {/* Headline */}
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.15] animate-fade-in-up drop-shadow-lg"
              style={{ animationDelay: "0.2s", animationFillMode: "both" }}
            >
              {t.hero.title} <br />
              <span className="font-serif italic text-gold-400">{t.hero.titleHighlight}</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto animate-fade-in-up drop-shadow"
              style={{ animationDelay: "0.3s", animationFillMode: "both" }}
            >
              {t.hero.subtitle}
            </p>


          </div>
        </div>
      </div>

      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Hero;
