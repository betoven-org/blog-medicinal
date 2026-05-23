import { getFeaturedPost } from "@/lib/loaders";

/**
 * @title Post Destaque
 * @description Banner principal com o post em destaque
 * @group Home
 */
export interface Props {
  /** @title Modo de selecao */
  /** @options featured,manual */
  /** @default featured */
  mode?: "featured" | "manual";

  /** @title Slug do post (modo manual) */
  /** @description Informe o slug do post para exibir manualmente */
  manualSlug?: string;

  /** @title Altura */
  /** @options pequeno,medio,grande */
  /** @default grande */
  height?: "pequeno" | "medio" | "grande";

  /** @title Overlay escuro */
  /** @default true */
  overlay?: boolean;

  /** @title Mostrar categoria */
  /** @default true */
  showCategory?: boolean;

  /** @title Mostrar autor */
  /** @default true */
  showAuthor?: boolean;

  /** @title Mostrar tempo de leitura */
  /** @default true */
  showReadingTime?: boolean;
}

const heightClass: Record<NonNullable<Props["height"]>, string> = {
  pequeno: "h-[350px]",
  medio: "h-[450px]",
  grande: "h-[550px]",
};

export default async function HeroPost({
  mode = "featured",
  manualSlug,
  height = "grande",
  overlay = true,
  showCategory = true,
  showAuthor = true,
  showReadingTime = true,
}: Props) {
  const post = await getFeaturedPost(mode, manualSlug);

  if (!post) return null;

  const imageUrl = post.coverUrl ?? post.heroImageUrl;
  const hasMetaBottom = showAuthor || showReadingTime;

  return (
    <section className="w-full">
      <a
        href={`/posts/${post.slug}`}
        className={`relative flex w-full overflow-hidden ${heightClass[height]} group`}
        aria-label={`Ler post: ${post.title}`}
      >
        {/* Background image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={post.title}
            width={1440}
            height={550}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="eager"
            fetchPriority="high"
          />
        )}

        {/* Fallback background when no image */}
        {!imageUrl && (
          <div className="absolute inset-0 bg-[#0d61ac]" aria-hidden="true" />
        )}

        {/* Overlay */}
        {overlay && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
            aria-hidden="true"
          />
        )}

        {/* Category badge — top left */}
        {showCategory && post.categoryName && (
          <div className="absolute left-6 top-6 z-10">
            <span className="rounded-full bg-[#0d61ac] px-3 py-1 text-xs font-semibold text-white">
              {post.categoryName}
            </span>
          </div>
        )}

        {/* Content — bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-8 pt-4 lg:px-12 lg:pb-10">
          <h2 className="font-bold leading-tight text-white text-3xl lg:text-5xl">
            {post.title}
          </h2>

          {post.excerpt && (
            <p className="mt-3 max-w-2xl text-base text-white/80 line-clamp-2">
              {post.excerpt}
            </p>
          )}

          {hasMetaBottom && (
            <div className="mt-4 flex items-center gap-3 text-sm text-white/60">
              {showAuthor && post.authorName && (
                <span>{post.authorName}</span>
              )}
              {showAuthor && post.authorName && showReadingTime && post.readingTimeMinutes && (
                <span aria-hidden="true">·</span>
              )}
              {showReadingTime && post.readingTimeMinutes && (
                <span>{post.readingTimeMinutes} min de leitura</span>
              )}
            </div>
          )}
        </div>
      </a>
    </section>
  );
}
