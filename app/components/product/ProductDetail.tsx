"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImageUI } from "@/types";
import { useDispatch } from "react-redux";
import { addToCart } from "@/app/Redux/slices/CartSlice";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/app/components/LocaleProvider";

interface ProductDetailProps {
  id: string | number;
  name: string;
  brand: string;
  description?: string;
  basePrice: number;
  images: ProductImageUI[];
  sizes: number[];
  topNotes: Array<{
    name: string;
    image: string;
  }>;
  middleNotes: Array<{
    name: string;
    image: string;
  }>;
  baseNotes: Array<{
    name: string;
    image: string;
  }>;
  rating?: number;
  reviewCount?: number;
  isInStock: boolean;
  maxQuantity?: number;
  isNew?: boolean;
  isOnSale?: boolean;
  originalPrice?: number;
  className?: string;
}

export function ProductDetail({
  id,
  name,
  brand,
  description,
  basePrice,
  images,
  sizes,
  topNotes,
  middleNotes,
  baseNotes,
  rating = 0,
  reviewCount = 0,
  isInStock,
  maxQuantity = 10,
  isNew = false,
  isOnSale = false,
  originalPrice,
  className = "",
}: ProductDetailProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const finalPrice = basePrice;
  const displayPrice = isOnSale && originalPrice ? originalPrice : finalPrice;

  const handleAddToCart = () => {
    if (selectedSize && isInStock) {
      dispatch(addToCart({
        id,
        Name: name,
        Brand: brand,
        Price: finalPrice,
        Image: images[0]?.src || "",
        size: `${selectedSize}ml`,
        qty: quantity,
      }));
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(maxQuantity, prev + delta)));
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-rose-50/20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-stone-600 hover:text-stone-900 transition-colors group"
        >
          <svg 
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">{t.productDetail.backBtn}</span>
        </button>

        {/* Main Product Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-stone-200/50 overflow-hidden">
          
          <div className="grid lg:grid-cols-2 gap-0">
            
            {/* Left - Product Image */}
            <div className="relative bg-gradient-to-br from-stone-100/50 to-amber-50/30 p-12 lg:p-16 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 to-rose-200/20 rounded-full blur-3xl"></div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl shadow-stone-300/40">
                  <Image
                    src={images[0]?.src || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E'}
                    alt={images[0]?.alt || name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
              
              {/* Floating Badges */}
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                {isNew && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-emerald-100/90 text-emerald-700 backdrop-blur-sm shadow-lg">
                    {t.productDetail.newArrival}
                  </span>
                )}
                {isOnSale && (
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-rose-100/90 text-rose-700 backdrop-blur-sm shadow-lg">
                    {t.productDetail.onSale}
                  </span>
                )}
              </div>
            </div>

            {/* Right - Product Details */}
            <div className="p-8 lg:p-12 flex flex-col">
              
              {/* Header */}
              <div className="mb-8">
                <p className="text-base font-serif italic tracking-wide text-amber-600 mb-3">{brand}</p>
                <h1 className="text-4xl lg:text-5xl font-serif font-light text-stone-900 mb-4 leading-tight">{name}</h1>
                {description && (
                  <p className="text-stone-600 leading-relaxed font-light">{description}</p>
                )}
              </div>

              {/* Price */}
              <div className="mb-8 pb-8 border-b border-stone-200">
                <div className="flex items-baseline gap-4">
                  <span className="text-5xl font-serif font-light text-stone-900">
                    {displayPrice.toFixed(2)} {t.productDetail.currency}
                  </span>
                  {isOnSale && originalPrice && (
                    <span className="text-2xl text-stone-400 line-through font-light">
                      {originalPrice.toFixed(2)} {t.productDetail.currency}
                    </span>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-8">
                <label className="block text-sm font-light tracking-wide text-stone-700 mb-4 text-right">
                  {t.productDetail.selectSize}
                </label>
                <div className="flex gap-3 flex-row-reverse">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                        px-6 py-3 rounded-2xl font-light text-sm transition-all duration-300
                        ${selectedSize === size
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-400/30 scale-105'
                          : 'bg-white border-2 border-stone-300 text-stone-700 hover:border-amber-400 hover:shadow-md'
                        }
                      `}
                    >
                      {size}ml
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-sm font-light tracking-wide text-stone-700 mb-4 text-right">
                  {t.productDetail.qty}
                </label>
                <div className="inline-flex items-center bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex-row-reverse">
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= maxQuantity}
                    className="px-6 py-3 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  <span className="px-8 py-3 text-stone-900 font-light border-x border-stone-200 min-w-[80px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="px-6 py-3 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-8 text-right">
                {isInStock ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700">
                  <span className="text-sm font-light">{t.productDetail.inStock}</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-700">
                  <span className="text-sm font-light">{t.productDetail.outOfStock}</span>
                    <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  </div>
                )}
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || !isInStock}
                className="
                  w-full py-5 rounded-2xl font-light text-lg tracking-wide
                  bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xl shadow-amber-500/30
                  hover:from-amber-600 hover:to-amber-700 hover:shadow-2xl hover:shadow-amber-600/40
                  disabled:from-stone-200 disabled:to-stone-300 disabled:text-stone-400 disabled:cursor-not-allowed disabled:shadow-none
                  transition-all duration-300 transform hover:-translate-y-0.5
                "
              >
                {!selectedSize ? t.productDetail.selectSize : t.productDetail.addToCart}
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-stone-200">
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto mb-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-xs text-stone-600 font-light">{t.productDetail.authentic}</p>
                </div>
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto mb-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-xs text-stone-600 font-light">{t.productDetail.freeDelivery}</p>
                </div>
                <div className="text-center">
                  <svg className="w-6 h-6 mx-auto mb-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-xs text-stone-600 font-light">{t.productDetail.guarantee}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fragrance Notes Section */}
          <div className="px-8 lg:px-12 py-16 bg-gradient-to-b from-white to-amber-50/30">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                </div>
                <h2 className="text-4xl font-light text-stone-900 mb-3 tracking-wide">{t.productDetail.fragrance}</h2>
                <p className="text-stone-600 font-light tracking-wide">{t.productDetail.fragranceSubtitle}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Top Notes */}
                <div className="bg-gradient-to-br from-rose-50/50 to-pink-50/30 rounded-3xl p-8 border border-rose-100/50 shadow-lg shadow-rose-100/20 hover:shadow-xl hover:shadow-rose-100/30 transition-all duration-300">
                  <h3 className="text-sm font-light tracking-[0.2em] text-rose-700 mb-6 text-center">{t.productDetail.topNotesLabel}</h3>
                  <div className="space-y-4">
                    {topNotes.map((note, idx) => (
                      <div key={idx} className="flex items-center gap-4 group flex-row-reverse">
                        <span className="text-stone-700 font-light">{note.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Middle Notes */}
                <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 rounded-3xl p-8 border border-amber-100/50 shadow-lg shadow-amber-100/20 hover:shadow-xl hover:shadow-amber-100/30 transition-all duration-300">
                  <h3 className="text-sm font-light tracking-[0.2em] text-amber-700 mb-6 text-center">{t.productDetail.middleNotesLabel}</h3>
                  <div className="space-y-4">
                    {middleNotes.map((note, idx) => (
                      <div key={idx} className="flex items-center gap-4 group flex-row-reverse">
                        <span className="text-stone-700 font-light">{note.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Base Notes */}
                <div className="bg-gradient-to-br from-stone-50/50 to-slate-50/30 rounded-3xl p-8 border border-stone-200/50 shadow-lg shadow-stone-200/20 hover:shadow-xl hover:shadow-stone-200/30 transition-all duration-300">
                  <h3 className="text-sm font-light tracking-[0.2em] text-stone-700 mb-6 text-center">{t.productDetail.baseNotesLabel}</h3>
                  <div className="space-y-4">
                    {baseNotes.map((note, idx) => (
                      <div key={idx} className="flex items-center gap-4 group flex-row-reverse">
                        <span className="text-stone-700 font-light">{note.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;