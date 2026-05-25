/**
 * @title Divider
 * @description Separador visual entre seções — linha, espaço ou pontos decorativos
 * @group Layout
 */

export interface Props {
  /**
   * @options line,space,dots
   * @default line
   */
  style?: "line" | "space" | "dots";
  /**
   * Espaçamento em rem
   * @default 4
   */
  spacing?: number;
}

export default function Divider({ style = "line", spacing = 4 }: Props) {
  const paddingStyle = { paddingTop: `${spacing / 2}rem`, paddingBottom: `${spacing / 2}rem` };

  if (style === "space") {
    return <div style={{ height: `${spacing}rem` }} aria-hidden="true" />;
  }

  if (style === "dots") {
    return (
      <div style={paddingStyle} className="flex items-center justify-center gap-2" aria-hidden="true">
        <span className="block w-2 h-2 rounded-full bg-gray-300" />
        <span className="block w-2 h-2 rounded-full bg-gray-300" />
        <span className="block w-2 h-2 rounded-full bg-gray-300" />
      </div>
    );
  }

  return (
    <div style={paddingStyle} aria-hidden="true">
      <hr className="border-t border-gray-200" />
    </div>
  );
}
