import { cms } from "@/lib/cms";
import LpFAQ, { type Props } from "./LpFAQ";

/**
 * @title LP FAQ (com auto-fetch do produto)
 * @description Perguntas frequentes com schema FAQPage — preenche automaticamente via productSlug
 * @group Landing Page
 */
export { type Props };

export default async function LpFAQLoader(props: Props) {
  let resolvedItems = props.items ?? [];

  if (resolvedItems.length === 0 && props.productSlug) {
    const product = await cms.products.getBySlug(props.productSlug);
    const p = product as Record<string, unknown> | null;
    const rawFaq = p?.faq;

    if (Array.isArray(rawFaq)) {
      resolvedItems = rawFaq
        .filter(
          (f): f is { question: string; answer: string } =>
            typeof f === "object" &&
            f !== null &&
            typeof (f as Record<string, unknown>).question === "string" &&
            typeof (f as Record<string, unknown>).answer === "string",
        )
        .map((f) => ({ question: f.question, answer: f.answer }));
    }
  }

  return <LpFAQ {...props} items={resolvedItems} />;
}
