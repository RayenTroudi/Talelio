"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="space-y-8" dir="rtl">
      <div className="">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
        <p className="text-gray-600">مرحباً بعودتك! إليك ما يحدث في متجر العطور الخاص بك اليوم.</p>
      </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Perfume */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">إضافة عطر</h3>
              <p className="text-gray-600 mb-4">إنشاء منتج عطر فاخر جديد</p>
              <Button asChild className="w-full">
                <Link href="/admin/perfumes/add">إضافة عطر جديد</Link>
              </Button>
            </div>
          </Card>

          {/* Manage Perfumes */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">إدارة العطور</h3>
              <p className="text-gray-600 mb-4">عرض وتعديل وحذف المنتجات الموجودة</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/perfumes">عرض جميع العطور</Link>
              </Button>
            </div>
          </Card>

          {/* Orders */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">الطلبات</h3>
              <p className="text-gray-600 mb-4">إدارة طلبات العملاء والشحن</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/orders">عرض الطلبات</Link>
              </Button>
            </div>
          </Card>

          {/* Promo Code Requests */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">طلبات الترويج</h3>
              <p className="text-gray-600 mb-4">مراجعة وتفعيل رموز الإحالة</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/promo-requests">عرض الطلبات</Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid md:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
            <div className="text-gray-600">إجمالي العطور</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
            <div className="text-gray-600">طلبات اليوم</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">0 TND</div>
            <div className="text-gray-600">الإيرادات</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">0</div>
            <div className="text-gray-600">العملاء</div>
          </Card>
        </div>
    </div>
  );
}