"use client";

import { useState, useEffect } from 'react';
import { storage, databases, validateAppwriteConfig } from '@/lib/appwrite-config';
import { AppwritePerfumeService, transformToProductCard } from '@/lib/appwrite-perfume';
import ProductDetail from '@/app/components/product/ProductDetail';
import { Button } from '@/components/ui/button';

// Example component showing how to use Appwrite perfume service
export default function ExampleUsage() {
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the perfume service
  const perfumeService = new AppwritePerfumeService(
    storage,
    databases,
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_PERFUMES_COLLECTION_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_PERFUME_IMAGES_BUCKET_ID!
  );

  useEffect(() => {
    // Validate configuration on component mount
    try {
      validateAppwriteConfig();
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const loadPerfumes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await perfumeService.getPerfumes();
      const transformedPerfumes = result.documents.map(transformToProductCard);
      setPerfumes(transformedPerfumes);
    } catch (err) {
      setError('Failed to load perfumes: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const createSamplePerfume = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create sample data (you would normally get this from a form)
      const sampleData = {
        name: 'Sample Luxury Perfume',
        brand: 'Luxury Brand',
        price: 199.99,
        sizes: [30, 50, 100],
        description: 'A sophisticated fragrance with complex notes',
        isInStock: true,
        
        // Note: In real usage, these would be actual File objects from form inputs
        topNotes: [
          { name: 'Bergamot', image: null as any }, // Replace with actual File
          { name: 'Lemon', image: null as any },
        ],
        middleNotes: [
          { name: 'Rose', image: null as any },
          { name: 'Jasmine', image: null as any },
        ],
        baseNotes: [
          { name: 'Sandalwood', image: null as any },
          { name: 'Musk', image: null as any },
        ],
        productImages: [] as File[], // Replace with actual File array
      };

      // This would fail without actual files - this is just an example
      // const result = await perfumeService.createPerfume(sampleData);
      // console.log('Created perfume:', result);
      
      alert('This is a demo. To create a real perfume, use the Add Perfume form with actual images.');
    } catch (err) {
      setError('Failed to create perfume: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Configuration Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-2">Please check your Appwrite configuration and environment variables.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Appwrite Integration Example</h1>
        <p className="text-gray-600 mb-6">
          This demonstrates how to use the Appwrite perfume service to manage perfume data.
        </p>
        
        <div className="flex gap-4">
          <Button onClick={loadPerfumes} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Load Perfumes'}
          </Button>
          
          <Button onClick={createSamplePerfume} disabled={isLoading} variant="outline">
            Create Sample (Demo)
          </Button>
        </div>
      </div>

      {/* Perfumes Grid */}
      {perfumes.length > 0 ? (
        <div className="grid lg:grid-cols-2 gap-8">
          {perfumes.map((perfume) => (
            <ProductDetail
              key={perfume.id}
              {...perfume}
            />
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m-2 0h2m0-8h16" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No perfumes</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first perfume.</p>
          </div>
        )
      )}
      
      {/* Code Example */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Example</h2>
        <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`// Initialize the service
const perfumeService = new AppwritePerfumeService(
  storage,
  databases,
  'your-database-id',
  'perfumes-collection-id',
  'perfume-images-bucket-id'
);

// Create a perfume
const result = await perfumeService.createPerfume(formData);

// Get all perfumes
const perfumes = await perfumeService.getPerfumes();

// Transform for ProductDetail component
const cardData = transformToProductCard(perfume);`}
        </pre>
      </div>
    </div>
  );
}