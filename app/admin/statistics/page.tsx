"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { useTranslation } from "@/app/components/LocaleProvider";

interface Order {
  $id: string;
  $createdAt: string;
  UserEmail: string;
  UserName: string;
  shipingAdress: string;
  itemsPrice: number;
  shipingPrice: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  paymentmethod: string;
  Ispaid: boolean;
  promoCodeId?: string;
}

interface PromoRequest {
  $id: string;
  userId: string;
  userEmail: string;
  userName: string;
  promoCode?: string;
  status: string;
}

interface ParsedAddress {
  gouvernorat?: string;
  items?: Array<{ qty?: number; quantity?: number; name?: string }>;
}

// Gold luxury palette aligned with platform brand
const GOLD = "#D4AF37";
const GOLD_DARK = "#B8941F";
const GOLD_LIGHT = "#E8D06A";
const GOLD_PALE = "#F5ECC0";

const PALETTE = [
  "#D4AF37",
  "#1a1a1a",
  "#B8941F",
  "#3d3730",
  "#E8D06A",
  "#78716c",
];

const STATUS_PALETTE: Record<string, string> = {
  "En attente": "#D4AF37",
  "Confirmé": "#1a1a1a",
  "Livré": "#B8941F",
  "Annulé": "#a8a29e",
};

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr",
  "05": "Mai", "06": "Jui", "07": "Jul", "08": "Aoû",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Déc",
};

function parseAddress(raw: string): ParsedAddress {
  try { return JSON.parse(raw); } catch { return {}; }
}

