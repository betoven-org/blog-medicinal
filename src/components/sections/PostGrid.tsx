import Image from "next/image";
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
  /** @default 3 */
  columns?: number;

  /** @title Mostrar categoria */
  /** @default true */
  showCategory?: boolean;

  /** @title Mostrar autor */
  /** @default false */
  showAuthor?: boolean;

  /** @title Mostrar tempo de leitura */
  /** @default true */
  showReadingTime?: boolean;

  /** @title Link "Ver todos" */
  viewAllHref?: string;
}

const COLUMNS_CLASS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

interface PostCardProps {
  post: PostCard;
  showCategory: boolean;
  showAuthor: boolean;
  showReadingTime: boolean;
}

function PostCardItem({
  post,
  showCategory,
  showAuthor,
  showReadingTime,
}: PostCardProps) {
  const imageUrl = post.heroImageUrl ?? post.coverUrl;

  return (
    <article>
      <a href={`/posts/${post.slug}`} tabIndex={-1} aria-hidden="true">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={post.title}
            width={640}
            height={400}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 320px, 380px"
            quality={60}
            className="aspect-[16/10] w-full rounded-lg object-cover"
            loading="lazy"
          />
        )}
      </a>

      <div className="flex flex-col">
        {showCategory && post.categoryName && (
          <span className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#0d61ac]">
            {post.categoryName}
          </span>
        )}

        <a href={`/posts/${post.slug}`}>
          <h3 className="mt-1 line-clamp-2 text-base font-semibold text-gray-900 hover:text-[#0d61ac]">
            {post.title}
          </h3>
        </a>

        <footer className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
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
  subtitle: _subtitle,
  mode = "recent",
  manualSlugs,
  limit = 6,
  columns = 3,
  showCategory = true,
  showAuthor = false,
  showReadingTime = true,
  viewAllHref,
}: Props) {
  const parsedSlugs = manualSlugs
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const posts = await getPostsByMode(mode as PostMode, limit, parsedSlugs);

  if (posts.length === 0) return null;

  const columnsClass = COLUMNS_CLASS[columns] ?? COLUMNS_CLASS[3];

  return (
    <section aria-labelledby="post-grid-heading" className="border-t border-gray-200">
      <div className="mx-auto max-w-7xl w-full px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-[#0d61ac]" aria-hidden="true" />
          <h2
            id="post-grid-heading"
            className="text-lg font-bold uppercase tracking-wide text-gray-900"
          >
            {title}
          </h2>
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="ml-auto shrink-0 text-sm font-medium text-[#0d61ac] hover:underline"
            >
              Ver todos
            </a>
          )}
        </div>

        <div className={`grid grid-cols-1 gap-4 ${columnsClass}`}>
          {posts.map((post) => (
            <PostCardItem
              key={post.id}
              post={post}
              showCategory={showCategory}
              showAuthor={showAuthor}
              showReadingTime={showReadingTime}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
