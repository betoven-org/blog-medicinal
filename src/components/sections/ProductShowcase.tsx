import Image from "next/image";
import { cms } from "@/lib/cms";

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
  /** @options all,featured,category,manual */
  /** @default featured */
  mode?: "all" | "featured" | "category" | "manual";

  /** @title Slug da categoria */
  /** @description Slug da categoria de produto (modo category) */
  categorySlug?: string;

  /** @title Slugs manuais */
  /** @description Slugs dos produtos separados por virgula (modo manual) */
  manualSlugs?: string;

  /** @title Limite */
  /** @default 4 */
  limit?: number;

  /** @title Colunas */
  /** @default 4 */
  columns?: number;

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

const COLUMNS_CLASS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

async function fetchProducts(
  mode: NonNullable<Props["mode"]>,
  limit: number,
  parsedSlugs: string[] | undefined,
  categorySlug: string | undefined,
): Promise<ProductCard[]> {
  switch (mode) {
    case "featured": {
      const result = await cms.products.list({ limit, featured: true });
      return result.docs.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        imageUrl: p.image?.url ?? null,
        imageAlt: p.image?.alt ?? null,
      }));
    }

    case "all": {
      const result = await cms.products.list({ limit });
      return result.docs.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        imageUrl: p.image?.url ?? null,
        imageAlt: p.image?.alt ?? null,
      }));
    }

    case "category": {
      if (!categorySlug) return [];
      // Get category ID first
      const categories = await cms.productCategories.list();
      const cat = categories.docs.find((c) => c.slug === categorySlug);
      if (!cat) return [];
      const result = await cms.products.list({ limit, category: cat.id });
      return result.docs.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        imageUrl: p.image?.url ?? null,
        imageAlt: p.image?.alt ?? null,
      }));
    }

    case "manual": {
      if (!parsedSlugs?.length) return [];
      // Fetch all and filter by slugs
      const result = await cms.products.list({ limit: 50 });
      const slugSet = new Set(parsedSlugs);
      return result.docs
        .filter((p) => slugSet.has(p.slug))
        .slice(0, limit)
        .map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          imageUrl: p.image?.url ?? null,
          imageAlt: p.image?.alt ?? null,
        }));
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
    <article className="group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-[#0d61ac]/30 hover:shadow-md">
      <a href={`/${product.slug}/p`} className="block">
        <div className="flex items-center justify-center rounded-lg bg-[#f8f9fa] p-4">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              width={160}
              height={160}
              sizes="160px"
              className="h-40 w-40 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center text-gray-300" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#0d61ac]">
          {product.name}
        </h3>

        {showDescription && product.description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {product.description}
          </p>
        )}

        <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0d61ac]/5 px-3 py-1.5 text-xs font-semibold text-[#0d61ac] transition-colors group-hover:bg-[#0d61ac] group-hover:text-white">
          Conhecer
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </a>
    </article>
  );
}

export default async function ProductShowcase({
  title = "Nossos Produtos",
  mode = "featured",
  categorySlug,
  manualSlugs,
  limit = 4,
  columns = 4,
  viewAllHref = "/produtos",
  showDescription = false,
}: Props) {
  const parsedSlugs = manualSlugs
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const items = await fetchProducts(mode, limit, parsedSlugs, categorySlug);

  if (items.length === 0) return null;

  const columnsClass = COLUMNS_CLASS[columns] ?? COLUMNS_CLASS[4];

  return (
    <section
      aria-labelledby="product-showcase-heading"
      className="border-t border-gray-200"
    >
      <div className="mx-auto max-w-7xl w-full px-4 py-8">
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
