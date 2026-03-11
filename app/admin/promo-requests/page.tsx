"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface PromoRequest {
  $id: string;
  $createdAt: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  promoCode?: string;
}

interface EarningRecord {
  $id: string;
  $createdAt: string;
  orderId: string;
  buyerEmail: string;
  amount: number;
  currency: string;
}

interface EarningsData {
  total: number | null;
  records: EarningRecord[];
}

export default function PromoRequestsPage() {
  const [requests, setRequests] = useState<PromoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "PENDING" | "APPROVED" | "DENIED">("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<Record<string, EarningsData>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      const res = await fetch(`/api/admin/promo-requests?${params}`);
      const data = await res.json();
      if (res.ok) {
        const reqs: PromoRequest[] = data.requests || [];
        setRequests(reqs);
        const approved = reqs.filter((r) => r.status === "APPROVED");
        const map: Record<string, EarningsData> = {};
        await Promise.all(
          approved.map(async (r) => {
            try {
              const er = await fetch(`/api/admin/referral-earnings?ownerUserId=${encodeURIComponent(r.userId)}`);
              const ed = await er.json();
              map[r.userId] = er.ok
                ? { total: ed.total, records: ed.records || [] }
                : { total: null, records: [] };
            } catch {
              map[r.userId] = { total: null, records: [] };
            }
          })
        );
        setEarnings(map);
      }
    } catch (err) {
      console.error("Error fetching promo requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approve" | "deny") => {
    setProcessing(id + action);
    try {
      const res = await fetch(`/api/admin/promo-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.$id === id ? { ...r, ...data.request } : r))
        );
      } else {
        alert(data.error || "فشلت العملية");
      }
    } catch {
      alert("حدث خطأ");
    } finally {
      setProcessing(null);
    }
  };

  const toggleExpanded = (userId: string) =>
    setExpanded((prev) => ({ ...prev, [userId]: !prev[userId] }));

  const statusLabel: Record<string, { label: string; cls: string }> = {
    PENDING: { label: "قيد الانتظار", cls: "bg-yellow-100 text-yellow-800" },
    APPROVED: { label: "موافق عليه", cls: "bg-green-100 text-green-800" },
    DENIED: { label: "مرفوض", cls: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">طلبات رمز الإحالة</h1>
        <p className="text-gray-500 text-sm">مراجعة الطلبات والموافقة عليها أو رفضها</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "PENDING", "APPROVED", "DENIED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {f === "all" ? "الكل" : (statusLabel[f]?.label || f)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                {["المستخدم", "الحالة", "الرمز", "العمولات", "تاريخ الطلب", "إجراء"].map((h) => (
                  <th key={h} className="px-5 py-3 text-right font-medium text-stone-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-stone-100 rounded animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white p-16 text-center text-gray-400">
          لا توجد طلبات
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-5 py-3 text-right font-medium text-stone-500">المستخدم</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">الحالة</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">رمز الإحالة</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">إجمالي العمولات</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">تاريخ الطلب</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {requests.map((req) => {
                const ed = earnings[req.userId];
                const isOpen = !!expanded[req.userId];
                const hasRecords = ed && ed.records.length > 0;

                return (
                  <React.Fragment key={req.$id}>
                    {/* Main row */}
                    <tr className="hover:bg-stone-50 transition-colors">
                      {/* User */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{req.userName || "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5" dir="ltr">{req.userEmail}</p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusLabel[req.status]?.cls || ""}`}>
                          {statusLabel[req.status]?.label || req.status}
                        </span>
                      </td>

                      {/* Promo code */}
                      <td className="px-5 py-4">
                        {req.status === "APPROVED" && req.promoCode ? (
                          <span className="font-mono font-bold tracking-widest text-stone-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 text-xs">
                            {req.promoCode}
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>

                      {/* Earnings */}
                      <td className="px-5 py-4">
                        {req.status === "APPROVED" ? (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-green-700">
                              {ed === undefined ? (
                                <span className="text-stone-300 font-normal">...</span>
                              ) : ed.total === null ? (
                                <span className="text-stone-300 font-normal">—</span>
                              ) : (
                                `${ed.total.toFixed(2)} TND`
                              )}
                            </span>
                            {hasRecords && (
                              <button
                                onClick={() => toggleExpanded(req.userId)}
                                className="text-amber-500 hover:text-amber-600 transition-colors text-xs underline underline-offset-2"
                              >
                                {isOpen ? "إخفاء" : `${ed!.records.length} مشتريات`}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">10% على كل طلب</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-stone-500 text-xs whitespace-nowrap">
                        {new Date(req.$createdAt).toLocaleDateString("ar-TN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        {req.status === "PENDING" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!!processing}
                              onClick={() => handleAction(req.$id, "deny")}
                              className="text-red-600 border-red-200 hover:bg-red-50 h-7 text-xs px-3"
                            >
                              {processing === req.$id + "deny" ? "..." : "رفض"}
                            </Button>
                            <Button
                              size="sm"
                              disabled={!!processing}
                              onClick={() => handleAction(req.$id, "approve")}
                              className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs px-3"
                            >
                              {processing === req.$id + "approve" ? "..." : "موافقة"}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-stone-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded buyers sub-table */}
                    {isOpen && hasRecords && (
                      <tr>
                        <td colSpan={6} className="px-0 py-0 bg-amber-50/40">
                          <div className="px-8 py-4 border-t border-amber-100">
                            <p className="text-xs font-semibold text-amber-700 mb-3 tracking-wide uppercase">
                              تفاصيل المشتريات
                            </p>
                            <table className="w-full text-sm rounded-lg overflow-hidden">
                              <thead>
                                <tr className="bg-white border border-stone-100 rounded-lg">
                                  <th className="px-4 py-2 text-right text-xs font-medium text-stone-500 rounded-tr-lg">#</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">المشتري</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">تاريخ الشراء</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">رقم الطلب</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 rounded-tl-lg">العمولة</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100">
                                {ed!.records.map((rec, idx) => (
                                  <tr key={rec.$id} className="bg-white hover:bg-stone-50 transition-colors">
                                    <td className="px-4 py-2.5 text-stone-400 text-xs">{idx + 1}</td>
                                    <td className="px-4 py-2.5 text-gray-700" dir="ltr">{rec.buyerEmail || "—"}</td>
                                    <td className="px-4 py-2.5 text-stone-500 text-xs">
                                      {new Date(rec.$createdAt).toLocaleDateString("ar-TN", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </td>
                                    <td className="px-4 py-2.5 text-stone-400 text-xs font-mono" dir="ltr">
                                      {rec.orderId.slice(0, 12)}…
                                    </td>
                                    <td className="px-4 py-2.5 text-left font-semibold text-green-700">
                                      +{rec.amount.toFixed(2)} <span className="text-xs font-normal text-stone-400">{rec.currency}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-stone-50 border-t border-stone-200">
                                  <td colSpan={4} className="px-4 py-2 text-xs font-semibold text-stone-500 text-right">
                                    الإجمالي
                                  </td>
                                  <td className="px-4 py-2 text-left font-bold text-green-700">
                                    {ed!.total?.toFixed(2)} <span className="text-xs font-normal text-stone-400">TND</span>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
