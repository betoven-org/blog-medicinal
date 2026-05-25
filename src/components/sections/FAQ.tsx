"use client";

import { useState } from "react";

/**
 * @title FAQ
 * @description Perguntas frequentes em formato accordion
 * @group Institucional
 */
export interface Props {
  /** @title Titulo */
  title: string;

  /** @title Subtitulo */
  subtitle?: string;

  /** @title Perguntas */
  items: {
    /** @title Pergunta */
    question: string;
    /** @title Resposta */
    /** @format textarea */
    answer: string;
  }[];
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-base font-medium text-gray-900">{question}</span>
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
        <p className="text-sm leading-relaxed text-gray-600">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ({ title, subtitle, items }: Props) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-3 text-lg text-gray-500">{subtitle}</p>}
        </div>
        <div className="divide-y divide-gray-200 border-t border-gray-200">
          {items?.map((item, i) => (
            <FAQItem key={i} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
