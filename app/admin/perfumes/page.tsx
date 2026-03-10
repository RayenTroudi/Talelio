"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DeleteConfirmDialog } from "@/app/components/admin/DeleteConfirmDialog";
import { ProductThumbnail } from "@/app/components/product/ProductImage";
import { ImageErrorBoundary } from "@/app/components/product/ImageErrorBoundary";

interface Perfume {
  $id: string;
  name: string;
  brand: string;
  price: number;
  sizes: string[];
  category: string;
  description?: string;
  images: string;
  isInStock: string;
  topNotes: string[];
  middleNotes: string[];
  baseNotes: string[];
}

export default function PerfumesPage() {
  const router = useRouter();
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    perfume: Perfume | null;
    isLoading: boolean;
  }>({ isOpen: false, perfume: null, isLoading: false });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch perfumes
  const fetchPerfumes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/perfumes');
      const result = await response.json();
      
      if (result.success) {
        setPerfumes(result.data || []);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch perfumes');
      }
    } catch (err) {
      console.error('Error fetching perfumes:', err);
      setError('Failed to fetch perfumes');
    } finally {
      setLoading(false);
    }
  };

  // Delete perfume handler - Open confirmation dialog
  // CRITICAL: This function depends ONLY on perfume ID, NOT on image state
  const handleDelete = async (perfume: Perfume) => {
    try {
      // Clear any previous messages
      setError(null);
      setSuccessMessage(null);
      // Open dialog - this MUST work regardless of image fetch status
      setDeleteDialog({ isOpen: true, perfume, isLoading: false });
    } catch (err) {
      // Fallback: ensure dialog opens even if state update fails
      console.error('Error in handleDelete (recovering):', err);
      setDeleteDialog({ isOpen: true, perfume, isLoading: false });
    }
  };

  // Confirm delete - Actually delete the perfume
  // CRITICAL: This function depends ONLY on product document ID
  // Image state, image URLs, and image fetch errors NEVER affect this logic
  const confirmDelete = async () => {
    if (!deleteDialog.perfume) return;
    
    const perfumeToDelete = deleteDialog.perfume;
    const perfumeId = perfumeToDelete.$id; // Store ID separately - never depends on image state
    
    setDeleteDialog(prev => ({ 
      isOpen: prev?.isOpen ?? true, 
      perfume: prev?.perfume ?? perfumeToDelete, 
      isLoading: true 
    }));
    
    try {
      console.log(`🗑️ Deleting perfume: ${perfumeToDelete.name} (ID: ${perfumeId})`);
      console.log(`📝 Delete uses ONLY document ID - images are NOT required`);
      
      // CRITICAL: DELETE API call depends ONLY on perfumeId
      // Does NOT depend on: image URLs, image state, image fetch success
      const response = await fetch(`/api/perfumes/${perfumeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Perfume deleted successfully');
        
        // Remove from local state using ID only
        setPerfumes(prev => prev.filter(p => p.$id !== perfumeId));
        
        // Close dialog
        setDeleteDialog({ isOpen: false, perfume: null, isLoading: false });
        
        // Show success message
        setSuccessMessage(`Successfully deleted "${perfumeToDelete.name}"`);
        setError(null);
      } else {
        console.error('❌ Delete failed:', result.error);
        setError(result.error || 'Failed to delete perfume');
        setDeleteDialog({ isOpen: true, perfume: perfumeToDelete, isLoading: false });
      }
    } catch (err: any) {
      console.error('❌ Error deleting perfume:', err);
      setError(err.message || 'An unexpected error occurred while deleting');
      setDeleteDialog({ isOpen: true, perfume: perfumeToDelete, isLoading: false });
    }
  };

  // Edit perfume
  const handleEdit = (perfumeId: string) => {
    router.push(`/admin/perfumes/edit/${perfumeId}`);
  };

  useEffect(() => {
    fetchPerfumes();
  }, []);

  const filteredPerfumes = perfumes.filter(perfume =>
    perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perfume.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perfume.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPerfumes = perfumes.length;
  const inStockPerfumes = perfumes.filter(p => p.isInStock === 'true').length;
  const outOfStockPerfumes = totalPerfumes - inStockPerfumes;

  const getStatusBadge = (isInStock: boolean) => {
    return isInStock 
      ? "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
      : "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل العطور...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
          <p className="text-gray-600 mt-1">إدارة مخزون العطور الخاص بك</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => fetchPerfumes()} variant="outline">
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            تحديث
          </Button>
          <Button asChild>
            <Link href="/admin/perfumes/add">
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              إضافة عطر جديد
            </Link>
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-700 hover:text-green-900"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">إجمالي المنتجات</p>
              <p className="text-2xl font-bold text-gray-900">{totalPerfumes}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">متوفر</p>
              <p className="text-2xl font-bold text-gray-900">{inStockPerfumes}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-500">غير متوفر</p>
              <p className="text-2xl font-bold text-gray-900">{outOfStockPerfumes}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and View Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="بحث عن العطور..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-right"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            جدول
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            شبكة
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredPerfumes.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m-2 0h2m0-8h16" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عطور</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? "حاول تعديل مصطلحات البحث" : "ابدأ بإضافة أول عطر"}
          </p>
          {!searchTerm && (
            <Button asChild>
              <Link href="/admin/perfumes/add">إضافة عطر جديد</Link>
            </Button>
          )}
        </Card>
      ) : (
        <>
          {viewMode === "table" ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-4 px-6 font-medium text-gray-900">المنتج</th>
                      <th className="text-right py-4 px-6 font-medium text-gray-900">العلامة التجارية</th>
                      <th className="text-right py-4 px-6 font-medium text-gray-900">السعر</th>
                      <th className="text-right py-4 px-6 font-medium text-gray-900">الفئة</th>
                      <th className="text-right py-4 px-6 font-medium text-gray-900">الحالة</th>
                      <th className="text-right py-4 px-6 font-medium text-gray-900">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPerfumes.map((perfume) => (
                      <tr key={perfume.$id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden ml-4 relative">
                              {/* Error boundary ensures image failures NEVER block DELETE */}
                              <ImageErrorBoundary>
                                <ProductThumbnail
                                  fileId={perfume.images}
                                  productName={perfume.name}
                                  className="w-full h-full"
                                />
                              </ImageErrorBoundary>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{perfume.name}</p>
                              <p className="text-sm text-gray-500">
                                الأحجام: {perfume.sizes.join(', ')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-900">{perfume.brand}</td>
                        <td className="py-4 px-6 text-gray-900">{perfume.price} DT</td>
                        <td className="py-4 px-6 text-gray-900">{perfume.category}</td>
                        <td className="py-4 px-6">
                          <span className={getStatusBadge(perfume.isInStock)}>
                            {perfume.isInStock ? "متوفر" : "غير متوفر"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(perfume.$id)}
                            >
                              تعديل
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(perfume)}
                            >
                              حذف
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPerfumes.map((perfume) => (
                <Card key={perfume.$id} className="overflow-hidden">
                  <div className="aspect-square bg-gray-200 relative">
                    {/* Error boundary ensures image failures NEVER block DELETE */}
                    <ImageErrorBoundary>
                      <ProductThumbnail
                        fileId={perfume.images}
                        productName={perfume.name}
                        className="w-full h-full"
                      />
                    </ImageErrorBoundary>
                    <div className="absolute top-2 left-2">
                      <span className={getStatusBadge(perfume.isInStock === 'true')}>
                        {perfume.isInStock === 'true' ? "متوفر" : "غير متوفر"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{perfume.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{perfume.brand}</p>
                    <p className="text-lg font-bold text-gray-900 mb-2">{perfume.price} دينار</p>
                    <p className="text-sm text-gray-500 mb-4">
                      الأحجام: {perfume.sizes.join(', ')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(perfume.$id)}
                        className="flex-1"
                      >
                        تعديل
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(perfume)}
                        className="flex-1"
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, perfume: null, isLoading: false })}
        onConfirm={confirmDelete}
        itemName={deleteDialog.perfume?.name || ""}
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
}