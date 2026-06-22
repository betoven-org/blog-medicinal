import type { Metadata } from "next";
import Image from "next/image";
import { HeroArticle } from "@/components/HeroArticle";
import { ArticleCard } from "@/components/ArticleCard";
import { ArticleCardSmall } from "@/components/ArticleCardSmall";
import { ArticleCardCompact } from "@/components/ArticleCardCompact";
import { TrendCard } from "@/components/TrendCard";
import ProductShowcase from "@/components/sections/ProductShowcase";
import { NewsletterForm } from "@/components/NewsletterForm";
import {
  getFeaturedPost,
  getLatestPosts,
  getRecentPosts,
  getPostsByCategorySlug,
  getCategories,
  getSiteSettings,
} from "@/lib/queries";
import Link from "next/link";
import { resolveRelation } from "@/lib/utils";
import { cms } from "@/lib/cms";
import type { SectionBlock } from "@/lib/cms";
import { SectionRenderer } from "@/components/SectionRenderer";

export async function generateMetadata(): Promise<Metadata> {
  const settings = ((await getSiteSettings()) || {}) as any;
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  return {
    title:
      settings.seoTitle || "Medicinal na Web | Portal de Saude e Bem-estar",
    description:
      settings.seoDescription ||
      "Portal de saude, suplementos naturais, fitoterapia e bem-estar.",
    keywords: settings.seoKeywords || "saude, suplementos, fitoterapia",
    alternates: { canonical: baseUrl },
    openGraph: {
      title: settings.seoTitle || "Medicinal na Web",
      description:
        settings.seoDescription || "Portal de saude e bem-estar.",
      type: "website",
      url: baseUrl,
      siteName: settings.siteName || "Medicinal na Web",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle || "Medicinal na Web",
      description:
        settings.seoDescription || "Portal de saude e bem-estar.",
    },
  };
}

/* ── Icon generico por slug ── */
const categoryIcons: Record<string, React.ReactNode> = {
  saude: (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
      <path d="M216,80H176V56a24,24,0,0,0-24-24H104A24,24,0,0,0,80,56V80H40A16,16,0,0,0,24,96v48a16,16,0,0,0,16,16v48a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V160a16,16,0,0,0,16-16V96A16,16,0,0,0,216,80ZM96,56a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V80H96ZM200,208H56V160H200Zm16-64H40V96H216Zm-104-8a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H136A8,8,0,0,1,128,136Z" />
    </svg>
  ),
  emagrecedor: (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
      <path d="M208,80a16,16,0,0,0-16-16H168V48a16,16,0,0,0-16-16H104A16,16,0,0,0,88,48V64H64A16,16,0,0,0,48,80V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16Zm-56,88H136v16a8,8,0,0,1-16,0V168H104a8,8,0,0,1,0-16h16V136a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16ZM104,64V48h48V64Z" />
    </svg>
  ),
  nutricosmetico: (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
      <path d="M216.42,39.6a53.26,53.26,0,0,0-75.32,0L39.6,141.09a53.26,53.26,0,0,0,75.32,75.31h0L216.42,114.91A53.26,53.26,0,0,0,216.42,39.6ZM103.61,205.09h0a37.26,37.26,0,0,1-52.7-52.69L96,107.31,155.31,166.6l-45.09,45.1ZM205.11,103.6,166.6,142.11,107.31,82.8l38.52-38.51a37.26,37.26,0,0,1,52.69,52.7Z" />
    </svg>
  ),
  ativos: (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
      <path d="M168,32a8,8,0,0,1-8,8,48.05,48.05,0,0,0-48,48,8,8,0,0,1-16,0A64.07,64.07,0,0,1,160,24,8,8,0,0,1,168,32ZM223.3,169.32a8.07,8.07,0,0,1,.7,3.28V200a32,32,0,0,1-32,32H64a32,32,0,0,1-32-32V172.6a8,8,0,0,1,.7-3.28L57.08,113A87.46,87.46,0,0,1,80,79.24V56a8,8,0,0,1,16,0V72.43A88.22,88.22,0,0,1,128,64a88.22,88.22,0,0,1,32,8.43V56a8,8,0,0,1,16,0V79.24A87.46,87.46,0,0,1,198.92,113ZM48,200a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V176H48Zm138.94-40L164.18,113a72,72,0,0,0-72.36,0L69.06,160Z" />
    </svg>
  ),
  fit: (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
      <path d="M200,64H180.53a48,48,0,0,0-90.06-8H56A16,16,0,0,0,40,72V200a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V80A16,16,0,0,0,200,64Zm-72-24a32,32,0,0,1,29.52,20H98.48A32,32,0,0,1,128,40ZM200,200H56V80H200Z" />
    </svg>
  ),
  dermocosmeticos: (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm72,0a12,12,0,1,1,12,12A12,12,0,0,1,152,108Zm24,52a8,8,0,0,1-6.4,3.2,60,60,0,0,1-83.2,0A8,8,0,0,1,99.2,150.4a44,44,0,0,0,57.6,0A8,8,0,0,1,176,160Z" />
    </svg>
  ),
  geral: (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
      <path d="M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152a15.86,15.86,0,0,0-4.69,11.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.32,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.32,64l24-24L216,84.69Z" />
    </svg>
  ),
};

