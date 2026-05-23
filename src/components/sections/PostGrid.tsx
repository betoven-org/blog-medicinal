import { getPostsByMode } from "@/lib/loaders";
import type { PostMode, PostCard } from "@/lib/loaders";
import { formatDate } from "@/lib/formatDate";

/**
 * @title Grade de Posts
 * @description Grade de posts com filtros configuraveis
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
  /** @default 6 */
  limit?: number;

  /** @title Colunas */
  /** @options 2,3,4 */
  /** @default 3 */
  columns?: "2" | "3" | "4";

  /** @title Mostrar categoria */
  /** @default true */
  showCategory?: boolean;

  /** @title Mostrar autor */
  /** @default false */
  showAuthor?: boolean;

  /** @title Mostrar tempo de leitura */
  /** @default true */
  showReadingTime?: boolean;

  /** @title Mostrar views (trending/popular) */
  /** @default false */
  showViews?: boolean;

  /** @title Link "Ver todos" */
  viewAllHref?: string;
}

const MODE_LABELS: Partial<Record<PostMode, string>> = {
  trending: "Tendencias",
  popular: "Mais Lidos",
  "editor-picks": "Escolhas do Editor",
};

const COLUMNS_CLASS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

function PostCardPlaceholder() {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-t-xl bg-gray-100">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </svg>
    </div>
  );
}

interface PostCardProps {
  post: PostCard;
  showCategory: boolean;
  showAuthor: boolean;
  showReadingTime: boolean;
  showViews: boolean;
}

function PostCardItem({
  post,
  showCategory,
  showAuthor,
  showReadingTime,
  showViews,
}: PostCardProps) {
  const imageUrl = post.heroImageUrl ?? post.coverUrl;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 transition-shadow hover:shadow-md">
      <a href={`/posts/${post.slug}`} tabIndex={-1} aria-hidden="true">
        <div className="relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={post.title}
              width={640}
              height={360}
              className="aspect-video w-full rounded-t-xl object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <PostCardPlaceholder />
          )}
          {showCategory && post.categoryName && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-[#0d61ac]">
              {post.categoryName}
            </span>
          )}
        </div>
      </a>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <a href={`/posts/${post.slug}`}>
          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 hover:text-[#0d61ac]">
            {post.title}
          </h3>
        </a>

        {post.excerpt && (
          <p className="line-clamp-2 mt-1 text-sm text-gray-500">{post.excerpt}</p>
        )}

        <footer className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-gray-400">
          {showAuthor && post.authorName && (
            <span className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {post.authorName}
            </span>
          )}

          {showReadingTime && post.readingTimeMinutes != null && (
            <span className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {post.readingTimeMinutes} min
            </span>
          )}

          {showViews && post.views != null && (
            <span className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {post.views.toLocaleString("pt-BR")}
            </span>
          )}

          {post.publishedAt && (
            <time dateTime={post.publishedAt} className="ml-auto">
              {formatDate(post.publishedAt)}
            </time>
          )}
        </footer>
      </div>
    </article>
  );
}

export default async function PostGrid({
  title,
  subtitle,
  mode = "recent",
  manualSlugs,
  limit = 6,
  columns = "3",
  showCategory = true,
  showAuthor = false,
  showReadingTime = true,
  showViews = false,
  viewAllHref,
}: Props) {
  const parsedSlugs = manualSlugs
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const posts = await getPostsByMode(mode as PostMode, limit, parsedSlugs);

  if (posts.length === 0) return null;

  const modeLabel = MODE_LABELS[mode as PostMode];
  const columnsClass = COLUMNS_CLASS[columns] ?? COLUMNS_CLASS["3"];

  return (
    <section aria-labelledby="post-grid-heading">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-8 flex items-end justify-between">
          <div>
            {modeLabel && (
              <span className="mb-2 inline-block rounded-full bg-[#0d61ac]/10 px-2 py-0.5 text-xs font-semibold text-[#0d61ac]">
                {modeLabel}
              </span>
            )}
            <h2
              id="post-grid-heading"
              className="text-2xl font-bold text-gray-900"
            >
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-gray-500">{subtitle}</p>}
          </div>

          {viewAllHref && (
            <a
              href={viewAllHref}
              className="shrink-0 text-sm font-medium text-[#0d61ac] hover:underline"
            >
              Ver todos
            </a>
          )}
        </header>

        <ul
          className={`grid grid-cols-1 gap-6 ${columnsClass}`}
          role="list"
        >
          {posts.map((post) => (
            <li key={post.id}>
              <PostCardItem
                post={post}
                showCategory={showCategory}
                showAuthor={showAuthor}
                showReadingTime={showReadingTime}
                showViews={showViews}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
