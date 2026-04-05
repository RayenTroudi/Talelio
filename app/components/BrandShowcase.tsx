"use client";

import React from "react";
import { useTranslation } from "@/app/components/LocaleProvider";

const stats = [
  { value: "15+",  key: "yearsExperience" as const },
  { value: "200+", key: "exclusivePerfumes" as const },
  { value: "50K+", key: "happyClients" as const },
  { value: "98%",  key: "customerSatisfaction" as const },
];

const BrandShowcase = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-16 md:py-20 bg-stone-900 overflow-hidden">
      {/* top & bottom gold rules */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      {/* ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,rgba(212,175,55,0.05),transparent)]" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 text-center">
          {stats.map(({ value, key }, i) => (
            <div key={i} className="group flex flex-col items-center gap-2">
              {/* number */}
              <span className="text-4xl md:text-5xl font-light text-gold-400 tracking-tight group-hover:text-gold-300 transition-colors duration-300">
                {value}
              </span>
              {/* thin gold rule */}
              <div className="h-px w-5 bg-gold-500/40 group-hover:w-8 transition-all duration-400" />
              {/* label */}
              <p className="text-xs text-stone-400 font-light tracking-[0.15em] uppercase leading-snug max-w-[110px]">
                {t.brand[key]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
