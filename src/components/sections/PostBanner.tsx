import Image from "next/image";
import { getPostsByMode } from "@/lib/loaders";
import type { PostMode } from "@/lib/loaders";

/**
 * @title Banner de Post
 * @description Post em destaque com imagem a esquerda e texto a direita
 * @group Home
 */
export interface Props {
  /** @title Modo */
  /** @options recent,trending,popular,editor-picks,manual */
  /** @default recent */
  mode?: PostMode;

  /** @title Slug do post (modo manual) */
  manualSlug?: string;

  /** @title homeSection */
  /** @description Valor da coluna home_section (banner, destaque, trending) */
  homeSection?: string;

  /** @title Posicao no feed */
  /** @description Qual post pegar da lista (ex: 1 = segundo post) */
  /** @default 0 */
  offset?: number;
}

export default async function PostBanner({
  mode = "homeSection",
  manualSlug,
  homeSection = "banner",
  offset = 0,
}: Props) {
  const slugs = mode === "manual" && manualSlug
    ? [manualSlug]
    : undefined;

  const posts = await getPostsByMode(mode, offset + 1, slugs, homeSection);
  const post = posts[offset] ?? posts[0];
  if (!post) return null;

  const imageUrl = post.heroImageUrl ?? post.coverUrl;

  return (
    <section>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <a href={`/posts/${post.slug}`} className="group block">
          <article className="flex flex-col overflow-hidden rounded-xl bg-gray-50 sm:flex-row">
            <div className="relative h-56 w-full shrink-0 sm:h-auto sm:w-1/2">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200" />
              )}
            </div>
            <div className="flex flex-col justify-center gap-3 p-6 sm:w-1/2">
              {post.categoryName && (
                <span className="w-fit rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold uppercase text-[#0d61ac]">
                  {post.categoryName}
                </span>
              )}
              <h2 className="text-base font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#0d61ac]">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="line-clamp-3 text-sm text-gray-600">
                  {post.excerpt}
                </p>
              )}
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0d61ac]">
                Leia mais &rarr;
              </span>
            </div>
          </article>
        </a>
      </div>
    </section>
  );
}
