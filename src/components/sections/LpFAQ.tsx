"use client";

import { useState } from "react";

/**
 * @title LP FAQ
 * @description Perguntas frequentes com schema markup FAQPage para SEO
 * @group Landing Page
 */
export interface Props {
  // --- Conteudo ---

  /** @title Titulo */
  /** @default Perguntas Frequentes */
  title?: string;

  /** @title Subtitulo */
  /** @format textarea */
  subtitle?: string;

  // --- Itens ---

  /** @title Perguntas e Respostas */
  /** @description Se vazio e productSlug preenchido, usa o FAQ do produto */
  items?: {
    /** @title Pergunta */
    question: string;
    /** @title Resposta */
    /** @format textarea */
    answer: string;
  }[];

  // --- Produto ---

  /** @title Slug do Produto */
  /** @description Preencha para puxar FAQ do produto automaticamente quando Items estiver vazio */
  productSlug?: string;

  // --- Layout ---

  /** @title Largura total */
  /** @default false */
  fullWidth?: boolean;
}

function LpFAQItem({
  question,
  answer,
  index,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const id = `lp-faq-answer-${index}`;

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d61ac] focus-visible:ring-offset-2"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
      >
        <span className="text-base font-semibold text-gray-900">{question}</span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white transition-transform duration-200 ${
            open ? "rotate-180 border-[#0d61ac]/30 bg-[#0d61ac]/5" : ""
          }`}
          aria-hidden="true"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={open ? "#0d61ac" : "#6b7280"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      <div
        id={id}
        role="region"
        aria-labelledby={`lp-faq-btn-${index}`}
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[600px] pb-5" : "max-h-0"
        }`}
      >
        <p className="text-sm leading-relaxed text-gray-600">{answer}</p>
      </div>
    </div>
  );
}

export default function LpFAQ({
  title = "Perguntas Frequentes",
  subtitle,
  items,
  fullWidth = false,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const resolvedItems = items ?? [];

  if (resolvedItems.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: resolvedItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section className="w-full px-4 py-16" aria-labelledby="lp-faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <style>{`
        @keyframes lp-faq-fade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-faq-wrap { animation: lp-faq-fade 0.5s ease both; }
      `}</style>

      <div className={`lp-faq-wrap mx-auto ${fullWidth ? "max-w-7xl" : "max-w-3xl"}`}>
        <div className="mb-10 text-center">
          <h2
            id="lp-faq-heading"
            className="text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg leading-relaxed text-gray-600">{subtitle}</p>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 shadow-sm">
          {resolvedItems.map((item, i) => (
            <LpFAQItem
              key={i}
              index={i}
              question={item.question}
              answer={item.answer}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

