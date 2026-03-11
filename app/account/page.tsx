"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/app/context/AuthContext";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { useRouter, useSearchParams } from "next/navigation";
import { Toast, useToast } from "@/components/ui/toast";
import Link from "next/link";

interface Order {
  $id: string;
  createdAt: string;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  totalPrice: number;
  deliveryAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: string;
  items: Array<{
    productId: string;
    productName: string;
    brand: string;
    size: string;
    quantity: number;
    price: number;
  }>;
}

function AccountPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, dismissToast } = useToast();

  // Show success notification if redirected from successful order
  useEffect(() => {
    const orderSuccessId = searchParams.get('orderSuccess');
    if (orderSuccessId) {
      showToast("🎉 Commande passée avec succès !", {
        description: `Votre commande #${orderSuccessId.slice(-8).toUpperCase()} a été enregistrée.`,
        variant: "success"
      });
      
      // Clean up URL after showing notification
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    // Fetch user orders from Appwrite
    const fetchOrders = async () => {
      try {
        if (user) {
          console.log('📥 Fetching orders for user:', user.email);
          
          const response = await fetch('/api/orders');
          const data = await response.json();
          
          if (response.ok) {
            console.log('✅ Orders fetched successfully:', data.orders?.length || 0);
            
            // Transform Appwrite orders to match our Order interface
            const transformedOrders = (data.orders || []).map((order: any) => {
              // Parse the shipping address JSON
              let shippingData;
              try {
                shippingData = JSON.parse(order.shipingAdress || '{}');
              } catch (e) {
                shippingData = {};
              }

              return {
                $id: order.$id,
                createdAt: order.$createdAt,
                status: order.status || 'pending',
                totalPrice: order.totalPrice || 0,
                deliveryAddress: {
                  fullName: shippingData.fullName || 'N/A',
                  address: shippingData.address || 'N/A',
                  city: shippingData.city || 'N/A',
                  postalCode: shippingData.postalCode || '',
                  country: 'Tunisia',
                  phone: shippingData.phone || 'N/A',
                },
                paymentMethod: order.paymentmethod || 'cash_on_delivery',
                items: shippingData.items || []
              };
            });
            
            setOrders(transformedOrders);
          } else {
            console.error('❌ Failed to fetch orders:', data.error);
          }
        }
      } catch (error) {
        console.error("❌ Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/20 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/30 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="h-9 w-48 bg-amber-200/30 rounded animate-pulse mb-4 mx-auto"></div>
            <div className="h-5 w-96 bg-amber-200/20 rounded animate-pulse mx-auto"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-white to-amber-50/20 rounded-3xl p-8 shadow-xl border border-amber-200/30">
                <div className="h-6 w-32 bg-amber-200/30 rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 w-full bg-amber-200/20 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-amber-200/20 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Orders skeleton */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <div className="h-6 w-48 bg-amber-200/30 rounded animate-pulse mb-6"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gradient-to-br from-white to-amber-50/20 rounded-3xl p-8 shadow-xl border border-amber-200/30">
                    <div className="h-5 w-32 bg-amber-200/30 rounded animate-pulse mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-amber-200/20 rounded animate-pulse"></div>
                      <div className="h-4 w-2/3 bg-amber-200/20 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/20 to-white">
      {/* Toast Container */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          description={toast.description}
          variant={toast.variant}
          visible={toast.visible}
          onClose={() => dismissToast(toast.id)}
        />
      ))}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
            <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
          </div>
          <h1 className="text-4xl font-light text-white text-center tracking-wide">حسابي</h1>
          <p className="mt-3 text-gray-300 font-light text-center tracking-wide">إدارة معلوماتك وعرض سجل طلباتك</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information Section */}
          <div className="lg:col-span-1">
            <Card className="p-8 bg-gradient-to-br from-white to-amber-50/20 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-amber-200/30">
              <h2 className="text-2xl font-light text-stone-900 mb-8 text-right tracking-wide">المعلومات الشخصية</h2>
              
              <div className="space-y-6">
                <div className="text-right">
                  <label className="text-sm font-light text-stone-500 tracking-wide">الاسم الكامل</label>
                  <p className="mt-2 text-xl text-stone-900 font-light">{user.name || "غير متوفر"}</p>
                </div>
                
                <Separator className="bg-stone-200/50" />
                
                <div className="text-right">
                  <label className="text-sm font-light text-stone-500 tracking-wide">البريد الإلكتروني</label>
                  <p className="mt-2 text-xl text-stone-900 font-light" dir="ltr">{user.email}</p>
                </div>
                
                {/* Return to Home Button - Only for non-admin users */}
                {user.role !== 'admin' && (
                  <>
                    <Separator className="my-6 bg-stone-200/50" />
                    
                    <Link 
                      href="/"
                      className="group flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-50 border border-amber-200/60 hover:border-amber-300/80 text-stone-800 hover:text-stone-900 font-light tracking-wide transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      <span className="text-sm">العودة للصفحة الرئيسية</span>
                      <svg 
                        className="w-4 h-4 transition-transform group-hover:-translate-x-1 duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                        />
                      </svg>
                    </Link>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Orders Section */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gradient-to-br from-white to-amber-50/20 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-amber-200/30">
              <h2 className="text-2xl font-light text-stone-900 mb-8 text-right tracking-wide">سجل الطلبات</h2>
              
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center shadow-xl">
                    <svg className="w-12 h-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-light text-stone-900 mb-3 tracking-wide">لا توجد طلبات بعد</h3>
                  <p className="text-stone-600 mb-8 font-light tracking-wide">ابدأ التسوق لرؤية طلباتك هنا</p>
                  <button
                    onClick={() => router.push("/")}
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-light rounded-2xl text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    تصفح العطور
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.$id} className="border border-amber-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-white/50">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 text-right">
                        <div>
                          <p className="text-sm font-light text-stone-500">رقم الطلب</p>
                          <p className="text-xl font-light text-stone-900">#{order.$id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="mt-2 sm:mt-0">
                          <p className="text-sm font-light text-stone-500">التاريخ</p>
                          <p className="text-stone-900 font-light">{new Date(order.createdAt).toLocaleDateString('ar-TN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</p>
                        </div>
                      </div>

                      <Separator className="my-6 bg-stone-200/50" />

                      {/* Order Status and Payment */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-right">
                        <div>
                          <p className="text-sm font-light text-stone-500 mb-2">الحالة</p>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-light ${
                            order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {
                              order.status === 'confirmed' ? 'مؤكد' :
                              order.status === 'pending' ? 'قيد الانتظار' :
                              order.status === 'delivered' ? 'تم التوصيل' :
                              'ملغى'
                            }
                          </span>
                        </div>
                        
                        <div>
                          <p className="text-sm font-light text-stone-500 mb-2">المجموع</p>
                          <p className="text-xl font-light text-amber-600">{order.totalPrice.toFixed(2)} د.ت</p>
                        </div>
                        
                        <div className="col-span-2">
                          <p className="text-sm font-light text-stone-500 mb-2">طريقة الدفع</p>
                          <p className="text-stone-900 font-light">
                            {order.paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : order.paymentMethod}
                          </p>
                        </div>
                      </div>

                      <Separator className="my-6 bg-stone-200/50" />

                      {/* Order Items */}
                      <div className="space-y-4 text-right">
                        <p className="text-sm font-light text-stone-700 tracking-wide">المنتجات ({order.items?.length || 0})</p>
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between items-center py-3 border-b border-stone-100 last:border-0">
                              <div className="text-right flex-1">
                                <p className="font-light text-stone-900">{item.Name || item.productName || 'منتج'}</p>
                                <p className="text-sm text-stone-500 font-light">
                                  {item.Brand || item.brand || 'غير متوفر'} 
                                  {item.size && ` • ${item.size}`}
                                </p>
                              </div>
                              <div className="mr-4">
                                <p className="text-stone-700 font-light text-sm">الكمية: {item.qty || item.quantity || 1}</p>
                                <p className="font-light text-stone-900">{(item.Price || item.price || 0).toFixed(2)} د.ت</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-stone-500 font-light italic">لا توجد معلومات عن المنتجات</p>
                        )}
                      </div>

                      <Separator className="my-6 bg-stone-200/50" />

                      {/* Delivery Address */}
                      <div className="text-right">
                        <p className="text-sm font-light text-stone-700 tracking-wide mb-3">عنوان التوصيل</p>
                        <div className="bg-gradient-to-br from-amber-50/50 to-stone-50 rounded-2xl p-5 border border-amber-200/30">
                          <p className="font-light text-stone-900 text-lg mb-1">{order.deliveryAddress.fullName}</p>
                          <p className="text-stone-700 font-light">{order.deliveryAddress.address}</p>
                          <p className="text-stone-700 font-light">
                            {order.deliveryAddress.city}, {order.deliveryAddress.postalCode}
                          </p>
                          <p className="text-stone-700 font-light">{order.deliveryAddress.country}</p>
                          <p className="text-stone-700 font-light mt-2" dir="ltr">هاتف: {order.deliveryAddress.phone}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountPageContent />
    </ProtectedRoute>
  );
}
