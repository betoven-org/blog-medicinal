export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-video w-full rounded-xl" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <Skeleton className="h-[28rem] w-full rounded-2xl md:h-[32rem]" />
  );
}

export function TrendSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="aspect-[4/3] w-2/5 shrink-0 rounded-xl" />
      <div className="flex flex-1 flex-col justify-center gap-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

export function PillsSkeleton() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
      ))}
    </div>
  );
}

export function PostPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <Skeleton className="mb-4 h-4 w-48" />
      <Skeleton className="mb-2 h-5 w-20" />
      <Skeleton className="mb-2 h-10 w-full max-w-2xl" />
      <Skeleton className="mb-8 h-10 w-2/3 max-w-xl" />
      <Skeleton className="h-4 w-40" />
      <div className="mt-8 border-b border-gray-100" />
      <Skeleton className="mt-6 aspect-video w-full rounded-2xl" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
