import { getPostsByMode } from "@/lib/loaders";
import type { PostMode } from "@/lib/loaders";

/**
 * @title Carrossel de Posts
 * @description Carrossel horizontal de posts com scroll
 * @group Home
 */
export interface Props {
  /** @title Titulo da secao */
  title: string;

  /** @title Subtitulo */
  subtitle?: string;

  /** @title Modo */
  /** @options recent,trending,popular,editor-picks,manual */
  /** @default recent */
  mode?: "recent" | "trending" | "popular" | "editor-picks" | "manual";

  /** @title Slugs manuais */
  /** @description Slugs separados por virgula (modo manual) */
  manualSlugs?: string;

  /** @title Limite de posts */
  /** @default 8 */
  limit?: number;

  /** @title Mostrar categoria */
  /** @default true */
  showCategory?: boolean;

  /** @title Mostrar views */
  /** @default false */
  showViews?: boolean;

  /** @title Link "Ver todos" */
  viewAllHref?: string;
}

// ── Mode badge labels ─────────────────────────────────────────────────────────

const MODE_LABEL: Record<PostMode, string> = {
  recent: "Recentes",
  trending: "Em alta",
  popular: "Mais lidos",
  "editor-picks": "Escolha da redacao",
  manual: "Selecao",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default async function PostCarousel({
  title,
  subtitle,
  mode = "recent",
  manualSlugs,
  limit = 8,
  showCategory = true,
  showViews = false,
  viewAllHref,
}: Props) {
  const parsedSlugs =
    mode === "manual" && manualSlugs
      ? manualSlugs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

  const posts = await getPostsByMode(mode, limit, parsedSlugs);

  if (!posts.length) return null;

  return (
    <section className="w-full py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <span className="rounded-full bg-[#0d61ac]/10 px-3 py-0.5 text-xs font-semibold text-[#0d61ac]">
                {MODE_LABEL[mode]}
              </span>
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="shrink-0 text-sm font-medium text-[#0d61ac] hover:underline"
            >
              Ver todos
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="inline ml-1 -mt-0.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>

        {/* Scroll container */}
        <div className="relative">
          <ul
            className="flex gap-4 overflow-x-auto scroll-smooth pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            role="list"
          >
            {posts.map((post) => {
              const imageUrl = post.coverUrl ?? post.heroImageUrl;

              return (
                <li
                  key={post.id}
                  className="w-[280px] flex-shrink-0 snap-start"
                >
                  <a
                    href={`/posts/${post.slug}`}
                    className="group block h-full"
                    aria-label={`Ler post: ${post.title}`}
                  >
                    {/* Card image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={post.title}
                          width={280}
                          height={210}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="h-full w-full bg-[#0d61ac]/10"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    {/* Card body */}
                    <div className="mt-3">
                      {showCategory && post.categoryName && (
                        <p className="text-xs font-medium text-[#0d61ac] mt-2">
                          {post.categoryName}
                        </p>
                      )}
                      <h3 className="mt-1 text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-[#0d61ac] transition-colors">
                        {post.title}
                      </h3>
                      {showViews && post.views !== undefined && (
                        <p className="mt-1 text-xs text-gray-400">
                          {post.views.toLocaleString("pt-BR")} visualizacoes
                        </p>
                      )}
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Right-edge fade overlay */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
