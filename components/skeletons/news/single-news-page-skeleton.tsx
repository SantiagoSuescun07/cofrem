import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Skeleton para el estado de loading principal
export function SingleNewsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back button skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Main image skeleton */}
        <div className="mb-8 rounded-lg overflow-hidden">
          <Skeleton className="w-full h-[400px]" />
        </div>

        {/* Article header skeleton */}
        <div className="mb-8">
          {/* Categories skeleton */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>

          {/* Title skeleton */}
          <div className="mb-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-3/4" />
          </div>

          {/* Metadata skeleton */}
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Main content skeleton */}
        <div className="mb-8 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* File attachment skeleton */}
        <Card className="mb-8 border border-neutral-400 border-dashed bg-muted/30">
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          </CardContent>
        </Card>

        {/* Gallery skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-20 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="w-full h-48 rounded-lg" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>

        {/* Comments section skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-6 w-24" />
            </div>
            <CommentsSkeleton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Skeleton específico para comentarios
export function CommentsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="border-l-2 border-muted pl-4 bg-muted rounded-xl py-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="ml-10 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton para cuando no hay comentarios (estado vacío)
export function EmptyCommentsSkeleton() {
  return (
    <div className="text-center py-8">
      <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full" />
      <Skeleton className="h-4 w-40 mx-auto" />
    </div>
  );
}

// Skeleton para error state
export function ErrorSkeleton({ message = "Error al cargar" }: { message?: string }) {
  return (
    <div className="text-center py-8">
      <div className="text-red-500">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}