/**
 * @title RichContent
 * @description Bloco de conteudo rich-text centralizado com largura configuravel
 * @group Conteudo
 */

export interface Props {
  /** @title Titulo */
  title?: string;
  /** @title Conteudo */
  /** @format rich-text */
  content: string;
  /** @title Largura maxima */
  /** @options narrow,medium,wide */
  /** @default medium */
  maxWidth?: "narrow" | "medium" | "wide";
}

export default function RichContent({
  title,
  content,
  maxWidth = "medium",
}: Props) {
  const widthClasses: Record<string, string> = {
    narrow: "max-w-2xl",
    medium: "max-w-4xl",
    wide: "max-w-6xl",
  };

  return (
    <section className="w-full py-12 md:py-16 bg-white">
      <div className={`mx-auto px-4 ${widthClasses[maxWidth]}`}>
        {title && (
          <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl">
            {title}
          </h2>
        )}

        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-lg"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}
