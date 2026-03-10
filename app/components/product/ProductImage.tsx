"use client";

import { useState } from 'react';
import Image from 'next/image';
import { getImageUrlWithFallback } from '@/lib/image-utils';

interface ProductImageProps {
  /**
   * Appwrite file ID or array of file IDs
   * Can be string (single ID), string[] (multiple IDs), or null/undefined
   */
  fileId: string | string[] | null | undefined;
  
  /**
   * Product name for alt text
   */
  productName: string;
  
  /**
   * Image width for Appwrite preview (default: 800)
   */
  width?: number;
  
  /**
   * Image height for Appwrite preview (default: 800)
   */
  height?: number;
  
  /**
   * Optional className for styling
   */
  className?: string;
  
  /**
   * Priority loading for above-the-fold images
   */
  priority?: boolean;
  
  /**
   * Optional object-fit style
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * ProductImage Component
 * 
 * Displays product images from Appwrite Storage with:
 * - Automatic fallback to placeholder
 * - Loading state handling
 * - Error state handling
 * - TypeScript safety (no null/undefined issues)
 * - Optimized with Next.js Image
 * - Support for single or multiple images (shows first)
 * 
 * @example
 * // Single image
 * <ProductImage
 *   fileId="abc123def456"
 *   productName="Chanel No. 5"
 *   priority
 * />
 * 
 * @example
 * // Multiple images (shows first)
 * <ProductImage
 *   fileId={["abc123", "def456", "ghi789"]}
 *   productName="Dior Sauvage"
 *   width={600}
 *   height={600}
 * />
 */
export function ProductImage({
  fileId,
  productName,
  width = 800,
  height = 800,
  className = '',
  priority = false,
  objectFit = 'cover',
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract first file ID if array is provided
  const firstFileId = Array.isArray(fileId) ? fileId[0] : fileId;
  
  // Get image URL with automatic fallback
  // CRITICAL: This must never throw - always returns a valid string (fallback if needed)
  const imageUrl = getImageUrlWithFallback(firstFileId, width, height);
  
  // Check if we're using the API proxy route - if so, disable Next.js optimization
  // to prevent double-encoding of query parameters
  const isApiRoute = imageUrl.startsWith('/api/images/');
  
  // Alt text for accessibility
  const altText = `${productName} - Luxury Perfume`;
  
  return (
    <div 
      className={`relative overflow-hidden group ${className}`}
      suppressHydrationWarning
    >
      {/* Elegant loading skeleton with luxury gradient */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-amber-50/40 to-rose-50/30">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        </div>
      )}
      
      {/* Product Image with elegant transitions */}
      {/* CRITICAL: Image errors are caught here and NEVER propagate to parent components */}
      {/* This ensures DELETE and other UI actions NEVER fail due to image issues */}
      <Image
        src={imageUrl}
        alt={altText}
        fill
        unoptimized={isApiRoute}
        className={`
          object-${objectFit}
          transition-all duration-700 ease-out
          ${isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}
          ${imageError ? 'opacity-40' : ''}
          group-hover:scale-105
        `}
        priority={priority}
        onLoad={() => {
          // Safe state update - never throws
          try { setIsLoading(false); } catch (e) { /* Ignore */ }
        }}
        onError={(e) => {
          // CRITICAL: Catch and suppress all image errors
          // Prevents error propagation to parent components
          try {
            setImageError(true);
            setIsLoading(false);
          } catch (err) { /* Ignore */ }
          // Prevent default error handling
          e.preventDefault?.();
        }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
        quality={90}
      />
      
      {/* Elegant error state for luxury brand */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-stone-50 via-amber-50/20 to-rose-50/10 backdrop-blur-sm">
          <div className="text-center p-6">
            <svg
              className="w-16 h-16 mx-auto mb-3 text-stone-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs text-stone-400 font-light tracking-wide uppercase">Image Unavailable</p>
          </div>
        </div>
      )}
      
      {/* Subtle overlay on hover for interactive feel */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
}

/**
 * ProductThumbnail Component
 * 
 * Simplified component for product cards/listings
 * Shows smaller preview with consistent aspect ratio
 */
interface ProductThumbnailProps {
  fileId: string | string[] | null | undefined;
  productName: string;
  className?: string;
}

export function ProductThumbnail({
  fileId,
  productName,
  className = '',
}: ProductThumbnailProps) {
  // CRITICAL: Wrap in try-catch to ensure thumbnail rendering NEVER crashes parent
  // This is essential for admin actions like DELETE to work even if images fail
  try {
    return (
      <ProductImage
        fileId={fileId}
        productName={productName}
        width={400}
        height={400}
        className={className}
        objectFit="cover"
      />
    );
  } catch (error) {
    // If ProductImage somehow throws, render a safe fallback
    // This ensures DELETE and other UI actions continue to work
    console.warn('ProductThumbnail render error (non-blocking):', error);
    return (
      <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    );
  }
}
