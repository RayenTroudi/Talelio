"use client";

import { useState, useEffect, useRef } from "react";

interface EarningRecord {
  $id: string;
  $createdAt: string;
  orderId: string;
  buyerEmail: string;
  amount: number;
  currency: string;
}

interface CommissionsData {
  total: number;
  records: EarningRecord[];
  promoCode: string;
  isPaid: boolean;
}

export default function CommissionsPanel({ userId }: { userId: string }) {
  const [data, setData] = useState<CommissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get promo request (to get promoCode + isPaid)
      const reqRes = await fetch("/api/promo/request");
      const reqData = await reqRes.json();
      const promoReq = reqData.promoRequest;

      if (!promoReq || promoReq.status !== "APPROVED") {
        setData(null);
        return;
      }

      // Get earnings
      const earningsRes = await fetch(
        `/api/promo/earnings`
      );
      const earningsData = await earningsRes.json();

      setData({
        promoCode: promoReq.promoCode || "",
        isPaid: promoReq.isPaid || false,
        total: earningsData.total || 0,
        records: earningsData.records || [],
      });
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Not approved — render nothing
  if (!loading && !data) return null;

  const hasEarnings = data && data.records.length > 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className={`relative group p-2 rounded-xl transition-all duration-200 ${
          hasEarnings ? "hover:bg-amber-50" : "hover:bg-gray-50"
        }`}
        aria-label="عمولاتي"
        title="عمولاتي"
      >
        <span
          className={`text-[15px] font-bold tracking-tight leading-none select-none ${
            hasEarnings
              ? "text-amber-600 group-hover:text-amber-700"
              : "text-gray-500 group-hover:text-gray-700"
          } transition-colors duration-200`}
        >
          TND
        </span>
        {/* Dot badge when there are earnings */}
        {data && data.total > 0 && (
          <span
            className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
              data.isPaid ? "bg-green-500" : "bg-orange-400"
            }`}
          />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute left-0 mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-gradient-to-l from-amber-50 to-white px-5 py-4 border-b border-stone-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 text-sm">عمولات الإحالة</p>
                {data && (
                  <p className="text-xs text-stone-400 mt-0.5 font-mono tracking-widest">
                    {data.promoCode}
                  </p>
                )}
              </div>
              {data && (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    data.isPaid
                      ? "bg-green-50 text-green-700 border-green-200"
                      : data.total > 0
                      ? "bg-orange-50 text-orange-600 border-orange-200"
                      : "bg-stone-50 text-stone-400 border-stone-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      data.isPaid
                        ? "bg-green-500"
                        : data.total > 0
                        ? "bg-orange-400"
                        : "bg-stone-300"
                    }`}
                  />
                  {data.isPaid
                    ? "تم الدفع"
                    : data.total > 0
                    ? "في انتظار الدفع"
                    : "لا توجد عمولات بعد"}
                </span>
              )}
            </div>

            {/* Total */}
            {data && (
              <div className="mt-3 flex items-end gap-1">
                <span className="text-2xl font-bold text-green-700">
                  {data.total.toFixed(2)}
                </span>
                <span className="text-sm text-stone-400 mb-0.5">TND</span>
                <span className="text-xs text-stone-400 mb-0.5 mr-1">إجمالي العمولات</span>
              </div>
            )}
          </div>

          {/* Body */}
          {loading ? (
            <div className="p-5 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-10 bg-stone-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !hasEarnings ? (
            <div className="px-5 py-8 text-center text-stone-400 text-sm">
              <p className="text-2xl mb-2">💰</p>
              <p>لم يستخدم أحد رمزك بعد</p>
              <p className="text-xs mt-1 text-stone-300">شارك رمزك وابدأ في الكسب!</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
              {data!.records.map((rec, idx) => (
                <div key={rec.$id} className="flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate" dir="ltr">
                      {rec.buyerEmail || "—"}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {new Date(rec.$createdAt).toLocaleDateString("ar-TN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="font-semibold text-sm text-green-700 mr-3 shrink-0">
                    +{rec.amount.toFixed(2)} <span className="text-[10px] font-normal text-stone-400">{rec.currency}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {hasEarnings && data && (
            <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-400">{data.records.length} عملية شراء</span>
              <span className="text-xs font-semibold text-green-700">{data.total.toFixed(2)} TND</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
