"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/app/components/LocaleProvider";

export default function CategoriesSection() {
  const { t } = useTranslation();

  const categories = [
    {
      name: t.categories.women.name,
      link: "/categories/femme",
      description: t.categories.women.description,
      image: "/female category.png",
      accentColor: "rose"
    },
    {
      name: t.categories.men.name,
      link: "/categories/homme",
      description: t.categories.men.description,
      image: "/male category.png",
      accentColor: "slate"
    },
  ];

  return (
    <section id="categories" className="py-28 bg-white relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(251,191,36,0.04),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <header className="mb-20 text-center">
          <div className="inline-block mb-6">
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 tracking-tight">
            {t.categories.sectionTitle} <span className="font-serif italic text-amber-600">{t.categories.sectionTitleHighlight}</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
            {t.categories.sectionSubtitle}
          </p>
        </header>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {categories.map((cat) => {
            return (
              <Link
                href={cat.link}
                key={cat.name}
                className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-3"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-700" />

                {/* Subtle Pattern Overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent_70%)]" />
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                {/* Content */}
                <div className="relative p-12 md:p-16 min-h-[450px] flex flex-col justify-between text-right">
                  <div>
                    {/* Title */}
                    <h3 className="text-4xl md:text-5xl font-light text-white mb-5 tracking-tight">
                      {cat.name}
                    </h3>

                    {/* Description */}
                    <p className="text-white/95 text-base md:text-lg leading-relaxed font-light">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
