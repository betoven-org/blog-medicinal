/**
 * @title Conteudo Rico
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

function isMarkdown(text: string): boolean {
  return /^#{1,6}\s|^\*\*|^\- |\[.+\]\(.+\)/m.test(text);
}

function mdToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inList = false;

  for (const line of lines) {
    if (line.trim() === "") {
      if (inList) { out.push("</ul>"); inList = false; }
      continue;
    }
    const hm = line.match(/^(#{1,6})\s+(.+)$/);
    if (hm) {
      if (inList) { out.push("</ul>"); inList = false; }
      const l = hm[1].length;
      out.push(`<h${l}>${inline(hm[2])}</h${l}>`);
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push("<hr />");
      continue;
    }
    const lm = line.match(/^[-*]\s+(.+)$/);
    if (lm) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inline(lm[1])}</li>`);
      continue;
    }
    if (inList) { out.push("</ul>"); inList = false; }
    out.push(`<p>${inline(line)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

function inline(t: string): string {
  return t
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
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

  const html = isMarkdown(content) ? mdToHtml(content) : content;

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
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
