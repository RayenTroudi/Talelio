"use client";

import { useDispatch, useSelector } from "react-redux";
import { toggleCartSidebar, removeFromCart } from "../Redux/slices/CartSlice";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/app/components/LocaleProvider";

export default function CartSidebar() {
  const dispatch = useDispatch();
  const { showSidebar, CartItems, itemsPrice, loading } = useSelector(
    (state: any) => state.Cart
  );
  const { t } = useTranslation();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClose = () => {
    dispatch(toggleCartSidebar());
  };

  const handleRemove = (id: any) => {
    dispatch(removeFromCart(id));
  };

  if (!isClient) return null;

  return (
    <>
      {/* Elegant Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-gray-400/20 backdrop-blur-md transition-all duration-500 z-40 ${
          showSidebar ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Cart Sidebar - Enhanced */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] lg:w-[480px] bg-gradient-to-b from-white via-stone-50/50 to-amber-50/20 shadow-2xl transform transition-all duration-500 ease-out z-50 ${
          showSidebar ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Refined Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-6 border-b border-stone-200/60 bg-white/80 backdrop-blur-sm">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-light text-stone-900 tracking-tight">
              {t.cart.title}
            </h2>
            <p className="text-sm text-stone-500 font-light mt-0.5">
              {CartItems.length} {CartItems.length === 1 ? t.cart.product : t.cart.products}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2.5 hover:bg-stone-100 rounded-full transition-all duration-300 hover:rotate-90"
            aria-label="Fermer le panier"
          >
            <svg
              className="w-5 h-5 text-stone-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Cart Items - Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
                <p className="text-stone-500 font-light text-sm">{t.cart.loading}</p>
              </div>
            </div>
          ) : CartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-in fade-in zoom-in-95 duration-500">
              {/* Elegant Icon Container */}
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-stone-100/40 rounded-full animate-pulse"></div>
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-stone-50 to-amber-50/30 flex items-center justify-center shadow-inner border border-stone-200/30">
                  <svg
                    className="w-16 h-16 text-stone-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>

              {/* Refined Typography */}
              <h3 className="text-2xl font-serif font-light text-stone-900 mb-3 tracking-tight">
                {t.cart.empty}
              </h3>
              <p className="text-sm text-stone-600 font-light leading-relaxed max-w-xs mb-8">
                {t.cart.emptyDesc}
              </p>

              {/* Elegant CTA Button */}
              <button
                onClick={handleClose}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-light tracking-wide transition-all duration-300 shadow-md hover:shadow-lg text-sm"
              >
                <svg
                  className="w-4 h-4 transition-transform group-hover:scale-110 duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                <span>{t.cart.discoverBtn}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {CartItems.map((item: any, index: number) => (
                <div key={`${item.id}-${item.size || ""}`}>
                  <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-4 hover:shadow-lg hover:bg-white transition-all duration-300 border border-stone-100/50">
                    {/* Product Image */}
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white flex-shrink-0 shadow-sm ring-1 ring-stone-200/50">
                        <Image
                          src={item.Image || item.image || "/images/placeholder.jpg"}
                          alt={item.Name || item.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="96px"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-light text-stone-900 mb-1 pr-8 leading-snug">
                          {item.Name || item.name}
                        </h3>
                        <p className="text-xs text-stone-500 font-light uppercase tracking-wide mb-2">
                          {item.Brand || item.brand}
                        </p>
                        {item.size && (
                          <p className="text-xs text-stone-600 font-light mb-3 bg-stone-50 inline-block px-2 py-1 rounded">
                            {item.size}
                          </p>
                        )}
                        
                        {/* Price and Quantity Row */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                          <span className="text-xs font-light text-stone-600 uppercase tracking-wide">
                            Qté: {item.qty}
                          </span>
                          <span className="font-serif text-base text-stone-900">
                            {((item.Price || item.price) * item.qty).toFixed(2)} <span className="text-sm">DT</span>
                          </span>
                        </div>
                      </div>

                      {/* Remove Button - Repositioned */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="absolute top-4 right-4 p-1.5 hover:bg-red-50 rounded-lg transition-all duration-300 group/btn opacity-0 group-hover:opacity-100"
                        aria-label="Retirer l'article"
                      >
                        <svg
                          className="w-4 h-4 text-stone-400 group-hover/btn:text-red-500 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {index < CartItems.length - 1 && (
                    <Separator className="my-3 bg-stone-200/50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Elegant Footer with Summary */}
        {CartItems.length > 0 && (
          <div className="border-t border-stone-200/60 bg-white/90 backdrop-blur-md px-6 sm:px-8 py-6 space-y-5">
            {/* Subtotal */}
            <div className="flex items-baseline justify-between">
              <span className="text-stone-600 font-light text-sm uppercase tracking-wide">{t.cart.subtotal}</span>
              <div className="text-right">
                <span className="text-3xl font-serif font-light text-stone-900">{itemsPrice}</span>
                <span className="text-lg text-stone-600 ml-1.5">DT</span>
              </div>
            </div>

            <Separator className="bg-stone-200/50" />

            {/* Checkout Button */}
            <Link
              href="/Cart"
              onClick={handleClose}
              className="group relative block w-full py-4 text-center rounded-2xl font-light tracking-widest uppercase bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300"
            >
              <span className="relative z-10">{t.cart.checkout}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-stone-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  );
}
