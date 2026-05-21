import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ArticleCard } from "@/components/ArticleCard";
import { formatDate } from "@/lib/formatDate";
import { getPostBySlug, getLatestPosts } from "@/lib/queries";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post nao encontrado" };
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const heroImage = typeof post.heroImage === "object" ? post.heroImage : null;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `${baseUrl}/posts/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      authors: [typeof post.author === "object" ? post.author?.name : "Redação"],
      images: heroImage?.url ? [{ url: heroImage.url, alt: heroImage.alt || post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export async function generateStaticParams() {
  const { getPayloadClient } = await import("@/payload-utils");
  const payload = await getPayloadClient();
  const posts = await payload.find({
    collection: "posts",
    where: { status: { equals: "published" } },
    limit: 1000,
    depth: 0,
  });
  return posts.docs.map((post) => ({ slug: post.slug }));
}

function resolveRelation<T>(value: T | string | number): T | null {
  if (typeof value === "object" && value !== null) return value as T;
  return null;
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const heroImage = resolveRelation(post.heroImage);
  const category = resolveRelation(post.category);
  const author = resolveRelation(post.author);
  const imageUrl =
    heroImage?.sizes?.hero?.url || heroImage?.url || null;

  const related = await getLatestPosts(4);
  const relatedPosts = related.docs.filter((p) => p.id !== post.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: author?.name || "Redação",
    },
    publisher: {
      "@type": "Organization",
      name: "Medicinal na Web",
    },
    ...(imageUrl ? { image: imageUrl } : {}),
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Post header */}
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-6">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            ...(category
              ? [{ label: category.name, href: `/categorias/${category.slug}` }]
              : []),
            { label: post.title },
          ]}
        />

        {category && (
          <Link href={`/categorias/${category.slug}`}>
            <CategoryBadge name={category.name} />
          </Link>
        )}

        <h1 className="mt-4 text-2xl font-bold leading-tight text-gray-900 md:text-4xl">
          {post.title}
        </h1>

        <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
          <span>{author?.name ?? "Redacao"}</span>
          {post.publishedAt && (
            <>
              <span>·</span>
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </>
          )}
        </div>

        <div className="mt-8 border-b border-gray-100" />
      </div>

      {/* Inline hero image */}
      {imageUrl && (
        <div className="mx-auto max-w-7xl px-4 pb-4">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={imageUrl}
              alt={heroImage?.alt || post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1280px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Rich Text Content */}
      <div className="mx-auto max-w-7xl px-4 ">
        <div className="prose prose-lg prose-gray mt-6 max-w-none">
          {post.content && <RichText data={post.content} />}
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pb-6">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t: { tag?: string | null }, i: number) => (
              <span
                key={i}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
              >
                #{t.tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Share icons */}
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
          <span className="text-sm font-medium text-gray-500">Compartilhar:</span>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`/posts/${post.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartilhar no Facebook"
            className="p-2 text-gray-500 transition-colors hover:text-blue-600"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`/posts/${post.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartilhar no X"
            className="p-2 text-gray-500 transition-colors hover:text-gray-900"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${post.title} /posts/${post.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Compartilhar no WhatsApp"
            className="p-2 text-gray-500 transition-colors hover:text-[#0d61ac]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 text-lg font-bold uppercase tracking-wider text-gray-900">
              Leia tambem
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((p) => {
                const cat = resolveRelation(p.category);
                const auth = resolveRelation(p.author);
                const img = resolveRelation(p.heroImage);
                return (
                  <ArticleCard
                    key={p.id}
                    title={p.title}
                    slug={p.slug}
                    excerpt={p.excerpt}
                    heroImage={img ?? { url: null }}
                    category={cat ?? { name: "Geral", slug: "geral" }}
                    author={auth ?? { name: "Redacao" }}
                    publishedAt={p.publishedAt ?? null}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
