import Image from "next/image";
import { getPostsByMode } from "@/lib/loaders";
import type { PostMode, PostCard } from "@/lib/loaders";

/**
 * @title Grade + Lista Lateral
 * @description Posts em grid (2/3) com lista numerada lateral (1/3)
 * @group Home
 */
export interface Props {
  /** @title Titulo do grid */
  gridTitle: string;

  /** @title Modo do grid */
  /** @options recent,trending,popular,editor-picks,manual */
  /** @default recent */
  gridMode?: "recent" | "trending" | "popular" | "editor-picks" | "manual";

  /** @title Slugs manuais (grid) */
  /** @description Slugs separados por virgula */
  gridManualSlugs?: string;

  /** @title Limite do grid */
  /** @default 4 */
  gridLimit?: number;

  /** @title Colunas do grid */
  /** @default 2 */
  gridColumns?: number;

  /** @title Mostrar categoria no grid */
  /** @default true */
  gridShowCategory?: boolean;

  /** @title Titulo da lista */
  sidebarTitle: string;

  /** @title Modo da lista */
  /** @options recent,trending,popular,editor-picks,manual */
  /** @default trending */
  sidebarMode?: "recent" | "trending" | "popular" | "editor-picks" | "manual";

  /** @title Slugs manuais (lista) */
  /** @description Slugs separados por virgula */
  sidebarManualSlugs?: string;

  /** @title Limite da lista */
  /** @default 5 */
  sidebarLimit?: number;

  /** @title Link "Ver todos" do grid */
  gridViewAllHref?: string;
}

export default async function PostGridWithSidebar({
  gridTitle,
  gridMode = "recent",
  gridManualSlugs,
  gridLimit = 4,
  gridColumns = 2,
  gridShowCategory = true,
  sidebarTitle,
  sidebarMode = "trending",
  sidebarManualSlugs,
  sidebarLimit = 5,
  gridViewAllHref,
}: Props) {
  const gridSlugs = gridManualSlugs?.split(",").map((s) => s.trim()).filter(Boolean);
  const sidebarSlugs = sidebarManualSlugs?.split(",").map((s) => s.trim()).filter(Boolean);

  const [gridPosts, sidebarPosts] = await Promise.all([
    getPostsByMode(gridMode as PostMode, gridLimit, gridSlugs),
    getPostsByMode(sidebarMode as PostMode, sidebarLimit, sidebarSlugs),
  ]);

  if (gridPosts.length === 0 && sidebarPosts.length === 0) return null;

  const colsClass = gridColumns === 1 ? "" : "sm:grid-cols-2";

  return (
    <section className="border-t border-gray-200">
      <div className="mx-auto max-w-7xl w-full px-4 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* ── Grid (2/3) ────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-[#0d61ac]" />
              <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">
                {gridTitle}
              </h2>
              {gridViewAllHref && (
                <a
                  href={gridViewAllHref}
                  className="ml-auto text-sm font-medium text-[#0d61ac] hover:underline"
                >
                  Ver todos
                </a>
              )}
            </div>

            <div className={`grid grid-cols-1 gap-4 ${colsClass}`}>
              {gridPosts.map((post) => (
                <GridCard key={post.id} post={post} showCategory={gridShowCategory} />
              ))}
            </div>
          </div>

          {/* ── Sidebar lista (1/3) ───────────────────────────── */}
          <aside className="mt-8 lg:mt-0">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-[#0d61ac]" />
              <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">
                {sidebarTitle}
              </h2>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <ol role="list">
                {sidebarPosts.map((post, i) => (
                  <li
                    key={post.id}
                    className={`flex gap-4 py-3 ${i < sidebarPosts.length - 1 ? "border-b border-gray-100" : ""}`}
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-xl font-bold text-[#0d61ac]/20">
                      {i + 1}
                    </span>
                    <a href={`/posts/${post.slug}`} className="group min-w-0 flex-1">
                      {post.categoryName && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#0d61ac]">
                          {post.categoryName}
                        </p>
                      )}
                      <h3 className="mt-0.5 text-sm font-semibold leading-snug text-gray-900 line-clamp-2 transition-colors group-hover:text-[#0d61ac]">
                        {post.title}
                      </h3>
                      {post.readingTimeMinutes != null && (
                        <p className="mt-1 text-xs text-gray-500">
                          {post.readingTimeMinutes} min
                        </p>
                      )}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ── Grid Card ────────────────────────────────────────────────────────── */

function GridCard({ post, showCategory }: { post: PostCard; showCategory: boolean }) {
  const imageUrl = post.heroImageUrl ?? post.coverUrl;

  return (
    <article>
      <a href={`/posts/${post.slug}`} className="group block">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={post.title}
            width={640}
            height={400}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 320px, 380px"
            className="aspect-[16/10] w-full rounded-lg object-cover"
            loading="lazy"
          />
        ) : (
          <div className="aspect-[16/10] w-full rounded-lg bg-gray-100" />
        )}
        {showCategory && post.categoryName && (
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#0d61ac]">
            {post.categoryName}
          </p>
        )}
        <h3 className="mt-1 text-base font-semibold text-gray-900 line-clamp-2 transition-colors group-hover:text-[#0d61ac]">
          {post.title}
        </h3>
        <p className="mt-1.5 text-xs text-gray-500">
          {[
            post.authorName,
            post.readingTimeMinutes ? `${post.readingTimeMinutes} min` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </a>
    </article>
  );
}
