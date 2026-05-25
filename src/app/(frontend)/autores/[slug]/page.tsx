import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ArticleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getAuthorBySlug, getPostsByAuthor } from "@/lib/queries";
import { resolveRelation } from "@/lib/utils";

export const revalidate = 600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return { title: "Autor nao encontrado" };
  return {
    title: `${author.name} - Medicinal na Web`,
    description: author.bio || `Artigos de ${author.name} no Medicinal na Web.`,
  };
}

export default async function AuthorPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const author = await getAuthorBySlug(slug);
  if (!author) notFound();

  const postsResult = await getPostsByAuthor(author.id, 12, page);
  const { docs, totalDocs, totalPages } = postsResult;

  const avatar = resolveRelation(author.avatar) as {
    url?: string | null;
    alt?: string;
  } | null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Autores" },
          { label: author.name },
        ]}
      />

      {/* Author profile */}
      <div className="mb-10 flex items-start gap-6">
        {avatar?.url ? (
          <Image
            src={avatar.url}
            alt={avatar.alt || author.name}
            width={96}
            height={96}
            className="h-24 w-24 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#0d61ac] text-3xl font-bold text-white">
            {author.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{author.name}</h1>
          {author.bio && (
            <p className="mt-2 max-w-2xl text-gray-600">{author.bio}</p>
          )}
          <p className="mt-2 text-sm font-semibold text-[#0d61ac]">
            {totalDocs} {totalDocs === 1 ? "artigo publicado" : "artigos publicados"}
          </p>
        </div>
      </div>

      {/* Posts grid */}
      {docs.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((post) => {
            const cat = resolveRelation(post.category);
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
                author={{ name: author.name }}
                publishedAt={post.publishedAt ?? null}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500">Nenhum artigo publicado por este autor.</p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-4">
          {page > 1 && (
            <Link
              href={`/autores/${slug}?page=${page - 1}`}
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
              href={`/autores/${slug}?page=${page + 1}`}
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
