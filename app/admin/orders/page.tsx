"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/app/components/LocaleProvider";

interface Order {
  $id: string;
  $createdAt: string;
  UserEmail: string;
  UserName: string;
  shipingAdress: string; // JSON string containing address and items
  itemsPrice: number;
  shipingPrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentmethod: string;
  Ispaid: boolean;
}

interface ParsedAddress {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  gouvernorat?: string;
  postalCode?: string;
  notes?: string;
  items?: any[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        console.error('Failed to fetch orders:', data.error);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (response.ok) {
        // Refresh orders
        fetchOrders();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const parseAddress = (addressJson: string): ParsedAddress => {
    try {
      return JSON.parse(addressJson);
    } catch {
      return {};
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };

    return styles[status as keyof typeof styles] || styles.pending;
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalPrice, 0),
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.admin.orders.title}</h1>
          <p className="text-gray-600 mt-1">{t.admin.orders.subtitle}</p>
        </div>
        <Button variant="outline" disabled>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t.admin.orders.export}
        </Button>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">{t.admin.orders.totalStat}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">{t.admin.orders.statuses.pending}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">{t.admin.orders.statuses.confirmed}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">{t.admin.orders.statuses.delivered}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">{t.admin.dashboard.revenue}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.revenue.toFixed(2)} DT</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'confirmed', 'delivered', 'cancelled'] as const).map((status) => {
          const statusLabels = {
            all: t.admin.promoRequests.all,
            pending: t.admin.orders.statuses.pending,
            confirmed: t.admin.orders.statuses.confirmed,
            delivered: t.admin.orders.statuses.delivered,
            cancelled: t.admin.orders.statuses.cancelled,
          };

          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === status
                  ? 'bg-white text-gray-700 border-2 border-gray-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {statusLabels[status]}
              {status !== 'all' && (
                <span className="mr-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                  {orders.filter(o => o.status === status).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filter === 'all' ? t.admin.orders.allOrders : `${t.admin.orders.title} ${{
              pending: t.admin.orders.statuses.pending,
              confirmed: t.admin.orders.statuses.confirmed,
              delivered: t.admin.orders.statuses.delivered,
              cancelled: t.admin.orders.statuses.cancelled,
            }[filter as 'pending' | 'confirmed' | 'delivered' | 'cancelled']}`}
          </h3>
        </div>

        {loading ? (
          <div className="p-12">
            {/* Table Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t.admin.orders.noOrders}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all'
                ? t.admin.orders.filterEmptyAll
                : `${t.admin.orders.noOrders} ${{
                  pending: t.admin.orders.statuses.pending,
                  confirmed: t.admin.orders.statuses.confirmed,
                  delivered: t.admin.orders.statuses.delivered,
                  cancelled: t.admin.orders.statuses.cancelled,
                }[filter as 'pending' | 'confirmed' | 'delivered' | 'cancelled']} ${t.admin.orders.filterEmptySuffix}`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.admin.orders.orderNumber}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.admin.orders.customer}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.admin.orders.phone}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.shipping.gouvernorat}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.admin.orders.total}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.admin.orders.status}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.admin.orders.date}
                  </th>

                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const address = parseAddress(order.shipingAdress);

                  return (
                    <React.Fragment key={order.$id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-900">
                            #{order.$id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 cursor-pointer"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 hover:text-amber-600 transition-colors underline-offset-2 hover:underline">{address.fullName || order.UserName}</div>
                            <div className="text-gray-500">{order.UserEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {address.phone || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {address.gouvernorat || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {order.totalPrice.toFixed(2)} DT
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.$id, e.target.value)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(order.status)}`}
                          >
                            <option value="pending">{t.admin.orders.statuses.pending}</option>
                            <option value="confirmed">{t.admin.orders.statuses.confirmed}</option>
                            <option value="delivered">{t.admin.orders.statuses.delivered}</option>
                            <option value="cancelled">{t.admin.orders.statuses.cancelled}</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.$createdAt).toLocaleDateString('ar-TN')}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {/* Order Details Modal */}
      {selectedOrder && (() => {
        const addr = parseAddress(selectedOrder.shipingAdress);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{t.admin.orders.orderDetails}</h2>
                  <p className="text-sm text-gray-500">#{selectedOrder.$id.slice(-8).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Customer & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Delivery Info */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {t.admin.orders.shippingAddress}
                    </h3>
                    <p><span className="font-medium text-gray-700">{t.admin.orders.name}: </span>{addr.fullName || selectedOrder.UserName}</p>
                    <p><span className="font-medium text-gray-700">{t.admin.orders.email}: </span>{selectedOrder.UserEmail}</p>
                    <p><span className="font-medium text-gray-700">{t.admin.orders.phone}: </span>{addr.phone || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">{t.admin.orders.addressLabel}: </span>{addr.address || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">{t.shipping.city}: </span>{addr.city || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">{t.shipping.gouvernorat}: </span>{addr.gouvernorat || 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">{t.shipping.postalCode}: </span>{addr.postalCode || 'N/A'}</p>
                    {addr.notes && <p className="pt-2 border-t border-gray-200"><span className="font-medium text-gray-700">{t.admin.orders.notes}: </span>{addr.notes}</p>}
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {t.admin.orders.orderSummaryLabel}
                    </h3>
                    <p><span className="font-medium text-gray-700">{t.admin.orders.date}: </span>{formatDate(selectedOrder.$createdAt)}</p>
                    <p><span className="font-medium text-gray-700">{t.admin.orders.paymentMethod}: </span>{selectedOrder.paymentmethod === 'cash_on_delivery' ? t.placeOrder.cashOnDelivery : selectedOrder.paymentmethod}</p>
                    <p><span className="font-medium text-gray-700">{t.admin.orders.isPaid}: </span>{selectedOrder.Ispaid ? t.admin.orders.yes : t.admin.orders.no}</p>
                    <div className="pt-2 border-t border-gray-200 space-y-1">
                      <p><span className="font-medium text-gray-700">{t.admin.orders.itemsPrice}: </span>{selectedOrder.itemsPrice.toFixed(2)} {t.productDetail.currency}</p>
                      <p><span className="font-medium text-gray-700">{t.admin.orders.shippingCost}: </span>{selectedOrder.shipingPrice.toFixed(2)} {t.productDetail.currency}</p>
                      <p className="text-base font-bold text-gray-900 pt-1 border-t border-gray-200">{t.admin.orders.total}: {selectedOrder.totalPrice.toFixed(2)} {t.productDetail.currency}</p>
                    </div>
                  </div>
                </div>

                {/* Ordered Items */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {t.admin.orders.items} ({addr.items?.length || 0})
                  </h3>
                  {addr.items && addr.items.length > 0 ? (
                    <div className="space-y-2">
                      {addr.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-start p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div>
                            <p className="font-medium text-gray-900">{item.Name || item.name || t.admin.orders.unknownProduct}</p>
                            <p className="text-sm text-gray-500">{item.Brand || item.brand || ''}</p>
                            {item.size && <p className="text-xs text-gray-400">{t.admin.orders.sizeLabel}: {item.size}</p>}
                            <p className="text-xs text-gray-400">{t.placeOrder.qty}: {item.qty || item.quantity || 1}</p>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">{(item.Price || item.price || 0).toFixed(2)} {t.productDetail.currency}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">{t.admin.orders.noProductsInfo}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
