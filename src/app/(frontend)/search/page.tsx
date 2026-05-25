import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { searchPosts, getCategories } from "@/lib/queries";
import { resolveRelation } from "@/lib/utils";
import { cms } from "@/lib/cms";
import { SectionRenderer } from "@/components/SectionRenderer";
import type { SectionBlock } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Buscar Artigos",
  description: "Busque artigos sobre saude, suplementos e bem-estar.",
};

type Props = {
  searchParams: Promise<{ q?: string; categoria?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const cmsPage = await cms.pages.get("search");
  const sectionBlocks: SectionBlock[] = cmsPage?.sections ?? [];
  if (sectionBlocks.length > 0) {
    return <SectionRenderer blocks={sectionBlocks} />;
  }

  const { q = "", categoria, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const query = q.trim();

  const [results, categoriesResult] = await Promise.all([
    query ? searchPosts(query, categoria, 12, page) : null,
    getCategories(),
  ]);

  const docs = results?.docs ?? [];
  const totalDocs = results?.totalDocs ?? 0;
  const totalPages = results?.totalPages ?? 0;
  const categories = categoriesResult.docs;

  function buildUrl(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = { q: query || undefined, categoria, ...params };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    return `/search?${sp.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "Buscar" }]}
      />

      {/* Search form */}
      <form action="/search" method="get" className="mb-8">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              viewBox="0 0 256 256"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Buscar artigos..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-[#0d61ac] focus:ring-1 focus:ring-[#0d61ac]"
            />
          </div>
          {categoria && <input type="hidden" name="categoria" value={categoria} />}
          <button
            type="submit"
            className="rounded-lg bg-[#0d61ac] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0a4f8c]"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Category filter */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          <Link
            href={buildUrl({ categoria: undefined, page: undefined })}
            className={
              !categoria
                ? "shrink-0 rounded-full border border-[#0d61ac] bg-[#0d61ac] px-3 py-1 text-xs font-medium text-white"
                : "shrink-0 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
            }
          >
            Todas
          </Link>
          {categories.map((cat) => {
            const isActive = categoria === cat.slug;
            return (
              <Link
                key={cat.id}
                href={buildUrl({ categoria: cat.slug as string, page: undefined })}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "shrink-0 rounded-full border border-[#0d61ac] bg-[#0d61ac] px-3 py-1 text-xs font-medium text-white"
                    : "shrink-0 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
                }
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Results header */}
      {query && (
        <div className="mb-8 border-b-2 border-[#0d61ac] pb-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Resultados para &ldquo;{query}&rdquo;
          </h1>
          <p className="mt-1 text-sm font-semibold text-[#0d61ac]">
            {totalDocs} {totalDocs === 1 ? "artigo encontrado" : "artigos encontrados"}
          </p>
        </div>
      )}

      {!query && (
        <div className="py-20 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-gray-300"
            viewBox="0 0 256 256"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
          </svg>
          <p className="text-lg text-gray-500">
            Digite algo para buscar artigos
          </p>
        </div>
      )}

      {/* Results grid */}
      {query && docs.length > 0 && (
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
                coverUrl={post.coverUrl ?? null}
                heroImage={heroImage ?? { url: null }}
                category={cat ?? { name: "", slug: "" }}
                author={author ?? { name: "Redacao" }}
                publishedAt={post.publishedAt ?? null}
              />
            );
          })}
        </div>
      )}

      {query && docs.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-gray-400">
            Nenhum artigo encontrado para &ldquo;{query}&rdquo;.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Tente usar termos diferentes ou remova os filtros.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={buildUrl({ page: String(page - 1) })}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
            >
              Anterior
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Pagina {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildUrl({ page: String(page + 1) })}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
            >
              Proximo
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
