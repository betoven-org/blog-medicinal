import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getPostsByCategory, getCategories } from "@/lib/queries";
import { resolveRelation } from "@/lib/utils";

export const revalidate = 300;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { category } = await getPostsByCategory(slug);
  if (!category) return { title: "Categoria nao encontrada" };
  return {
    title: category.name,
    description: `Artigos sobre ${category.name.toLowerCase()} - Medicinal na Web`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [categoryResult, categoriesResult] = await Promise.all([
    getPostsByCategory(slug, 12, page),
    getCategories(),
  ]);
  const { docs, category, totalPages, totalDocs } = categoryResult as {
    docs: any[];
    category: any;
    totalPages: number;
    totalDocs: number;
  };

  if (!category) notFound();

  const allCategories = categoriesResult.docs;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categorias", href: "/categorias" },
          { label: category.name },
        ]}
      />

      {/* Category pills */}
      <div
        className="mb-8 flex flex-wrap gap-2"
        role="navigation"
        aria-label="Filtrar por categoria"
      >
        <Link
          href="/"
          className="rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
        >
          Todos
        </Link>
        {allCategories.map((cat) => {
          const isActive = cat.slug === slug;
          return (
            <Link
              key={cat.id}
              href={`/categorias/${cat.slug}`}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "rounded-full border border-[#0d61ac] px-4 py-1.5 text-sm font-medium bg-[#0d61ac] text-white"
                  : "rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac]"
              }
            >
              {cat.name}
            </Link>
          );
        })}
      </div>

      {/* Page header */}
      <div className="mb-8 border-b-2 border-[#0d61ac] pb-3">
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        <p className="mt-1 text-sm font-semibold text-[#0d61ac]">
          {totalDocs} {totalDocs === 1 ? "artigo" : "artigos"}
        </p>
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
                coverUrl={post.coverUrl ?? null}
                heroImage={heroImage ?? { url: null }}
                category={cat ?? { name: category.name, slug: category.slug }}
                author={author ?? { name: "Redacao" }}
                publishedAt={post.publishedAt ?? null}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">Nenhum artigo nesta categoria ainda.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={`/categorias/${slug}?page=${page - 1}`}
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
              href={`/categorias/${slug}?page=${page + 1}`}
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
