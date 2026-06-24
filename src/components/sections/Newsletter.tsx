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
  /** @title Mostrar campo nome */
  /** @default false */
  showName?: boolean;
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
  showName = false,
  style = "card",
  backgroundColor,
}: Props) {
  const bgStyle = backgroundColor ? { backgroundColor } : undefined;
  const isDark = backgroundColor && isColorDark(backgroundColor);

  const inputClass = isDark
    ? "px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
    : "px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm";

  const btnClass = isDark
    ? "px-6 py-3 bg-white text-[#0d61ac] rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors whitespace-nowrap"
    : "px-6 py-3 bg-[#0d61ac] text-white rounded-lg font-medium text-sm hover:bg-[#0b5499] transition-colors whitespace-nowrap";

  const form = (
    <form
      className={`flex ${style === "inline" ? "flex-row" : "flex-col sm:flex-row"} gap-3 w-full ${
        style === "fullwidth" ? "max-w-2xl mx-auto" : "max-w-md"
      }`}
    >
      {showName && (
        <input
          type="text"
          placeholder="Seu nome"
          className={`flex-1 ${inputClass}`}
        />
      )}
      <input
        type="email"
        placeholder="seu@email.com"
        required
        className={`flex-1 ${inputClass}`}
      />
      <button type="submit" className={btnClass}>
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
    const textColor = isDark ? "text-white" : "text-gray-900";
    const descColor = isDark ? "text-white/80" : "text-gray-600";
    return (
      <section
        className={`w-full py-10 px-6 bg-gray-50 text-center ${textColor}`}
        style={bgStyle}
      >
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        {description && <p className={`${descColor} mb-6 max-w-lg mx-auto text-sm`}>{description}</p>}
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

function isColorDark(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
