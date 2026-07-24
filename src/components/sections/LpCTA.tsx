/**
 * @title LP CTA
 * @description Secao de chamada para acao focada em conversao
 * @group Landing Page
 */
export interface Props {
  // --- Produto ---

  /** @title Slug do Produto */
  /** @description Opcional — preenchido automaticamente no futuro */
  productSlug?: string;

  // --- Conteudo ---

  /** @title Titulo */
  /** @default Pronto para experimentar? */
  title?: string;

  /** @title Subtitulo */
  /** @format textarea */
  subtitle?: string;

  // --- CTA ---

  /** @title Texto do botao */
  /** @default Falar pelo WhatsApp */
  ctaText?: string;

  /** @title Link do botao */
  /** @format url */
  ctaUrl?: string;

  // --- Aparencia ---

  /** @title Variante visual */
  /** @options default,gradient,dark */
  /** @default default */
  variant?: "default" | "gradient" | "dark";

  /** @title Exibir icone do WhatsApp */
  /** @default true */
  showWhatsAppIcon?: boolean;
}

const VARIANTS = {
  default: {
    section: "bg-[#0d61ac]/5 border-t border-[#0d61ac]/10",
    heading: "text-gray-900",
    sub: "text-gray-600",
    button: "bg-[#0d61ac] text-white shadow-lg shadow-[#0d61ac]/25 hover:bg-[#0b5499] hover:shadow-xl hover:shadow-[#0d61ac]/30",
  },
  gradient: {
    section: "bg-gradient-to-br from-[#0d61ac] to-[#0b4f94]",
    heading: "text-white",
    sub: "text-white/80",
    button: "bg-white text-[#0d61ac] shadow-lg hover:bg-gray-50 hover:shadow-xl",
  },
  dark: {
    section: "bg-gray-900",
    heading: "text-white",
    sub: "text-gray-400",
    button: "bg-[#0d61ac] text-white shadow-lg shadow-[#0d61ac]/30 hover:bg-[#0b5499] hover:shadow-xl",
  },
} as const;

export default function LpCTA({
  title = "Pronto para experimentar?",
  subtitle,
  ctaText = "Falar pelo WhatsApp",
  ctaUrl,
  variant = "default",
  showWhatsAppIcon = true,
}: Props) {
  const v = VARIANTS[variant];

  return (
    <section className={`w-full px-4 py-20 ${v.section}`} aria-labelledby="lp-cta-heading">
      <style>{`
        @keyframes lp-cta-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(13, 97, 172, 0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(13, 97, 172, 0); }
        }
        @keyframes lp-cta-pulse-white {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.3); }
          50%       { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
        }
        .lp-cta-btn {
          animation: ${variant === "default" ? "lp-cta-pulse" : "lp-cta-pulse-white"} 2.5s ease infinite;
        }
        @keyframes lp-cta-fade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-cta-content { animation: lp-cta-fade 0.6s ease both; }
      `}</style>

      <div className="lp-cta-content mx-auto max-w-2xl text-center">
        <h2
          id="lp-cta-heading"
          className={`text-3xl font-bold sm:text-4xl ${v.heading}`}
        >
          {title}
        </h2>

        {subtitle && (
          <p className={`mt-4 text-lg leading-relaxed ${v.sub}`}>{subtitle}</p>
        )}

        {ctaUrl && (
          <div className="mt-10">
            <a
              href={ctaUrl}
              className={`lp-cta-btn inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${v.button} ${
                variant !== "default" ? "focus:ring-white" : "focus:ring-[#0d61ac]"
              }`}
              aria-label={ctaText}
            >
              {showWhatsAppIcon && (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.525 5.847L0 24l6.335-1.499A11.948 11.948 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.879 9.879 0 0 1-5.034-1.376l-.361-.214-3.762.891.952-3.662-.235-.376A9.848 9.848 0 0 1 2.106 12C2.106 6.527 6.527 2.106 12 2.106S21.894 6.527 21.894 12 17.473 21.894 12 21.894z" />
                </svg>
              )}
              {ctaText}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
