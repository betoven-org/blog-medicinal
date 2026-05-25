/**
 * @title Galeria
 * @description Galeria de imagens em grid responsivo com legendas opcionais
 * @group Conteudo
 */

export interface GalleryItem {
  /** @title Imagem */
  /** @format image */
  image: string;
  /** @title Texto alternativo */
  alt: string;
  /** @title Legenda */
  caption?: string;
}

export interface Props {
  /** @title Titulo */
  title?: string;
  /** @title Itens */
  items: GalleryItem[];
  /** @title Colunas */
  /** @default 3 */
  columns?: number;
  /** @title Espacamento */
  /** @default 2 */
  gap?: number;
}

export default function Gallery({ title, items, columns = 3, gap = 2 }: Props) {
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: `${gap * 0.25}rem`,
  };

  return (
    <section className="w-full">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}

      <div style={gridStyle} className="sm:grid-cols-2 md:grid-cols-none">
        {items.map((item, i) => (
          <figure key={i} className="overflow-hidden rounded-lg">
            <img
              src={item.image}
              alt={item.alt}
              loading="lazy"
              className="w-full h-auto object-cover aspect-square"
              width={400}
              height={400}
            />
            {item.caption && (
              <figcaption className="text-xs text-gray-500 mt-2 text-center">
                {item.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </section>
  );
}
