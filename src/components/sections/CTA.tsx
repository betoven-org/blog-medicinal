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
  /** @title Texto do botao */
  /** @default Saiba mais */
  buttonText?: string;
  /** @title Link do botao */
  /** @format url */
  buttonHref: string;
  /** @title Abrir em nova aba */
  /** @default false */
  buttonNewTab?: boolean;
  /** @title Imagem de fundo */
  /** @format image */
  backgroundImage?: string;
  /** @title Estilo */
  /** @options light,dark,brand */
  /** @default dark */
  style?: "light" | "dark" | "brand";
}

export default function CTA({
  title,
  description,
  buttonText = "Saiba mais",
  buttonHref,
  buttonNewTab = false,
  backgroundImage,
  style = "dark",
}: Props) {
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
      className={`relative w-full py-16 md:py-24 ${bgStyles[style]}`}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl">
          {title}
        </h2>

        {description && (
          <p className="mt-4 text-lg opacity-90 md:text-xl">{description}</p>
        )}

        <a
          href={buttonHref}
          target={buttonNewTab ? "_blank" : undefined}
          rel={buttonNewTab ? "noopener noreferrer" : undefined}
          className={`mt-8 inline-block rounded-lg px-8 py-3 font-semibold transition-colors ${buttonStyles[style]}`}
        >
          {buttonText}
        </a>
      </div>
    </section>
  );
}
