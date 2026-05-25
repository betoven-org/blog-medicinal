/**
 * @title Linha do Tempo
 * @description Timeline vertical com anos, titulos e descricoes
 * @group Institucional
 */
export interface Props {
  /** @title Titulo */
  title: string;

  /** @title Subtitulo */
  subtitle?: string;

  /** @title Itens */
  items: {
    /** @title Ano */
    year: string;
    /** @title Titulo */
    title: string;
    /** @title Descricao */
    /** @format textarea */
    description: string;
  }[];
}

export default function Timeline({ title, subtitle, items }: Props) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-3 text-lg text-gray-500">{subtitle}</p>}
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 md:left-1/2 md:-translate-x-px" />

          <div className="space-y-10">
            {items?.map((item, i) => (
              <div key={i} className="relative flex items-start gap-6 md:gap-0">
                {/* Dot */}
                <div className="absolute left-4 top-1.5 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-green-600 bg-white md:left-1/2" />

                {/* Content */}
                <div className="ml-10 md:ml-0 md:w-1/2 md:odd:pr-10 md:odd:text-right md:even:ml-auto md:even:pl-10">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-800">
                    {item.year}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
