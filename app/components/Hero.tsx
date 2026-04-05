"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/app/components/LocaleProvider";

const Hero = () => {
  const { t, dir } = useTranslation();

  return (
    <div className="relative w-full min-h-screen flex items-center overflow-hidden bg-black">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        src="/talelparfume.mp4"
      />

      {/* Layered overlays for editorial depth */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Content */}
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-20 py-20 sm:py-28 lg:py-36 mt-14 sm:mt-16">
        <div className="max-w-2xl">

          {/* Eyebrow */}
          <div
            className="flex items-center gap-3 mb-5 sm:mb-8 hero-anim"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="h-px w-8 sm:w-10 bg-gold-400" />
            <span className="text-gold-400 text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] uppercase font-light">
              {t.hero.eyebrow}
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-white leading-[1.08] hero-anim mb-4 sm:mb-6"
            style={{ animationDelay: "0.22s" }}
          >
            {t.hero.title}
            <br />
            <span className="font-serif italic text-gold-400">
              {t.hero.titleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-light max-w-md hero-anim mb-8 sm:mb-12"
            style={{ animationDelay: "0.38s" }}
          >
            {t.hero.subtitle}
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 hero-anim"
            style={{ animationDelay: "0.52s" }}
          >
            <Link
              href="/categories/femme"
              className="group inline-flex items-center justify-center gap-3 bg-gold-500 hover:bg-gold-600 text-white px-7 sm:px-9 py-3.5 sm:py-4 text-xs tracking-[0.15em] uppercase font-light transition-all duration-300 hover:shadow-xl hover:shadow-gold-500/25 active:scale-[0.98]"
            >
              <span>{t.hero.cta}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${dir === 'rtl' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {dir === 'rtl' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                )}
              </svg>
            </Link>

            <Link
              href="#categories"
              className="inline-flex items-center justify-center gap-3 border border-white/35 hover:border-gold-400/60 text-white/90 hover:text-gold-400 px-7 sm:px-9 py-3.5 sm:py-4 text-xs tracking-[0.15em] uppercase font-light transition-all duration-300 backdrop-blur-sm active:scale-[0.98]"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator — hidden on very small screens */}
      <div className="hidden sm:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-3 scroll-indicator">
        <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
      </div>

      <style jsx>{`
        @keyframes heroFadeUp {
          from {
            opacity: 0;
            transform: translateY(36px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scrollBounce {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
            opacity: 0.6;
          }
          50% {
            transform: translateX(-50%) translateY(7px);
            opacity: 1;
          }
        }

        .hero-anim {
          opacity: 0;
          animation: heroFadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .scroll-indicator {
          animation: scrollBounce 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Hero;
