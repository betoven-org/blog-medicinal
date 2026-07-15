/**
 * @title Chamada para Acao
 * @description Banner de chamada para acao com titulo, descricao e botao
 * @group Marketing
 */

export interface Props {
  /** @title Titulo */
  title: string;
  /** @title Descricao */
  /** @format textarea */
  description?: string;
  /** @title Cor do texto */
  /** @format color */
  textColor?: string;

  /** @title Imagem de fundo */
  /** @format image */
  backgroundImage?: string;
  /** @title Cor de fundo */
  /** @format color */
  backgroundColor?: string;
  /** @title Estilo */
  /** @options light,dark,brand */
  /** @default dark */
  style?: "light" | "dark" | "brand";

  /** @title Texto do botao */
  /** @default Saiba mais */
  buttonText?: string;
  /** @title Link do botao */
  /** @format url */
  buttonHref: string;
  /** @title Abrir em nova aba */
  /** @default false */
  buttonNewTab?: boolean;
  /** @title Cor do botao */
  /** @format color */
  buttonColor?: string;
  /** @title Cor do texto do botao */
  /** @format color */
  buttonTextColor?: string;
}

export default function CTA(props: Props & { buttonUrl?: string; subtitle?: string; variant?: string }) {
  const {
    title,
    buttonText = "Saiba mais",
    buttonNewTab = false,
    backgroundImage,
    backgroundColor,
    textColor,
    buttonColor,
    buttonTextColor,
  } = props;
  const description = props.description || props.subtitle;
  const buttonHref = props.buttonHref || props.buttonUrl || "#";
  const style = props.style || (props.variant as Props["style"]) || "dark";
  const bgStyles: Record<string, string> = {
    light: "bg-gray-100 text-gray-900",
    dark: "bg-gray-900 text-white",
    brand: "bg-blue-600 text-white",
  };

  const buttonStyles: Record<string, string> = {
    light: "bg-gray-900 text-white hover:bg-gray-800",
    dark: "bg-white text-gray-900 hover:bg-gray-100",
    brand: "bg-white text-blue-600 hover:bg-gray-100",
  };

  return (
    <section
      className={`relative w-full py-16 md:py-24 ${!backgroundColor && !textColor ? bgStyles[style] : ""}`}
      style={{ ...(backgroundColor ? { backgroundColor } : {}), ...(textColor ? { color: textColor } : {}) }}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-3 text-base opacity-80">{description}</p>
        )}

        <a
          href={buttonHref}
          target={buttonNewTab ? "_blank" : undefined}
          rel={buttonNewTab ? "noopener noreferrer" : undefined}
          className={`mt-6 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors ${!buttonColor ? "bg-[#0d61ac] hover:bg-[#0a4f90]" : ""} ${!buttonTextColor ? "text-white" : ""}`}
          style={{ ...(buttonColor ? { backgroundColor: buttonColor } : {}), ...(buttonTextColor ? { color: buttonTextColor } : {}) }}
        >
          {buttonText}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </a>
      </div>
    </section>
  );
}
