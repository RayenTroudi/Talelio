"use client";

import React from "react";
import { useTranslation } from "@/app/components/LocaleProvider";

const BrandShowcase = () => {
  const { t } = useTranslation();

  return (
    <section className="py-32 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.05),transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
          </div>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
            <span className="font-serif italic text-amber-600">{t.brand.sectionTitle}</span> {t.brand.sectionTitleHighlight}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t.brand.sectionSubtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {/* Feature 1 */}
          <div className="group text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-12 h-12 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">{t.brand.feature1Title}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t.brand.feature1Desc}
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-12 h-12 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">{t.brand.feature2Title}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t.brand.feature2Desc}
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-50 to-amber-100/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <svg
                  className="w-12 h-12 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-4">{t.brand.feature3Title}</h3>
            <p className="text-gray-600 leading-relaxed">
              {t.brand.feature3Desc}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 pt-16 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-light text-amber-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                15+
              </div>
              <p className="text-sm text-gray-600 font-light tracking-wide">{t.brand.yearsExperience}</p>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-light text-amber-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                200+
              </div>
              <p className="text-sm text-gray-600 font-light tracking-wide">{t.brand.exclusivePerfumes}</p>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-light text-amber-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                50K+
              </div>
              <p className="text-sm text-gray-600 font-light tracking-wide">{t.brand.happyClients}</p>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-light text-amber-600 mb-2 group-hover:scale-110 transition-transform duration-300">
                98%
              </div>
              <p className="text-sm text-gray-600 font-light tracking-wide">{t.brand.customerSatisfaction}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandShowcase;
