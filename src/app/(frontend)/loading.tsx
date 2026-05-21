import {
  HeroSkeleton,
  CardSkeleton,
  TrendSkeleton,
  PillsSkeleton,
  Skeleton,
} from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Hero */}
      <div className="mb-6">
        <HeroSkeleton />
      </div>

      {/* Escolha do Editor */}
      <section className="mb-8">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>

      {/* Categorias */}
      <div className="mb-8 -mx-4 bg-gray-50 px-4 py-6">
        <PillsSkeleton />
      </div>

      {/* Tendencias */}
      <section className="mb-8">
        <Skeleton className="mb-4 h-6 w-36" />
        <div className="grid gap-4 md:grid-cols-2">
          <TrendSkeleton />
          <TrendSkeleton />
          <TrendSkeleton />
          <TrendSkeleton />
        </div>
      </section>
    </div>
  );
}
