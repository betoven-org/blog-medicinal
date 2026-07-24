/**
 * @title Estatisticas
 * @description Numeros grandes em destaque — "500+ Clientes", "10 Anos", etc.
 * @group Institucional
 */
export interface Props {
  // --- Conteudo ---

  /** @title Titulo */
  title?: string;

  // --- Layout ---

  /** @title Colunas */
  /** @default 4 */
  columns?: number;

  /**
   * @title Estilo
   * @options light,dark,brand
   */
  style?: string;

  // --- Itens ---

  /** @title Itens */
  items: {
    /** @title Valor */
    value: string;
    /** @title Label */
    label: string;
    /** @title Sufixo */
    suffix?: string;
  }[];
}

export default function Stats({ title, columns = 4, style = "light", items }: Props) {
  const gridCols =
    columns === 2
      ? "lg:grid-cols-2"
      : columns === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-4";

  const bg =
    style === "dark"
      ? "bg-gray-900 text-white"
      : style === "brand"
        ? "bg-green-700 text-white"
        : "bg-white text-gray-900";

  const labelColor =
    style === "light" ? "text-gray-500" : "text-white/70";

  return (
    <section className={`px-6 py-16 ${bg}`}>
      <div className="mx-auto max-w-6xl">
        {title && (
          <h2 className="mb-10 text-center text-3xl font-bold">{title}</h2>
        )}
        <div className={`grid gap-8 text-center ${gridCols}`}>
          {items?.map((item, i) => (
            <div key={i}>
              <p className="text-4xl font-bold">
                {item.value}
                {item.suffix && <span className="text-2xl">{item.suffix}</span>}
              </p>
              <p className={`mt-2 text-sm font-medium ${labelColor}`}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
