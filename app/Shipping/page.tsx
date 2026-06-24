"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { saveShippingAddress, setPromoCode, clearPromoCode, clearCart } from "../Redux/slices/CartSlice";
import { useSession } from "next-auth/react";
import Checkout from "../components/Checkout";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useTranslation } from "@/app/components/LocaleProvider";

const Shipping = () => {
  const { t } = useTranslation();
  //React Hook Form
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm();
  //
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const { shippingAddress, appliedPromoCode, promoCodeId, CartItems, itemsPrice, shippingPrice, totalPrice } = useSelector(
    (state: any) => state.Cart
  );

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const promoDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Returns the validated promo data on success, or null on failure.
  const handleApplyPromo = async (val?: string): Promise<{ code: string; promoCodeId: string } | null> => {
    const code = (val ?? promoInput).trim();
    if (!code) return null;
    // Cancel any pending debounce when called explicitly
    if (promoDebounceRef.current) {
      clearTimeout(promoDebounceRef.current);
      promoDebounceRef.current = null;
    }
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch(
        `/api/promo/validate?code=${encodeURIComponent(code.toUpperCase())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error || t.shipping.promoInvalid);
        return null;
      } else {
        dispatch(
          setPromoCode({
            code: data.code,
            promoCodeId: data.promoCodeId,
          })
        );
        setPromoInput("");
        return { code: data.code, promoCodeId: data.promoCodeId };
      }
    } catch {
      setPromoError(t.shipping.promoError);
      return null;
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => {
    setValue("fullName", shippingAddress?.fullName);
    setValue("email", shippingAddress?.email || session?.user?.email || "");
    setValue("phone", shippingAddress?.phone);
    setValue("address", shippingAddress?.address);
    setValue("city", shippingAddress?.city);
    setValue("gouvernorat", shippingAddress?.gouvernorat);
    setValue("postalCode", shippingAddress?.postalCode);
    setValue("notes", shippingAddress?.notes);
  }, [setValue, shippingAddress, session]);

  const submitHandler = async ({
    fullName,
    email,
    phone,
    address,
    city,
    gouvernorat,
    postalCode,
    notes,
  }: void & any) => {
    if (isSubmitting) return;

    // If user typed a promo code but hasn't applied it yet (e.g. submitted before debounce fired),
    // apply it synchronously now and capture the result — closure values would be stale otherwise.
    let resolvedPromoCode = appliedPromoCode;
    let resolvedPromoCodeId = promoCodeId;
    if (promoInput.trim() && !appliedPromoCode) {
      if (promoDebounceRef.current) {
        clearTimeout(promoDebounceRef.current);
        promoDebounceRef.current = null;
      }
      const promoResult = await handleApplyPromo(promoInput.trim());
      if (promoResult) {
        resolvedPromoCode = promoResult.code;
        resolvedPromoCodeId = promoResult.promoCodeId;
      }
    }

    const shipping = { fullName, email, phone, address, city, gouvernorat, postalCode, notes };
    dispatch(saveShippingAddress(shipping));

    // Compute prices from cart items directly to avoid stale Redux state
    const computedItemsPrice = CartItems.reduce(
      (acc: number, item: any) => acc + (item.Price || item.price || 0) * item.qty,
      0
    );
    const computedShipping = 0;
    const computedTotal = computedItemsPrice + computedShipping;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: CartItems,
          shippingAddress: shipping,
          itemsPrice: computedItemsPrice.toFixed(2),
          shippingPrice: computedShipping,
          totalPrice: computedTotal.toFixed(2),
          promoCodeId: resolvedPromoCodeId || null,
          appliedPromoCode: resolvedPromoCode || null,
          guestEmail: email || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(clearCart());
        setOrderSuccess(true);
        setIsSubmitting(false);
      } else {
        setSubmitError(data.error || data.details || t.common.error);
        setIsSubmitting(false);
      }
    } catch {
      setSubmitError(t.placeOrder?.connectionError || t.common.error);
      setIsSubmitting(false);
    }
  };



  return (
    <>
    {/* Order Success Modal */}
    {orderSuccess && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />

        {/* Modal */}
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 flex flex-col items-center text-center overflow-hidden">
          {/* Background grain/texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")"}} />

          {/* Gold radial glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-radial from-gold-300/30 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Checkmark icon */}
          <div className="relative mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-400/40">
            <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Decorative line */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-400/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400/60" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-400/60" />
          </div>

          <h2 className="font-serif text-3xl font-light text-stone-900 tracking-wide mb-3">
            Commande confirmée
          </h2>
          <p className="text-stone-500 font-light text-sm leading-relaxed mb-8">
            Votre commande a été passée avec succès.<br />Nous vous contacterons bientôt pour la livraison.
          </p>

          <button
            onClick={() => router.push("/")}
            className="w-full py-4 rounded-2xl font-light text-sm tracking-widest bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-lg shadow-gold-400/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            OK
          </button>
        </div>
      </div>
    )}

    <Navbar/>
    <div className="container mt-10 mb-16">

      <Checkout activeStep={1} />
      <form
        className="mx-auto max-w-screen-md bg-gradient-to-br from-white to-gold-50/20 backdrop-blur-sm rounded-3xl shadow-2xl border border-gold-200/30 p-10 md:p-12"
        onSubmit={handleSubmit(submitHandler)}
      >
        {/* Decorative element */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"></div>
          <div className="w-2 h-2 rounded-full bg-gold-500/50"></div>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent"></div>
        </div>

        <h1 className="text-4xl font-light text-center mt-4 mb-10 text-stone-900 tracking-wide">{t.shipping.title}</h1>

        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-light tracking-wide text-stone-700 mb-2 ltr:text-left rtl:text-right">
              {t.shipping.fullName} <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all ltr:text-left rtl:text-right"
              id="fullName"
              autoFocus
              {...register("fullName", {
                required: t.shipping.errors.fullName,
              })}
            />
            {errors.fullName && (
              <div className="text-red-500 text-sm mt-1 ltr:text-left rtl:text-right">{errors.fullName.message as string}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-light tracking-wide text-stone-700 mb-2 ltr:text-left rtl:text-right">
              {t.shipping.email} <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
              id="email"
              type="email"
              dir="ltr"
              {...register("email", {
                required: t.shipping.errors.email,
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t.shipping.errors.email,
                },
              })}
            />
            {errors.email && (
              <div className="text-red-500 text-sm mt-1 ltr:text-left rtl:text-right">{errors.email.message as string}</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-light tracking-wide text-stone-700 mb-2 ltr:text-left rtl:text-right">
              {t.shipping.phone} <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
              id="phone"
              type="tel"
              dir="ltr"
              {...register("phone", {
                required: t.shipping.errors.phone,
                pattern: {
                  value: /^[0-9\s\-\+\(\)]+$/,
                  message: t.shipping.errors.phoneInvalid
                }
              })}
            />
            {errors.phone && (
              <div className="text-red-500 text-sm mt-1 ltr:text-left rtl:text-right">{errors.phone.message as string}</div>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-light tracking-wide text-stone-700 mb-2 ltr:text-left rtl:text-right">
              {t.shipping.address} <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all ltr:text-left rtl:text-right"
              id="address"
              {...register("address", {
                required: t.shipping.errors.address,
                minLength: {
                  value: 3,
                  message: t.shipping.errors.addressMin,
                },
              })}
            />
            {errors.address && (
              <div className="text-red-500 text-sm mt-1 ltr:text-left rtl:text-right">{errors.address.message as string}</div>
            )}
          </div>

          {/* City & Gouvernorat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="city" className="block text-sm font-light tracking-wide text-stone-700 mb-2 ltr:text-left rtl:text-right">
                {t.shipping.city} <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all ltr:text-left rtl:text-right"
                id="city"
                {...register("city", {
                  required: t.shipping.errors.city,
                })}
              />
              {errors.city && (
                <div className="text-red-500 text-sm mt-1 ltr:text-left rtl:text-right">{errors.city.message as string}</div>
              )}
            </div>

            <div>
              <label htmlFor="gouvernorat" className="block text-sm font-light tracking-wide text-stone-700 mb-2 ltr:text-left rtl:text-right">
                {t.shipping.gouvernorat} <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all bg-white ltr:text-left rtl:text-right"
                id="gouvernorat"
                {...register("gouvernorat", {
                  required: t.shipping.errors.gouvernorat,
                })}
              >
                <option value="">{t.shipping.selectGouvernorat}</option>
                <option value="Tunis">{t.shipping.gouvernorats.Tunis}</option>
                <option value="Ariana">{t.shipping.gouvernorats.Ariana}</option>
                <option value="Ben Arous">{t.shipping.gouvernorats.BenArous}</option>
                <option value="Manouba">{t.shipping.gouvernorats.Manouba}</option>
                <option value="Nabeul">{t.shipping.gouvernorats.Nabeul}</option>
                <option value="Zaghouan">{t.shipping.gouvernorats.Zaghouan}</option>
                <option value="Bizerte">{t.shipping.gouvernorats.Bizerte}</option>
                <option value="Béja">{t.shipping.gouvernorats.Beja}</option>
                <option value="Jendouba">{t.shipping.gouvernorats.Jendouba}</option>
                <option value="Kef">{t.shipping.gouvernorats.Kef}</option>
                <option value="Siliana">{t.shipping.gouvernorats.Siliana}</option>
                <option value="Sousse">{t.shipping.gouvernorats.Sousse}</option>
                <option value="Monastir">{t.shipping.gouvernorats.Monastir}</option>
                <option value="Mahdia">{t.shipping.gouvernorats.Mahdia}</option>
                <option value="Sfax">{t.shipping.gouvernorats.Sfax}</option>
                <option value="Kairouan">{t.shipping.gouvernorats.Kairouan}</option>
                <option value="Kasserine">{t.shipping.gouvernorats.Kasserine}</option>
                <option value="Sidi Bouzid">{t.shipping.gouvernorats.SidiBouzid}</option>
                <option value="Gabès">{t.shipping.gouvernorats.Gabes}</option>
                <option value="Medenine">{t.shipping.gouvernorats.Medenine}</option>
                <option value="Tataouine">{t.shipping.gouvernorats.Tataouine}</option>
                <option value="Gafsa">{t.shipping.gouvernorats.Gafsa}</option>
                <option value="Tozeur">{t.shipping.gouvernorats.Tozeur}</option>
                <option value="Kebili">{t.shipping.gouvernorats.Kebili}</option>
              </select>
              {errors.gouvernorat && (
                <div className="text-red-500 text-sm mt-1 ltr:text-left rtl:text-right">{errors.gouvernorat.message as string}</div>
              )}
            </div>
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-light tracking-wide text-stone-700 mb-2 ltr:text-left rtl:text-right">
              {t.shipping.postalCode}
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
              id="postalCode"
              dir="ltr"
              {...register("postalCode")}
            />
          </div>

          {/* Delivery Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-light tracking-wide text-stone-700 mb-2 ltr:text-left rtl:text-right">
              {t.shipping.notes}
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all resize-none ltr:text-left rtl:text-right"
              id="notes"
              rows={3}
              placeholder={t.shipping.notesPlaceholder}
              {...register("notes")}
            />
          </div>
        </div>

          {/* Promo Code Section */}
          <div className="border-t border-stone-200/50 pt-6">
            <label className="block text-sm font-light tracking-wide text-stone-700 mb-2 ltr:text-left rtl:text-right">
              {t.shipping.promoCode}
            </label>
            {appliedPromoCode ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
                <button
                  type="button"
                  onClick={() => dispatch(clearPromoCode())}
                  className="text-red-500 text-sm hover:text-red-700 transition-colors"
                >
                  {t.shipping.promoRemove}
                </button>
                <div className="ltr:text-left rtl:text-right">
                  <p className="font-medium text-green-800 tracking-widest">{appliedPromoCode}</p>
                    <p className="text-sm text-green-600 font-light">{t.shipping.promoApplied}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setPromoInput(val);
                      setPromoError("");
                      if (promoDebounceRef.current) clearTimeout(promoDebounceRef.current);
                      if (val.trim()) {
                        promoDebounceRef.current = setTimeout(() => handleApplyPromo(val), 800);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyPromo();
                      }
                    }}
                    placeholder={t.shipping.promoPlaceholder}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all tracking-widest uppercase"
                  />
                  {promoLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyPromo()}
                  disabled={promoLoading || !promoInput.trim()}
                  className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-900 disabled:bg-stone-300 text-white text-sm font-light tracking-wide transition-colors whitespace-nowrap"
                >
                  {promoLoading ? (t.shipping.promoApplying || "...") : (t.shipping.promoApply || "Apply")}
                </button>
              </div>
            )}
            {promoError && (
              <p className="text-red-500 text-sm mt-1 ltr:text-left rtl:text-right">{promoError}</p>
            )}
          </div>

        {submitError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {submitError}
          </div>
        )}

        <div className="mt-6">
          <button
            disabled={isSubmitting}
            className="w-full py-5 rounded-2xl font-light text-lg tracking-wide bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-stone-300 disabled:to-stone-400 text-white shadow-xl shadow-gold-400/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t.placeOrder?.processing || "..."}
              </>
            ) : (
              t.shipping.continueBtn
            )}
          </button>
        </div>
      </form>
    </div>
    <Footer/>
    </>
  );
};

export default Shipping;
