"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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
          <h1 className="text-2xl font-bold text-gray-900">الطلبات</h1>
          <p className="text-gray-600 mt-1">إدارة طلبات العملاء والشحن</p>
        </div>
        <Button variant="outline" disabled>
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          تصدير الطلبات
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
              <p className="text-sm font-medium text-gray-500">الإجمالي</p>
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
              <p className="text-sm font-medium text-gray-500">قيد الانتظار</p>
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
              <p className="text-sm font-medium text-gray-500">مؤكد</p>
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
              <p className="text-sm font-medium text-gray-500">تم التوصيل</p>
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
              <p className="text-sm font-medium text-gray-500">الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.revenue.toFixed(2)} DT</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'confirmed', 'delivered', 'cancelled'] as const).map((status) => {
          const statusLabels = {
            all: 'الكل',
            pending: 'قيد الانتظار',
            confirmed: 'مؤكد',
            delivered: 'تم التوصيل',
            cancelled: 'ملغى'
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
            {filter === 'all' ? 'جميع الطلبات' : `طلبات ${{
              pending: 'قيد الانتظار',
              confirmed: 'مؤكدة',
              delivered: 'تم توصيلها',
              cancelled: 'ملغاة'
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">لم يتم العثور على طلبات</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'ستظهر الطلبات هنا عندما يقوم العملاء بعمليات الشراء.' 
                : `لا توجد طلبات ${{
                  pending: 'قيد الانتظار',
                  confirmed: 'مؤكدة',
                  delivered: 'تم توصيلها',
                  cancelled: 'ملغاة'
                }[filter as 'pending' | 'confirmed' | 'delivered' | 'cancelled']} في الوقت الحالي.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم الطلب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الهاتف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الولاية
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجمالي
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const address = parseAddress(order.shipingAdress);
                  const isExpanded = expandedOrder === order.$id;
                  
                  return (
                    <React.Fragment key={order.$id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-900">
                            #{order.$id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{address.fullName || order.UserName}</div>
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
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(order.status)}`}>
                            {{
                              pending: 'قيد الانتظار',
                              confirmed: 'مؤكد',
                              delivered: 'تم التوصيل',
                              cancelled: 'ملغى'
                            }[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.$createdAt).toLocaleDateString('ar-TN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.$id)}
                            className="text-stone-600 hover:text-stone-900 font-medium"
                          >
                            {isExpanded ? 'إخفاء' : 'عرض'}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="px-6 py-6 bg-gray-50">
                            <div className="space-y-6">
                              {/* Order Info Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Delivery Information */}
                                <Card className="p-4">
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <svg className="w-5 h-5 ml-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    معلومات التوصيل
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p><span className="font-medium text-gray-700">الاسم:</span> {address.fullName || 'N/A'}</p>
                                    <p><span className="font-medium text-gray-700">الهاتف:</span> {address.phone || 'N/A'}</p>
                                    <p><span className="font-medium text-gray-700">العنوان:</span> {address.address || 'N/A'}</p>
                                    <p><span className="font-medium text-gray-700">المدينة:</span> {address.city || 'N/A'}</p>
                                    <p><span className="font-medium text-gray-700">الولاية:</span> {address.gouvernorat || 'N/A'}</p>
                                    <p><span className="font-medium text-gray-700">الرمز البريدي:</span> {address.postalCode || 'N/A'}</p>
                                    {address.notes && (
                                      <p className="pt-2 border-t border-gray-200">
                                        <span className="font-medium text-gray-700">ملاحظات:</span> {address.notes}
                                      </p>
                                    )}
                                  </div>
                                </Card>

                                {/* Order Summary */}
                                <Card className="p-4">
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <svg className="w-5 h-5 ml-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    ملخص الطلب
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p><span className="font-medium text-gray-700">رقم الطلب:</span> #{order.$id.slice(-8).toUpperCase()}</p>
                                    <p><span className="font-medium text-gray-700">التاريخ:</span> {formatDate(order.$createdAt)}</p>
                                    <p><span className="font-medium text-gray-700">طريقة الدفع:</span> {order.paymentmethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : order.paymentmethod}</p>
                                    <p><span className="font-medium text-gray-700">تم الدفع:</span> {order.Ispaid ? 'نعم' : 'لا'}</p>
                                    <Separator className="my-2" />
                                    <p><span className="font-medium text-gray-700">سعر المنتجات:</span> {order.itemsPrice.toFixed(2)} دينار</p>
                                    <p><span className="font-medium text-gray-700">الشحن:</span> {order.shipingPrice.toFixed(2)} دينار</p>
                                    <p className="text-base font-semibold text-gray-900 pt-2 border-t border-gray-200">
                                      <span>الإجمالي:</span> {order.totalPrice.toFixed(2)} دينار
                                    </p>
                                  </div>
                                </Card>
                              </div>

                              {/* Ordered Items */}
                              <Card className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                  <svg className="w-5 h-5 ml-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                  المنتجات المطلوبة ({address.items?.length || 0})
                                </h4>
                                {address.items && address.items.length > 0 ? (
                                  <div className="space-y-3">
                                    {address.items.map((item: any, idx: number) => (
                                      <div key={idx} className="flex justify-between items-start p-3 bg-white rounded-lg border border-gray-200">
                                        <div>
                                          <p className="font-medium text-gray-900">{item.Name || item.name || 'منتج غير معروف'}</p>
                                          <p className="text-sm text-gray-600">{item.Brand || item.brand || ''}</p>
                                          {item.size && <p className="text-sm text-gray-500">الحجم: {item.size}</p>}
                                          <p className="text-sm text-gray-500">الكمية: {item.qty || item.quantity || 1}</p>
                                        </div>
                                        <div className="text-left">
                                          <p className="font-semibold text-gray-900">{(item.Price || item.price || 0).toFixed(2)} دينار</p>
                                          <p className="text-xs text-gray-500">للواحد</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">لا تتوفر معلومات عن المنتجات</p>
                                )}
                              </Card>

                              {/* Status Update */}
                              <Card className="p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">تحديث حالة الطلب</h4>
                                <div className="flex gap-2 flex-wrap">
                                  {[{value: 'pending', label: 'قيد الانتظار'}, {value: 'confirmed', label: 'مؤكد'}, {value: 'delivered', label: 'تم التوصيل'}, {value: 'cancelled', label: 'ملغى'}].map(({value, label}) => (
                                    <button
                                      key={value}
                                      onClick={() => updateOrderStatus(order.$id, value)}
                                      disabled={order.status === value}
                                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        order.status === value
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                                      }`}
                                    >
                                      تحديد إلى {label}
                                    </button>
                                  ))}
                                </div>
                              </Card>
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
      </Card>
    </div>
  );
}