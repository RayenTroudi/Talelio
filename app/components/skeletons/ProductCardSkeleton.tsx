import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Skeleton loader for ProductCard component
 * Matches the exact structure and dimensions of ProductCard
 */
export function ProductCardSkeleton() {
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-0">
        {/* Image skeleton */}
        <div className="relative aspect-square overflow-hidden bg-stone-100">
          <Skeleton className="w-full h-full" />
        </div>

        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          {/* Brand */}
          <Skeleton className="h-3 w-20" />
          
          {/* Product name */}
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          
          {/* Price */}
          <Skeleton className="h-6 w-24" />
          
          {/* Button */}
          <Skeleton className="h-10 w-full rounded-xl mt-4" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid of product card skeletons
 */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
