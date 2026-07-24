import type { JSX } from "react";
import { cms } from "@/lib/cms";

/**
 * @title LP Beneficios
 * @description Grade de beneficios do produto com icones e descricoes
 * @group Landing Page
 */
export interface Props {
  // --- Produto ---

  /** @title Slug do Produto */
  /** @description Preencha para puxar beneficios do produto automaticamente */
  productSlug?: string;

  // --- Conteudo ---

  /** @title Titulo da secao */
  /** @default Por que escolher? */
  title?: string;

  /** @title Subtitulo */
  /** @format textarea */
  subtitle?: string;

  // --- Itens ---

  /** @title Itens de beneficio */
  items?: {
    /** @title Icone */
    /** @options leaf,shield,heart,zap,star,check */
    icon?: "leaf" | "shield" | "heart" | "zap" | "star" | "check";
    /** @title Titulo */
    title: string;
    /** @title Descricao */
    /** @format textarea */
    description: string;
  }[];

  // --- Layout ---

  /** @title Colunas */
  /** @options 2,3,4 */
  /** @default 3 */
  columns?: "2" | "3" | "4";

  /** @title Variante visual */
  /** @options cards,minimal,icons-only */
  /** @default cards */
  variant?: "cards" | "minimal" | "icons-only";
}

const ICONS: Record<string, JSX.Element> = {
  leaf: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
  shield: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  heart: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  zap: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  star: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  check: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

const COLS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

type BenefitItem = {
  icon?: "leaf" | "shield" | "heart" | "zap" | "star" | "check";
  title: string;
  description: string;
};

function parseBenefits(raw: unknown): BenefitItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((b): b is { title: string; description?: string } =>
      typeof b === "object" && b !== null && typeof (b as Record<string, unknown>).title === "string"
    )
    .map((b) => ({
      title: b.title,
      description: typeof b.description === "string" ? b.description : "",
    }));
}

export default async function LpBenefits({
  productSlug,
  title = "Por que escolher?",
  subtitle,
  items,
  columns = "3",
  variant = "cards",
}: Props) {
  const product = productSlug
    ? await cms.products.getBySlug(productSlug)
    : null;

  const p = product as Record<string, unknown> | null;
  const productBenefits: BenefitItem[] = parseBenefits(p?.benefits);

  const resolvedItems: BenefitItem[] =
    items && items.length > 0 ? items : productBenefits;

  if (resolvedItems.length === 0) return null;

  const colsClass = COLS[columns] ?? COLS["3"];

  return (
    <section className="w-full px-4 py-16" aria-labelledby="lp-benefits-heading">
      <style>{`
        @keyframes lp-benefits-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-benefit-item {
          animation: lp-benefits-in 0.5s ease both;
        }
        ${resolvedItems
          .map((_, i) => `.lp-benefit-item:nth-child(${i + 1}) { animation-delay: ${i * 0.08}s; }`)
          .join("\n")}
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2
            id="lp-benefits-heading"
            className="text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`grid grid-cols-1 gap-6 ${colsClass}`}>
          {resolvedItems.map((item, i) => {
            const icon = item.icon ?? "check";
            const IconEl = ICONS[icon] ?? ICONS.check;

            if (variant === "icons-only") {
              return (
                <article
                  key={i}
                  className="lp-benefit-item flex flex-col items-center gap-3 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d61ac]/10 text-[#0d61ac]">
                    {IconEl}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                </article>
              );
            }

            if (variant === "minimal") {
              return (
                <article
                  key={i}
                  className="lp-benefit-item flex items-start gap-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0d61ac]/10 text-[#0d61ac]">
                    {IconEl}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.description}</p>
                  </div>
                </article>
              );
            }

            // cards (default)
            return (
              <article
                key={i}
                className="lp-benefit-item rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0d61ac]/10 text-[#0d61ac]">
                  {IconEl}
                </div>
                <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
