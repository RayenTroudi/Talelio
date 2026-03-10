import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

/**
 * Skeleton loader for Order Card in account page
 */
export function OrderCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-32" /> {/* Order ID */}
          <Skeleton className="h-4 w-24" /> {/* Date */}
        </div>
        <Skeleton className="h-6 w-20 rounded-full" /> {/* Status badge */}
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        {/* Delivery address */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" /> {/* Label */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <Separator />

        {/* Order items */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" /> {/* Items label */}
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </Card>
  );
}

/**
 * List of order skeletons
 */
export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  );
}
