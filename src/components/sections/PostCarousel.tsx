import { getPostsByMode } from "@/lib/loaders";
import type { PostMode } from "@/lib/loaders";

/**
 * @title Lista de Posts
 * @description Lista numerada de posts (vertical ou horizontal)
 * @group Home
 */
export interface Props {
  // --- Conteudo ---

  /** @title Titulo da secao */
  title: string;

  /** @title Subtitulo */
  subtitle?: string;

  // --- Selecao ---

  /** @title Modo */
  /** @options recent,trending,popular,editor-picks,manual,homeSection */
  /** @default trending */
  mode?: "recent" | "trending" | "popular" | "editor-picks" | "manual" | "homeSection";

  /** @title Slugs manuais */
  /** @description Slugs separados por virgula (modo manual) */
  manualSlugs?: string;

  /** @title homeSection */
  /** @description Valor da coluna home_section (trending, destaque, editor) */
  homeSection?: string;

  /** @title Limite de posts */
  /** @default 5 */
  limit?: number;

  // --- Exibicao ---

  /** @title Mostrar categoria */
  /** @default true */
  showCategory?: boolean;

  /** @title Layout */
  /** @options vertical,horizontal */
  /** @default vertical */
  layout?: "vertical" | "horizontal";

  /** @title Link "Ver todos" */
  viewAllHref?: string;
}

export default async function PostList({
  title,
  subtitle,
  mode = "trending",
  manualSlugs,
  limit = 5,
  showCategory = true,
  layout = "vertical",
  homeSection,
  viewAllHref,
}: Props) {
  const parsedSlugs =
    mode === "manual" && manualSlugs
      ? manualSlugs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : undefined;

  const posts = await getPostsByMode(mode as PostMode, limit, parsedSlugs, homeSection);

  if (!posts.length) return null;

  if (layout === "horizontal") {
    return (
      <section className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-6 w-1 rounded-full bg-[#0d61ac]" aria-hidden="true" />
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              {title}
            </h2>
            {viewAllHref && (
              <a href={viewAllHref} className="ml-auto shrink-0 text-sm font-medium text-[#0d61ac] hover:underline">
                Ver todos
              </a>
            )}
          </div>
          <ol className="grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
            {posts.map((post, index) => (
              <li key={post.id}>
                <a
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
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  // vertical (default)
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-6 w-1 rounded-full bg-[#0d61ac]" aria-hidden="true" />
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              {title}
            </h2>
          </div>
          {viewAllHref && (
            <a href={viewAllHref} className="shrink-0 text-sm font-medium text-[#0d61ac] hover:underline flex items-center gap-1">
              Ver todos
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>

        {subtitle && (
          <p className="text-sm text-gray-500 -mt-4 mb-6">{subtitle}</p>
        )}

        <ol role="list">
          {posts.map((post, index) => (
            <li key={post.id} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
              <a href={`/posts/${post.slug}`} className="flex gap-4 w-full group" aria-label={`Ler post: ${post.title}`}>
                <span className="text-2xl font-bold text-[#0d61ac]/20 w-8 flex-shrink-0 text-center leading-none pt-1" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  {showCategory && post.categoryName && (
                    <p className="text-xs font-semibold text-[#0d61ac] uppercase tracking-wide">
                      {post.categoryName}
                    </p>
                  )}
                  <h3 className="text-base font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-[#0d61ac] transition-colors">
                    {post.title}
                  </h3>
                  {post.readingTimeMinutes != null && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      {post.readingTimeMinutes} min
                    </p>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
