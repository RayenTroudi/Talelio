"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface Order {
  $id: string;
  $createdAt: string;
  UserEmail: string;
  UserName: string;
  shipingAdress: string;
  itemsPrice: number;
  shipingPrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentmethod: string;
  Ispaid: boolean;
}

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/SignIn');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'confirmed':
        return 'مؤكد';
      case 'delivered':
        return 'تم التوصيل';
      case 'cancelled':
        return 'ملغى';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'confirmed':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'delivered':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-6 lg:px-16">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block mb-6">
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight">
              طلباتي
            </h1>
            <p className="text-gray-600 font-light mt-3 text-lg">
              تتبع حالة طلباتك
            </p>
          </div>

          {loadingOrders ? (
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 font-light">جاري التحميل...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center min-h-[40vh] px-4">
              <div className="max-w-md w-full bg-gradient-to-br from-white via-amber-50/30 to-amber-50/20 backdrop-blur-sm rounded-3xl p-12 md:p-14 shadow-2xl border border-amber-100/50 text-center">
                <div className="relative mx-auto w-32 h-32 mb-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-amber-200/30 rounded-full animate-pulse"></div>
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-50 to-amber-100/40 flex items-center justify-center shadow-inner">
                    <svg
                      className="w-16 h-16 text-amber-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4 tracking-tight">
                  لا توجد طلبات
                </h2>
                <p className="text-gray-600 font-light leading-relaxed mb-10 text-base">
                  لم تقم بأي طلب بعد. تصفح عطورنا وابدأ تجربتك.
                </p>

                <Link
                  href="/"
                  className="group inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl font-light tracking-wide transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <span>اكتشف عطورنا</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                let orderItems: any[] = [];
                try {
                  const parsed = JSON.parse(order.shipingAdress);
                  orderItems = parsed.items || [];
                } catch {
                  // ignore parse errors
                }

                return (
                  <div
                    key={order.$id}
                    className="bg-white rounded-3xl border border-amber-200/50 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="p-6 md:p-8">
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-stone-200">
                        <div className="text-right">
                          <p className="text-sm text-stone-500 font-light mb-1">
                            رقم الطلب
                          </p>
                          <p className="text-lg font-medium text-stone-900">
                            #{order.$id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-stone-500 font-light mb-1">
                            التاريخ
                          </p>
                          <p className="text-stone-900 font-light">
                            {formatDate(order.$createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-stone-500 font-light mb-1">
                            الحالة
                          </p>
                          <span
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-stone-500 font-light mb-1">
                            المجموع
                          </p>
                          <p className="text-2xl font-light text-amber-600">
                            {order.totalPrice.toFixed(2)} TND
                          </p>
                        </div>
                      </div>

                      {/* Order Items */}
                      {orderItems.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-stone-700 mb-3">
                            المنتجات:
                          </p>
                          {orderItems.map((item: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-4 p-3 bg-amber-50/30 rounded-xl"
                            >
                              <div className="flex items-center gap-3 flex-row-reverse">
                                {item.Image && (
                                  <Image
                                    src={item.Image}
                                    width={50}
                                    height={50}
                                    className="rounded-lg"
                                    alt={item.Name || 'Product'}
                                  />
                                )}
                                <div className="text-right">
                                  <p className="font-medium text-stone-900 text-sm">
                                    {item.Name}
                                  </p>
                                  <p className="text-xs text-stone-600">
                                    {item.Brand} • {item.size}
                                  </p>
                                </div>
                              </div>
                              <div className="text-left">
                                <p className="text-sm text-stone-700">
                                  الكمية: {item.qty}
                                </p>
                                <p className="text-sm font-medium text-amber-600">
                                  {(item.Price * item.qty).toFixed(2)} TND
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrdersPage;
