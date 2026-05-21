import { CardSkeleton, PillsSkeleton, Skeleton } from "@/components/Skeleton";

export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Skeleton className="mb-4 h-4 w-48" />

      <div className="mb-8">
        <PillsSkeleton />
      </div>

      <div className="mb-8 border-b-2 border-gray-200 pb-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-24" />
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
