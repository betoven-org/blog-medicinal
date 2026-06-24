import { cms } from "@/lib/cms";

/**
 * @title Posts por Categoria
 * @description Colunas com posts agrupados por categoria
 * @group Home
 */
export interface Props {
  /** @title Numero de categorias */
  /** @default 3 */
  categoryCount?: number;

  /** @title Posts por categoria */
  /** @default 3 */
  postsPerCategory?: number;
}

export default async function CategoryPosts({
  categoryCount = 3,
  postsPerCategory = 3,
}: Props) {
  const categoriesResult = await cms.categories.list();
  const topCategories = categoriesResult.docs.slice(0, categoryCount);

  if (topCategories.length === 0) return null;

  const sections = await Promise.all(
    topCategories.map(async (cat) => {
      const result = await cms.posts.list({
        limit: postsPerCategory,
        category: cat.slug,
      });
      return {
        slug: cat.slug,
        name: cat.name,
        docs: result.docs,
      };
    })
  );

  const filled = sections.filter((s) => s.docs.length > 0);
  if (filled.length === 0) return null;

  const colsClass =
    filled.length === 2
      ? "md:grid-cols-2"
      : filled.length >= 3
        ? "md:grid-cols-3"
        : "";

  return (
    <section className="border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className={`grid gap-8 ${colsClass}`}>
          {filled.map((section) => (
            <div key={section.slug}>
              {/* Category header */}
              <div className="flex items-center justify-between mb-4 border-b-2 border-[#0d61ac] pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                  {section.name}
                </h2>
                <a
                  href={`/categorias/${section.slug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-[#0d61ac] hover:underline"
                >
                  Ver todos
                </a>
              </div>

              {/* Posts list */}
              <div className="space-y-0">
                {section.docs.map((post) => {
                  const date = post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : null;
                  return (
                    <a
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="block py-3 border-b border-gray-100 last:border-0 group"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#0d61ac] transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {[
                          post.author?.name,
                          date,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
