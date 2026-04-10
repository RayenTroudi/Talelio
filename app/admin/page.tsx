"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/app/components/LocaleProvider";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalPerfumes: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  revenue: number;
  pendingPromoRequests: number;
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [perfumesRes, ordersRes, promoRes] = await Promise.all([
          fetch('/api/perfumes'),
          fetch('/api/admin/orders?limit=500'),
          fetch('/api/admin/promo-requests?status=PENDING'),
        ]);

        const perfumesData = perfumesRes.ok ? await perfumesRes.json() : { total: 0 };
        const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [], total: 0 };
        const promoData = promoRes.ok ? await promoRes.json() : { requests: [] };

        const orders: any[] = ordersData.orders || [];
        const today = new Date().toDateString();

        setStats({
          totalPerfumes: perfumesData.total ?? 0,
          totalOrders: ordersData.total ?? orders.length,
          pendingOrders: orders.filter((o) => o.status === 'pending').length,
          deliveredOrders: orders.filter((o) => o.status === 'delivered').length,
          revenue: orders
            .filter((o) => o.status !== 'cancelled')
            .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
          pendingPromoRequests: (promoData.requests || []).length,
        });
      } catch (e) {
        console.error('Failed to load dashboard stats', e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const fmt = (n: number) => n.toLocaleString('fr-TN');

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{t.admin.dashboard.title}</h1>
        <p className="text-gray-600 text-sm sm:text-base">{t.admin.dashboard.subtitle}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 text-center">
          {loading ? (
            <div className="h-8 w-12 mx-auto mb-1 bg-gray-200 rounded animate-pulse" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">{fmt(stats?.totalPerfumes ?? 0)}</div>
          )}
          <div className="text-gray-600 text-xs sm:text-sm">{t.admin.dashboard.totalPerfumes}</div>
        </Card>

        <Card className="p-4 sm:p-5 text-center">
          {loading ? (
            <div className="h-8 w-12 mx-auto mb-1 bg-gray-200 rounded animate-pulse" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-gray-700 mb-1">{fmt(stats?.totalOrders ?? 0)}</div>
          )}
          <div className="text-gray-600 text-xs sm:text-sm">{t.admin.dashboard.todayOrders}</div>
        </Card>

        <Card className="p-4 sm:p-5 text-center">
          {loading ? (
            <div className="h-8 w-12 mx-auto mb-1 bg-gray-200 rounded animate-pulse" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">{fmt(stats?.pendingOrders ?? 0)}</div>
          )}
          <div className="text-gray-600 text-xs sm:text-sm">{t.admin.orders.statuses.pending}</div>
        </Card>

        <Card className="p-4 sm:p-5 text-center">
          {loading ? (
            <div className="h-8 w-12 mx-auto mb-1 bg-gray-200 rounded animate-pulse" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{fmt(stats?.deliveredOrders ?? 0)}</div>
          )}
          <div className="text-gray-600 text-xs sm:text-sm">{t.admin.orders.statuses.delivered}</div>
        </Card>

        <Card className="p-4 sm:p-5 text-center">
          {loading ? (
            <div className="h-8 w-16 mx-auto mb-1 bg-gray-200 rounded animate-pulse" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">{fmt(stats?.revenue ?? 0)}</div>
          )}
          <div className="text-gray-600 text-xs sm:text-sm">{t.admin.dashboard.revenue} (TND)</div>
        </Card>

        <Card className="p-4 sm:p-5 text-center">
          {loading ? (
            <div className="h-8 w-12 mx-auto mb-1 bg-gray-200 rounded animate-pulse" />
          ) : (
            <div className="text-2xl sm:text-3xl font-bold text-orange-500 mb-1">{fmt(stats?.pendingPromoRequests ?? 0)}</div>
          )}
          <div className="text-gray-600 text-xs sm:text-sm">{t.admin.dashboard.promoRequests}</div>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Add Perfume */}
        <Card className="p-5 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t.admin.dashboard.addPerfume}</h3>
            <p className="text-gray-600 mb-4 text-sm">{t.admin.dashboard.addPerfumeDesc}</p>
            <Button asChild className="w-full">
              <Link href="/admin/perfumes/add">{t.admin.dashboard.addPerfumeBtn}</Link>
            </Button>
          </div>
        </Card>

        {/* Manage Perfumes */}
        <Card className="p-5 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t.admin.dashboard.managePerfumes}</h3>
            <p className="text-gray-600 mb-4 text-sm">{t.admin.dashboard.managePerfumesDesc}</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/perfumes">{t.admin.dashboard.managePerfumesBtn}</Link>
            </Button>
          </div>
        </Card>

        {/* Orders */}
        <Card className="p-5 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t.admin.dashboard.orders}</h3>
            <p className="text-gray-600 mb-4 text-sm">{t.admin.dashboard.ordersDesc}</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/orders">{t.admin.dashboard.ordersBtn}</Link>
            </Button>
          </div>
        </Card>

        {/* Promo Code Requests */}
        <Card className="p-5 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gold-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{t.admin.dashboard.promoRequests}</h3>
            <p className="text-gray-600 mb-4 text-sm">{t.admin.dashboard.promoRequestsDesc}</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/promo-requests">{t.admin.dashboard.promoRequestsBtn}</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
