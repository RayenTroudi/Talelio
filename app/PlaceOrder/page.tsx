"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { clearCart } from "../Redux/slices/CartSlice";
import Checkout from "../components/Checkout";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Toast, useToast } from "@/components/ui/toast";
import { useTranslation } from "@/app/components/LocaleProvider";

const page = () => {
  const { t, dir } = useTranslation();
  const dispatch = useDispatch();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const { toasts, showToast, dismissToast } = useToast();
  const { data: session, status } = useSession();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    CartItems,
    itemsPrice,
    totalPrice,
    shippingPrice,
    shippingAddress,
    hideloading,
    appliedPromoCode,
    promoCodeId,
  } = useSelector((state: any) => state.Cart);

  const router = useRouter();

  useEffect(() => {
    // Don't redirect if order was successfully placed
    if (!orderSuccess && !shippingAddress.address) {
      router.push("/Shipping");
    }
  }, [shippingAddress, router, orderSuccess]);

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log('🛒 Submitting order:', {
        itemCount: CartItems.length,
        totalPrice,
        userEmail: session?.user?.email || shippingAddress.email
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: CartItems,
          shippingAddress,
          itemsPrice,
          shippingPrice,
          totalPrice,
          promoCodeId: promoCodeId || null,
          appliedPromoCode: appliedPromoCode || null,
          guestEmail: shippingAddress.email || null,
        }),
      });

      const data = await response.json();

      console.log('📬 Order response:', {
        ok: response.ok,
        status: response.status,
        data
      });

      if (response.ok) {
        console.log('✅ Order created successfully:', data.orderId);

        // Set success flag to prevent redirect to shipping page
        setOrderSuccess(true);

        // Show elegant success toast
        showToast(t.placeOrder.successToast, {
          description: t.placeOrder.successToastDesc,
          variant: "success"
        });

        // Wait for toast animation, then clear cart and redirect
        setTimeout(() => {
          dispatch(clearCart());
          if (status === 'authenticated') {
            router.push(`/account?orderSuccess=${data.orderId}`);
          } else {
            router.push(`/?orderSuccess=${data.orderId}`);
          }
        }, 1500);

      } else {
        console.error('❌ Order creation failed:', data);

        // Show error toast instead of alert
        showToast(t.placeOrder.errorToast, {
          description: data.error || data.details || t.common.error,
          variant: "error"
        });

        setIsSubmitting(false); // Re-enable button on error
      }
    } catch (error) {
      console.error('❌ Error placing order:', error);

      // Show error toast
      showToast(t.placeOrder.connectionError, {
        description: t.placeOrder.connectionErrorDesc,
        variant: "error"
      });

      alert(t.common.error);
      setIsSubmitting(false); // Re-enable button on error
    }
    // Note: Don't set isSubmitting to false on success - let the redirect happen
  };

  return (
    <>
      {/* Toast Container */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          description={toast.description}
          variant={toast.variant}
          visible={toast.visible}
          onClose={() => dismissToast(toast.id)}
        />
      ))}

      <div>
        <Navbar />
        {isClient ? (
          <>
            {/* ── Sticky bottom bar — mobile only ── */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
              {/* Soft blur backdrop */}
              <div className="absolute inset-0 bg-white/80 backdrop-blur-md border-t border-gold-200/60 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]" />
              <div className="relative flex items-center justify-between gap-4 px-5 py-3">
                {/* Total */}
                <div>
                  <p className="text-xs text-stone-500 font-light tracking-wide">{t.placeOrder.total}</p>
                  <p className="font-serif text-xl text-stone-900 leading-tight">
                    {totalPrice} <span className="text-sm text-stone-600">{t.placeOrder.currency}</span>
                  </p>
                </div>
                {/* CTA */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="group relative flex-shrink-0 flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-light text-sm tracking-widest bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-lg shadow-gold-400/30 disabled:bg-stone-400 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t.placeOrder.processing}
                      </>
                    ) : (
                      <>
                        {t.placeOrder.placeOrderBtn}
                        <svg
                          className={`w-4 h-4 transition-transform ${dir === 'rtl' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          {dir === 'rtl' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          )}
                        </svg>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-l from-gold-900/20 to-gold-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
            </div>

            <div className="min-h-screen bg-gradient-to-br from-stone-50 via-gold-50/20 to-rose-50/10 py-8 sm:py-12 pb-28 lg:pb-12">
              <div className="container mx-auto px-4 max-w-7xl">
                <Checkout activeStep={2} />

                {/* Enhanced Page Title */}
                <div className="text-center mt-8 mb-10">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-stone-900 mb-3 tracking-tight">
                    {t.placeOrder.title}
                  </h1>
                  <p className="text-stone-600 font-light text-sm sm:text-base">
                    {t.placeOrder.subtitle}
                  </p>
                </div>

                {hideloading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center space-y-3">
                      <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
                      <p className="text-stone-500 font-light">{t.common.loading}</p>
                    </div>
                  </div>
                ) : CartItems.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="max-w-md mx-auto bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
                      <svg className="w-16 h-16 text-stone-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p className="text-stone-900 font-serif text-xl mb-3">{t.placeOrder.emptyCart}</p>
                      <p className="text-stone-600 mb-6 font-light">{t.placeOrder.emptyCartDesc}</p>
                      <Link href="/" className="inline-block px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white rounded-2xl transition-colors font-light tracking-wide">
                        {t.placeOrder.continueShopping}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column - Order Details (2 columns on desktop) */}
                    <div className="lg:col-span-2 space-y-6">

                      {/* Shipping Address Card */}
                      <Card className="bg-white/70 backdrop-blur-sm border-stone-200/60 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
                        <div className="p-6 sm:p-8">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-gold-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </div>
                              <h2 className="text-xl sm:text-2xl font-serif font-light text-stone-900">
                                {t.placeOrder.shippingAddress}
                              </h2>
                            </div>
                            <Link
                              href="/Shipping"
                              className="text-sm text-stone-600 hover:text-stone-900 font-light underline decoration-dotted underline-offset-4 hover:decoration-solid transition-all"
                            >
                              {t.placeOrder.editAddress}
                            </Link>
                          </div>

                          <div className="bg-stone-50/50 rounded-2xl p-5 space-y-2 text-right">
                            <p className="font-medium text-stone-900 text-lg">{shippingAddress.fullName}</p>
                            {shippingAddress.email && (
                              <p className="text-stone-700 flex items-center gap-2 justify-start">
                                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span dir="ltr">{shippingAddress.email}</span>
                              </p>
                            )}
                            {shippingAddress.phone && (
                              <p className="text-stone-700 flex items-center gap-2 justify-start">
                                <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span dir="ltr">{shippingAddress.phone}</span>
                              </p>
                            )}
                            <Separator className="my-3 bg-stone-200/50" />
                            <p className="text-stone-700 leading-relaxed">{shippingAddress.address}</p>
                            <p className="text-stone-700">
                              {shippingAddress.city}، <span className="font-medium">{shippingAddress.gouvernorat}</span> {shippingAddress.postalCode}
                            </p>
                            {shippingAddress.notes && (
                              <>
                                <Separator className="my-3 bg-stone-200/50" />
                                <div className="bg-gold-50/50 rounded-xl p-3 border border-gold-100">
                                  <p className="text-xs text-stone-600 font-light italic leading-relaxed">
                                    <span className="font-medium not-italic">{t.placeOrder.note}:</span> {shippingAddress.notes}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>

                      {/* Order Items Card */}
                      <Card className="bg-white/70 backdrop-blur-sm border-stone-200/60 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
                        <div className="p-6 sm:p-8">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-serif font-light text-stone-900">
                              {t.placeOrder.orderedItems}
                            </h2>
                          </div>

                          <div className="space-y-4">
                            {CartItems.map((item: any, index: number) => (
                              <div key={`${item.id}-${item.size || ""}`}>
                                <div className="flex gap-4 sm:gap-5">
                                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0 shadow-md ring-1 ring-stone-200/50">
                                    <Image
                                      src={item.Image || "/images/placeholder.jpg"}
                                      alt={item.Name || item.name}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 640px) 80px, 96px"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-light text-stone-900 text-base sm:text-lg leading-snug mb-1">
                                      {item.Name || item.name}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-stone-500 font-light uppercase tracking-wide mb-2">
                                      {item.Brand || item.brand}
                                    </p>
                                    {item.size && (
                                      <span className="inline-block text-xs text-stone-600 font-light bg-stone-100 px-2.5 py-1 rounded-lg">
                                        {item.size}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-right flex flex-col justify-between">
                                    <p className="text-xs sm:text-sm text-stone-600 font-light">{t.placeOrder.qty}: {item.qty}</p>
                                    <p className="font-serif text-base sm:text-lg text-stone-900">
                                      {((item.Price || item.price) * item.qty).toFixed(2)} <span className="text-sm">{t.placeOrder.currency}</span>
                                    </p>
                                  </div>
                                </div>
                                {index < CartItems.length - 1 && (
                                  <Separator className="my-4 bg-stone-200/50" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>

                      {/* Payment Method Card */}
                      <Card className="bg-white/70 backdrop-blur-sm border-stone-200/60 shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden">
                        <div className="p-6 sm:p-8">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-serif font-light text-stone-900">
                              {t.placeOrder.paymentMethod}
                            </h2>
                          </div>

                          <div className="flex items-center gap-4 bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50">
                            <div className="text-right flex-1">
                              <p className="font-medium text-stone-900 mb-1">{t.placeOrder.cashOnDelivery}</p>
                              <p className="text-sm text-stone-600 font-light leading-relaxed">
                                {t.placeOrder.cashOnDeliveryDesc}
                              </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Delivery Info Banner */}
                      <div className="bg-gradient-to-br from-gold-50 via-gold-100/30 to-gold-50/20 backdrop-blur-sm rounded-3xl p-6 shadow-md border border-gold-200/50">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 text-right">
                            <p className="font-medium text-stone-900 mb-2 text-base">
                              {t.placeOrder.estimatedDelivery}
                            </p>
                            <p className="text-sm text-stone-700 font-light leading-relaxed">
                              {t.placeOrder.deliveryDays}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-gold-200/50 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-gold-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column - Order Summary (Sticky) */}
                    <div className="lg:col-span-1">
                      <div className="lg:sticky lg:top-24">
                        <Card className="bg-gradient-to-br from-white via-stone-50/50 to-gold-50/30 backdrop-blur-sm border-stone-200/60 shadow-xl rounded-3xl overflow-hidden">
                          <div className="p-6 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-serif font-light text-stone-900 mb-6 text-center">
                              {t.placeOrder.orderSummary}
                            </h2>

                            {/* ── CTA at top — always visible ── */}
                            <button
                              onClick={handlePlaceOrder}
                              disabled={isSubmitting}
                              className="group relative w-full py-5 rounded-2xl font-light text-base tracking-widest bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-xl hover:shadow-2xl disabled:bg-stone-400 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden mb-6"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-3">
                                {isSubmitting ? (
                                  <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    {t.placeOrder.processing}
                                  </>
                                ) : (
                                  <>
                                    {t.placeOrder.placeOrderBtn}
                                    <svg
                                      className={`w-5 h-5 transition-transform ${dir === 'rtl' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`}
                                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                      {dir === 'rtl' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                                      ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                      )}
                                    </svg>
                                  </>
                                )}
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-l from-gold-900/20 to-gold-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>

                            <Separator className="mb-6 bg-stone-200/70" />

                            {/* Price breakdown */}
                            <div className="space-y-4 mb-6">
                              <div className="flex justify-between items-baseline text-stone-700">
                                <span className="font-light text-sm">{t.placeOrder.subtotal}</span>
                                <span className="font-serif text-lg">{itemsPrice} <span className="text-sm">{t.placeOrder.currency}</span></span>
                              </div>

                              <div className="flex justify-between items-baseline text-stone-700">
                                <span className="font-light text-sm">{t.placeOrder.shipping}</span>
                                {shippingPrice > 0 ? (
                                  <span className="font-serif text-lg">{shippingPrice} <span className="text-sm">{t.placeOrder.currency}</span></span>
                                ) : (
                                  <span className="text-emerald-700 font-medium text-sm bg-emerald-50 px-3 py-1 rounded-full">
                                    {t.placeOrder.free}
                                  </span>
                                )}
                              </div>

                              <Separator className="bg-stone-300/50" />

                              <div className="flex justify-between items-baseline pt-1">
                                <span className="text-stone-900 font-serif text-base">{t.placeOrder.total}</span>
                                <div>
                                  <span className="text-stone-900 font-serif text-2xl sm:text-3xl">{totalPrice}</span>
                                  <span className="text-stone-600 text-lg mx-1">{t.placeOrder.currency}</span>
                                </div>
                              </div>
                            </div>

                            {/* Terms */}
                            <p className="text-xs text-center text-stone-500 font-light leading-relaxed px-2">
                              {t.placeOrder.termsText}{" "}
                              <Link href="/terms" className="underline hover:text-stone-900">
                                {t.placeOrder.terms}
                              </Link>
                            </p>

                            {/* Security badges */}
                            <div className="mt-5 pt-5 border-t border-stone-200/60">
                              <div className="flex items-center justify-center gap-6 text-stone-400">
                                <div className="flex flex-col items-center gap-1">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-xs font-light">{t.placeOrder.secure}</span>
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-xs font-light">{t.placeOrder.trusted}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-900 rounded-full animate-spin mx-auto"></div>
              <span className="text-stone-600 font-light">Chargement...</span>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default page;
