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

export function TipTapRenderer({ content }: { content: any }) {
  if (!content || !content.content) return null;
  return <>{content.content.map(renderNode)}</>;
}
