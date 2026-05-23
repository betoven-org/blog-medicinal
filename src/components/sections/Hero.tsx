import type { ImageWidget, RichText } from "@brasa/core/manifest";

/**
 * @title Hero
 * @description Secao principal com imagem de fundo, titulo e CTA
 * @group Conteudo
 */
export interface Props {
  /** @title Titulo */
  title: string;

  /** @title Subtitulo */
  /** @format textarea */
  subtitle?: string;

  /** @title Conteudo */
  /** @format rich-text */
  content?: RichText;

  /** @title Imagem de fundo */
  backgroundImage?: ImageWidget;

  /** @title Alinhamento */
  /** @options esquerda,centro,direita */
  align?: "esquerda" | "centro" | "direita";

  /** @title Botao CTA */
  cta?: {
    /** @title Texto do botao */
    label: string;
    /** @title Link */
    href: string;
    /** @title Abrir em nova aba */
    newTab?: boolean;
  };

  /** @title Fundo escuro */
  /** @default false */
  dark?: boolean;
}

export default function Hero({ title, subtitle, content, backgroundImage, align = "centro", cta, dark }: Props) {
  const textAlign = align === "esquerda" ? "text-left" : align === "direita" ? "text-right" : "text-center";

  return (
    <section
      className={`relative flex min-h-[400px] items-center justify-center px-6 py-20 ${dark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/40" />}
      <div className={`relative z-10 mx-auto max-w-3xl ${textAlign}`}>
        <h1 className="text-4xl font-bold lg:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 text-lg opacity-80">{subtitle}</p>}
        {content && <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: content }} />}
        {cta && (
          <a
            href={cta.href}
            target={cta.newTab ? "_blank" : undefined}
            rel={cta.newTab ? "noopener noreferrer" : undefined}
            className="mt-8 inline-block rounded-lg bg-[#0d61ac] px-6 py-3 font-semibold text-white hover:bg-[#0b5499]"
          >
            {cta.label}
          </a>
        )}
      </div>
    </section>
  );
}
