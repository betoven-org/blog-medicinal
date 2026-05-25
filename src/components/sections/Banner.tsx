/** Manifest-compatible type aliases */
type ImageWidget = string;
type Color = string;

/**
 * @title Banner
 * @description Banner promocional com imagem e texto
 * @group Marketing
 */
export interface Props {
  /** @title Imagem */
  image: ImageWidget;

  /** @title Alt da imagem */
  alt: string;

  /** @title Titulo */
  title?: string;

  /** @title Descricao */
  /** @format textarea */
  description?: string;

  /** @title Cor de fundo */
  /** @format color */
  backgroundColor?: Color;

  /** @title Link */
  href?: string;

  /** @title Altura */
  /** @options pequeno,medio,grande */
  /** @default medio */
  height?: "pequeno" | "medio" | "grande";
}

export default function Banner({ image, alt, title, description, backgroundColor, href, height = "medio" }: Props) {
  const heightClass = height === "pequeno" ? "h-48" : height === "grande" ? "h-96" : "h-64";

  const content = (
    <div
      className={`relative flex ${heightClass} items-center justify-center overflow-hidden rounded-xl`}
      style={{ backgroundColor: backgroundColor || undefined }}
    >
      <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover" width={1200} height={400} />
      {(title || description) && (
        <div className="relative z-10 text-center text-white">
          {title && <h2 className="text-3xl font-bold drop-shadow-lg">{title}</h2>}
          {description && <p className="mt-2 text-lg drop-shadow-lg">{description}</p>}
        </div>
      )}
    </div>
  );

  if (href) {
    return <a href={href} className="block px-6 py-8">{content}</a>;
  }
  return <section className="px-6 py-8">{content}</section>;
}
