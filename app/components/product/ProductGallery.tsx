"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductImageUI } from "@/types";

interface ProductGalleryProps {
  images: ProductImageUI[]; // Uses type-safe UI image interface
  productName: string;
  className?: string;
  showThumbnails?: boolean;
  allowZoom?: boolean;
}

export function ProductGallery({
  images,
  productName,
  className = "",
  showThumbnails = true,
  allowZoom = true,
}: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className={`flex aspect-square items-center justify-center bg-gray-100 ${className}`}>
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  const selectedImage = images[selectedImageIndex];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Image */}
      <div className="group relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl">
        <Image
          src={selectedImage.src}
          alt={selectedImage.alt || productName}
          fill
          className={`object-cover transition-all duration-500 ease-out ${
            isZoomed ? "scale-150" : "scale-100 group-hover:scale-105"
          }`}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
        />
        
        {/* Luxury Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {allowZoom && (
          <button
            className="absolute right-4 top-4 rounded-full bg-white/90 backdrop-blur-sm p-3 text-gray-800 shadow-lg transition-all duration-300 hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
            onClick={() => setIsZoomed(!isZoomed)}
          >
            {isZoomed ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10h-2m-2 0h2m0 0V8m0 2v2" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            )}
          </button>
        )}

        {/* Navigation arrows for multiple images */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/95 backdrop-blur-sm p-3 text-gray-800 shadow-xl transition-all duration-300 hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100 disabled:opacity-30"
              onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/95 backdrop-blur-sm p-3 text-gray-800 shadow-xl transition-all duration-300 hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
              onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={image.id}
              className={`group/thumb relative aspect-square h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl transition-all duration-300 ${
                index === selectedImageIndex
                  ? "ring-3 ring-gray-900 ring-offset-4 shadow-xl scale-105"
                  : "hover:ring-2 hover:ring-gray-400 hover:ring-offset-2 hover:shadow-lg hover:scale-102"
              }`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <Image
                src={image.src}
                alt={image.alt || `${productName} view ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                sizes="96px"
              />
              
              {/* Overlay for non-active thumbnails */}
              <div className={`
                absolute inset-0 transition-all duration-300
                ${index === selectedImageIndex 
                  ? 'bg-transparent' 
                  : 'bg-white/30 group-hover/thumb:bg-white/10'
                }
              `} />
              
              {/* Active Indicator */}
              {index === selectedImageIndex && (
                <div className="absolute top-2 right-2 bg-gray-900 text-white p-1 rounded-full">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Image Caption */}
      <div className="text-center">
        <p className="text-gray-600 font-medium">
          {selectedImage.alt || `${productName} - View ${selectedImageIndex + 1}`}
        </p>
        {images.length > 1 && (
          <p className="text-gray-400 text-sm mt-1">
            Click thumbnails or use arrows to explore more views
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductGallery;