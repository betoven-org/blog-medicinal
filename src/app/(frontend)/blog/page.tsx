import { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { getLatestPosts, getCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Todos os Posts",
  description: "Confira todos os artigos sobre saúde, suplementos e bem-estar.",
};

function resolveRelation<T>(value: T | string | number): T | null {
  if (typeof value === "object" && value !== null) return value as T;
  return null;
}

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [postsResult, categoriesResult] = await Promise.all([
    getLatestPosts(12, page),
    getCategories(),
  ]);

  const { docs, totalDocs, totalPages } = postsResult;
  const categories = categoriesResult.docs;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Todos os Posts</h1>
        <p className="mt-2 text-gray-500">
          {totalDocs} {totalDocs === 1 ? "artigo publicado" : "artigos publicados"}
        </p>
      </div>

      {/* Category filter bar */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          <Link
            href="/blog"
            className="shrink-0 rounded-full border border-[#0d61ac] bg-[#0d61ac] px-3 py-1 text-xs font-medium text-white"
          >
            Todos
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              className="shrink-0 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      {docs.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((post) => {
            const cat = resolveRelation(post.category);
            const author = resolveRelation(post.author);
            const heroImage = resolveRelation(post.heroImage);
            return (
              <ArticleCard
                key={post.id}
                title={post.title}
                slug={post.slug}
                excerpt={post.excerpt}
                heroImage={heroImage ?? { url: null }}
                category={cat ?? { name: "", slug: "" }}
                author={author ?? { name: "Redacao" }}
                publishedAt={post.publishedAt ?? null}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-gray-400">Nenhum artigo publicado ainda.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={`/blog?page=${page - 1}`}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
            >
              Anterior
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/blog?page=${page + 1}`}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
            >
              Próximo
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
