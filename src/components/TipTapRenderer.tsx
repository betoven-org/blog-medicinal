import Image from "next/image";

type TipTapNode = {
  type: string;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, any> }[];
  attrs?: Record<string, any>;
};

function renderMarks(text: string, marks?: TipTapNode["marks"]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  return marks.reduce<React.ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{acc}</strong>;
      case "italic":
        return <em>{acc}</em>;
      case "code":
        return <code>{acc}</code>;
      case "link":
        return (
          <a href={mark.attrs?.href} target={mark.attrs?.target || "_blank"} rel="noopener noreferrer">
            {acc}
          </a>
        );
      default:
        return acc;
    }
  }, text);
}

function renderNode(node: TipTapNode, index: number): React.ReactNode {
  switch (node.type) {
    case "text":
      return <span key={index}>{renderMarks(node.text || "", node.marks)}</span>;
    case "paragraph":
      return <p key={index}>{node.content?.map(renderNode)}</p>;
    case "heading": {
      const level = node.attrs?.level || 2;
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      return <Tag key={index}>{node.content?.map(renderNode)}</Tag>;
    }
    case "bulletList":
      return <ul key={index}>{node.content?.map(renderNode)}</ul>;
    case "orderedList":
      return <ol key={index}>{node.content?.map(renderNode)}</ol>;
    case "listItem":
      return <li key={index}>{node.content?.map(renderNode)}</li>;
    case "blockquote":
      return <blockquote key={index}>{node.content?.map(renderNode)}</blockquote>;
    case "codeBlock":
      return (
        <pre key={index}>
          <code>{node.content?.map(renderNode)}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={index} />;
    case "image":
      return (
        <figure key={index}>
          <Image
            src={node.attrs?.src || ""}
            alt={node.attrs?.alt || ""}
            width={800}
            height={450}
            className="rounded-lg"
          />
        </figure>
      );
    case "hardBreak":
      return <br key={index} />;
    default:
      if (node.content) {
        return <div key={index}>{node.content.map(renderNode)}</div>;
      }
      return null;
  }
}

export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Empty line
    if (line.trim() === "") {
      if (inList) { out.push("</ul>"); inList = false; }
      continue;
    }

    // Headers
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (inList) { out.push("</ul>"); inList = false; }
      const level = headingMatch[1].length;
      out.push(`<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(line.trim())) {
      if (inList) { out.push("</ul>"); inList = false; }
      out.push("<hr />");
      continue;
    }

    // Unordered list item
    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      if (!inList) { out.push("<ul>"); inList = true; }
      out.push(`<li>${inlineMarkdown(listMatch[1])}</li>`);
      continue;
    }

    // If we were in a list but this line is not a list item
    if (inList) { out.push("</ul>"); inList = false; }

    // Regular paragraph
    out.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  if (inList) out.push("</ul>");

  return out.join("\n");
}

function inlineMarkdown(text: string): string {
  return text
    // Images (before links)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>");
}

export function TipTapRenderer({ content }: { content: any }) {
  if (!content) return null;

  // Handle raw markdown string (Supabase fallback)
  if (typeof content === "string") {
    const html = markdownToHtml(content);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Handle markdown content from Supabase (_html field)
  if (content._html && typeof content._html === "string") {
    const html = markdownToHtml(content._html);
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Handle TipTap JSON format
  if (!content.content) return null;
  return <>{content.content.map(renderNode)}</>;
}
