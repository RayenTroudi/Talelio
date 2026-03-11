"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/app/components/LocaleProvider";

// Declare global types for Vanta and THREE
declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

const Hero = () => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  // Ensure client-side only rendering to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!vantaEffect && vantaRef.current) {
      // Wait for both libraries to be loaded
      const checkAndInit = () => {
        if (window.VANTA && window.THREE && vantaRef.current) {
          try {
            const effect = window.VANTA.BIRDS({
              el: vantaRef.current,
              THREE: window.THREE,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              scale: 1.00,
              scaleMobile: 1.00,
              backgroundColor: 0xffffff,
              color1: 0xf59e0b,
              color2: 0xfbbf24,
              quantity: 4.00,
              birdSize: 1.30,
              wingSpan: 25.00,
              speedLimit: 4.00,
              separation: 50.00,
              alignment: 35.00,
              cohesion: 25.00
            });
            setVantaEffect(effect);
          } catch (error) {
            console.error('Error initializing Vanta:', error);
          }
        } else {
          // Retry after a short delay
          setTimeout(checkAndInit, 100);
        }
      };

      checkAndInit();
    }

    return () => {
      if (vantaEffect) {
        try {
          vantaEffect.destroy();
        } catch (error) {
          console.error('Error destroying Vanta:', error);
        }
      }
    };
  }, [vantaEffect, mounted]);

  return (
    <div
      ref={vantaRef}
      className="relative w-full min-h-[90vh] flex items-center overflow-hidden"
      suppressHydrationWarning
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" suppressHydrationWarning />

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
              className="text-4xl md:text-6xl lg:text-7xl font-light text-gray-900 leading-[1.15] animate-fade-in-up"
              style={{ animationDelay: "0.2s", animationFillMode: "both" }}
            >
              {t.hero.title} <br />
              <span className="font-serif italic text-amber-600">{t.hero.titleHighlight}</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto animate-fade-in-up"
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