function StatCard({ label, value, sub, icon, accent = false }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode; accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden"
      style={{
        background: "white",
        border: accent ? `1px solid ${GOLD_LIGHT}` : `1px solid #f0e8cc`,
        boxShadow: accent
          ? `0 8px 32px rgba(212,175,55,0.2), 0 2px 8px rgba(212,175,55,0.1)`
          : `0 2px 12px rgba(212,175,55,0.08), 0 1px 3px rgba(0,0,0,0.04)`,
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10"
        style={{
          background: accent
            ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`
            : `linear-gradient(135deg, ${GOLD_PALE} 0%, #ede4b0 100%)`,
          boxShadow: accent
            ? `0 4px 12px rgba(212,175,55,0.4)`
            : `0 2px 8px rgba(212,175,55,0.2)`,
        }}
      >
        <span style={{ color: accent ? "#1a1a1a" : GOLD_DARK }}>
          {icon}
        </span>
      </div>
      <div className="min-w-0 relative z-10">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: accent ? GOLD_DARK : "#a0916a", letterSpacing: "0.1em" }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-bold leading-none truncate"
          style={{
            color: "#1a1a1a",
            fontFamily: "var(--font-playfair, serif)",
            letterSpacing: "-0.01em",
          }}
        >
          {value}
        </p>
        {sub && (
          <p
            className="text-xs mt-1.5"
            style={{ color: accent ? "#8a7040" : "#b0a080" }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

const GoldTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="text-xs rounded-xl px-4 py-3 max-w-[220px]"
      style={{
        background: "white",
        border: `1px solid #f0e8cc`,
        boxShadow: `0 8px 24px rgba(212,175,55,0.15), 0 2px 8px rgba(0,0,0,0.08)`,
      }}
    >
      {label && (
        <p className="font-semibold mb-2 truncate" style={{ color: GOLD_DARK, fontFamily: "var(--font-playfair, serif)" }}>
          {label}
        </p>
      )}
      {payload.map((p: any, i: number) => (
        <p key={i} className="leading-relaxed" style={{ color: "#6b5e3e" }}>
          {p.name}:{" "}
          <span className="font-bold" style={{ color: "#1a1a1a" }}>
            {p.name?.toLowerCase().includes("tnd")
              ? `${Number(p.value).toFixed(2)} TND`
              : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

const WrappedTick = ({ x, y, payload }: any) => {
  const label: string = payload.value.length > 12 ? payload.value.slice(0, 11) + "…" : payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={14}
        textAnchor="middle"
        fill="#a0916a"
        fontSize={11}
        fontFamily="var(--font-inter, sans-serif)"
      >
        {label}
      </text>
    </g>
  );
};

function SectionCard({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "white",
        border: "1px solid #f0e8cc",
        boxShadow: "0 2px 16px rgba(212,175,55,0.07), 0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="px-6 py-4 flex items-start justify-between"
        style={{ borderBottom: "1px solid #f7f0dc" }}
      >
        <div>
          <h2
            className="font-bold text-base"
            style={{
              color: "#1a1a1a",
              fontFamily: "var(--font-playfair, serif)",
              letterSpacing: "0.01em",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: "#b0a080" }}>
              {subtitle}
            </p>
          )}
        </div>
        <div
          className="w-1.5 h-8 rounded-full flex-shrink-0 mt-0.5"
          style={{ background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DARK} 100%)` }}
        />
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split("-");
  return `${MONTH_LABELS[month] || month} ${year}`;
}

export default function StatisticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [promoMap, setPromoMap] = useState<Record<string, { name: string; code: string }>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"current" | "archive">("current");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => monthKey(new Date()));
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const [ordersRes, promoRes] = await Promise.all([
          fetch("/api/admin/orders?limit=500"),
          fetch("/api/admin/promo-requests"),
        ]);
        const [ordersData, promoData] = await Promise.all([
          ordersRes.json(),
          promoRes.json(),
        ]);

        if (ordersRes.ok) setOrders(ordersData.orders || []);

        if (promoRes.ok) {
          const map: Record<string, { name: string; code: string }> = {};
          for (const req of (promoData.requests || []) as PromoRequest[]) {
            map[req.$id] = {
              name: req.userName || req.userEmail || req.$id,
              code: req.promoCode || req.$id,
            };
          }
          setPromoMap(map);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Default statistics panel resets to the current calendar month
  const currentMonthKey = useMemo(() => monthKey(new Date()), []);
  const currentMonthOrders = useMemo(
    () => orders.filter((o) => monthKey(new Date(o.$createdAt)) === currentMonthKey),
    [orders, currentMonthKey]
  );

  const scopedOrders = activeTab === "current" ? currentMonthOrders : orders;

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    for (const o of orders) set.add(monthKey(new Date(o.$createdAt)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [orders]);

  const archiveOrders = useMemo(
    () => orders.filter((o) => monthKey(new Date(o.$createdAt)) === selectedMonth),
    [orders, selectedMonth]
  );

  const buildStats = useCallback((list: Order[]) => {
    const delivered = list.filter((o) => o.status === "delivered");
    const totalRevenue = list.reduce((s, o) => s + (o.totalPrice || 0), 0);

    const gouvernoratMap: Record<string, { orders: number; revenue: number }> = {};
    for (const order of list) {
      const addr = parseAddress(order.shipingAdress);
      const gov = addr.gouvernorat?.trim() || "Inconnu";
      if (!gouvernoratMap[gov]) gouvernoratMap[gov] = { orders: 0, revenue: 0 };
      gouvernoratMap[gov].orders += 1;
      gouvernoratMap[gov].revenue += order.totalPrice || 0;
    }
    const gouvernoratData = Object.entries(gouvernoratMap)
      .map(([name, d]) => ({ name, orders: d.orders, revenue: parseFloat(d.revenue.toFixed(2)) }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    const sellerMap: Record<string, { orders: number; revenue: number; name: string; code: string }> = {};
    for (const order of list) {
      if (!order.promoCodeId) continue;
      const id = order.promoCodeId;
      const info = promoMap[id];
      if (!sellerMap[id]) sellerMap[id] = {
        orders: 0,
        revenue: 0,
        name: info?.name || id.slice(0, 10) + "…",
        code: info?.code || id,
      };
      sellerMap[id].orders += 1;
      sellerMap[id].revenue += order.totalPrice || 0;
    }
    const sellerData = Object.entries(sellerMap)
      .map(([, d]) => ({
        name: d.name,
        code: d.code,
        orders: d.orders,
        "revenue TND": parseFloat(d.revenue.toFixed(2)),
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 8);

    const dayMap: Record<string, { orders: number; revenue: number }> = {};
    for (const order of list) {
      const day = order.$createdAt.slice(0, 10);
      if (!dayMap[day]) dayMap[day] = { orders: 0, revenue: 0 };
      dayMap[day].orders += 1;
      dayMap[day].revenue += order.totalPrice || 0;
    }
    const bestDay = Object.entries(dayMap).sort(([, a], [, b]) => b.revenue - a.revenue)[0];

    return {
      delivered,
      totalRevenue,
      gouvernoratData,
      sellerData,
      bestSeller: sellerData[0],
      bestDay: bestDay ? { date: bestDay[0], ...bestDay[1] } : null,
      bestGouvernorat: gouvernoratData[0],
    };
  }, [promoMap]);

  const currentStats = useMemo(() => buildStats(scopedOrders), [scopedOrders, buildStats]);
  const archiveStats = useMemo(() => buildStats(archiveOrders), [archiveOrders, buildStats]);

  const delivered = currentStats.delivered;
  const totalRevenue = currentStats.totalRevenue;
  const gouvernoratData = currentStats.gouvernoratData;
  const sellerData = currentStats.sellerData;

  const monthData = useMemo(() => {
    const map: Record<string, { orders: number; revenue: number }> = {};
    for (const order of orders) {
      const d = new Date(order.$createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map[key]) map[key] = { orders: 0, revenue: 0 };
      map[key].orders += 1;
      map[key].revenue += order.totalPrice || 0;
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, d]) => {
        const [year, month] = key.split("-");
        return {
          name: `${MONTH_LABELS[month] || month} ${year.slice(2)}`,
          Commandes: d.orders,
          "Revenu TND": parseFloat(d.revenue.toFixed(2)),
        };
      });
  }, [orders]);

  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of scopedOrders) map[o.status] = (map[o.status] || 0) + 1;
    const labels: Record<string, string> = {
      pending: "En attente", confirmed: "Confirmé",
      delivered: "Livré", cancelled: "Annulé",
    };
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }, [scopedOrders]);

  const topGov = gouvernoratData[0]?.name || "—";

  const topUsersByItemsThisMonth = useMemo(() => {
    const now = new Date();
    const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const map: Record<string, { name: string; email: string; items: number; orders: number }> = {};
    for (const order of orders) {
      const d = new Date(order.$createdAt);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (ym !== currentYM) continue;
      const addr = parseAddress(order.shipingAdress);
      const itemCount = (addr.items || []).reduce((sum, item) => sum + (Number(item.qty ?? item.quantity) || 1), 0);
      const key = order.UserEmail || order.UserName;
      if (!map[key]) map[key] = { name: order.UserName || order.UserEmail || key, email: order.UserEmail || "", items: 0, orders: 0 };
      map[key].items += itemCount;
      map[key].orders += 1;
    }
    return Object.values(map).sort((a, b) => b.items - a.items).slice(0, 10);
  }, [orders]);

  const axisStyle = { fontSize: 11, fill: "#b0a080", fontFamily: "var(--font-inter, sans-serif)" };

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="h-10 w-56 rounded-xl animate-pulse" style={{ background: "#f5ecc0" }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "#fdf8ec" }} />
          ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-2xl animate-pulse" style={{ background: "#fdf8ec" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">

      {/* Page header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{
              color: "#1a1a1a",
              fontFamily: "var(--font-playfair, serif)",
              letterSpacing: "-0.01em",
            }}
          >
            {t.admin.nav.statistics}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#b0a080" }}>
            بناءً على{" "}
            <span className="font-semibold" style={{ color: GOLD_DARK }}>
              {scopedOrders.length}
            </span>{" "}
            طلب {activeTab === "current" ? "هذا الشهر" : "إجمالي"}
          </p>
        </div>
        <div
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
          style={{
            background: GOLD_PALE,
            color: GOLD_DARK,
            border: `1px solid ${GOLD_LIGHT}`,
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          لوحة الإحصائيات
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl w-fit" style={{ background: GOLD_PALE, border: `1px solid ${GOLD_LIGHT}` }}>
        {[
          { key: "current" as const, label: "الشهر الحالي" },
          { key: "archive" as const, label: "الأرشيف الشهري" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={
              activeTab === tab.key
                ? { background: GOLD_DARK, color: "white" }
                : { background: "transparent", color: GOLD_DARK }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "current" ? (
      <>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          accent
          label="إجمالي الطلبات"
          value={scopedOrders.length}
          sub={`${delivered.length} تم التسليم`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatCard
          label="رقم الأعمال"
          value={`${totalRevenue.toFixed(0)} TND`}
          sub="جميع الطلبات"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="أفضل ولاية"
          value={topGov}
          sub={gouvernoratData[0] ? `${gouvernoratData[0].orders} طلب` : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="أفضل يوم هذا الشهر"
          value={currentStats.bestDay ? new Date(currentStats.bestDay.date).toLocaleDateString("ar-TN", { day: "numeric", month: "short" }) : "—"}
          sub={currentStats.bestDay ? `${currentStats.bestDay.revenue.toFixed(0)} TND` : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Monthly chart */}
      <SectionCard title="المبيعات الشهرية" subtitle="الطلبات والإيرادات خلال آخر 12 شهراً">
        {monthData.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="darkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5ecc0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                interval={0}
                height={40}
                tickMargin={8}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                tick={axisStyle}
                axisLine={false} tickLine={false}
                width={54}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis
                yAxisId="orders"
                orientation="left"
                tick={{ ...axisStyle, fill: "#c8b87a" }}
                axisLine={false} tickLine={false}
                width={28}
              />
              <Tooltip content={<GoldTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                formatter={(v) => <span style={{ color: "#a0916a", fontFamily: "var(--font-inter, sans-serif)" }}>{v}</span>}
              />
              <Area yAxisId="revenue" type="monotone" dataKey="Revenu TND" stroke={GOLD} strokeWidth={2.5} fill="url(#goldGrad)" dot={false} activeDot={{ r: 5, fill: GOLD, stroke: "white", strokeWidth: 2 }} />
              <Area yAxisId="orders" type="monotone" dataKey="Commandes" stroke="#1a1a1a" strokeWidth={2} fill="url(#darkGrad)" dot={false} activeDot={{ r: 4, fill: "#1a1a1a", stroke: "white", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* Gouvernorat + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{
            background: "white",
            border: "1px solid #f0e8cc",
            boxShadow: "0 2px 16px rgba(212,175,55,0.07), 0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div className="px-6 py-4 flex items-start justify-between" style={{ borderBottom: "1px solid #f7f0dc" }}>
            <div>
              <h2 className="font-bold text-base" style={{ color: "#1a1a1a", fontFamily: "var(--font-playfair, serif)" }}>
                المبيعات حسب الولاية
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#b0a080" }}>عدد الطلبات حسب المنطقة</p>
            </div>
            <div className="w-1.5 h-8 rounded-full flex-shrink-0 mt-0.5" style={{ background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DARK} 100%)` }} />
          </div>
          <div className="p-5 sm:p-6" dir="ltr">
            {gouvernoratData.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={Math.max(280, gouvernoratData.length * 46)}>
                <BarChart
                  data={gouvernoratData}
                  layout="vertical"
                  margin={{ top: 4, right: 160, left: 16, bottom: 4 }}
                  barSize={16}
                  barCategoryGap="35%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#faf4e0" horizontal={false} />
                  <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} tickMargin={6} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    orientation="right"
                    tick={{ ...axisStyle, fill: "#6b5e3e", fontSize: 12 }}
                    axisLine={false} tickLine={false}
                    width={150}
                    tickMargin={12}
                  />
                  <Tooltip content={<GoldTooltip />} />
                  <Bar dataKey="orders" name="Commandes" radius={[0, 6, 6, 0]} label={{ position: "left", offset: 8, fontSize: 11, fill: "#b0a080" }}>
                    {gouvernoratData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? GOLD : i === 1 ? GOLD_DARK : i % 2 === 0 ? GOLD_LIGHT : "#d4c077"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status donut */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "white",
            border: "1px solid #f0e8cc",
            boxShadow: "0 2px 16px rgba(212,175,55,0.07), 0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div className="px-6 py-4 flex items-start justify-between" style={{ borderBottom: "1px solid #f7f0dc" }}>
            <div>
              <h2 className="font-bold text-base" style={{ color: "#1a1a1a", fontFamily: "var(--font-playfair, serif)" }}>
                حالات الطلبات
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "#b0a080" }}>توزيع الطلبات</p>
            </div>
            <div className="w-1.5 h-8 rounded-full flex-shrink-0 mt-0.5" style={{ background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DARK} 100%)` }} />
          </div>
          <div className="p-5 sm:p-6">
            {statusData.length === 0 ? <EmptyState /> : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={76}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={STATUS_PALETTE[entry.name] || PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<GoldTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5 mt-3">
                  {statusData.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: STATUS_PALETTE[s.name] || PALETTE[i % PALETTE.length] }}
                        />
                        <span className="text-xs truncate" style={{ color: "#5a4e35" }}>{s.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold" style={{ color: "#1a1a1a" }}>{s.value}</span>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                          style={{ background: GOLD_PALE, color: GOLD_DARK }}
                        >
                          {scopedOrders.length ? `${((s.value / scopedOrders.length) * 100).toFixed(0)}%` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Top sellers */}
      <SectionCard title="أفضل البائعين" subtitle="البائعون الذين حققوا أكثر الطلبات عبر كودهم">
        {sellerData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12" style={{ color: "#d4c077" }}>
            <svg className="w-10 h-10 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "#b0a080" }}>لم يُستخدم أي كود ترويجي بعد</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sellerData} margin={{ top: 4, right: 16, left: -16, bottom: 8 }} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#faf4e0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={<WrappedTick />}
                axisLine={false}
                tickLine={false}
                interval={0}
                height={40}
              />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<GoldTooltip />} />
              <Bar dataKey="orders" name="Commandes" radius={[8, 8, 0, 0]}>
                {sellerData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? GOLD : i === 1 ? GOLD_DARK : i % 2 === 0 ? GOLD_LIGHT : "#c8ac3a"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      {/* Top users by items sold this month */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid #f0e8cc",
          boxShadow: "0 2px 16px rgba(212,175,55,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f7f0dc" }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: "#1a1a1a", fontFamily: "var(--font-playfair, serif)" }}>
              أكثر المشترين هذا الشهر
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#b0a080" }}>
              ترتيب العملاء حسب عدد القطع المشتراة في{" "}
              <span style={{ color: GOLD_DARK, fontWeight: 600 }}>
                {new Date().toLocaleString("ar-TN", { month: "long", year: "numeric" })}
              </span>
            </p>
          </div>
          <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DARK} 100%)` }} />
        </div>

        {topUsersByItemsThisMonth.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12" style={{ color: "#d4c077" }}>
            <svg className="w-10 h-10 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm font-medium" style={{ color: "#b0a080" }}>لا توجد طلبات هذا الشهر بعد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#fdf8ec", borderBottom: "1px solid #f0e8cc" }}>
                  {["#", "العميل", "البريد الإلكتروني", "القطع المشتراة", "الطلبات"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "#a0916a", letterSpacing: "0.07em" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topUsersByItemsThisMonth.map((user, i) => {
                  const maxItems = topUsersByItemsThisMonth[0]?.items || 1;
                  const barPct = ((user.items / maxItems) * 100).toFixed(0);
                  return (
                    <tr
                      key={user.email || user.name}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid #faf5e8" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf8ec")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-4 py-3.5 text-xs font-bold w-10" style={{ color: i === 0 ? GOLD_DARK : i === 1 ? "#9ca3af" : i === 2 ? "#b45309" : "#c8b87a" }}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </td>
                      <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: "#1a1a1a" }}>
                        {user.name}
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: "#78716c" }}>
                        {user.email || "—"}
                      </td>
                      <td className="px-4 py-3.5 min-w-[160px]">
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: GOLD_PALE }}>
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${barPct}%`,
                                background: i === 0
                                  ? `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`
                                  : `linear-gradient(90deg, ${GOLD_LIGHT} 0%, ${GOLD} 100%)`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold flex-shrink-0 w-10 text-left" style={{ color: i === 0 ? GOLD_DARK : "#5a4e35" }}>
                            {user.items}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-md"
                          style={{ background: GOLD_PALE, color: GOLD_DARK }}
                        >
                          {user.orders} طلب
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Gouvernorat detail table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: "1px solid #f0e8cc",
          boxShadow: "0 2px 16px rgba(212,175,55,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f7f0dc" }}>
          <div>
            <h2 className="font-bold text-base" style={{ color: "#1a1a1a", fontFamily: "var(--font-playfair, serif)" }}>
              تفاصيل حسب الولاية
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#b0a080" }}>إجمالي الطلبات والإيرادات لكل منطقة</p>
          </div>
          <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DARK} 100%)` }} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "#fdf8ec", borderBottom: "1px solid #f0e8cc" }}>
                {["#", "الولاية", "الطلبات", "الإيراد (TND)", "الحصة"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: "#a0916a", letterSpacing: "0.07em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gouvernoratData.map((row, i) => {
                const pct = scopedOrders.length > 0 ? ((row.orders / scopedOrders.length) * 100).toFixed(1) : "0";
                return (
                  <tr
                    key={row.name}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid #faf5e8" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf8ec")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-3.5 text-xs font-bold" style={{ color: i === 0 ? GOLD_DARK : "#c8b87a" }}>
                      {i === 0 ? "★" : i + 1}
                    </td>
                    <td className="px-4 py-3.5 font-semibold" style={{ color: "#1a1a1a" }}>{row.name}</td>
                    <td className="px-4 py-3.5" style={{ color: "#5a4e35" }}>{row.orders}</td>
                    <td className="px-4 py-3.5 font-bold" style={{ color: GOLD_DARK }}>{row.revenue.toFixed(2)}</td>
                    <td className="px-4 py-3.5 min-w-[140px]">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: GOLD_PALE }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_DARK} 100%)`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold w-10 text-left flex-shrink-0" style={{ color: GOLD_DARK }}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      </>
      ) : (
      <>

      {/* Month selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm font-semibold" style={{ color: "#5a4e35" }}>اختر الشهر</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm font-semibold"
          style={{
            background: "white",
            border: `1px solid ${GOLD_LIGHT}`,
            color: GOLD_DARK,
          }}
        >
          {availableMonths.length === 0 && <option value={selectedMonth}>{monthLabel(selectedMonth)}</option>}
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}{m === currentMonthKey ? " (الحالي)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Month recap */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          accent
          label="إجمالي الطلبات"
          value={archiveOrders.length}
          sub={`${archiveStats.delivered.length} تم التسليم`}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <StatCard
          label="رقم الأعمال"
          value={`${archiveStats.totalRevenue.toFixed(0)} TND`}
          sub={monthLabel(selectedMonth)}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="أفضل بائع"
          value={archiveStats.bestSeller?.name || "—"}
          sub={archiveStats.bestSeller ? `${archiveStats.bestSeller.orders} طلب` : "لا يوجد كود مستخدم"}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
        />
        <StatCard
          label="أفضل ولاية"
          value={archiveStats.bestGouvernorat?.name || "—"}
          sub={archiveStats.bestGouvernorat ? `${archiveStats.bestGouvernorat.orders} طلب` : undefined}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
      </div>

      {archiveOrders.length === 0 ? (
        <SectionCard title={`إحصائيات ${monthLabel(selectedMonth)}`}>
          <EmptyState />
        </SectionCard>
      ) : (
        <>
          {/* Best day of the month */}
          {archiveStats.bestDay && (
            <SectionCard title="أفضل يوم" subtitle={`أعلى إيراد خلال ${monthLabel(selectedMonth)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold" style={{ color: "#1a1a1a", fontFamily: "var(--font-playfair, serif)" }}>
                    {new Date(archiveStats.bestDay.date).toLocaleDateString("ar-TN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#b0a080" }}>{archiveStats.bestDay.orders} طلب</p>
                </div>
                <p className="text-2xl font-bold" style={{ color: GOLD_DARK }}>
                  {archiveStats.bestDay.revenue.toFixed(2)} TND
                </p>
              </div>
            </SectionCard>
          )}

          {/* Sellers ranking for the selected month */}
          <SectionCard title="ترتيب البائعين" subtitle={`الأداء خلال ${monthLabel(selectedMonth)}`}>
            {archiveStats.sellerData.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#fdf8ec", borderBottom: "1px solid #f0e8cc" }}>
                      {["#", "البائع", "الطلبات", "الإيراد (TND)"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                          style={{ color: "#a0916a", letterSpacing: "0.07em" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {archiveStats.sellerData.map((s, i) => (
                      <tr key={s.code} style={{ borderBottom: "1px solid #faf5e8" }}>
                        <td className="px-4 py-3.5 text-xs font-bold" style={{ color: i === 0 ? GOLD_DARK : "#c8b87a" }}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </td>
                        <td className="px-4 py-3.5 font-semibold" style={{ color: "#1a1a1a" }}>{s.name}</td>
                        <td className="px-4 py-3.5" style={{ color: "#5a4e35" }}>{s.orders}</td>
                        <td className="px-4 py-3.5 font-bold" style={{ color: GOLD_DARK }}>{s["revenue TND"].toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Gouvernorat breakdown for the selected month */}
          <SectionCard title="المبيعات حسب الولاية" subtitle={monthLabel(selectedMonth)}>
            {archiveStats.gouvernoratData.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#fdf8ec", borderBottom: "1px solid #f0e8cc" }}>
                      {["#", "الولاية", "الطلبات", "الإيراد (TND)"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                          style={{ color: "#a0916a", letterSpacing: "0.07em" }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {archiveStats.gouvernoratData.map((row, i) => (
                      <tr key={row.name} style={{ borderBottom: "1px solid #faf5e8" }}>
                        <td className="px-4 py-3.5 text-xs font-bold" style={{ color: i === 0 ? GOLD_DARK : "#c8b87a" }}>
                          {i === 0 ? "★" : i + 1}
                        </td>
                        <td className="px-4 py-3.5 font-semibold" style={{ color: "#1a1a1a" }}>{row.name}</td>
                        <td className="px-4 py-3.5" style={{ color: "#5a4e35" }}>{row.orders}</td>
                        <td className="px-4 py-3.5 font-bold" style={{ color: GOLD_DARK }}>{row.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </>
      )}

      {/* 12-month trend */}
      <SectionCard title="المبيعات الشهرية" subtitle="الطلبات والإيرادات خلال آخر 12 شهراً">
        {monthData.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradArchive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="darkGradArchive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5ecc0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={axisStyle}
                axisLine={false}
                tickLine={false}
                interval={0}
                height={40}
                tickMargin={8}
              />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                tick={axisStyle}
                axisLine={false} tickLine={false}
                width={54}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis
                yAxisId="orders"
                orientation="left"
                tick={{ ...axisStyle, fill: "#c8b87a" }}
                axisLine={false} tickLine={false}
                width={28}
              />
              <Tooltip content={<GoldTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                formatter={(v) => <span style={{ color: "#a0916a", fontFamily: "var(--font-inter, sans-serif)" }}>{v}</span>}
              />
              <Area yAxisId="revenue" type="monotone" dataKey="Revenu TND" stroke={GOLD} strokeWidth={2.5} fill="url(#goldGradArchive)" dot={false} activeDot={{ r: 5, fill: GOLD, stroke: "white", strokeWidth: 2 }} />
              <Area yAxisId="orders" type="monotone" dataKey="Commandes" stroke="#1a1a1a" strokeWidth={2} fill="url(#darkGradArchive)" dot={false} activeDot={{ r: 4, fill: "#1a1a1a", stroke: "white", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </SectionCard>

      </>
      )}

    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-40" style={{ color: "#d4c077" }}>
      <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-sm font-medium" style={{ color: "#b0a080" }}>لا توجد بيانات</p>
    </div>
  );
}
