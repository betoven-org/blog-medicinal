/**
 * @title Logos
 * @description Linha de logos de parceiros com grayscale opcional
 * @group Marketing
 */

export interface LogoItem {
  name: string;
  /** @format image */
  logo: string;
  url?: string;
}

export interface Props {
  /** @default Parceiros */
  title?: string;
  items: LogoItem[];
  /** @default true */
  grayscale?: boolean;
}

export default function Logos({
  title = "Parceiros",
  items = [],
  grayscale = true,
}: Props) {
  return (
    <section className="w-full py-12 md:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {title && (
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 md:text-3xl">
            {title}
          </h2>
        )}

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {items.map((item, index) => {
            const imgElement = (
              <img
                src={item.logo}
                alt={item.name}
                width={120}
                height={60}
                loading="lazy"
                className={`h-12 w-auto object-contain transition-all duration-300 ${
                  grayscale ? "grayscale hover:grayscale-0" : ""
                }`}
              />
            );

            if (item.url) {
              return (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={item.name}
                >
                  {imgElement}
                </a>
              );
            }

            return (
              <div key={index} title={item.name}>
                {imgElement}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
