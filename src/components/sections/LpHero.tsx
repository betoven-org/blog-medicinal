import Image from "next/image";
import { cms } from "@/lib/cms";

/** Manifest-compatible type alias */
type ImageWidget = string;

/**
 * @title LP Hero
 * @description Hero principal da landing page com dados do produto
 * @group Landing Page
 */
export interface Props {
  /** @title Slug do Produto */
  /** @description Preencha para puxar nome e imagem do produto automaticamente */
  productSlug?: string;

  /** @title Titulo Principal */
  /** @description Deixe vazio para usar o nome do produto */
  /** @format text */
  headline?: string;

  /** @title Subtitulo */
  /** @description Deixe vazio para usar a descricao do produto */
  /** @format textarea */
  subheadline?: string;

  /** @title Texto do CTA */
  /** @default Fale com o Farmaceutico */
  ctaText?: string;

  /** @title Link do CTA */
  /** @format url */
  ctaUrl?: string;

  /** @title Imagem de fundo */
  /** @format image */
  backgroundImage?: ImageWidget;

  /** @title Exibir imagem do produto */
  /** @default true */
  showProductImage?: boolean;

  /** @title Layout */
  /** @options image-left,image-right */
  /** @default image-right */
  layout?: "image-left" | "image-right";
}

export default async function LpHero({
  productSlug,
  headline,
  subheadline,
  ctaText = "Fale com o Farmaceutico",
  ctaUrl,
  backgroundImage,
  showProductImage = true,
  layout = "image-right",
}: Props) {
  const product = productSlug
    ? await cms.products.getBySlug(productSlug)
    : null;

  const title = headline || product?.name || "Descubra o poder da natureza";
  const subtitle =
    subheadline || product?.description || undefined;
  const productImage = product?.image?.url ?? null;
  const productImageAlt = product?.image?.alt ?? product?.name ?? title;
  const categoryName = product?.category?.name ?? null;

  const isImageLeft = layout === "image-left";

  return (
    <section
      className="relative w-full overflow-hidden bg-white"
      aria-label={title}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-white/85" />
        </div>
      )}

      <style>{`
        @keyframes lp-fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-slideInLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes lp-slideInRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .lp-anim-text   { animation: lp-fadeInUp 0.6s ease both; }
        .lp-anim-text-2 { animation: lp-fadeInUp 0.6s 0.15s ease both; }
        .lp-anim-text-3 { animation: lp-fadeInUp 0.6s 0.3s ease both; }
        .lp-anim-img-l  { animation: lp-slideInLeft 0.7s 0.1s ease both; }
        .lp-anim-img-r  { animation: lp-slideInRight 0.7s 0.1s ease both; }
      `}</style>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div
          className={`flex flex-col items-center gap-10 md:flex-row md:gap-16 ${
            isImageLeft ? "md:flex-row-reverse" : ""
          }`}
        >
          {/* Text column */}
          <div className="flex-1 text-center md:text-left">
            {categoryName && (
              <span
                className="lp-anim-text mb-4 inline-block rounded-full border border-[#0d61ac]/20 bg-[#0d61ac]/8 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#0d61ac]"
                aria-label={`Categoria: ${categoryName}`}
              >
                {categoryName}
              </span>
            )}

            <h1 className="lp-anim-text-2 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {title}
            </h1>

            {subtitle && (
              <p className="lp-anim-text-3 mt-5 text-lg leading-relaxed text-gray-600">
                {subtitle}
              </p>
            )}

            {ctaUrl && (
              <div className="lp-anim-text-3 mt-8">
                <a
                  href={ctaUrl}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0d61ac] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-[#0d61ac]/25 transition-all hover:bg-[#0b5499] hover:shadow-xl hover:shadow-[#0d61ac]/30 focus:outline-none focus:ring-2 focus:ring-[#0d61ac] focus:ring-offset-2"
                  aria-label={ctaText}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.525 5.847L0 24l6.335-1.499A11.948 11.948 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.879 9.879 0 0 1-5.034-1.376l-.361-.214-3.762.891.952-3.662-.235-.376A9.848 9.848 0 0 1 2.106 12C2.106 6.527 6.527 2.106 12 2.106S21.894 6.527 21.894 12 17.473 21.894 12 21.894z" />
                  </svg>
                  {ctaText}
                </a>
              </div>
            )}
          </div>

          {/* Image column */}
          {showProductImage && productImage && (
            <figure
              className={`flex-shrink-0 ${isImageLeft ? "lp-anim-img-l" : "lp-anim-img-r"}`}
              aria-label={productImageAlt}
            >
              <div className="relative flex h-72 w-72 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0d61ac]/6 to-[#0d61ac]/12 p-6 shadow-xl sm:h-80 sm:w-80 lg:h-96 lg:w-96">
                <Image
                  src={productImage}
                  alt={productImageAlt}
                  width={320}
                  height={320}
                  sizes="(max-width: 640px) 288px, (max-width: 1024px) 320px, 384px"
                  className="h-full w-full object-contain mix-blend-multiply"
                  priority
                />
              </div>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
