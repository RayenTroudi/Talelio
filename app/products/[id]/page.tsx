import { getPerfumeById } from '@/lib/appwrite-queries';
import { mapProductImagesToUI } from '@/lib/image-utils';
import { notFound } from 'next/navigation';
import ProductDetail from '@/app/components/product/ProductDetail';
import { Suspense } from 'react';
import { ProductDetailSkeleton } from '@/app/components/skeletons/ProductDetailSkeleton';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function ProductContent({ productId }: { productId: string }) {
  let product;
  
  try {
    // Fetch product from Appwrite
    product = await getPerfumeById(productId);
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }

  if (!product) {
    notFound();
  }

  // Transform Appwrite data to ProductDetail props format
  // Uses safe image mapping that guarantees valid URLs
  const productImages = mapProductImagesToUI(product.images, product.name, 800, 800);

  // Parse sizes from string array like ["30ml", "50ml"] to numbers [30, 50]
  const productSizes = Array.isArray(product.sizes)
    ? product.sizes.map((size: string) => {
        const num = parseInt(size.replace('ml', ''));
        return isNaN(num) ? 0 : num;
      }).filter(s => s > 0)
    : [30, 50, 100]; // Default sizes

  // Transform notes arrays (strings) to objects with images
  const transformNotes = (notes: string[]) => {
    if (!Array.isArray(notes)) return [];
    // Use data URL placeholder instead of file path to avoid 400 errors
    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="10" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENote%3C/text%3E%3C/svg%3E';
    return notes.map((noteName: string) => ({
      name: noteName,
      image: placeholderImage
    }));
  };

  const topNotes = transformNotes(product.topNotes || []);
  const middleNotes = transformNotes(product.middleNotes || []);
  const baseNotes = transformNotes(product.baseNotes || []);

  return (
    <ProductDetail
      id={productId}
      name={product.name}
      brand={product.brand}
      description={product.description}
      basePrice={product.price}
      images={productImages}
      sizes={productSizes}
      topNotes={topNotes}
      middleNotes={middleNotes}
      baseNotes={baseNotes}
      rating={4.5}
      reviewCount={128}
      isInStock={product.isInStock === 'true'}
      maxQuantity={10}
      isNew={false}
      isOnSale={false}
    />
  );
}

export default async function ProductPage(props: ProductPageProps) {
  // Await params in Next.js 15
  const params = await props.params;

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductContent productId={params.id} />
    </Suspense>
  );
}
