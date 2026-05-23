import readingTime from "reading-time";
import { load } from "cheerio";

/**
 * Extrai texto plano de conteudo TipTap JSON ou HTML.
 * O campo content pode ser:
 * - { type: "doc", _html: "..." } (sync do Supabase)
 * - { type: "doc", content: [...] } (TipTap JSON)
 * - string HTML direta
 */
export function extractText(content: unknown): string {
  if (!content) return "";

  if (typeof content === "string") {
    return load(content).text();
  }

  if (typeof content === "object" && content !== null) {
    const obj = content as Record<string, unknown>;
    if (typeof obj._html === "string") {
      return load(obj._html).text();
    }
    // TipTap JSON — serialize text nodes recursively
    return extractTipTapText(obj);
  }

  return "";
}

function extractTipTapText(node: Record<string, unknown>): string {
  if (node.type === "text" && typeof node.text === "string") {
    return node.text;
  }
  if (Array.isArray(node.content)) {
    return node.content.map((child: Record<string, unknown>) => extractTipTapText(child)).join(" ");
  }
  return "";
}

export function getContentStats(content: unknown) {
  const text = extractText(content);
  if (!text.trim()) return { wordCount: 0, readingTimeMinutes: 0 };

  const stats = readingTime(text);
  return {
    wordCount: stats.words,
    readingTimeMinutes: Math.max(1, Math.ceil(stats.minutes)),
  };
}

/**
 * Gera excerpt automatico a partir do conteudo (primeiros ~160 chars de texto plano).
 */
export function autoExcerpt(content: unknown, maxLength = 160): string {
  const text = extractText(content).trim();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
}
