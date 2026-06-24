import Image from "next/image";
import { getPostsByMode } from "@/lib/loaders";
import type { PostMode } from "@/lib/loaders";

/**
 * @title Destaque da Semana
 * @description Hero com overlay na imagem + lista lateral de posts
 * @group Home
 */
export interface Props {
  /** @title Titulo da secao */
  /** @default Destaque da Semana */
  title?: string;

  /** @title Modo */
  /** @options recent,trending,popular,editor-picks,manual */
  /** @default editor-picks */
  mode?: PostMode;

  /** @title Slugs manuais */
  /** @description Slugs separados por virgula (modo manual) */
  manualSlugs?: string;

  /** @title Posts laterais */
  /** @default 3 */
  sideCount?: number;

  /** @title homeSection */
  /** @description Valor da coluna home_section (destaque, trending, editor) */
  homeSection?: string;

  /** @title Link "Ver todos" */
  viewAllHref?: string;
}

export default async function PostHighlight({
  title = "Destaque da Semana",
  mode = "homeSection",
  manualSlugs,
  sideCount = 3,
  homeSection = "destaque",
  viewAllHref,
}: Props) {
  const slugs = mode === "manual" && manualSlugs
    ? manualSlugs.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;

  const posts = await getPostsByMode(mode, sideCount + 1, slugs, homeSection);
  if (posts.length === 0) return null;

  const [hero, ...side] = posts;
  const heroImage = hero.heroImageUrl ?? hero.coverUrl;

  return (
    <section className="border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
            {title}
          </h2>
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="text-xs font-semibold uppercase tracking-wider text-[#0d61ac] hover:underline"
            >
              Ver todos
            </a>
          )}
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Hero with overlay */}
          <div className="lg:col-span-2">
            <a href={`/posts/${hero.slug}`} className="group block relative">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={hero.title}
                  width={864}
                  height={540}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="w-full aspect-[16/10] object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-[16/10] rounded-lg bg-gray-200" />
              )}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-xl lg:text-2xl font-bold text-white line-clamp-3 group-hover:underline">
                  {hero.title}
                </h3>
                {hero.excerpt && (
                  <p className="text-sm text-white/80 mt-2 line-clamp-2">
                    {hero.excerpt}
                  </p>
                )}
              </div>
            </a>
          </div>

          {/* Side posts */}
          {side.length > 0 && (
            <div className="mt-6 lg:mt-0 space-y-0">
              {side.map((post) => {
                const img = post.heroImageUrl ?? post.coverUrl;
                const date = post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                      day: "numeric",
                      month: "short",
                    })
                  : null;
                return (
                  <a
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="flex gap-4 py-4 border-b border-gray-100 last:border-0 group"
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={post.title}
                        width={96}
                        height={96}
                        sizes="96px"
                        loading="lazy"
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-3 group-hover:text-[#0d61ac] transition-colors">
                        {post.title}
                      </h4>
                      {date && (
                        <p className="text-xs text-gray-500 mt-1.5">{date}</p>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
