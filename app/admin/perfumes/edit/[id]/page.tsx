"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { AddPerfumeForm } from "@/app/components/admin/AddPerfumeForm";
import { appwriteConfig } from "@/lib/appwrite-config";
import { Toast } from "@/components/ui/toast";

interface PerfumeData {
  $id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  sizes: number[];
  productImages: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
  description?: string;
  isInStock: boolean;
  topNotes: Array<{ name: string; imageId: string; imageUrl: string; }>;
  middleNotes: Array<{ name: string; imageId: string; imageUrl: string; }>;
  baseNotes: Array<{ name: string; imageId: string; imageUrl: string; }>;
  createdAt: string;
  updatedAt: string;
}

export default function EditPerfumePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Unwrap params Promise using React.use()
  const unwrappedParams = use(params);
  const perfumeId = unwrappedParams.id;
  
  const [perfume, setPerfume] = useState<PerfumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Fetch perfume data
  useEffect(() => {
    const fetchPerfume = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/perfumes/${perfumeId}`);
        const result = await response.json();
        
        if (result.success) {
          setPerfume(result.data);
          setError(null);
        } else {
          setError(result.error || 'Failed to fetch perfume');
        }
      } catch (err) {
        console.error('Error fetching perfume:', err);
        setError('Failed to fetch perfume');
      } finally {
        setLoading(false);
      }
    };

    fetchPerfume();
  }, [perfumeId]);

  // Handle form submission
  const handleSubmit = async (formData: any) => {
    setSubmitting(true);
    setError(null);
    
    try {
      console.log('📝 Submitting edit form:', formData);
      
      // Step 1: Upload new images if provided via server-side API
      let finalImages: string | undefined = undefined;
      
      if (formData.productImages && formData.productImages.length > 0) {
        console.log(`📤 Uploading ${formData.productImages.length} new images via server API...`);
        
        const uploadPromises = Array.from(formData.productImages as FileList).map(async (file) => {
          try {
            // Create FormData for the upload API
            const formData = new FormData();
            formData.append('file', file);
            formData.append('bucketId', appwriteConfig.perfumeImagesBucketId);
            
            // Upload via server-side API route
            const response = await fetch('/api/upload-image', {
              method: 'POST',
              body: formData,
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
              throw new Error(result.error || 'Failed to upload image');
            }
            
            console.log('✅ Image uploaded successfully:', result.fileId);
            return result.fileId;
          } catch (uploadError) {
            console.error('❌ Error uploading image:', uploadError);
            throw uploadError;
          }
        });
        
        const uploadedImageIds = await Promise.all(uploadPromises);
        console.log('✅ All images uploaded. File IDs:', uploadedImageIds);
        // Store as string (single ID or comma-separated for multiple)
        finalImages = uploadedImageIds.join(',');
      }

      // Step 2: Transform form data for API
      const updateData: any = {
        name: formData.name,
        brand: formData.brand,
        price: Number(formData.price),
        category: formData.category,
        sizes: Array.isArray(formData.sizes) ? formData.sizes.map((size: number) => `${size}ml`) : [],
        description: formData.description || "",
        isInStock: formData.isInStock,
        topNotes: Array.isArray(formData.topNotes)
          ? formData.topNotes.filter((note: any) => note.name?.trim()).map((note: any) => note.name.trim())
          : [],
        middleNotes: Array.isArray(formData.middleNotes)
          ? formData.middleNotes.filter((note: any) => note.name?.trim()).map((note: any) => note.name.trim())
          : [],
        baseNotes: Array.isArray(formData.baseNotes)
          ? formData.baseNotes.filter((note: any) => note.name?.trim()).map((note: any) => note.name.trim())
          : [],
      };
      
      // Only include images if new ones were uploaded
      if (finalImages !== undefined) {
        updateData.images = finalImages;
      }

      console.log('Update data:', updateData);

      const response = await fetch(`/api/perfumes/${perfumeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Perfume updated successfully');
        // Show elegant success toast
        setShowSuccessToast(true);
        // Redirect after toast is visible
        setTimeout(() => {
          router.push('/admin/perfumes');
          router.refresh(); // Force refresh to show updated data
        }, 1500);
      } else {
        console.error('❌ Update failed:', result.error);
        setError(result.error || 'Failed to update perfume');
      }
    } catch (err: any) {
      console.error('❌ Error updating perfume:', err);
      setError(err.message || 'Failed to update perfume');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/admin/perfumes');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading perfume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => router.push('/admin/perfumes')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Perfumes
        </button>
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Perfume not found</p>
        <button
          onClick={() => router.push('/admin/perfumes')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Perfumes
        </button>
      </div>
    );
  }

  // Transform perfume data for the form
  // Helper to parse array data (could be string or array)
  const parseArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Parse sizes and remove 'ml' suffix if present
  const parsedSizes = parseArray(perfume.sizes).map((size: any) => {
    if (typeof size === 'string') {
      return parseInt(size.replace('ml', ''));
    }
    return typeof size === 'number' ? size : 0;
  }).filter(s => s > 0);

  // Parse notes - handle both array and string formats
  const parsedTopNotes = parseArray(perfume.topNotes).map((note: any) => ({
    name: typeof note === 'string' ? note : (note.name || '')
  })).filter(n => n.name);
  
  const parsedMiddleNotes = parseArray(perfume.middleNotes).map((note: any) => ({
    name: typeof note === 'string' ? note : (note.name || '')
  })).filter(n => n.name);
  
  const parsedBaseNotes = parseArray(perfume.baseNotes).map((note: any) => ({
    name: typeof note === 'string' ? note : (note.name || '')
  })).filter(n => n.name);

  const initialData = {
    name: perfume.name,
    brand: perfume.brand,
    price: perfume.price,
    category: perfume.category,
    sizes: parsedSizes,
    description: perfume.description || "",
    isInStock: perfume.isInStock === 'true' || perfume.isInStock === true,
    topNotes: parsedTopNotes.length > 0 ? parsedTopNotes : [{ name: "" }],
    middleNotes: parsedMiddleNotes.length > 0 ? parsedMiddleNotes : [{ name: "" }],
    baseNotes: parsedBaseNotes.length > 0 ? parsedBaseNotes : [{ name: "" }],
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/perfumes')}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Perfumes
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <AddPerfumeForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={submitting}
        initialData={initialData}
        isEditMode={true}
      />

      {/* Elegant Success Toast */}
      {showSuccessToast && (
        <Toast
          message="Perfume Updated Successfully"
          description="Your product has been updated and will appear in the catalog momentarily."
          variant="success"
          visible={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
          duration={4000}
        />
      )}
    </div>
  );
}