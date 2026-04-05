"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/app/components/LocaleProvider";

export default function CategoriesSection() {
  const { t, dir } = useTranslation();

  const categories = [
    {
      name: t.categories.women.name,
      link: "/categories/femme",
      description: t.categories.women.description,
      image: "/female category.png",
      label: t.categories.women.badge,
    },
    {
      name: t.categories.men.name,
      link: "/categories/homme",
      description: t.categories.men.description,
      image: "/male category.png",
      label: t.categories.men.badge,
    },
  ];

  return (
    <section id="categories" className="py-16 md:py-28 bg-white relative overflow-hidden">
      {/* Subtle background grain */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.05),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.04),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section Header */}
        <header className="mb-10 md:mb-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-10 sm:w-12 bg-gradient-to-r from-transparent to-gold-400" />
            <span className="text-gold-600 text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] uppercase font-light">
              {t.categories.eyebrow}
            </span>
            <div className="h-px w-10 sm:w-12 bg-gradient-to-l from-transparent to-gold-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
            {t.categories.sectionTitle}{" "}
            <span className="font-serif italic text-gold-600">
              {t.categories.sectionTitleHighlight}
            </span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed font-light px-2">
            {t.categories.sectionSubtitle}
          </p>
        </header>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-5 lg:gap-7 max-w-5xl mx-auto">
          {categories.map((cat) => (
            <Link
              href={cat.link}
              key={cat.name}
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-700"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.07]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                {/* Base dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/70 transition-all duration-700" />

                {/* Shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/8 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                {/* Top label badge */}
                <div className="absolute top-6 left-6 z-10">
                  <span className="inline-block px-4 py-1.5 border border-white/30 text-white/80 text-[10px] tracking-[0.3em] uppercase font-light backdrop-blur-sm bg-black/20">
                    {cat.label}
                  </span>
                </div>

                {/* Content — bottom */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-6 sm:p-8 md:p-10">
                  {/* Category name */}
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-2 sm:mb-3 tracking-tight leading-tight">
                    {cat.name}
                  </h3>

                  {/* Gold separator line */}
                  <div className="h-px w-8 sm:w-10 bg-gold-400 mb-3 sm:mb-4 transition-all duration-500 group-hover:w-14" />

                  {/* Description */}
                  <p className="text-white/70 text-xs sm:text-sm font-light leading-relaxed mb-4 sm:mb-6 max-w-xs">
                    {cat.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-3 text-gold-400 group-hover:text-gold-300 transition-colors duration-300">
                    <span className="text-xs tracking-[0.2em] uppercase font-light">
                      {t.categories.shopNow}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${dir === 'rtl' ? 'group-hover:-translate-x-1.5' : 'group-hover:translate-x-1.5'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={dir === 'rtl' ? "M7 16l-4-4m0 0l4-4m-4 4h18" : "M17 8l4 4m0 0l-4 4m4-4H3"}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
