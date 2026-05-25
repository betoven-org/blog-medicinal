/**
 * @title Newsletter
 * @description Formulário de inscrição na newsletter com múltiplos estilos visuais
 * @group Marketing
 */

export interface Props {
  /** @title Titulo */
  /** @default Assine nossa newsletter */
  title?: string;
  /** @title Descricao */
  /** @format textarea */
  description?: string;
  /** @title Texto do botao */
  /** @default Inscrever */
  buttonText?: string;
  /** @title Estilo */
  /** @options inline,card,fullwidth */
  /** @default card */
  style?: "inline" | "card" | "fullwidth";
  /** @title Cor de fundo */
  /** @format color */
  backgroundColor?: string;
}

export default function Newsletter({
  title = "Assine nossa newsletter",
  description,
  buttonText = "Inscrever",
  style = "card",
  backgroundColor,
}: Props) {
  const bgStyle = backgroundColor ? { backgroundColor } : undefined;

  const form = (
    <form
      className={`flex ${style === "inline" ? "flex-row" : "flex-col sm:flex-row"} gap-3 w-full max-w-md ${
        style === "fullwidth" ? "mx-auto" : ""
      }`}
    >
      <input
        type="email"
        placeholder="Seu melhor e-mail"
        required
        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
      >
        {buttonText}
      </button>
    </form>
  );

  if (style === "inline") {
    return (
      <section className="w-full py-4" style={bgStyle}>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-shrink-0">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          {form}
        </div>
      </section>
    );
  }

  if (style === "fullwidth") {
    return (
      <section
        className="w-full py-12 px-6 bg-gray-50 text-center"
        style={bgStyle}
      >
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {description && <p className="text-gray-600 mb-6 max-w-lg mx-auto">{description}</p>}
        {form}
      </section>
    );
  }

  // card (default)
  return (
    <section className="w-full">
      <div
        className="p-8 rounded-xl bg-gray-50 border border-gray-100 text-center max-w-lg mx-auto"
        style={bgStyle}
      >
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        {description && <p className="text-gray-600 mb-6 text-sm">{description}</p>}
        {form}
      </div>
    </section>
  );
}
