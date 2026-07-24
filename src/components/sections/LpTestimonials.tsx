import Image from "next/image";

/** Manifest-compatible type alias */
type ImageWidget = string;

/**
 * @title LP Depoimentos
 * @description Grid de depoimentos de clientes com avaliacao por estrelas
 * @group Landing Page
 */
export interface Props {
  // --- Conteudo ---

  /** @title Titulo */
  /** @default O que nossos clientes dizem */
  title?: string;

  /** @title Subtitulo */
  /** @format textarea */
  subtitle?: string;

  // --- Itens ---

  /** @title Depoimentos */
  items: {
    /** @title Nome do cliente */
    name: string;
    /** @title Cargo ou descricao */
    role?: string;
    /** @title Depoimento */
    /** @format textarea */
    text: string;
    /** @title Nota (1 a 5) */
    /** @default 5 */
    rating?: number;
    /** @title Foto do cliente */
    /** @format image */
    avatar?: ImageWidget;
  }[];

  // --- Aparencia ---

  /** @title Variante visual */
  /** @options cards,minimal */
  /** @default cards */
  variant?: "cards" | "minimal";
}

function StarRating({ rating }: { rating: number }) {
  const clamped = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <span
      className="inline-flex gap-0.5"
      aria-label={`${clamped} de 5 estrelas`}
      role="img"
    >
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={i < clamped ? "#f59e0b" : "none"}
          stroke={i < clamped ? "#f59e0b" : "#d1d5db"}
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default function LpTestimonials({
  title = "O que nossos clientes dizem",
  subtitle,
  items,
  variant = "cards",
}: Props) {
  if (!items || items.length === 0) return null;

  const colsClass =
    items.length === 1
      ? "max-w-xl mx-auto"
      : items.length === 2
      ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="w-full bg-gray-50 px-4 py-16" aria-labelledby="lp-testimonials-heading">
      <style>{`
        @keyframes lp-test-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-test-item {
          animation: lp-test-in 0.5s ease both;
        }
        ${items
          .map((_, i) => `.lp-test-item:nth-child(${i + 1}) { animation-delay: ${i * 0.1}s; }`)
          .join("\n")}
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2
            id="lp-testimonials-heading"
            className="text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg leading-relaxed text-gray-600">{subtitle}</p>
          )}
        </div>

        <div className={items.length > 1 ? `grid gap-6 ${colsClass}` : colsClass}>
          {items.map((item, i) => (
            <article
              key={i}
              className={`lp-test-item ${
                variant === "minimal"
                  ? "border-l-4 border-[#0d61ac] pl-5 py-2"
                  : "rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              }`}
            >
              {variant === "cards" && (
                <svg
                  className="mb-4 h-8 w-8 text-[#0d61ac]/20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              )}

              {item.rating !== undefined && item.rating > 0 && (
                <div className="mb-3">
                  <StarRating rating={item.rating} />
                </div>
              )}

              <p className="text-sm leading-relaxed text-gray-700">{item.text}</p>

              <div className="mt-5 flex items-center gap-3">
                {item.avatar ? (
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    width={40}
                    height={40}
                    sizes="40px"
                    className="h-10 w-10 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d61ac]/10 text-sm font-bold text-[#0d61ac]"
                    aria-hidden="true"
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  {item.role && (
                    <p className="text-xs text-gray-500">{item.role}</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
