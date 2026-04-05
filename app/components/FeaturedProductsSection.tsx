"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/app/components/product/ProductCard";
import { useTranslation } from "@/app/components/LocaleProvider";

interface Product {
  $id: string;
  name: string;
  brand: string;
  price: number;
  images: string[];
  isInStock: string;
  category: string;
}

const DISPLAY_LIMIT = 8;

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-50" />
      <div className="p-4 space-y-2.5">
        <div className="h-2.5 w-16 bg-stone-100 rounded-full" />
        <div className="h-3.5 w-3/4 bg-stone-100 rounded-full" />
        <div className="h-3 w-1/3 bg-stone-100 rounded-full" />
        <div className="flex justify-between items-center pt-2 border-t border-stone-50">
          <div className="h-px w-6 bg-stone-100" />
          <div className="h-4 w-20 bg-stone-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProductsSection() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/perfumes");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProducts((data.data || data.documents || []).slice(0, DISPLAY_LIMIT));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background — warm stone, textured */}
      <div className="absolute inset-0 bg-[#faf9f7]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(212,175,55,0.07),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(212,175,55,0.05),transparent)]" />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: "radial-gradient(circle, #78716c 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">

        {/* ── Section Header ── */}
        <header className="mb-12 md:mb-20 text-center">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-10 sm:w-14 bg-gradient-to-r from-transparent to-gold-400" />
            <span className="text-gold-600 text-[10px] sm:text-xs tracking-[0.3em] sm:tracking-[0.35em] uppercase font-light">
              {t.featuredProducts.eyebrow}
            </span>
            <div className="h-px w-10 sm:w-14 bg-gradient-to-l from-transparent to-gold-400" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 tracking-tight">
            {t.featuredProducts.title}{" "}
            <span className="font-serif italic text-gold-600">
              {t.featuredProducts.titleHighlight}
            </span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-light px-2">
            {t.featuredProducts.subtitle}
          </p>
        </header>

        {/* ── Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {Array.from({ length: DISPLAY_LIMIT }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-stone-400 font-light">{t.featuredProducts.error}</p>
          </div>
        ) : products.length === 0 ? null : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {products.map((product, i) => (
              <div
                key={product.$id}
                className="opacity-0 animate-[fadeSlideUp_0.5s_ease_forwards]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <ProductCard
                  id={product.$id}
                  name={product.name}
                  brand={product.brand}
                  price={product.price}
                  images={product.images}
                  isInStock={product.isInStock === "true"}
                  category={product.category}
                />
              </div>
            ))}
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
