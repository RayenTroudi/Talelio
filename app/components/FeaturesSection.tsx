"use client";

import React from "react";
import { useTranslation } from "@/app/components/LocaleProvider";

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const BoxIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

const TruckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

export default function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      Icon: ShieldIcon,
      title: t.brand.feature3Title,
      desc: t.brand.feature3Desc,
    },
    {
      Icon: BoxIcon,
      title: t.brand.feature2Title,
      desc: t.brand.feature2Desc,
    },
    {
      Icon: TruckIcon,
      title: t.brand.feature4Title,
      desc: t.brand.feature4Desc,
    },
    {
      Icon: StarIcon,
      title: t.brand.feature1Title,
      desc: t.brand.feature1Desc,
    },
  ];

  return (
    <section className="bg-[#080808] py-20 relative overflow-hidden">
      {/* Gold border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/60 to-transparent" />
      {/* Gold border bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="group flex flex-col items-center text-center px-4"
            >
              {/* Icon ring */}
              <div className="mb-5 w-11 h-11 rounded-full border border-gold-500/30 flex items-center justify-center text-gold-400 group-hover:border-gold-500/60 group-hover:bg-gold-500/8 transition-all duration-400">
                <f.Icon />
              </div>

              {/* Separator */}
              <div className="h-px w-6 bg-gold-500/40 mb-5" />

              {/* Title */}
              <h3 className="text-white/90 text-xs font-light tracking-[0.2em] uppercase mb-3">
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm font-light leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
