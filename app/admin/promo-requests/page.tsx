"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/app/components/LocaleProvider";

interface PromoRequest {
  $id: string;
  $createdAt: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: "PENDING" | "APPROVED" | "DENIED";
  promoCode?: string;
  isPaid?: boolean;
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
  const [payProcessing, setPayProcessing] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<Record<string, EarningsData>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { t } = useTranslation();

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
        alert(data.error || t.common.error);
      }
    } catch {
      alert(t.common.error);
    } finally {
      setProcessing(null);
    }
  };

  const toggleExpanded = (userId: string) =>
    setExpanded((prev) => ({ ...prev, [userId]: !prev[userId] }));

  const togglePaid = async (req: PromoRequest) => {
    const action = req.isPaid ? "markUnpaid" : "markPaid";
    setPayProcessing(req.$id);
    try {
      const res = await fetch(`/api/admin/promo-requests/${req.$id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.$id === req.$id ? { ...r, isPaid: !req.isPaid } : r))
        );
      } else {
        alert(data.error || t.common.error);
      }
    } catch {
      alert(t.common.error);
    } finally {
      setPayProcessing(null);
    }
  };

  const statusLabel: Record<string, { label: string; cls: string }> = {
    PENDING: { label: t.admin.promoRequests.pending, cls: "bg-yellow-100 text-yellow-800" },
    APPROVED: { label: t.admin.promoRequests.approved, cls: "bg-green-100 text-green-800" },
    DENIED: { label: t.admin.promoRequests.denied, cls: "bg-red-100 text-red-700" },
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">{t.admin.promoRequests.title}</h1>
        <p className="text-gray-500 text-sm">{t.admin.promoRequests.subtitle}</p>
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
            {f === "all" ? t.admin.promoRequests.all : (statusLabel[f]?.label || f)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="rounded-xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                {[
                  t.admin.promoRequests.user,
                  t.admin.promoRequests.status,
                  t.admin.promoRequests.promoCode,
                  t.admin.promoRequests.totalEarnings,
                  t.admin.promoRequests.paymentStatus,
                  t.admin.promoRequests.date,
                  t.admin.promoRequests.amountDue,
                  t.admin.promoRequests.actions,
                ].map((h) => (
                  <th key={h} className="px-5 py-3 text-right font-medium text-stone-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white">
              {[1, 2, 3].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
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
          {t.admin.promoRequests.noRequests}
        </div>
      ) : (
        <div className="rounded-xl border border-stone-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-5 py-3 text-right font-medium text-stone-500">{t.admin.promoRequests.user}</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">{t.admin.promoRequests.status}</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">{t.admin.promoRequests.promoCode}</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">{t.admin.promoRequests.totalEarnings}</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">{t.admin.promoRequests.paymentStatus}</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">{t.admin.promoRequests.date}</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">{t.admin.promoRequests.amountDue}</th>
                <th className="px-5 py-3 text-right font-medium text-stone-500">{t.admin.promoRequests.actions}</th>
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
                                {isOpen ? t.admin.promoRequests.hide : `${ed!.records.length} ${t.admin.promoRequests.purchases}`}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400">{t.admin.promoRequests.commissions}</span>
                        )}
                      </td>

                      {/* Payment status */}
                      <td className="px-5 py-4">
                        {req.status === "APPROVED" && ed && (ed.total ?? 0) > 0 ? (
                          <button
                            onClick={() => togglePaid(req)}
                            disabled={payProcessing === req.$id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                              req.isPaid
                                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
                            } disabled:opacity-50`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              req.isPaid ? "bg-green-500" : "bg-orange-400"
                            }`} />
                            {payProcessing === req.$id
                              ? "..."
                              : req.isPaid
                              ? t.admin.promoRequests.paid
                              : t.admin.promoRequests.notPaid}
                          </button>
                        ) : (
                          <span className="text-stone-300 text-xs">—</span>
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

                      {/* Amount Due */}
                      <td className="px-5 py-4">
                        {req.status === "APPROVED" ? (
                          ed === undefined ? (
                            <span className="text-stone-300 text-xs">...</span>
                          ) : req.isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              {t.admin.promoRequests.paid}
                            </span>
                          ) : ed.total !== null && ed.total > 0 ? (
                            <span className="font-bold text-amber-700 text-sm">
                              {ed.total.toFixed(2)}{" "}
                              <span className="text-xs font-medium text-stone-400">TND</span>
                            </span>
                          ) : (
                            <span className="text-stone-300 text-xs">—</span>
                          )
                        ) : (
                          <span className="text-stone-300 text-xs">—</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        {req.status === "PENDING" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAction(req.$id, "approve")}
                              disabled={processing === req.$id + "approve" || processing === req.$id + "deny"}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              {processing === req.$id + "approve" ? "..." : t.admin.promoRequests.approve}
                            </button>
                            <button
                              onClick={() => handleAction(req.$id, "deny")}
                              disabled={processing === req.$id + "approve" || processing === req.$id + "deny"}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              {processing === req.$id + "deny" ? "..." : t.admin.promoRequests.deny}
                            </button>
                          </div>
                        ) : (
                          <span className="text-stone-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>

                    {/* Expanded buyers sub-table */}
                    {isOpen && hasRecords && (
                      <tr>
                        <td colSpan={8} className="px-0 py-0 bg-amber-50/40">
                          <div className="px-8 py-4 border-t border-amber-100">
                            <p className="text-xs font-semibold text-amber-700 mb-3 tracking-wide uppercase">
                              {t.admin.promoRequests.purchaseDetails}
                            </p>
                            <table className="w-full text-sm rounded-lg overflow-hidden">
                              <thead>
                                <tr className="bg-white border border-stone-100 rounded-lg">
                                  <th className="px-4 py-2 text-right text-xs font-medium text-stone-500 rounded-tr-lg">#</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">{t.admin.promoRequests.buyer}</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">{t.admin.promoRequests.purchaseDate}</th>
                                  <th className="px-4 py-2 text-right text-xs font-medium text-stone-500">{t.admin.promoRequests.orderNumber}</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-stone-500 rounded-tl-lg">{t.admin.promoRequests.commission}</th>
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
                                    {t.admin.promoRequests.total}
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
