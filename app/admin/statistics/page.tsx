"use client";

import React, { useState, useEffect, useMemo } from "react";
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
}

const PALETTE = ["#1c1917", "#44403c", "#78716c", "#a8a29e", "#c4bfbb", "#d6d3d1"];

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr",
  "05": "Mai", "06": "Jui", "07": "Jul", "08": "Aoû",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Déc",
};

function parseAddress(raw: string): ParsedAddress {
  try { return JSON.parse(raw); } catch { return {}; }
}

function StatCard({ label, value, sub, icon }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 flex items-start gap-3 sm:gap-4 shadow-sm">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-900 flex items-center justify-center flex-shrink-0 text-white">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-stone-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-stone-900 mt-0.5 leading-tight truncate">{value}</p>
        {sub && <p className="text-[10px] sm:text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-stone-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl border border-stone-700 max-w-[200px]">
      {label && <p className="font-semibold mb-1.5 text-stone-200 truncate">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-stone-300 leading-relaxed">
          {p.name}:{" "}
          <span className="text-white font-bold">
            {p.name?.toLowerCase().includes("tnd")
              ? `${Number(p.value).toFixed(2)} TND`
              : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

// Custom X-axis tick that rotates and truncates long labels
const RotatedTick = ({ x, y, payload }: any) => (
  <g transform={`translate(${x},${y})`}>
    <text
      x={0} y={0} dy={12}
      textAnchor="end"
      transform="rotate(-38)"
      fill="#78716c"
      fontSize={11}
    >
      {payload.value.length > 14 ? payload.value.slice(0, 13) + "…" : payload.value}
    </text>
  </g>
);

export default function StatisticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [promoMap, setPromoMap] = useState<Record<string, { name: string; code: string }>>({});
  const [loading, setLoading] = useState(true);
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

  const delivered = useMemo(() => orders.filter((o) => o.status === "delivered"), [orders]);
  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + (o.totalPrice || 0), 0), [orders]);

  // Gouvernorat data
  const gouvernoratData = useMemo(() => {
    const map: Record<string, { orders: number; revenue: number }> = {};
    for (const order of orders) {
      const addr = parseAddress(order.shipingAdress);
      const gov = addr.gouvernorat?.trim() || "Inconnu";
      if (!map[gov]) map[gov] = { orders: 0, revenue: 0 };
      map[gov].orders += 1;
      map[gov].revenue += order.totalPrice || 0;
    }
    return Object.entries(map)
      .map(([name, d]) => ({ name, orders: d.orders, revenue: parseFloat(d.revenue.toFixed(2)) }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);
  }, [orders]);

  // Seller data — use seller name from promoMap
  const sellerData = useMemo(() => {
    const map: Record<string, { orders: number; revenue: number; name: string; code: string }> = {};
    for (const order of orders) {
      if (!order.promoCodeId) continue;
      const id = order.promoCodeId;
      const info = promoMap[id];
      if (!map[id]) map[id] = {
        orders: 0,
        revenue: 0,
        name: info?.name || id.slice(0, 10) + "…",
        code: info?.code || id,
      };
      map[id].orders += 1;
      map[id].revenue += order.totalPrice || 0;
    }
    return Object.entries(map)
      .map(([, d]) => ({
        name: d.name,
        code: d.code,
        orders: d.orders,
        "revenue TND": parseFloat(d.revenue.toFixed(2)),
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 8);
  }, [orders, promoMap]);

  // Monthly data — split into two separate scales
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

  // Status pie
  const statusData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) map[o.status] = (map[o.status] || 0) + 1;
    const labels: Record<string, string> = {
      pending: "En attente", confirmed: "Confirmé",
      delivered: "Livré", cancelled: "Annulé",
    };
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({ name: labels[k] || k, value: v }));
  }, [orders]);

  const topGov = gouvernoratData[0]?.name || "—";
  const bestMonth = [...monthData].sort((a, b) => b.Commandes - a.Commandes)[0]?.name || "—";
  const bestMonthOrders = [...monthData].sort((a, b) => b.Commandes - a.Commandes)[0]?.Commandes || 0;

  // Dynamic left margin for gouvernorat YAxis based on longest name
  const govYAxisWidth = Math.min(120, Math.max(80, (gouvernoratData[0]?.name?.length || 8) * 7 + 10));

  if (loading) {
    return (
      <div className="space-y-6" dir="rtl">
        <div className="h-8 w-48 bg-stone-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-white rounded-2xl border border-stone-200 animate-pulse" />)}
        </div>
        {[1, 2, 3].map((i) => <div key={i} className="h-72 bg-white rounded-2xl border border-stone-200 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900">{t.admin.nav.statistics}</h1>
        <p className="text-stone-400 text-sm mt-0.5">Basé sur {orders.length} commandes au total</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total commandes" value={orders.length} sub={`${delivered.length} livrées`}
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <StatCard
          label="Chiffre d'affaires" value={`${totalRevenue.toFixed(0)} TND`} sub="Toutes commandes"
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Top gouvernorat" value={topGov} sub={gouvernoratData[0] ? `${gouvernoratData[0].orders} commandes` : undefined}
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          label="Meilleur mois" value={bestMonth} sub={`${bestMonthOrders} commandes`}
          icon={<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-stone-900 mb-1">Ventes par mois</h2>
        <p className="text-xs text-stone-400 mb-5">Commandes et revenus sur les 12 derniers mois</p>
        {monthData.length === 0 ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1c1917" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1c1917" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a8a29e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a8a29e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#a8a29e" }}
                axisLine={false} tickLine={false}
              />
              {/* Left axis: revenue */}
              <YAxis
                yAxisId="revenue"
                orientation="right"
                tick={{ fontSize: 10, fill: "#a8a29e" }}
                axisLine={false} tickLine={false}
                width={50}
                tickFormatter={(v) => `${v} TND`}
              />
              {/* Right axis: orders count */}
              <YAxis
                yAxisId="orders"
                orientation="left"
                tick={{ fontSize: 10, fill: "#c4bfbb" }}
                axisLine={false} tickLine={false}
                width={28}
              />
              <Tooltip content={<DarkTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                formatter={(v) => <span style={{ color: "#78716c" }}>{v}</span>}
              />
              <Area yAxisId="revenue" type="monotone" dataKey="Revenu TND" stroke="#1c1917" strokeWidth={2} fill="url(#g1)" dot={false} activeDot={{ r: 4 }} />
              <Area yAxisId="orders" type="monotone" dataKey="Commandes" stroke="#a8a29e" strokeWidth={2} fill="url(#g2)" dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Gouvernorat + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

        {/* Gouvernorat horizontal bars */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-bold text-stone-900 mb-1">Ventes par gouvernorat</h2>
          <p className="text-xs text-stone-400 mb-5">Nombre de commandes par région</p>
          {gouvernoratData.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={Math.max(220, gouvernoratData.length * 32)}>
              <BarChart
                data={gouvernoratData}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
                barSize={16}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#a8a29e" }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#57534e" }}
                  axisLine={false} tickLine={false}
                  width={govYAxisWidth}
                />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="orders" name="Commandes" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 11, fill: "#78716c" }}>
                  {gouvernoratData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[Math.min(i, PALETTE.length - 1)]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status donut */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6">
          <h2 className="text-sm font-bold text-stone-900 mb-1">Statuts</h2>
          <p className="text-xs text-stone-400 mb-5">Répartition des commandes</p>
          {statusData.length === 0 ? <EmptyState /> : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {statusData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {statusData.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PALETTE[i % PALETTE.length] }} />
                      <span className="text-xs text-stone-600">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-700">{s.value}</span>
                      <span className="text-[10px] text-stone-400">
                        {orders.length ? `${((s.value / orders.length) * 100).toFixed(0)}%` : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top sellers */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 sm:p-6">
        <h2 className="text-sm font-bold text-stone-900 mb-1">Top vendeurs</h2>
        <p className="text-xs text-stone-400 mb-5">Vendeurs ayant généré le plus de commandes via leur code</p>
        {sellerData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-stone-300">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-sm">Aucun code promo utilisé</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={sellerData}
              margin={{ top: 4, right: 8, left: -16, bottom: 60 }}
              barSize={32}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
              <XAxis
                dataKey="name"
                tick={<RotatedTick />}
                axisLine={false}
                tickLine={false}
                interval={0}
                height={64}
              />
              <YAxis tick={{ fontSize: 11, fill: "#a8a29e" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="orders" name="Commandes" radius={[6, 6, 0, 0]}>
                {sellerData.map((_, i) => (
                  <Cell key={i} fill={PALETTE[Math.min(i, PALETTE.length - 1)]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Gouvernorat detail table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-900">Détail par gouvernorat</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                {["#", "Gouvernorat", "Commandes", "Revenu (TND)", "Part"].map((h) => (
                  <th key={h} className="px-4 py-3 text-right text-xs font-semibold text-stone-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {gouvernoratData.map((row, i) => {
                const pct = orders.length > 0 ? ((row.orders / orders.length) * 100).toFixed(1) : "0";
                return (
                  <tr key={row.name} className="hover:bg-stone-50/60 transition-colors">
                    <td className="px-4 py-3 text-stone-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-stone-800">{row.name}</td>
                    <td className="px-4 py-3 text-stone-600">{row.orders}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{row.revenue.toFixed(2)}</td>
                    <td className="px-4 py-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-900 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-stone-400 w-9 text-left flex-shrink-0">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-stone-300">
      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-sm">Pas de données</p>
    </div>
  );
}
