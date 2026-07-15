/**
 * @title Imagem e Texto
 * @description Imagem de um lado e texto do outro, responsivo
 * @group Conteudo
 */

export interface Props {
  /** @title Titulo */
  title: string;
  /** @title Texto */
  /** @format rich-text */
  text: string;
  /** @title Cor do texto */
  /** @format color */
  textColor?: string;

  /** @title Imagem */
  /** @format image */
  image?: string;
  /** @title Texto alternativo da imagem */
  imageAlt?: string;
  /** @title Posicao da imagem */
  /** @options esquerda,direita */
  /** @default esquerda */
  imagePosition?: "esquerda" | "direita";

  /** @title Cor de fundo */
  /** @format color */
  backgroundColor?: string;
  /** @title Estilo */
  /** @options light,dark */
  /** @default light */
  style?: "light" | "dark";
}

export default function ImageText({
  title,
  text,
  textColor,
  image,
  imageAlt,
  imagePosition = "esquerda",
  backgroundColor,
  style = "light",
}: Props) {
  const bgStyle = !backgroundColor && !textColor
    ? (style === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900")
    : "";

  return (
    <section
      className={`w-full py-16 md:py-24 ${bgStyle}`}
      style={{ ...(backgroundColor ? { backgroundColor } : {}), ...(textColor ? { color: textColor } : {}) }}
    >
      <div
        className={`mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 ${
          image ? `md:flex-row md:gap-12 ${imagePosition === "direita" ? "md:flex-row-reverse" : ""}` : ""
        }`}
      >
        {image && (
          <div className="w-full md:w-1/2">
            <img
              src={image}
              alt={imageAlt || ""}
              width={600}
              height={400}
              className="w-full rounded-lg object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className={image ? "w-full md:w-1/2" : "w-full"}>
          <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
          <div
            className="mt-4 prose prose-lg max-w-none"
            style={textColor ? { color: textColor } : undefined}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      </div>
    </section>
  );
}
