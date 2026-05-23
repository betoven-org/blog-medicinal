import type { ImageWidget } from "@brasa/core/manifest";

/**
 * @title Destaques
 * @description Grid de features com icone, titulo e descricao
 * @group Conteudo
 */
export interface Props {
  /** @title Titulo da secao */
  title: string;

  /** @title Subtitulo */
  subtitle?: string;

  /** @title Colunas */
  /** @options 2,3,4 */
  /** @default 3 */
  columns?: "2" | "3" | "4";

  /** @title Itens */
  items: {
    /** @title Icone */
    icon?: ImageWidget;
    /** @title Titulo */
    title: string;
    /** @title Descricao */
    /** @format textarea */
    description: string;
  }[];
}

export default function Features({ title, subtitle, columns = "3", items }: Props) {
  const gridCols = columns === "2" ? "lg:grid-cols-2" : columns === "4" ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-3 text-lg text-gray-500">{subtitle}</p>}
        </div>
        <div className={`grid gap-8 ${gridCols}`}>
          {items?.map((item, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-6 text-center">
              {item.icon && <img src={item.icon} alt="" className="mx-auto mb-4 h-12 w-12" width={48} height={48} />}
              <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
