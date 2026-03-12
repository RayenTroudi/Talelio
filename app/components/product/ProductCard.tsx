"use client";

import { memo } from 'react';
import Link from 'next/link';
import { ProductThumbnail } from './ProductImage';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from "@/app/components/LocaleProvider";

/**
 * Product Card Interface
 * Matches Appwrite perfume document structure
 */
interface ProductCardProps {
  /**
   * Product ID (Appwrite document ID)
   */
  id: string;
  
  /**
   * Product name
   */
  name: string;
  
  /**
   * Brand name
   */
  brand: string;
  
  /**
   * Price in currency
   */
  price: number;
  
  /**
   * Appwrite file IDs for product images
   */
  images: string[] | null | undefined;
  
  /**
   * Stock status
   */
  isInStock?: boolean;
  
  /**
   * Optional category
   */
  category?: string;
  
  /**
   * Optional sale indicator
   */
  isOnSale?: boolean;
  
  /**
   * Optional new arrival indicator
   */
  isNew?: boolean;
}

/**
 * ProductCard Component (Memoized for performance)
 * 
 * Displays a product card with:
 * - Product image from Appwrite Storage
 * - Product name, brand, and price
 * - Stock status
 * - Badges (new, sale, out of stock)
 * - Link to product detail page
 * 
 * @example
 * <ProductCard
 *   id="abc123def456"
 *   name="Chanel No. 5"
 *   brand="Chanel"
 *   price={1200}
 *   images={["fileId1", "fileId2"]}
 *   isInStock={true}
 *   isNew={true}
 * />
 */
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
  const { t } = useTranslation();
  return (
    <Card className="group overflow-hidden rounded-3xl border-0 shadow-xl shadow-stone-200/40 hover:shadow-2xl hover:shadow-gold-500/20 transition-all duration-700 bg-white backdrop-blur-sm transform hover:-translate-y-2">
      <Link href={`/products/${id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square bg-gradient-to-br from-gold-50/40 via-white to-gold-50/20 overflow-hidden">
          <ProductThumbnail
            fileId={images}
            productName={name}
            className="w-full h-full transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            {isNew && (
              <span className="inline-flex items-center px-3.5 py-2 rounded-full text-xs font-light bg-emerald-500/95 text-white backdrop-blur-sm shadow-xl tracking-wide">
                {t.productCard.new}
              </span>
            )}
            {isOnSale && (
              <span className="inline-flex items-center px-3.5 py-2 rounded-full text-xs font-light bg-rose-500/95 text-white backdrop-blur-sm shadow-xl tracking-wide">
                {t.productCard.sale}
              </span>
            )}
            {!isInStock && (
              <span className="inline-flex items-center px-3.5 py-2 rounded-full text-xs font-light bg-stone-500/95 text-white backdrop-blur-sm shadow-xl tracking-wide">
                {t.productCard.outOfStock}
              </span>
            )}
          </div>
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gold-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        
        {/* Content */}
        <CardContent className="p-7 text-right">
          {/* Brand */}
          <p className="text-xs font-light tracking-[0.2em] uppercase text-stone-500 mb-3">
            {brand}
          </p>
          
          {/* Product Name */}
          <CardTitle className="text-xl font-light text-stone-900 mb-4 line-clamp-2 leading-snug group-hover:text-gold-700 transition-colors duration-300">
            {name}
          </CardTitle>
          
          {/* Category (optional) */}
          {category && (
            <p className="text-xs text-stone-400 mb-4 font-light">
              {category === 'Femme' ? t.productCard.categoryFemme : category === 'Homme' ? t.productCard.categoryHomme : category}
            </p>
          )}
          
          {/* Decorative line */}
          <div className="h-px w-12 bg-gradient-to-l from-gold-400/40 to-transparent mb-5 mr-auto" />
          
          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <svg 
                className="w-4 h-4 text-gold-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              <span className="text-xs font-light text-gold-700 tracking-wide">{t.productCard.viewDetails}</span>
            </div>
            <span className="text-2xl font-light text-stone-900">
              {price.toFixed(2)} <span className="text-base text-stone-500">{t.productDetail.currency}</span>
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

// Export memoized version to prevent unnecessary re-renders
export const ProductCard = memo(ProductCardComponent);
export default ProductCard;
