"use client";

import React, { useState, useEffect, useCallback } from "react";
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

interface PaymentHistoryRecord {
  $id: string;
  $createdAt: string;
  ownerUserId: string;
  ownerEmail: string;
  userName: string;
  promoCode: string;
  amount: number;
}

type MainTab = "requests" | "paymentHistory";

function RestoreConfirmModal({
  record,
  onConfirm,
  onCancel,
  loading,
  t,
}: {
  record: PaymentHistoryRecord;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  t: any;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-300 to-stone-200" />

        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 mx-auto mb-4">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-stone-900 text-center mb-1">
            {t.admin.promoRequests.restore}
          </h3>
          <p className="text-sm text-stone-500 text-center mb-5 leading-relaxed">
            {t.admin.promoRequests.confirmRestore}
          </p>

          {/* Payment summary card */}
          <div className="bg-stone-50 rounded-2xl border border-stone-100 p-4 mb-6 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">{t.admin.promoRequests.seller}</span>
              <span className="text-xs font-semibold text-stone-700">{record.userName || record.ownerEmail}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-400">{t.admin.promoRequests.promoCode}</span>
              <span className="font-mono font-bold text-xs tracking-widest text-stone-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {record.promoCode || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-stone-200 pt-2.5">
              <span className="text-xs text-stone-400">{t.admin.promoRequests.paidAmount}</span>
              <span className="text-sm font-bold text-emerald-700">{record.amount.toFixed(2)} <span className="text-xs font-normal text-stone-400">TND</span></span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 rounded-2xl text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              {loading ? t.admin.promoRequests.restoring : t.admin.promoRequests.restore}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PromoRequestsPage() {
  const [mainTab, setMainTab] = useState<MainTab>("requests");

  const [requests, setRequests] = useState<PromoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "PENDING" | "APPROVED" | "DENIED">("all");
  const [processing, setProcessing] = useState<string | null>(null);
  const [payProcessing, setPayProcessing] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<Record<string, EarningsData>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmRecord, setConfirmRecord] = useState<PaymentHistoryRecord | null>(null);

  const { t } = useTranslation();

  useEffect(() => { fetchRequests(); }, [filter]);

  useEffect(() => {
    if (mainTab === "paymentHistory") fetchPaymentHistory();
  }, [mainTab]);

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
              map[r.userId] = er.ok ? { total: ed.total, records: ed.records || [] } : { total: null, records: [] };
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

  const fetchPaymentHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch("/api/admin/payment-history");
      const data = await res.json();
      if (res.ok) setPaymentHistory(data.records || []);
    } catch (err) {
      console.error("Error fetching payment history:", err);
    } finally {
      setHistoryLoading(false);
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
        setRequests((prev) => prev.map((r) => (r.$id === id ? { ...r, ...data.request } : r)));
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
        // After marking paid, earnings are cleared — reset local state to 0
        if (action === "markPaid") {
          setEarnings((prev) => ({
            ...prev,
            [req.userId]: { total: 0, records: [] },
          }));
        }
      } else {
        alert(data.error || t.common.error);
      }
    } catch {
      alert(t.common.error);
    } finally {
      setPayProcessing(null);
    }
  };

  const handleRestore = (record: PaymentHistoryRecord) => {
    setConfirmRecord(record);
  };

  const doRestore = async () => {
    if (!confirmRecord) return;
    const record = confirmRecord;
    const promoReq = requests.find((r) => r.userId === record.ownerUserId);

    setRestoring(record.$id);
    try {
      const res = await fetch(`/api/admin/payment-history/${record.$id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoRequestId: promoReq?.$id }),
      });
      const data = await res.json();
      if (res.ok) {
        // Remove from payment history list
        setPaymentHistory((prev) => prev.filter((h) => h.$id !== record.$id));

        // Mark promo request as unpaid
        if (promoReq) {
          setRequests((prev) =>
            prev.map((r) => (r.$id === promoReq.$id ? { ...r, isPaid: false } : r))
          );
        }

        // Re-fetch earnings for this user so Montant dû updates
        try {
          const er = await fetch(`/api/admin/referral-earnings?ownerUserId=${encodeURIComponent(record.ownerUserId)}`);
          const ed = await er.json();
          if (er.ok) {
            setEarnings((prev) => ({
              ...prev,
              [record.ownerUserId]: { total: ed.total, records: ed.records || [] },
            }));
          }
        } catch {
          // non-fatal — user can refresh
        }

        setConfirmRecord(null);
      } else {
        alert(data.error || t.common.error);
      }
    } catch {
      alert(t.common.error);
    } finally {
      setRestoring(null);
    }
  };

  const STATUS_CONFIG = {
    PENDING:  { label: t.admin.promoRequests.pending,  dot: "bg-amber-400",  pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200"  },
    APPROVED: { label: t.admin.promoRequests.approved, dot: "bg-emerald-400", pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
    DENIED:   { label: t.admin.promoRequests.denied,   dot: "bg-red-400",    pill: "bg-red-50 text-red-600 ring-1 ring-red-200"    },
  } as const;

  const StatusBadge = ({ status }: { status: PromoRequest["status"] }) => {
    const cfg = STATUS_CONFIG[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.pill}`}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ar-TN", { year: "numeric", month: "short", day: "numeric" });

  const filterCounts = {
    all: requests.length,
    PENDING:  requests.filter(r => r.status === "PENDING").length,
    APPROVED: requests.filter(r => r.status === "APPROVED").length,
    DENIED:   requests.filter(r => r.status === "DENIED").length,
  };

  const activePaymentHistory = paymentHistory;
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">

      {/* ── Restore Confirm Modal ── */}
      {confirmRecord && (
        <RestoreConfirmModal
          record={confirmRecord}
          onConfirm={doRestore}
          onCancel={() => setConfirmRecord(null)}
          loading={restoring === confirmRecord.$id}
          t={t}
        />
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.admin.promoRequests.title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t.admin.promoRequests.subtitle}</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2 mt-1">
          <span className="text-xs text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full font-medium">
            {pendingCount} {t.admin.promoRequests.pending}
          </span>
        </div>
      </div>

      {/* ── Main Tabs ── */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-2xl w-fit">
        <button
          onClick={() => setMainTab("requests")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
            mainTab === "requests"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {t.admin.promoRequests.title}
          {pendingCount > 0 && (
            <span className="bg-amber-400 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold leading-none">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setMainTab("paymentHistory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
            mainTab === "paymentHistory"
              ? "bg-white text-stone-900 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t.admin.promoRequests.paymentHistory}
          {activePaymentHistory.length > 0 && (
            <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold leading-none">
              {activePaymentHistory.length}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════
          TAB: Requests
      ══════════════════════════════════════ */}
      {mainTab === "requests" && (
        <>
          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(["all", "PENDING", "APPROVED", "DENIED"] as const).map((f) => {
              const label = f === "all" ? t.admin.promoRequests.all : STATUS_CONFIG[f].label;
              const count = filterCounts[f];
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    filter === f
                      ? "bg-stone-900 text-white shadow-sm"
                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300"
                  }`}
                >
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
                    filter === f ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-4 w-32 bg-stone-100 rounded" />
                    <div className="h-6 w-20 bg-stone-100 rounded-full" />
                  </div>
                  <div className="h-3 w-48 bg-stone-100 rounded" />
                  <div className="grid grid-cols-3 gap-3">
                    {[1,2,3].map(j => <div key={j} className="h-3 bg-stone-100 rounded" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center">
              <svg className="w-10 h-10 text-stone-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-stone-400 text-sm">{t.admin.promoRequests.noRequests}</p>
            </div>
          ) : (
            <>
              {/* MOBILE — Card layout */}
              <div className="lg:hidden space-y-3">
                {requests.map((req) => {
                  const ed = earnings[req.userId];
                  const isOpen = !!expanded[req.userId];
                  const hasRecords = ed && ed.records.length > 0;
                  const isProcessing = processing === req.$id + "approve" || processing === req.$id + "deny";

                  return (
                    <div key={req.$id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{req.userName || "—"}</p>
                          <p className="text-xs text-gray-400 mt-0.5 truncate" dir="ltr">{req.userEmail}</p>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 pb-4 border-t border-stone-100 pt-3">
                        <div>
                          <p className="text-xs text-stone-400 mb-1">{t.admin.promoRequests.promoCode}</p>
                          {req.status === "APPROVED" && req.promoCode ? (
                            <span className="font-mono font-bold text-xs tracking-widest text-stone-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {req.promoCode}
                            </span>
                          ) : (
                            <span className="text-stone-300 text-sm">—</span>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-stone-400 mb-1">{t.admin.promoRequests.date}</p>
                          <p className="text-xs text-stone-600">{formatDate(req.$createdAt)}</p>
                        </div>

                        <div>
                          <p className="text-xs text-stone-400 mb-1">{t.admin.promoRequests.totalEarnings}</p>
                          {req.status === "APPROVED" ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-emerald-700">
                                {ed === undefined ? "..." : ed.total === null ? "—" : `${ed.total.toFixed(2)} TND`}
                              </span>
                              {hasRecords && (
                                <button
                                  onClick={() => toggleExpanded(req.userId)}
                                  className="text-amber-500 hover:text-amber-600 text-xs underline underline-offset-2"
                                >
                                  {isOpen ? t.admin.promoRequests.hide : `${ed!.records.length}`}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400">{t.admin.promoRequests.commissions}</span>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-stone-400 mb-1">{t.admin.promoRequests.amountDue}</p>
                          {req.status === "APPROVED" ? (
                            ed === undefined ? (
                              <span className="text-xs text-stone-300">...</span>
                            ) : req.isPaid ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                {t.admin.promoRequests.paid}
                              </span>
                            ) : ed.total !== null && ed.total > 0 ? (
                              <span className="text-sm font-bold text-amber-700">{ed.total.toFixed(2)} <span className="text-xs font-normal text-stone-400">TND</span></span>
                            ) : (
                              <span className="text-stone-300 text-xs">—</span>
                            )
                          ) : (
                            <span className="text-stone-300 text-xs">—</span>
                          )}
                        </div>
                      </div>

                      {(req.status === "PENDING" || (req.status === "APPROVED" && ed && (ed.total ?? 0) > 0)) && (
                        <div className="flex gap-2 px-4 py-3 bg-stone-50 border-t border-stone-100">
                          {req.status === "PENDING" ? (
                            <>
                              <button
                                onClick={() => handleAction(req.$id, "approve")}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                              >
                                {processing === req.$id + "approve" ? (
                                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                                {t.admin.promoRequests.approve}
                              </button>
                              <button
                                onClick={() => handleAction(req.$id, "deny")}
                                disabled={isProcessing}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                {processing === req.$id + "deny" ? (
                                  <span className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                                {t.admin.promoRequests.deny}
                              </button>
                            </>
                          ) : req.status === "APPROVED" && ed && (ed.total ?? 0) > 0 ? (
                            <button
                              onClick={() => togglePaid(req)}
                              disabled={payProcessing === req.$id}
                              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all border ${
                                req.isPaid
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                              } disabled:opacity-50`}
                            >
                              {payProcessing === req.$id ? (
                                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                              ) : req.isPaid ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                              )}
                              {req.isPaid ? t.admin.promoRequests.paid : t.admin.promoRequests.notPaid}
                            </button>
                          ) : null}
                        </div>
                      )}

                      {isOpen && hasRecords && (
                        <div className="border-t border-amber-100 bg-amber-50/40 px-4 py-3">
                          <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide">
                            {t.admin.promoRequests.purchaseDetails}
                          </p>
                          <div className="space-y-2">
                            {ed!.records.map((rec) => (
                              <div key={rec.$id} className="flex justify-between items-center bg-white rounded-xl px-3 py-2 border border-stone-100">
                                <div className="min-w-0">
                                  <p className="text-xs text-stone-600 truncate" dir="ltr">{rec.buyerEmail || "—"}</p>
                                  <p className="text-xs text-stone-400 mt-0.5">{formatDate(rec.$createdAt)}</p>
                                </div>
                                <span className="text-sm font-semibold text-emerald-700 flex-shrink-0 ml-3">
                                  +{rec.amount.toFixed(2)} <span className="text-xs font-normal text-stone-400">{rec.currency}</span>
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center px-3 py-2 bg-stone-50 rounded-xl border border-stone-200">
                              <span className="text-xs font-semibold text-stone-600">{t.admin.promoRequests.total}</span>
                              <span className="text-sm font-bold text-emerald-700">
                                {ed!.total?.toFixed(2)} <span className="text-xs font-normal text-stone-400">TND</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP — Table layout */}
              <div className="hidden lg:block rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
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
                        <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {requests.map((req) => {
                      const ed = earnings[req.userId];
                      const isOpen = !!expanded[req.userId];
                      const hasRecords = ed && ed.records.length > 0;
                      const isProcessing = processing === req.$id + "approve" || processing === req.$id + "deny";

                      return (
                        <React.Fragment key={req.$id}>
                          <tr className="hover:bg-stone-50/60 transition-colors">
                            <td className="px-4 py-4">
                              <p className="font-medium text-gray-900 leading-tight">{req.userName || "—"}</p>
                              <p className="text-xs text-gray-400 mt-0.5" dir="ltr">{req.userEmail}</p>
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge status={req.status} />
                            </td>
                            <td className="px-4 py-4">
                              {req.status === "APPROVED" && req.promoCode ? (
                                <span className="font-mono font-bold tracking-widest text-stone-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs">
                                  {req.promoCode}
                                </span>
                              ) : (
                                <span className="text-stone-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {req.status === "APPROVED" ? (
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-emerald-700 text-sm">
                                    {ed === undefined ? (
                                      <span className="text-stone-300 font-normal text-xs">...</span>
                                    ) : ed.total === null ? (
                                      <span className="text-stone-300">—</span>
                                    ) : (
                                      `${ed.total.toFixed(2)} TND`
                                    )}
                                  </span>
                                  {hasRecords && (
                                    <button
                                      onClick={() => toggleExpanded(req.userId)}
                                      className="text-amber-500 hover:text-amber-600 transition-colors text-xs underline underline-offset-2 whitespace-nowrap"
                                    >
                                      {isOpen ? t.admin.promoRequests.hide : `${ed!.records.length} ${t.admin.promoRequests.purchases}`}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-stone-400">{t.admin.promoRequests.commissions}</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {req.status === "APPROVED" && ed && (ed.total ?? 0) > 0 ? (
                                <button
                                  onClick={() => togglePaid(req)}
                                  disabled={payProcessing === req.$id}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border disabled:opacity-50 ${
                                    req.isPaid
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                      : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                  }`}
                                >
                                  {payProcessing === req.$id ? (
                                    <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                  ) : (
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${req.isPaid ? "bg-emerald-400" : "bg-amber-400"}`} />
                                  )}
                                  {req.isPaid ? t.admin.promoRequests.paid : t.admin.promoRequests.notPaid}
                                </button>
                              ) : (
                                <span className="text-stone-300 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-stone-500 text-xs whitespace-nowrap">
                              {formatDate(req.$createdAt)}
                            </td>
                            <td className="px-4 py-4">
                              {req.status === "APPROVED" ? (
                                ed === undefined ? (
                                  <span className="text-xs text-stone-300">...</span>
                                ) : req.isPaid ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    {t.admin.promoRequests.paid}
                                  </span>
                                ) : ed.total !== null && ed.total > 0 ? (
                                  <span className="font-bold text-amber-700 text-sm whitespace-nowrap">
                                    {ed.total.toFixed(2)}{" "}
                                    <span className="text-xs font-normal text-stone-400">TND</span>
                                  </span>
                                ) : (
                                  <span className="text-stone-300 text-xs">—</span>
                                )
                              ) : (
                                <span className="text-stone-300 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {req.status === "PENDING" ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAction(req.$id, "approve")}
                                    disabled={isProcessing}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {processing === req.$id + "approve" ? (
                                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                    {t.admin.promoRequests.approve}
                                  </button>
                                  <button
                                    onClick={() => handleAction(req.$id, "deny")}
                                    disabled={isProcessing}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {processing === req.$id + "deny" ? (
                                      <span className="w-3 h-3 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                                    ) : (
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                    {t.admin.promoRequests.deny}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-stone-300 text-xs">—</span>
                              )}
                            </td>
                          </tr>

                          {isOpen && hasRecords && (
                            <tr>
                              <td colSpan={8} className="px-0 py-0 bg-amber-50/30">
                                <div className="px-6 py-4 border-t border-amber-100">
                                  <p className="text-xs font-semibold text-amber-700 mb-3 tracking-wider uppercase">
                                    {t.admin.promoRequests.purchaseDetails}
                                  </p>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="bg-white rounded-xl border border-stone-100">
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-stone-400">#</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-stone-400">{t.admin.promoRequests.buyer}</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-stone-400">{t.admin.promoRequests.purchaseDate}</th>
                                        <th className="px-4 py-2 text-right text-xs font-semibold text-stone-400">{t.admin.promoRequests.orderNumber}</th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold text-stone-400">{t.admin.promoRequests.commission}</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                      {ed!.records.map((rec, idx) => (
                                        <tr key={rec.$id} className="bg-white hover:bg-stone-50 transition-colors">
                                          <td className="px-4 py-2.5 text-stone-400 text-xs">{idx + 1}</td>
                                          <td className="px-4 py-2.5 text-gray-700 text-xs" dir="ltr">{rec.buyerEmail || "—"}</td>
                                          <td className="px-4 py-2.5 text-stone-500 text-xs whitespace-nowrap">{formatDate(rec.$createdAt)}</td>
                                          <td className="px-4 py-2.5 text-stone-400 text-xs font-mono" dir="ltr">{rec.orderId.slice(0, 12)}…</td>
                                          <td className="px-4 py-2.5 text-left font-semibold text-emerald-700 text-sm">
                                            +{rec.amount.toFixed(2)} <span className="text-xs font-normal text-stone-400">{rec.currency}</span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr className="bg-stone-50 border-t border-stone-200">
                                        <td colSpan={4} className="px-4 py-2.5 text-xs font-semibold text-stone-500 text-right">
                                          {t.admin.promoRequests.total}
                                        </td>
                                        <td className="px-4 py-2.5 text-left font-bold text-emerald-700">
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
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════
          TAB: Payment History
      ══════════════════════════════════════ */}
      {mainTab === "paymentHistory" && (
        <>
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-4 w-40 bg-stone-100 rounded" />
                    <div className="h-6 w-24 bg-stone-100 rounded-full" />
                  </div>
                  <div className="h-3 w-56 bg-stone-100 rounded" />
                </div>
              ))}
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center">
              <svg className="w-10 h-10 text-stone-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-stone-400 text-sm">{t.admin.promoRequests.paymentHistoryEmpty}</p>
            </div>
          ) : (
            <>
              {/* MOBILE — Payment history cards */}
              <div className="lg:hidden space-y-3">
                {paymentHistory.map((record) => (
                  <div key={record.$id} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{record.userName || "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate" dir="ltr">{record.ownerEmail}</p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {t.admin.promoRequests.paid}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 pb-4 border-t border-stone-100 pt-3">
                      <div>
                        <p className="text-xs text-stone-400 mb-1">{t.admin.promoRequests.promoCode}</p>
                        <span className="font-mono font-bold text-xs tracking-widest text-stone-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {record.promoCode || "—"}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 mb-1">{t.admin.promoRequests.paymentDate}</p>
                        <p className="text-xs text-stone-600">{formatDate(record.$createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400 mb-1">{t.admin.promoRequests.paidAmount}</p>
                        <span className="text-sm font-bold text-emerald-700">{record.amount.toFixed(2)} <span className="text-xs font-normal text-stone-400">TND</span></span>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-stone-50 border-t border-stone-100">
                        <button
                          onClick={() => handleRestore(record)}
                          disabled={restoring === record.$id}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                          {restoring === record.$id ? (
                            <span className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          )}
                          {restoring === record.$id ? t.admin.promoRequests.restoring : t.admin.promoRequests.restore}
                        </button>
                      </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP — Payment history table */}
              <div className="hidden lg:block rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      {[
                        t.admin.promoRequests.seller,
                        t.admin.promoRequests.promoCode,
                        t.admin.promoRequests.paidAmount,
                        t.admin.promoRequests.paymentDate,
                        t.admin.promoRequests.actions,
                      ].map((h) => (
                        <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {paymentHistory.map((record) => (
                      <tr key={record.$id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900 leading-tight">{record.userName || "—"}</p>
                          <p className="text-xs text-gray-400 mt-0.5" dir="ltr">{record.ownerEmail}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono font-bold tracking-widest text-stone-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs">
                            {record.promoCode || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-bold text-emerald-700 text-sm">
                            {record.amount.toFixed(2)}{" "}
                            <span className="text-xs font-normal text-stone-400">TND</span>
                          </span>
                        </td>
                        <td className="px-4 py-4 text-stone-500 text-xs whitespace-nowrap">
                          {formatDate(record.$createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {t.admin.promoRequests.paid}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleRestore(record)}
                            disabled={restoring === record.$id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {restoring === record.$id ? (
                              <span className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            )}
                            {restoring === record.$id ? t.admin.promoRequests.restoring : t.admin.promoRequests.restore}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
