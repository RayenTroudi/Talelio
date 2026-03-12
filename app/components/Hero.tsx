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
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            </div>

            {/* Headline */}
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.15] animate-fade-in-up drop-shadow-lg"
              style={{ animationDelay: "0.2s", animationFillMode: "both" }}
            >
              {t.hero.title} <br />
              <span className="font-serif italic text-amber-400">{t.hero.titleHighlight}</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto animate-fade-in-up drop-shadow"
              style={{ animationDelay: "0.3s", animationFillMode: "both" }}
            >
              {t.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-wrap gap-4 animate-fade-in-up justify-center"
              style={{ animationDelay: "0.4s", animationFillMode: "both" }}
            >
              <Link
                href="#categories"
                className="inline-flex items-center justify-center bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-light py-4 px-10 rounded-xl text-base shadow-2xl shadow-amber-500/30 transition-all duration-500 transform hover:scale-105 hover:shadow-amber-500/40"
              >
                {t.hero.cta}
              </Link>
            </div>
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
