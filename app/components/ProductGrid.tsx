"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/app/components/product/ProductCard";
import { ProductGridSkeleton } from "@/app/components/skeletons/ProductCardSkeleton";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import PaginationSection from "./Pagination";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "@/app/components/LocaleProvider";

/**
 * Appwrite Product Interface
 */
interface AppwriteProduct {
  $id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  images: string[]; // Array of Appwrite file IDs
  isInStock: string; // "true" or "false"
  sizes: string[]; // ["30ml", "50ml"]
  description?: string;
}

interface ProductGridProps {
  /**
   * Optional initial products (from server component)
   */
  initialProducts?: AppwriteProduct[];
  
  /**
   * Optional search query
   */
  searchQuery?: string;
}

/**
 * ProductGrid Component
 * 
 * Displays a grid of products with:
 * - Search functionality
 * - Pagination
 * - Appwrite image integration
 * - Loading and error states
 */
export function ProductGrid({
  initialProducts = [],
  searchQuery = ""
}: ProductGridProps) {
  const [products, setProducts] = useState<AppwriteProduct[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Search
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Paginate filtered products
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredProducts.slice(firstItemIndex, lastItemIndex);
  
  // Handle search
  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
    setCurrentPage(1); // Reset to first page on search
  }
  
  // Fetch products from API (if not provided)
  useEffect(() => {
    if (initialProducts.length === 0) {
      async function fetchProducts() {
        try {
          setLoading(true);
          const response = await fetch('/api/perfumes');
          if (!response.ok) throw new Error('Failed to fetch products');
          const data = await response.json();
          setProducts(data.documents || []);
        } catch (err: any) {
          setError(err.message || 'Failed to load products');
          console.error('Error fetching products:', err);
        } finally {
          setLoading(false);
        }
      }
      fetchProducts();
    }
  }, [initialProducts]);
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
            <p className="mt-6 text-stone-600 font-light tracking-wide">{t.productGrid.loading}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center bg-gradient-to-r from-red-50 to-red-50/50 border border-red-300/50 rounded-3xl p-10 shadow-xl">
          <p className="text-red-700 mb-6 font-light text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-light shadow-lg"
          >
            {t.productGrid.retry}
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-12 max-w-2xl mx-auto">
        <InputGroup className="bg-white shadow-xl shadow-amber-200/20 rounded-2xl overflow-hidden border border-amber-200/30">
          <InputGroupInput
            placeholder={t.productGrid.searchPlaceholder}
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get("query")?.toString()}
            className="border-0 focus:ring-2 focus:ring-amber-500 font-light py-5 px-6 text-right placeholder:text-stone-400"
          />
        </InputGroup>
      </div>

      {/* Results Info */}
      {searchQuery && (
        <div className="mb-8 text-center">
          <p className="text-stone-600 font-light tracking-wide">
            {t.productGrid.resultsFor} {filteredProducts.length} {t.productGrid.resultsCount} <span className="font-normal text-amber-600">"{searchQuery}"</span>
          </p>
        </div>
      )}

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center shadow-xl">
              <svg
                className="w-12 h-12 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <p className="text-stone-900 text-2xl font-light mb-3 tracking-wide">
              {searchQuery ? t.productGrid.noResults : t.productGrid.noProducts}
            </p>
            <p className="text-stone-500 font-light tracking-wide">
              {searchQuery ? t.productGrid.modifySearch : t.productGrid.checkLater}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {currentItems.map((product) => (
              <ProductCard
                key={product.$id}
                id={product.$id}
                name={product.name}
                brand={product.brand}
                price={product.price}
                images={product.images}
                isInStock={product.isInStock === 'true'}
                category={product.category}
              />
            ))}
          </div>

          {/* Pagination */}
          {filteredProducts.length > itemsPerPage && (
            <PaginationSection
              totalItems={filteredProducts.length}
              itemperpage={itemsPerPage}
              CurrentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}

export default ProductGrid;
