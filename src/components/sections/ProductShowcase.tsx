import { db } from "@brasa/core/db";
import { products, media } from "@brasa/core/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

/**
 * @title Vitrine de Produtos
 * @description Grade de produtos da farmacia
 * @group Home
 */
export interface Props {
  /** @title Titulo da secao */
  /** @default Nossos Produtos */
  title?: string;

  /** @title Modo */
  /** @options all,featured,manual */
  /** @default featured */
  mode?: "all" | "featured" | "manual";

  /** @title Slugs manuais */
  /** @description Slugs dos produtos separados por virgula */
  manualSlugs?: string;

  /** @title Limite */
  /** @default 4 */
  limit?: number;

  /** @title Colunas */
  /** @options 2,3,4 */
  /** @default 4 */
  columns?: "2" | "3" | "4";

  /** @title Link "Ver todos" */
  /** @default /produtos */
  viewAllHref?: string;

  /** @title Mostrar descricao */
  /** @default false */
  showDescription?: boolean;
}

type ProductCard = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
};

const COLUMNS_CLASS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

const publishedFilter = and(
  eq(products.status, "published"),
  eq(products.showOnSite, true),
);

async function fetchProducts(
  mode: NonNullable<Props["mode"]>,
  limit: number,
  parsedSlugs: string[] | undefined,
): Promise<ProductCard[]> {
  const select = {
    id: products.id,
    name: products.name,
    slug: products.slug,
    description: products.description,
    imageUrl: media.url,
    imageAlt: media.alt,
  };

  const base = db
    .select(select)
    .from(products)
    .leftJoin(media, eq(products.imageId, media.id));

  switch (mode) {
    case "all":
      return base
        .where(publishedFilter)
        .orderBy(desc(products.createdAt))
        .limit(limit);

    case "featured":
      return base
        .where(and(publishedFilter, eq(products.featured, true)))
        .orderBy(desc(products.createdAt))
        .limit(limit);

    case "manual": {
      if (!parsedSlugs?.length) return [];
      return base
        .where(and(publishedFilter, inArray(products.slug, parsedSlugs)))
        .limit(limit);
    }

    default:
      return [];
  }
}

interface ProductCardItemProps {
  product: ProductCard;
  showDescription: boolean;
}

function ProductCardItem({ product, showDescription }: ProductCardItemProps) {
  return (
    <article>
      <a href={`/${product.slug}/p`} tabIndex={-1} aria-hidden="true">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.imageAlt ?? product.name}
            width={400}
            height={400}
            className="aspect-square w-full rounded-lg object-cover bg-gray-100"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="aspect-square w-full rounded-lg bg-gray-100"
            aria-hidden="true"
          />
        )}
      </a>

      <div className="flex flex-col">
        <a href={`/${product.slug}/p`}>
          <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-900 hover:text-[#0d61ac]">
            {product.name}
          </h3>
        </a>

        {showDescription && product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {product.description}
          </p>
        )}

        <a
          href={`/${product.slug}/p`}
          className="mt-2 text-xs font-medium text-[#0d61ac] hover:underline"
        >
          Conhecer
        </a>
      </div>
    </article>
  );
}

export default async function ProductShowcase({
  title = "Nossos Produtos",
  mode = "featured",
  manualSlugs,
  limit = 4,
  columns = "4",
  viewAllHref = "/produtos",
  showDescription = false,
}: Props) {
  const parsedSlugs = manualSlugs
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const items = await fetchProducts(mode, limit, parsedSlugs);

  if (items.length === 0) return null;

  const columnsClass = COLUMNS_CLASS[columns] ?? COLUMNS_CLASS["4"];

  return (
    <section
      aria-labelledby="product-showcase-heading"
      className="border-t border-gray-200"
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-[#0d61ac]" aria-hidden="true" />
          <h2
            id="product-showcase-heading"
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
          {items.map((product) => (
            <ProductCardItem
              key={product.id}
              product={product}
              showDescription={showDescription}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
