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
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">
              {t.cart.pageTitle}
            </h1>
          </div>

          {isClient ? (
            hideloading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-500 font-light">{t.cart.loading}</p>
                </div>
              </div>
            ) : CartItems.length === 0 ? (
              <div className="flex items-center justify-center min-h-[60vh] px-4">
                <div className="max-w-md w-full bg-gradient-to-br from-white via-amber-50/30 to-amber-50/20 backdrop-blur-sm rounded-3xl p-12 md:p-14 shadow-2xl border border-amber-100/50 text-center animate-in fade-in zoom-in-95 duration-500">
                  <div className="relative mx-auto w-32 h-32 mb-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-amber-200/30 rounded-full animate-pulse"></div>
                    <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-50 to-amber-100/40 flex items-center justify-center shadow-inner">
                      <svg
                        className="w-16 h-16 text-amber-500"
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
                    className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-light tracking-wide transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
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
                <div className="PlaceOrderTable grid gap-8">
                  <div className="overflow-x-auto md:col-span-3">
                    {/****************When Cart Have Items*****************************/}
                    <div className="bg-white rounded-3xl border border-amber-200/50 shadow-xl overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 border-b border-amber-200/50">
                          <tr>
                            <th className="p-6 text-right text-stone-900 font-light tracking-wider">{t.admin.perfumes.product}</th>
                            <th className="p-6 text-right text-stone-900 font-light tracking-wider">{t.cart.qty}</th>
                            <th className="p-6 text-right text-stone-900 font-light tracking-wider">{t.admin.perfumes.price}</th>
                            <th className="p-6 text-center text-stone-900 font-light tracking-wider">{t.admin.perfumes.actions}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {CartItems.map((item: any) => (
                            <tr key={`${item.id}-${item.size || 'default'}`} className="border-b border-stone-100 hover:bg-gradient-to-r hover:from-amber-50/30 hover:to-transparent transition-all duration-300">
                              <td className="p-6">
                                <div className="flex items-center gap-4 flex-row-reverse">
                                  <Image
                                    src={item.Image}
                                    width={60}
                                    height={60}
                                    className="rounded-xl"
                                    alt={item.Name || item.name || t.admin.perfumes.product}
                                  />
                                  <span className="font-light text-stone-800">{item.Name}</span>
                                </div>
                              </td>
                              <td className="p-6 text-right">
                                <div className="text-stone-700 font-light">{t.cart.qty}: {item.qty}</div>
                              </td>
                              <td className="p-6 text-right">
                                <span className="text-amber-600 font-light text-lg">{itemsPrice} TND</span>
                              </td>
                              <td className="p-6 text-center">
                                <button
                                  className="px-6 py-2.5 text-sm font-light text-stone-600 hover:text-amber-600 border border-stone-200 hover:border-amber-600 rounded-xl transition-all duration-300"
                                  onClick={() => RemoveFromCartHandler(item.id)}
                                >
                                  {t.cart.remove}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-8 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 rounded-3xl border border-amber-200/50 shadow-xl">
                  {/***********SubTotal Items**********************/}
                  <div className="text-right text-stone-900 font-light text-xl mb-6">
                    <span className="text-stone-600">{t.cart.subtotal}</span>
                    <span className="mx-3">({CartItems.reduce((a: any, c: any) => a + c.qty, 0)} {t.cart.product})</span>
                    <span className="text-amber-600 font-normal text-2xl">{itemsPrice} TND</span>
                  </div>

                  {/************ Go To Shipping Page**********************/}
                  <div className="flex justify-center mt-8">
                    <button
                      className="w-full max-w-md bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-12 py-5 cursor-pointer rounded-2xl font-light text-lg tracking-wide shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                      onClick={() => router.push("/Shipping")}
                    >
                      {t.cart.proceedBtn}
                    </button>
                  </div>
                </div>
              </>
            )
          ) : (
            <span>{t.cart.loading}</span>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default page;
