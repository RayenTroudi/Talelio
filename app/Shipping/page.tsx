"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { saveShippingAddress, setPromoCode, clearPromoCode } from "../Redux/slices/CartSlice";
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
  const { data: session } = useSession();
  const { shippingAddress, appliedPromoCode } = useSelector(
    (state: any) => state.Cart
  );

  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError("");
    try {
      const res = await fetch(
        `/api/promo/validate?code=${encodeURIComponent(promoInput.trim().toUpperCase())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setPromoError(data.error || t.shipping.promoInvalid);
      } else {
        dispatch(
          setPromoCode({
            code: data.code,
            promoCodeId: data.promoCodeId,
          })
        );
        setPromoInput("");
      }
    } catch {
      setPromoError(t.shipping.promoError);
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => {
    setValue("fullName", shippingAddress?.fullName);
    setValue("phone", shippingAddress?.phone);
    setValue("address", shippingAddress?.address);
    setValue("city", shippingAddress?.city);
    setValue("gouvernorat", shippingAddress?.gouvernorat);
    setValue("postalCode", shippingAddress?.postalCode);
    setValue("notes", shippingAddress?.notes);
  }, [setValue, shippingAddress]);

  const submitHandler = ({
    fullName,
    phone,
    address,
    city,
    gouvernorat,
    postalCode,
    notes,
  }: void & any) => {
    dispatch(
      saveShippingAddress({ fullName, phone, address, city, gouvernorat, postalCode, notes })
    );

    router.push("/PlaceOrder");
  };



  return (
    <>
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
            <label htmlFor="fullName" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
              {t.shipping.fullName} <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all text-right"
              id="fullName"
              autoFocus
              {...register("fullName", {
                required: t.shipping.errors.fullName,
              })}
            />
            {errors.fullName && (
              <div className="text-red-500 text-sm mt-1 text-right">{errors.fullName.message as string}</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
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
              <div className="text-red-500 text-sm mt-1 text-right">{errors.phone.message as string}</div>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
              {t.shipping.address} <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all text-right"
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
              <div className="text-red-500 text-sm mt-1 text-right">{errors.address.message as string}</div>
            )}
          </div>

          {/* City & Gouvernorat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="city" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
                {t.shipping.city} <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all text-right"
                id="city"
                {...register("city", {
                  required: t.shipping.errors.city,
                })}
              />
              {errors.city && (
                <div className="text-red-500 text-sm mt-1 text-right">{errors.city.message as string}</div>
              )}
            </div>

            <div>
              <label htmlFor="gouvernorat" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
                {t.shipping.gouvernorat} <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all bg-white text-right"
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
                <div className="text-red-500 text-sm mt-1 text-right">{errors.gouvernorat.message as string}</div>
              )}
            </div>
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
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
            <label htmlFor="notes" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
              {t.shipping.notes}
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all resize-none text-right"
              id="notes"
              rows={3}
              placeholder={t.shipping.notesPlaceholder}
              {...register("notes")}
            />
          </div>
        </div>

          {/* Promo Code Section */}
          {session ? (
            <div className="border-t border-stone-200/50 pt-6">
              <label className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
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
                  <div className="text-right">
                    <p className="font-medium text-green-800 tracking-widest">{appliedPromoCode}</p>
                      <p className="text-sm text-green-600 font-light">{t.shipping.promoApplied}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2" dir="rtl">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value.toUpperCase());
                      setPromoError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyPromo())}
                    placeholder={t.shipping.promoPlaceholder}
                    className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all tracking-widest uppercase"
                  />
                  <button
                    type="button"
                    disabled={promoLoading || !promoInput.trim()}
                    onClick={handleApplyPromo}
                    className="px-5 py-3 rounded-xl bg-gold-500 hover:bg-gold-600 disabled:bg-stone-300 text-white font-light text-sm transition-colors whitespace-nowrap"
                  >
                    {promoLoading ? t.shipping.promoApplying : t.shipping.promoApply}
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-red-500 text-sm mt-1 text-right">{promoError}</p>
              )}
            </div>
          ) : null}

        <div className="mt-10">
          <button className="w-full py-5 rounded-2xl font-light text-lg tracking-wide bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white shadow-xl shadow-gold-400/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5">
            {t.shipping.continueBtn}
          </button>
        </div>
      </form>
    </div>
    <Footer/>
    </>
  );
};

export default Shipping;
