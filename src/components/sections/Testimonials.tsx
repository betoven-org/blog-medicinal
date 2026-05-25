/** Manifest-compatible type alias */
type ImageWidget = string;

/**
 * @title Depoimentos
 * @description Grid de depoimentos com avatar, nome e texto
 * @group Institucional
 */
export interface Props {
  /** @title Titulo */
  title: string;

  /** @title Subtitulo */
  subtitle?: string;

  /** @title Colunas */
  /** @default 3 */
  columns?: number;

  /** @title Depoimentos */
  items: {
    /** @title Nome */
    name: string;
    /** @title Cargo */
    role: string;
    /** @title Depoimento */
    /** @format textarea */
    text: string;
    /** @title Avatar */
    /** @format image */
    avatar?: ImageWidget;
  }[];
}

export default function Testimonials({ title, subtitle, columns = 3, items }: Props) {
  const gridCols =
    columns === 2 ? "lg:grid-cols-2" : columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <section className="px-6 py-16 bg-gray-50">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-3 text-lg text-gray-500">{subtitle}</p>}
        </div>
        <div className={`grid gap-8 ${gridCols}`}>
          {items?.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <svg
                className="mb-4 h-8 w-8 text-gray-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">{item.text}</p>
              <div className="flex items-center gap-3">
                {item.avatar && (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover"
                    width={40}
                    height={40}
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
