"use client";

import { useDispatch, useSelector } from "react-redux";
import { removeFromCart } from "../Redux/slices/CartSlice";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTranslation } from "@/app/components/LocaleProvider";

const page = () => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { hideloading, CartItems, itemsPrice } = useSelector(
    (state: any) => state.Cart
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const RemoveFromCartHandler = (id: number[] & void) => {
    dispatch(removeFromCart(id));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-16">
          <div className="text-center mb-8 md:mb-16">
            <div className="inline-block mb-6">
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">
              {t.cart.pageTitle}
            </h1>
          </div>

          {isClient ? (
            hideloading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-2 border-gold-300 border-t-gold-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-500 font-light">{t.cart.loading}</p>
                </div>
              </div>
            ) : CartItems.length === 0 ? (
              <div className="flex items-center justify-center min-h-[60vh] px-4">
                <div className="max-w-md w-full bg-gradient-to-br from-white via-gold-50/30 to-gold-50/20 backdrop-blur-sm rounded-3xl p-12 md:p-14 shadow-2xl border border-gold-100/50 text-center animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative mx-auto w-32 h-32 mb-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-100/50 to-gold-200/30 rounded-full animate-pulse"></div>
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gold-50 to-gold-100/40 flex items-center justify-center shadow-inner">
                      <svg
                        className="w-16 h-16 text-gold-500"
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

                  <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4 tracking-tight">
                    {t.cart.empty}
                  </h2>
                  <p className="text-gray-600 font-light leading-relaxed mb-10 text-base">
                    {t.cart.emptyDesc}
                  </p>

                  <Link
                    href="/"
                    className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-2xl font-light tracking-wide transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    <span>{t.cart.discoverBtn}</span>
                  </Link>

                  <div className="mt-8 pt-6 border-t border-stone-200/50">
                    <p className="text-xs text-stone-500 font-light">
                      {t.productDetail.freeDelivery} • {t.placeOrder.secure}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Cart items — card list (mobile-first, no table) */}
                <div className="bg-white rounded-2xl border border-gold-200/50 shadow-xl overflow-hidden">
                  {/* Column header — hidden on mobile */}
                  <div className="hidden md:grid md:grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-4 bg-gradient-to-r from-gold-50/50 via-white to-gold-50/30 border-b border-gold-200/50">
                    <span className="text-stone-900 font-light tracking-wider text-sm">{t.admin.perfumes.product}</span>
                    <span className="text-stone-900 font-light tracking-wider text-sm w-20 text-center">{t.cart.qty}</span>
                    <span className="text-stone-900 font-light tracking-wider text-sm w-28 text-center">{t.admin.perfumes.price}</span>
                    <span className="text-stone-900 font-light tracking-wider text-sm w-24 text-center">{t.admin.perfumes.actions}</span>
                  </div>

                  {CartItems.map((item: any) => (
                    <div
                      key={`${item.id}-${item.size || "default"}`}
                      className="flex items-center gap-4 px-4 py-4 md:px-6 md:py-5 border-b border-stone-100 last:border-0 hover:bg-gold-50/20 transition-colors duration-200"
                    >
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={item.Image}
                          width={64}
                          height={64}
                          className="rounded-xl object-cover w-16 h-16 md:w-[60px] md:h-[60px]"
                          alt={item.Name || item.name || t.admin.perfumes.product}
                        />
                      </div>

                      {/* Name + mobile meta */}
                      <div className="flex-1 min-w-0">
                        <p className="font-light text-stone-800 text-sm md:text-base truncate">{item.Name}</p>
                        {/* On mobile: show qty + price inline */}
                        <div className="flex items-center gap-3 mt-1 md:hidden">
                          <span className="text-xs text-stone-500 font-light">{t.cart.qty}: {item.qty}</span>
                          <span className="text-xs text-gold-600 font-light">{itemsPrice} TND</span>
                        </div>
                      </div>

                      {/* Qty — desktop only */}
                      <div className="hidden md:flex w-20 justify-center">
                        <span className="text-stone-700 font-light text-sm">{item.qty}</span>
                      </div>

                      {/* Price — desktop only */}
                      <div className="hidden md:flex w-28 justify-center">
                        <span className="text-gold-600 font-light">{itemsPrice} TND</span>
                      </div>

                      {/* Remove button */}
                      <div className="flex-shrink-0 md:w-24 flex justify-center">
                        <button
                          className="p-2 md:px-4 md:py-2 text-sm font-light text-stone-500 hover:text-gold-600 border border-stone-200 hover:border-gold-400 rounded-xl transition-all duration-200 active:scale-95"
                          onClick={() => RemoveFromCartHandler(item.id)}
                          aria-label={t.cart.remove}
                        >
                          {/* Trash icon on mobile, text on desktop */}
                          <svg className="w-4 h-4 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="hidden md:inline">{t.cart.remove}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order summary */}
                <div className="mt-6 p-5 md:p-8 bg-gradient-to-br from-gold-50/50 via-white to-gold-50/30 rounded-2xl border border-gold-200/50 shadow-xl">
                  <div className="flex items-center justify-between md:justify-end md:gap-4 text-stone-900 font-light mb-6">
                    <span className="text-stone-600 text-sm md:text-base">{t.cart.subtotal}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-stone-500">({CartItems.reduce((a: any, c: any) => a + c.qty, 0)} {t.cart.product})</span>
                      <span className="text-gold-600 font-normal text-xl md:text-2xl">{itemsPrice} TND</span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white px-8 py-4 md:py-5 cursor-pointer rounded-xl md:rounded-2xl font-light text-base md:text-lg tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                    onClick={() => router.push("/Shipping")}
                  >
                    {t.cart.proceedBtn}
                  </button>
                </div>
              </>
            )
          ) : (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-10 h-10 border-2 border-gold-300 border-t-gold-600 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default page;
