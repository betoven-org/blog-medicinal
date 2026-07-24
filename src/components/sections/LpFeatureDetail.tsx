import Image from "next/image";

/** Manifest-compatible type aliases */
type ImageWidget = string;
type RichText = string;

/**
 * @title LP Detalhe de Feature
 * @description Secao com imagem e texto lado a lado, layout alternavel
 * @group Landing Page
 */
export interface Props {
  // --- Conteudo ---

  /** @title Titulo */
  title: string;

  /** @title Descricao */
  /** @format rich-text */
  description?: RichText;

  // --- Imagem ---

  /** @title Imagem */
  /** @format image */
  image?: ImageWidget;

  /** @title Texto alternativo da imagem */
  imageAlt?: string;

  // --- Layout ---

  /** @title Layout */
  /** @options image-left,image-right */
  /** @default image-left */
  layout?: "image-left" | "image-right";

  // --- Badge ---

  /** @title Exibir badge */
  /** @default false */
  showBadge?: boolean;

  /** @title Texto do badge */
  badgeText?: string;
}

export default function LpFeatureDetail({
  title,
  description,
  image,
  imageAlt,
  layout = "image-left",
  showBadge = false,
  badgeText,
}: Props) {
  const isImageLeft = layout === "image-left";

  return (
    <section className="w-full overflow-hidden px-4 py-16 md:py-24" aria-labelledby="lp-feature-heading">
      <style>{`
        @keyframes lp-feature-slide-l {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes lp-feature-slide-r {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes lp-feature-fade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-feature-img-l { animation: lp-feature-slide-l 0.65s ease both; }
        .lp-feature-img-r { animation: lp-feature-slide-r 0.65s ease both; }
        .lp-feature-text  { animation: lp-feature-fade 0.65s 0.15s ease both; }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <div
          className={`flex flex-col items-center gap-10 md:flex-row md:gap-16 ${
            isImageLeft ? "" : "md:flex-row-reverse"
          }`}
        >
          {/* Image column */}
          {image && (
            <figure
              className={`w-full md:w-1/2 ${isImageLeft ? "lp-feature-img-l" : "lp-feature-img-r"}`}
            >
              <div className="overflow-hidden rounded-2xl bg-gray-50 shadow-lg">
                <Image
                  src={image}
                  alt={imageAlt ?? title}
                  width={640}
                  height={480}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="h-auto w-full object-cover"
                  loading="lazy"
                />
              </div>
            </figure>
          )}

          {/* Text column */}
          <div className="lp-feature-text w-full md:w-1/2">
            {showBadge && badgeText && (
              <span className="mb-4 inline-block rounded-full border border-[#0d61ac]/20 bg-[#0d61ac]/8 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#0d61ac]">
                {badgeText}
              </span>
            )}

            <h2
              id="lp-feature-heading"
              className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl"
            >
              {title}
            </h2>

            {description && (
              <div
                className="prose prose-lg mt-5 max-w-none text-gray-600 prose-headings:text-gray-900 prose-a:text-[#0d61ac] prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
