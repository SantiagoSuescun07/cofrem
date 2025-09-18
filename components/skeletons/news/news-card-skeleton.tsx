import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NewsCardSkeleton() {
  return (
    <Card className="w-full max-w-md overflow-hidden border-0 bg-white rounded-2xl shadow-lg py-0">
      <CardHeader className="p-0 relative">
        {/* Image skeleton */}
        <div className="relative h-52 w-full overflow-hidden">
          <Skeleton className="w-full h-full" />

          {/* Photo count badge skeleton */}
          <div className="absolute top-4 right-4">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Floating segmentation badges skeleton (desktop) */}
          <div className="hidden md:block absolute -bottom-2 left-6 right-6 bg-white rounded-t-xl p-4 shadow-xl border border-gray-100">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-6 pb-6">
        <div className="space-y-4">
          {/* Mobile badges skeleton */}
          <div className="md:hidden flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-8 rounded-full" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-4/5" />
          </div>

          {/* Content excerpt skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Publication status skeleton */}
          <div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        <div className="flex items-center justify-between w-full pt-4 border-t border-gray-100">
          {/* Metadata skeleton */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>

          {/* Read more button skeleton */}
          <Skeleton className="h-4 w-16" />
        </div>
      </CardFooter>
    </Card>
  );
}
