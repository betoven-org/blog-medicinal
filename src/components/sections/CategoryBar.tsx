import { db } from "@brasa/core/db";
import { categories } from "@brasa/core/schema";
import { asc } from "drizzle-orm";

/**
 * @title Barra de Categorias
 * @description Navegacao rapida por categorias
 * @group Home
 */
export interface Props {
  /** @title Titulo */
  /** @default Categorias */
  title?: string;

  /** @title Mostrar todas */
  /** @default true */
  showAll?: boolean;

  /** @title Limite */
  /** @default 10 */
  limit?: number;
}

export default async function CategoryBar({
  showAll = true,
  limit = 10,
}: Props) {
  const rows = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(asc(categories.name))
    .limit(limit);

  if (rows.length === 0) return null;

  return (
    <nav aria-label="Categorias">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
          {showAll && (
            <li>
              <a
                href="/blog"
                className="inline-block px-4 py-2 rounded-full text-sm font-medium transition-colors bg-[#0d61ac] text-white"
              >
                Todos
              </a>
            </li>
          )}
          {rows.map((category) => (
            <li key={category.id}>
              <a
                href={`/categorias/${category.slug}`}
                className="inline-block px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-[#0d61ac] hover:text-white"
              >
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
