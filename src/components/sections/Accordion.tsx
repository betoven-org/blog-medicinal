"use client";

/**
 * @title Accordion
 * @description Acordeao generico com conteudo rich-text
 * @group Conteudo
 */

import { useState } from "react";

export interface AccordionItem {
  /** @title Titulo */
  title: string;
  /** @title Conteudo */
  /** @format rich-text */
  content: string;
}

export interface Props {
  /** @title Titulo */
  title?: string;
  /** @title Itens */
  items: AccordionItem[];
}

export default function Accordion({ title, items = [] }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-12 md:py-16 bg-white">
      <div className="mx-auto max-w-3xl px-4">
        {title && (
          <h2 className="mb-8 text-2xl font-bold text-gray-900 md:text-3xl">
            {title}
          </h2>
        )}

        <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {items.map((item, index) => (
            <div key={index}>
              <button
                type="button"
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between py-4 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="text-lg font-medium text-gray-900">
                  {item.title}
                </span>
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openIndex === index && (
                <div
                  className="pb-4 prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
