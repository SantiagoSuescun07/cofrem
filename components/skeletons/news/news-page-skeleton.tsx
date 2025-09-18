import { Skeleton } from "@/components/ui/skeleton";
import { NewsCardSkeleton } from "@/components/skeletons/news/news-card-skeleton";

export function NewsPageSkeleton() {
  return (
    <div className="relative">
      <div className="container mx-auto pt-6">
        {/* Title skeleton */}
        <Skeleton className="h-9 w-64 mb-8" />

        {/* News grid skeleton */}
        <div className="flex flex-col items-center gap-6 sm:grid sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <NewsCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
