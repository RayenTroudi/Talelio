"use client";

import { useState, useEffect } from "react";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import PaginationSection from "./Pagination";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Updated product interface to match Appwrite structure
interface Product {
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

interface ProductListingProps {
  results?: Product[];
  searchQuery?: string;
}

export function ProductListing({ results = [], searchQuery = "" }: ProductListingProps) {
  const [productDetails, setProductDetails] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [currentpage, setCurrentPage] = useState(1);
  const [itemperpage] = useState(8); // Increased for better display
  const LastItemIndex = currentpage * itemperpage;
  const FirstItemIndex = LastItemIndex - itemperpage;
  const CurrentItems = productDetails.slice(FirstItemIndex, LastItemIndex);


  // Search functionality
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // URL Search as Server Side
  function HandleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }

  // Filter products based on search
  const filteredProducts = productDetails.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch Data From API or use provided results
  useEffect(() => {
    async function FetchData() {
      if (results && results.length > 0) {
        setProductDetails(results);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // For now, use mock data since we're transitioning to Appwrite
        // In the future, this would fetch from Appwrite via an API route
        const mockProducts: Product[] = [
          {
            $id: "1",
            name: "Chanel No. 5",
            brand: "Chanel",
            price: 1200,
            category: "Femme",
            sizes: [30, 50, 100],
            productImages: [{ id: "1", url: "/images/perfume1.jpg", alt: "Chanel No. 5" }],
            description: "The iconic fragrance from Chanel",
            isInStock: true,
            topNotes: [{ name: "Bergamot", imageId: "1", imageUrl: "/images/bergamot.jpg" }],
            middleNotes: [{ name: "Rose", imageId: "2", imageUrl: "/images/rose.jpg" }],
            baseNotes: [{ name: "Sandalwood", imageId: "3", imageUrl: "/images/sandalwood.jpg" }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          // Add more mock products as needed
        ];
        setProductDetails(mockProducts);
      } catch (error: any) {
        setError("Failed to load products");
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    FetchData();
  }, [results]);
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const displayProducts = searchQuery ? filteredProducts : productDetails;
  const paginatedProducts = displayProducts.slice(FirstItemIndex, LastItemIndex);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8 max-w-2xl mx-auto">
        <InputGroup className="bg-[#F3F4F7]">
          <InputGroupInput
            placeholder="Search for perfumes by name, brand, or category..."
            onChange={(e) => HandleSearch(e.target.value)}
            defaultValue={searchParams.get("query")?.toString()}
            className="border-0 focus:ring-2 focus:ring-blue-500"
          />
        </InputGroup>
      </div>

      {/* Results Info */}
      {searchQuery && (
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''} found for "{searchQuery}"
          </p>
        </div>
      )}

      {/* Product Grid */}
      {displayProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchQuery ? "No products found matching your search." : "No products available."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginatedProducts.map((product) => (
              <Card className="group w-full overflow-hidden hover:shadow-lg transition-shadow duration-300" key={product.$id}>
                <CardContent className="p-4">
                  {/* Product Image */}
                  <div className="aspect-square rounded-md mb-3 relative overflow-hidden bg-gray-100">
                    {product.productImages && product.productImages.length > 0 ? (
                      <Image
                        src={product.productImages[0].url}
                        width={300}
                        height={300}
                        alt={product.productImages[0].alt || product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                    
                    {/* Stock Status Badge */}
                    {!product.isInStock && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs">
                        Out of Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <CardTitle className="text-lg font-bold mb-1 line-clamp-2 min-h-[3rem]">
                    {product.name}
                  </CardTitle>

                  <CardDescription className="text-sm mb-2 text-gray-600">
                    {product.brand} • {product.category}
                  </CardDescription>

                  {/* Available Sizes */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.sizes.map((size) => (
                      <span 
                        key={size} 
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {size}ml
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#D51243]">
                      {product.price} TND
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 space-y-2">
                    <Button 
                      className="w-full"
                      disabled={!product.isInStock}
                    >
                      {product.isInStock ? "Add to Cart" : "Out of Stock"}
                    </Button>
                    <Link 
                      href={`/products/${product.$id}`}
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <PaginationSection
            totalItems={displayProducts.length}
            itemperpage={itemperpage}
            CurrentPage={currentpage}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

export default ProductListing;
