"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddPerfumeForm } from "@/app/components/admin/AddPerfumeForm";
import { appwriteConfig } from "@/lib/appwrite-config";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/app/components/LocaleProvider";

// Mock Appwrite service - replace with actual Appwrite configuration
interface PerfumeFormData {
  name: string;
  brand: string;
  price: number;
  category: string;
  sizes: number[];
  topNotes: Array<{ name: string }>;
  middleNotes: Array<{ name: string }>;
  baseNotes: Array<{ name: string }>;
  productImages: FileList;
  description?: string;
  isInStock: boolean;
}

export default function AddPerfumePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (data: PerfumeFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Upload images to Appwrite Storage via server-side API
      let uploadedImageIds: string[] = [];

      if (data.productImages && data.productImages.length > 0) {
        console.log(`Uploading ${data.productImages.length} images via server API...`);

        const uploadPromises = Array.from(data.productImages).map(async (file) => {
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

            console.log('Image uploaded successfully:', result.fileId);
            return result.fileId;
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
          }
        });

        uploadedImageIds = await Promise.all(uploadPromises);
        console.log('All images uploaded. File IDs:', uploadedImageIds);
      }

      // Step 2: Transform form data for API
      const perfumeData = {
        name: data.name,
        brand: data.brand,
        price: Number(data.price),
        category: data.category,
        sizes: Array.isArray(data.sizes) ? data.sizes.map(size => `${size}ml`) : [],
        description: data.description || "",
        isInStock: data.isInStock,
        topNotes: Array.isArray(data.topNotes)
          ? data.topNotes.filter(note => note.name.trim()).map(note => note.name.trim())
          : [],
        middleNotes: Array.isArray(data.middleNotes)
          ? data.middleNotes.filter(note => note.name.trim()).map(note => note.name.trim())
          : [],
        baseNotes: Array.isArray(data.baseNotes)
          ? data.baseNotes.filter(note => note.name.trim()).map(note => note.name.trim())
          : [],
        // Send file IDs directly as array of strings
        // Database will store: images: ["fileId1", "fileId2"]
        productImages: uploadedImageIds // Simple array of file IDs
      };

      console.log('Payload to API:', perfumeData);

      // Step 3: Send to API
      const response = await fetch('/api/perfumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(perfumeData),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/perfumes');
        }, 2000);
      } else {
        console.error('API Error:', result);
        throw new Error(result.error || 'Failed to create perfume');
      }

    } catch (error) {
      console.error('Error creating perfume:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error creating perfume: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.admin.addPerfume.successTitle}</h2>
          <p className="text-gray-600 mb-6">{t.admin.addPerfume.successDesc}</p>
          <Button onClick={() => router.push('/admin/perfumes')}>{t.admin.addPerfume.viewAllBtn}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.admin.addPerfume.title}</h1>
          <p className="text-gray-600 mt-1">{t.admin.addPerfume.subtitle}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          {t.admin.addPerfume.backBtn}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      <AddPerfumeForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
}
