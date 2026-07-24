/** Manifest-compatible type aliases */
type ImageWidget = string;
type RichText = string;

/**
 * @title Hero
 * @description Secao principal com imagem de fundo, titulo e CTA
 * @group Conteudo
 */
export interface Props {
  // --- Conteudo ---

  /** @title Titulo */
  title: string;

  /** @title Subtitulo */
  /** @format textarea */
  subtitle?: string;

  /** @title Conteudo */
  /** @format rich-text */
  content?: RichText;

  // --- Layout ---

  /** @title Alinhamento */
  /** @options esquerda,centro,direita */
  align?: "esquerda" | "centro" | "direita";

  // --- Fundo ---

  /** @title Imagem de fundo */
  backgroundImage?: ImageWidget;

  /** @title Cor de fundo */
  /** @format color */
  backgroundColor?: string;

  /** @title Fundo escuro */
  /** @default false */
  dark?: boolean;

  // --- Cores ---

  /** @title Cor do texto */
  /** @format color */
  textColor?: string;

  /** @title Cor do botao */
  /** @format color */
  buttonColor?: string;

  /** @title Cor do texto do botao */
  /** @format color */
  buttonTextColor?: string;

  // --- CTA ---

  /** @title Botao CTA */
  cta?: {
    /** @title Texto do botao */
    label: string;
    /** @title Link */
    href: string;
    /** @title Abrir em nova aba */
    newTab?: boolean;
  };
}

export default function Hero({ title, subtitle, content, backgroundImage, backgroundColor, textColor, buttonColor, buttonTextColor, align = "centro", cta, dark }: Props) {
  const justifyClass = align === "esquerda" ? "justify-start" : align === "direita" ? "justify-end" : "justify-center";
  const textAlign = align === "esquerda" ? "text-left" : align === "direita" ? "text-right" : "text-center";
  const itemsAlign = align === "esquerda" ? "items-start" : align === "direita" ? "items-end" : "items-center";

  const sectionStyle: React.CSSProperties = {};
  if (backgroundImage) {
    sectionStyle.backgroundImage = `url(${backgroundImage})`;
    sectionStyle.backgroundSize = "cover";
    sectionStyle.backgroundPosition = "center";
  } else if (backgroundColor) {
    sectionStyle.backgroundColor = backgroundColor;
  }

  return (
    <section
      className={`relative flex min-h-[400px] items-center ${justifyClass} px-6 py-20 ${!textColor ? (dark || backgroundImage ? "text-white" : "text-gray-900") : ""} ${!backgroundColor && !backgroundImage ? (dark ? "bg-gray-900" : "bg-white") : ""}`}
      style={{ ...sectionStyle, ...(textColor ? { color: textColor } : {}) }}
    >
      {backgroundImage && <div className="absolute inset-0 bg-black/40" />}
      <div className={`relative z-10 mx-auto flex max-w-3xl flex-col ${itemsAlign} ${textAlign}`}>
        <h1 className="text-4xl font-bold lg:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 text-lg opacity-80">{subtitle}</p>}
        {content && <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: content }} />}
        {cta && (
          <a
            href={cta.href}
            target={cta.newTab ? "_blank" : undefined}
            rel={cta.newTab ? "noopener noreferrer" : undefined}
            className={`mt-8 inline-block rounded-lg px-6 py-3 font-semibold ${!buttonColor ? "bg-[#0d61ac] hover:bg-[#0b5499]" : ""} ${!buttonTextColor ? "text-white" : ""}`}
            style={{ ...(buttonColor ? { backgroundColor: buttonColor } : {}), ...(buttonTextColor ? { color: buttonTextColor } : {}) }}
          >
            {cta.label}
          </a>
        )}
      </div>
    </section>
  );
}
