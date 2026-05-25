/**
 * @title ImageText
 * @description Imagem de um lado e texto do outro, responsivo
 * @group Conteudo
 */

export interface Props {
  title: string;
  /** @format rich-text */
  text: string;
  /** @format image */
  image: string;
  imageAlt: string;
  /** @options esquerda,direita
   * @default esquerda
   */
  imagePosition?: "esquerda" | "direita";
  /** @options light,dark */
  style?: "light" | "dark";
}

export default function ImageText({
  title,
  text,
  image,
  imageAlt,
  imagePosition = "esquerda",
  style = "light",
}: Props) {
  const bgStyle = style === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

  return (
    <section className={`w-full py-16 md:py-24 ${bgStyle}`}>
      <div
        className={`mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 md:flex-row md:gap-12 ${
          imagePosition === "direita" ? "md:flex-row-reverse" : ""
        }`}
      >
        <div className="w-full md:w-1/2">
          <img
            src={image}
            alt={imageAlt}
            width={600}
            height={400}
            className="w-full rounded-lg object-cover"
            loading="lazy"
          />
        </div>

        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
          <div
            className="mt-4 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </div>
      </div>
    </section>
  );
}
