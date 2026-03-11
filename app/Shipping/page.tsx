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

const Shipping = () => {
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
        setPromoError(data.error || "رمز الإحالة غير صالح");
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
      setPromoError("حدث خطأ. يرجى المحاولة مرة أخرى.");
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
        className="mx-auto max-w-screen-md bg-gradient-to-br from-white to-amber-50/20 backdrop-blur-sm rounded-3xl shadow-2xl border border-amber-200/30 p-10 md:p-12"
        onSubmit={handleSubmit(submitHandler)}
      >
        {/* Decorative element */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
          <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
          <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        </div>
        
        <h1 className="text-4xl font-light text-center mt-4 mb-10 text-stone-900 tracking-wide">عنوان التوصيل</h1>
        
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all text-right"
              id="fullName"
              autoFocus
              {...register("fullName", {
                required: "يرجى إدخال اسمك الكامل",
              })}
            />
            {errors.fullName && (
              <div className="text-red-500 text-sm mt-1 text-right">{errors.fullName.message}</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all"
              id="phone"
              type="tel"
              dir="ltr"
              {...register("phone", {
                required: "يرجى إدخال رقم هاتفك",
                pattern: {
                  value: /^[0-9\s\-\+\(\)]+$/,
                  message: "يرجى إدخال رقم هاتف صالح"
                }
              })}
            />
            {errors.phone && (
              <div className="text-red-500 text-sm mt-1 text-right">{errors.phone.message}</div>
            )}
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
              عنوان الشارع <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all text-right"
              id="address"
              {...register("address", {
                required: "يرجى إدخال عنوانك",
                minLength: {
                  value: 3,
                  message: "يجب أن يكون العنوان 3 أحرف على الأقل",
                },
              })}
            />
            {errors.address && (
              <div className="text-red-500 text-sm mt-1 text-right">{errors.address.message}</div>
            )}
          </div>

          {/* City & Gouvernorat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="city" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
                المدينة <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all text-right"
                id="city"
                {...register("city", {
                  required: "يرجى إدخال مدينتك",
                })}
              />
              {errors.city && (
                <div className="text-red-500 text-sm mt-1 text-right">{errors.city.message}</div>
              )}
            </div>

            <div>
              <label htmlFor="gouvernorat" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
                الولاية <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all bg-white text-right"
                id="gouvernorat"
                {...register("gouvernorat", {
                  required: "يرجى اختيار ولايتك",
                })}
              >
                <option value="">اختر الولاية</option>
                <option value="Tunis">تونس</option>
                <option value="Ariana">أريانة</option>
                <option value="Ben Arous">بن عروس</option>
                <option value="Manouba">منوبة</option>
                <option value="Nabeul">نابل</option>
                <option value="Zaghouan">زغوان</option>
                <option value="Bizerte">بنزرت</option>
                <option value="Béja">باجة</option>
                <option value="Jendouba">جندوبة</option>
                <option value="Kef">الكاف</option>
                <option value="Siliana">سليانة</option>
                <option value="Sousse">سوسة</option>
                <option value="Monastir">المنستير</option>
                <option value="Mahdia">المهدية</option>
                <option value="Sfax">صفاقس</option>
                <option value="Kairouan">القيروان</option>
                <option value="Kasserine">القصرين</option>
                <option value="Sidi Bouzid">سيدي بوزيد</option>
                <option value="Gabès">قابس</option>
                <option value="Medenine">مدنين</option>
                <option value="Tataouine">تطاوين</option>
                <option value="Gafsa">قفصة</option>
                <option value="Tozeur">توزر</option>
                <option value="Kebili">قبلي</option>
              </select>
              {errors.gouvernorat && (
                <div className="text-red-500 text-sm mt-1 text-right">{errors.gouvernorat.message}</div>
              )}
            </div>
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
              الرمز البريدي
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
              ملاحظات التوصيل (اختياري)
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all resize-none text-right"
              id="notes"
              rows={3}
              placeholder="أي تعليمات خاصة للتوصيل..."
              {...register("notes")}
            />
          </div>
        </div>

          {/* Promo Code Section */}
          {session ? (
            <div className="border-t border-stone-200/50 pt-6">
              <label className="block text-sm font-light tracking-wide text-stone-700 mb-2 text-right">
                رمز الإحالة (اختياري)
              </label>
              {appliedPromoCode ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
                  <button
                    type="button"
                    onClick={() => dispatch(clearPromoCode())}
                    className="text-red-500 text-sm hover:text-red-700 transition-colors"
                  >
                    إزالة
                  </button>
                  <div className="text-right">
                    <p className="font-medium text-green-800 tracking-widest">{appliedPromoCode}</p>
                      <p className="text-sm text-green-600 font-light">تم تطبيق رمز الإحالة ✔️</p>
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
                    placeholder="أدخل رمز الإحالة"
                    className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200 transition-all tracking-widest uppercase"
                  />
                  <button
                    type="button"
                    disabled={promoLoading || !promoInput.trim()}
                    onClick={handleApplyPromo}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white font-light text-sm transition-colors whitespace-nowrap"
                  >
                    {promoLoading ? "..." : "تطبيق"}
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-red-500 text-sm mt-1 text-right">{promoError}</p>
              )}
            </div>
          ) : null}

        <div className="mt-10">
          <button className="w-full py-5 rounded-2xl font-light text-lg tracking-wide bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-xl shadow-amber-400/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5">
            متابعة لمراجعة الطلب
          </button>
        </div>
      </form>
    </div>
    <Footer/>
    </>
  );
};

export default Shipping;