function CategoryIcon({ slug }: { slug: string }) {
  return (
    <span aria-hidden="true" className="flex shrink-0">
      {categoryIcons[slug] ?? categoryIcons.saude}
    </span>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b-2 border-[#0d61ac] pb-2">
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
        {title}
      </h2>
      <Link
        href={href}
        className="text-xs font-semibold uppercase tracking-wider text-[#0d61ac] transition-colors hover:text-[#0d61ac]/80"
      >
        Ver todos
      </Link>
    </div>
  );
}

export const revalidate = 60;

export default async function HomePage() {
  // Check if home page has CMS sections configured
  const homePage = await cms.pages.get("home");

  // Use sections from CMS page
  const sectionBlocks: SectionBlock[] = homePage?.sections ?? [];

  if (sectionBlocks.length > 0) {
    return <SectionRenderer blocks={sectionBlocks} />;
  }

  // Fallback: hardcoded portal layout
  const [featured, latest, recent, categories] = await Promise.all([
    getFeaturedPost(),
    getLatestPosts(30),
    getRecentPosts(5),
    getCategories(),
  ]);

  const allCategories = categories.docs;
  const posts = latest.docs;
  const editorPicks = posts.slice(0, 3);
  const trendPosts = posts.slice(3, 11);
  const bannerPost = posts[11] ?? null;
  const weekHighlight = posts[12] ?? null;
  const weekSide = posts.slice(13, 16);
  const noveltyPosts = posts.slice(16, 24);
  const maisLidas = posts.slice(0, 5);

  // Top 3 categories for dedicated sections
  const topCategorySlugs = allCategories
    .map((c) => c.slug as string)
    .slice(0, 3);

  const categorySections = await Promise.all(
    topCategorySlugs.map(async (slug) => {
      const result = await getPostsByCategorySlug(slug, 3);
      const cat = allCategories.find((c) => c.slug === slug);
      return {
        slug,
        name: (cat?.name as string) ?? slug,
        docs: result.docs,
      };
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* ── 1. HERO ── */}
      {featured && (
        <div className="mb-6">
          <HeroArticle
            title={featured.title}
            slug={featured.slug}
            coverUrl={featured.coverUrl ?? null}
            heroImage={resolveRelation(featured.heroImage) ?? { url: null }}
            category={
              resolveRelation(featured.category) ?? {
                name: "Geral",
                slug: "geral",
              }
            }
            author={resolveRelation(featured.author) ?? { name: "Redacao" }}
            publishedAt={featured.publishedAt ?? null}
          />
        </div>
      )}

      {/* ── 2. FLASH DE NOTICIAS ── */}
      {posts.length > 0 && (
        <section className="mb-6 -mx-4 border-y border-[#0d61ac]/20 bg-[#0d61ac]/5 px-4 py-3">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="shrink-0 rounded bg-[#0d61ac] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
              Ultimas
            </span>
            <div className="flex items-center gap-3 text-sm">
              {posts.slice(0, 5).map((post, idx) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="flex shrink-0 items-center gap-3 text-gray-700 transition-colors hover:text-[#0d61ac]"
                >
                  <span className="line-clamp-1 max-w-[220px] font-medium">
                    {post.title}
                  </span>
                  {idx < 4 && (
                    <span className="text-gray-300" aria-hidden="true">|</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. ESCOLHA DO EDITOR ── */}
      <section className="mb-8">
        <SectionHeader title="Escolha do Editor" href="/blog" />
        {editorPicks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {editorPicks.map((post, idx) => {
              const category = resolveRelation(post.category);
              const author = resolveRelation(post.author);
              const heroImage = resolveRelation(post.heroImage);
              return (
                <ArticleCard
                  key={post.id}
                  title={post.title}
                  slug={post.slug}
                  excerpt={post.excerpt ?? ""}
                  coverUrl={post.coverUrl ?? null}
                  heroImage={heroImage ?? { url: null }}
                  category={category ?? { name: "Geral", slug: "geral" }}
                  author={author ?? { name: "Redacao" }}
                  publishedAt={post.publishedAt ?? null}
                  priority={idx === 0}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Nenhum post publicado ainda. Acesse{" "}
            <Link href="/admin" className="text-blue-600 underline">
              /admin
            </Link>{" "}
            para criar conteudo.
          </p>
        )}
      </section>

      {/* ── 4. CATEGORIAS ── */}
      {allCategories.length > 0 && (
        <section className="mb-8 -mx-4 bg-gray-50 px-4 py-6">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {allCategories.map((cat) => {
              const slug = cat.slug as string;
              return (
                <Link
                  key={cat.id}
                  href={`/categorias/${slug}`}
                  className="flex items-center gap-2 rounded-full border-2 border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac] whitespace-nowrap"
                >
                  <CategoryIcon slug={slug} />
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 5. VITRINE DE PRODUTOS ── */}
      {/* @ts-expect-error Async Server Component */}
      <ProductShowcase
        title="Nossos Produtos"
        mode="all"
        limit={4}
        columns={4}
        viewAllHref="/produtos"
      />

      {/* ── 6. TENDENCIAS + POSTS RECENTES ── */}
      <div className="mb-8 grid gap-8 lg:grid-cols-[1fr_280px]">
        {trendPosts.length > 0 && (
          <section>
            <SectionHeader title="Tendencias" href="/blog" />
            <div className="grid gap-4 md:grid-cols-2">
              {trendPosts.map((post) => {
                const heroImage = resolveRelation(post.heroImage);
                return (
                  <TrendCard
                    key={post.id}
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt ?? ""}
                    coverUrl={post.coverUrl ?? null}
                    heroImage={heroImage ?? { url: null }}
                  />
                );
              })}
            </div>
          </section>
        )}

        <aside>
          <SectionHeader title="Posts Recentes" href="/blog" />
          <div className="rounded-lg border border-gray-100 bg-white p-3">
            {recent.docs.length > 0 ? (
              recent.docs.map((post) => {
                const author = resolveRelation(post.author);
                return (
                  <ArticleCardSmall
                    key={post.id}
                    title={post.title}
                    slug={post.slug}
                    author={author ?? { name: "Redacao" }}
                    publishedAt={post.publishedAt ?? null}
                  />
                );
              })
            ) : (
              <p className="text-sm text-gray-500">Nenhum post recente.</p>
            )}
          </div>
        </aside>
      </div>

      {/* ── 7. DESTAQUE DA SEMANA (portal layout) ── */}
      {weekHighlight && weekSide.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Destaque da Semana" href="/blog" />
          <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
            {/* Big card left */}
            {(() => {
              const heroImage = resolveRelation(weekHighlight.heroImage);
              const category = resolveRelation(weekHighlight.category);
              const imageUrl =
                weekHighlight.coverUrl ||
                (heroImage as any)?.sizes?.card?.url ||
                (heroImage as any)?.url ||
                "/placeholder.svg";
              return (
                <Link
                  href={`/posts/${weekHighlight.slug}`}
                  className="group block"
                >
                  <article className="relative overflow-hidden rounded-xl bg-gray-100">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={imageUrl}
                        alt={(heroImage as any)?.alt || weekHighlight.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      {category && (
                        <span className="mb-2 inline-block rounded-full bg-[#0d61ac] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          {(category as { name: string }).name}
                        </span>
                      )}
                      <h3 className="text-lg font-bold leading-snug text-white transition-colors group-hover:text-blue-200 sm:text-xl">
                        {weekHighlight.title}
                      </h3>
                      {weekHighlight.excerpt && (
                        <p className="mt-1 line-clamp-2 text-sm text-white/80">
                          {weekHighlight.excerpt}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              );
            })()}

            {/* 3 stacked cards right */}
            <div className="flex flex-col gap-4">
              {weekSide.map((post) => {
                const heroImage = resolveRelation(post.heroImage);
                const category = resolveRelation(post.category);
                const imageUrl =
                  post.coverUrl ||
                  (heroImage as any)?.sizes?.card?.url ||
                  (heroImage as any)?.url ||
                  "/placeholder.svg";
                return (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="group flex gap-4"
                  >
                    <div className="relative w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100" style={{ aspectRatio: "4/3" }}>
                      <Image
                        src={imageUrl}
                        alt={(heroImage as any)?.alt || post.title}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                      {category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0d61ac]">
                          {(category as { name: string }).name}
                        </span>
                      )}
                      <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#0d61ac]">
                        {post.title}
                      </h3>
                      {post.publishedAt && (
                        <time className="text-xs text-gray-400" dateTime={post.publishedAt}>
                          {new Date(post.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </time>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. BANNER DE DESTAQUE ── */}
      {bannerPost &&
        (() => {
          const bannerImage = resolveRelation(bannerPost.heroImage);
          const bannerCategory = resolveRelation(bannerPost.category);
          const imageUrl =
            bannerPost.coverUrl ||
            (
              bannerImage as {
                sizes?: { card?: { url?: string | null } };
                url?: string | null;
              } | null
            )?.sizes?.card?.url ||
            (bannerImage as { url?: string | null } | null)?.url ||
            "/placeholder.svg";
          return (
            <section className="mb-8">
              <Link
                href={`/posts/${bannerPost.slug}`}
                className="group block"
              >
                <article className="flex flex-col overflow-hidden rounded-xl bg-gray-50 sm:flex-row">
                  <div className="relative h-56 w-full shrink-0 sm:h-auto sm:w-1/2">
                    <Image
                      src={imageUrl}
                      alt={
                        (bannerImage as { alt?: string } | null)?.alt ||
                        bannerPost.title
                      }
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-3 p-6 sm:w-1/2">
                    {bannerCategory && (
                      <span className="w-fit rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold uppercase text-[#0d61ac]">
                        {(bannerCategory as { name: string }).name}
                      </span>
                    )}
                    <h2 className="text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#0d61ac]">
                      {bannerPost.title}
                    </h2>
                    {bannerPost.excerpt && (
                      <p className="line-clamp-3 text-sm text-gray-600">
                        {bannerPost.excerpt}
                      </p>
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#0d61ac]">
                      Leia mais &rarr;
                    </span>
                  </div>
                </article>
              </Link>
            </section>
          );
        })()}

      {/* ── 9. SECOES POR CATEGORIA ── */}
      {categorySections.filter((s) => s.docs.length > 0).length > 0 && (
        <section className="mb-8">
          <div className="grid gap-8 md:grid-cols-3">
            {categorySections.map(
              (section) =>
                section.docs.length > 0 && (
                  <div key={section.slug}>
                    <SectionHeader
                      title={section.name}
                      href={`/categorias/${section.slug}`}
                    />
                    <div className="space-y-0">
                      {section.docs.map((post) => {
                        const author = resolveRelation(post.author);
                        return (
                          <ArticleCardSmall
                            key={post.id}
                            title={post.title}
                            slug={post.slug}
                            author={author ?? { name: "Redacao" }}
                            publishedAt={post.publishedAt ?? null}
                          />
                        );
                      })}
                    </div>
                  </div>
                )
            )}
          </div>
        </section>
      )}

      {/* ── 10. NEWSLETTER ── */}
      <section className="mb-8 -mx-4 bg-gradient-to-r from-[#0d61ac] to-[#0a4d8a] px-4 py-8 sm:rounded-xl sm:mx-0 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            Receba as melhores dicas de saude
          </h2>
          <p className="mt-1 text-sm text-white/70">
            Cadastre-se e receba conteudos exclusivos sobre bem-estar, suplementos e vida saudavel.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </section>

      {/* ── 11. NOVIDADES ── */}
      {noveltyPosts.length > 0 && (
        <section className="mb-8">
          <SectionHeader title="Novidades" href="/blog" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {noveltyPosts.map((post) => {
              const category = resolveRelation(post.category);
              const heroImage = resolveRelation(post.heroImage);
              return (
                <ArticleCardCompact
                  key={post.id}
                  title={post.title}
                  slug={post.slug}
                  coverUrl={post.coverUrl ?? null}
                  heroImage={heroImage ?? { url: null }}
                  category={category ?? { name: "Geral", slug: "geral" }}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* ── 12. MAIS LIDAS ── */}
      {maisLidas.length > 0 && (
        <section className="mb-4">
          <SectionHeader title="Mais Lidas" href="/blog" />
          <ol className="grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
            {maisLidas.map((post, index) => (
              <li key={post.id}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="group flex items-start gap-3 border-r border-gray-100 px-4 py-3 first:pl-0 last:border-r-0 hover:bg-gray-50 sm:first:pl-4"
                >
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-3xl font-black leading-none text-gray-200 group-hover:text-blue-200"
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium leading-snug text-gray-800 transition-colors group-hover:text-[#0d61ac]">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
