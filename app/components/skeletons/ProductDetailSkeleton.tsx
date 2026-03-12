import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * Skeleton loader for Product Detail page
 * Matches ProductDetail component structure
 */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-gold-50/20 to-rose-50/10 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb skeleton */}
        <div className="mb-8 flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            {/* Main image */}
            <Skeleton className="w-full aspect-square rounded-3xl" />
            
            {/* Thumbnail gallery */}
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            {/* Brand & Name */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>

            <Separator />

            {/* Price */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-12 w-40" />
            </div>

            {/* Size selector */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-20 rounded-xl" />
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-14 w-full rounded-2xl" />
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Notes */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-5 w-24 mb-3" />
                  <div className="flex gap-3">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-16 w-16 rounded-lg" />
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
