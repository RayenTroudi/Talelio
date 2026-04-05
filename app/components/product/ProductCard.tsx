"use client";

import { memo } from 'react';
import Link from 'next/link';
import { ProductThumbnail } from './ProductImage';
import { useTranslation } from "@/app/components/LocaleProvider";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  images: string[] | null | undefined;
  isInStock?: boolean;
  category?: string;
  isOnSale?: boolean;
  isNew?: boolean;
}

const ProductCardComponent = function ProductCard({
  id,
  name,
  brand,
  price,
  images,
  isInStock = true,
  category,
  isOnSale = false,
  isNew = false,
}: ProductCardProps) {
  const { t, dir } = useTranslation();

  return (
    <Link
      href={`/products/${id}`}
      className="group block bg-white overflow-hidden rounded-xl sm:rounded-2xl shadow-md shadow-stone-100 hover:shadow-xl hover:shadow-stone-200/60 transition-all duration-500 hover:-translate-y-1 active:scale-[0.99]"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-gradient-to-br from-stone-50 via-white to-gold-50/30 overflow-hidden">
        <ProductThumbnail
          fileId={images}
          productName={name}
          className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-[900ms]" />

        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
          {isNew && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-light tracking-wide bg-emerald-500 text-white shadow-md">
              {t.productCard.new}
            </span>
          )}
          {isOnSale && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-light tracking-wide bg-rose-500 text-white shadow-md">
              {t.productCard.sale}
            </span>
          )}
          {!isInStock && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-light tracking-wide bg-stone-500 text-white shadow-md">
              {t.productCard.outOfStock}
            </span>
          )}
        </div>

        {/* Quick view label — appears on hover */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400 z-10">
          <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/95 backdrop-blur-sm text-stone-800 text-xs tracking-[0.12em] uppercase font-light shadow-lg rounded-full">
            {t.productCard.viewDetails}
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {dir === 'rtl' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              )}
            </svg>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-5 text-right">
        {/* Brand */}
        <p className="text-[9px] sm:text-[10px] font-light tracking-[0.2em] sm:tracking-[0.25em] uppercase text-stone-400 mb-1.5">
          {brand}
        </p>

        {/* Product name */}
        <h3 className="text-sm sm:text-base font-light text-stone-900 mb-1 line-clamp-2 leading-snug group-hover:text-gold-700 transition-colors duration-300">
          {name}
        </h3>

        {/* Category */}
        {category && (
          <p className="text-[11px] text-stone-400 mb-3 font-light">
            {category === 'Femme'
              ? t.productCard.categoryFemme
              : category === 'Homme'
              ? t.productCard.categoryHomme
              : category}
          </p>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-stone-100">
          {/* Gold accent line */}
          <div className="h-px w-5 sm:w-6 bg-gold-400/50" />
          <span className="text-lg sm:text-xl font-light text-stone-900">
            {price.toFixed(2)}{" "}
            <span className="text-[10px] sm:text-xs text-stone-400">{t.productDetail.currency}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;
