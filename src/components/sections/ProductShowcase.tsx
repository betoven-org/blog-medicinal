import Image from "next/image";
import { cms } from "@/lib/cms";
import { ProductCarouselWrapper } from "./ProductCarouselWrapper";

/**
 * @title Vitrine de Produtos
 * @description Carrossel de produtos da farmacia
 * @group Home
 */
export interface Props {
  /** @title Titulo da secao */
  /** @default Nossos Produtos */
  title?: string;

  /** @title Modo */
  /** @options all,featured,category,manual */
  /** @default all */
  mode?: "all" | "featured" | "category" | "manual";

  /** @title Slug da categoria */
  /** @description Slug da categoria de produto (modo category) */
  categorySlug?: string;

  /** @title Slugs manuais */
  /** @description Slugs dos produtos separados por virgula (modo manual) */
  manualSlugs?: string;

  /** @title Limite */
  /** @default 12 */
  limit?: number;

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

export default async function ProductShowcase({
  title = "Nossos Produtos",
  mode = "all",
  categorySlug,
  manualSlugs,
  limit = 12,
  viewAllHref = "/produtos",
  showDescription = false,
}: Props) {
  const parsedSlugs = manualSlugs
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const items = await fetchProducts(mode, limit, parsedSlugs, categorySlug);

  if (items.length === 0) return null;

  const cards = items.map((product) => (
    <article
      key={product.id}
      className="w-[260px] shrink-0 snap-start group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-[#0d61ac]/30 hover:shadow-md"
    >
      <a href={`/${product.slug}/p`} className="block">
        <div className="flex items-center justify-center rounded-lg bg-[#f8f9fa] p-4">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.imageAlt ?? product.name}
              width={300}
              height={300}
              sizes="300px"
              className="h-56 w-56 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center text-gray-300" aria-hidden="true">
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
  ));

  return (
    <section aria-labelledby="product-showcase-heading" className="border-t border-gray-200">
      <div className="mx-auto max-w-7xl w-full px-4 py-8">
        <ProductCarouselWrapper title={title} viewAllHref={viewAllHref}>
          {cards}
        </ProductCarouselWrapper>
      </div>
    </section>
  );
}
