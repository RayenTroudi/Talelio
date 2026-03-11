"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">طلبات رمز الترويج</h1>
        <p className="text-gray-600">مراجعة طلبات رموز الإحالة والموافقة عليها أو رفضها.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "PENDING", "APPROVED", "DENIED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-light transition-colors ${
              filter === f
                ? "bg-amber-500 text-white"
                : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50"
            }`}
          >
            {f === "all" ? "الكل" : (statusLabel[f]?.label || f)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="h-5 w-48 bg-stone-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
            </Card>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center text-gray-500">لا توجد طلبات</Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const ed = earnings[req.userId];
            const isOpen = !!expanded[req.userId];
            const hasRecords = ed && ed.records.length > 0;

            return (
              <Card key={req.$id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1 text-right flex-1">
                    <p className="font-semibold text-gray-900">{req.userName || "—"}</p>
                    <p className="text-sm text-gray-600" dir="ltr">{req.userEmail}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(req.$createdAt).toLocaleDateString("ar-TN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-light ${
                        statusLabel[req.status]?.cls || ""
                      }`}
                    >
                      {statusLabel[req.status]?.label || req.status}
                    </span>

                    {req.status === "APPROVED" && req.promoCode && (
                      <p className="font-mono font-bold tracking-widest text-stone-900 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                        {req.promoCode}
                      </p>
                    )}

                    {req.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!processing}
                          onClick={() => handleAction(req.$id, "deny")}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          {processing === req.$id + "deny" ? "..." : "رفض"}
                        </Button>
                        <Button
                          size="sm"
                          disabled={!!processing}
                          onClick={() => handleAction(req.$id, "approve")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {processing === req.$id + "approve" ? "..." : "موافقة"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                {req.status === "APPROVED" ? (
                  <div className="text-right space-y-3">
                    {/* Summary row + toggle */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleExpanded(req.userId)}
                        disabled={!hasRecords}
                        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                          hasRecords
                            ? "text-amber-600 hover:text-amber-700 cursor-pointer"
                            : "text-gray-400 cursor-default"
                        }`}
                      >
                        <span>
                          {hasRecords
                            ? isOpen
                              ? "▲ إخفاء المشتريات"
                              : `▼ عرض المشتريات (${ed!.records.length})`
                            : "لا توجد مشتريات بعد"}
                        </span>
                      </button>
                      <p className="text-sm text-gray-500">
                        إجمالي العمولات:{" "}
                        <span className="font-semibold text-green-700">
                          {ed === undefined
                            ? "..."
                            : ed.total === null
                            ? "—"
                            : `${ed.total.toFixed(2)} TND`}
                        </span>
                      </p>
                    </div>

                    {/* Buyers dropdown */}
                    {isOpen && hasRecords && (
                      <div className="border border-stone-100 rounded-lg overflow-hidden mt-2">
                        <table className="w-full text-sm">
                          <thead className="bg-stone-50 text-stone-600">
                            <tr>
                              <th className="px-4 py-2 text-right font-medium">المشتري</th>
                              <th className="px-4 py-2 text-right font-medium">التاريخ</th>
                              <th className="px-4 py-2 text-left font-medium">العمولة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {ed!.records.map((rec) => (
                              <tr key={rec.$id} className="hover:bg-stone-50 transition-colors">
                                <td className="px-4 py-3 text-gray-700" dir="ltr">
                                  {rec.buyerEmail || "—"}
                                </td>
                                <td className="px-4 py-3 text-gray-500">
                                  {new Date(rec.$createdAt).toLocaleDateString("ar-TN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </td>
                                <td className="px-4 py-3 text-left font-semibold text-green-700">
                                  {rec.amount.toFixed(2)} {rec.currency}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-right">10% عمولة على كل طلب</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
