import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getPostsByCategory, getCategories } from "@/lib/queries";

type Props = {
  params: Promise<{ slug: string }>;
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

function resolveRelation<T>(value: T | string | number): T | null {
  if (typeof value === "object" && value !== null) return value as T;
  return null;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  const [{ docs, category }, categoriesResult] = await Promise.all([
    getPostsByCategory(slug),
    getCategories(),
  ]);

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
                  ? "rounded-full px-4 py-1.5 text-sm font-medium bg-[#0d61ac] text-white"
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
          {docs.length} {docs.length === 1 ? "artigo" : "artigos"}
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
        <p className="text-gray-400">Nenhum artigo nesta categoria ainda.</p>
      )}
    </div>
  );
}
