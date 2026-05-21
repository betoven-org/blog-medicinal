import { CardSkeleton, PillsSkeleton, Skeleton } from "@/components/Skeleton";

export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Skeleton className="mb-2 h-4 w-32" />
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-8 h-4 w-40" />

      <div className="mb-8">
        <PillsSkeleton />
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
