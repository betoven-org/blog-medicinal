"use client";

import { useState } from "react";

type FAQItem = { pergunta: string; resposta: string };

function AccordionItem({ pergunta, resposta }: FAQItem) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-base font-medium text-gray-900">{pergunta}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 pb-5" : "max-h-0"}`}
      >
        <p className="text-sm leading-relaxed text-gray-600">{resposta}</p>
      </div>
    </div>
  );
}

export default function ProductFAQ({
  items,
  productName,
}: {
  items: FAQItem[];
  productName: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.pergunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.resposta,
      },
    })),
  };

  return (
    <section aria-label="Perguntas frequentes" className="mt-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        Perguntas frequentes sobre {productName}
      </h2>
      <div className="divide-y divide-gray-200 border-t border-gray-200">
        {items.map((item, i) => (
          <AccordionItem key={i} {...item} />
        ))}
      </div>
    </section>
  );
}
