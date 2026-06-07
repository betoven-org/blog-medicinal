import Image from "next/image";

/** Manifest-compatible type alias */
type ImageWidget = string;

/**
 * @title LP Prova Social
 * @description Numeros de destaque e logos de parceiros/certificacoes
 * @group Landing Page
 */
export interface Props {
  /** @title Titulo da secao */
  /** @default Numeros que comprovam */
  title?: string;

  /** @title Stats / Numeros */
  stats?: {
    /** @title Prefixo (ex: +) */
    prefix?: string;
    /** @title Valor (ex: 10.000) */
    value: string;
    /** @title Sufixo (ex: %) */
    suffix?: string;
    /** @title Legenda */
    label: string;
  }[];

  /** @title Exibir logos */
  /** @default false */
  showLogos?: boolean;

  /** @title Logos */
  logos?: {
    /** @title Imagem do logo */
    /** @format image */
    image: ImageWidget;
    /** @title Texto alternativo */
    alt: string;
  }[];
}

export default function LpSocialProof({
  title = "Numeros que comprovam",
  stats,
  showLogos = false,
  logos,
}: Props) {
  const hasStats = stats && stats.length > 0;
  const hasLogos = showLogos && logos && logos.length > 0;

  if (!hasStats && !hasLogos) return null;

  return (
    <section className="w-full bg-[#0d61ac] px-4 py-16" aria-labelledby="lp-socialproof-heading">
      <style>{`
        @keyframes lp-stat-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-stat-item {
          animation: lp-stat-in 0.5s ease both;
        }
        ${(stats ?? [])
          .map((_, i) => `.lp-stat-item:nth-child(${i + 1}) { animation-delay: ${i * 0.1}s; }`)
          .join("\n")}
      `}</style>

      <div className="mx-auto max-w-6xl">
        <h2
          id="lp-socialproof-heading"
          className="mb-12 text-center text-2xl font-bold text-white sm:text-3xl"
        >
          {title}
        </h2>

        {hasStats && (
          <div
            className={`grid grid-cols-2 gap-8 ${
              (stats?.length ?? 0) >= 4
                ? "lg:grid-cols-4"
                : (stats?.length ?? 0) === 3
                ? "lg:grid-cols-3"
                : "lg:grid-cols-2"
            }`}
          >
            {stats!.map((stat, i) => (
              <div
                key={i}
                className="lp-stat-item text-center"
              >
                <p className="text-4xl font-extrabold text-white sm:text-5xl" aria-label={`${stat.prefix ?? ""}${stat.value}${stat.suffix ?? ""}`}>
                  {stat.prefix && (
                    <span className="text-3xl font-bold text-white/80">{stat.prefix}</span>
                  )}
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-3xl font-bold text-white/80">{stat.suffix}</span>
                  )}
                </p>
                <p className="mt-2 text-sm font-medium uppercase tracking-wide text-white/75">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {hasLogos && (
          <div className={`${hasStats ? "mt-14 border-t border-white/20 pt-12" : ""} flex flex-wrap items-center justify-center gap-8`}>
            {logos!.map((logo, i) => (
              <figure key={i} className="group">
                <Image
                  src={logo.image}
                  alt={logo.alt}
                  width={120}
                  height={48}
                  sizes="120px"
                  className="h-10 w-auto object-contain grayscale brightness-0 invert opacity-70 transition-all duration-300 group-hover:grayscale-0 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
