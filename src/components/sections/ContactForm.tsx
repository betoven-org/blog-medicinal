"use client";

import { useState } from "react";

/**
 * @title Formulario de Contato
 * @description Formulario com nome, email, telefone, assunto e mensagem
 * @group Institucional
 */
export interface Props {
  /** @title Titulo */
  /** @default Entre em Contato */
  title?: string;

  /** @title Subtitulo */
  subtitle?: string;

  /** @title Email destino */
  email: string;

  /** @title Mostrar campo telefone */
  /** @default true */
  showPhone?: boolean;

  /** @title Mostrar campo assunto */
  /** @default true */
  showSubject?: boolean;

  /** @title Texto do botao */
  /** @default Enviar */
  buttonText?: string;

  /** @title Mensagem de sucesso */
  /** @default Mensagem enviada com sucesso! */
  successMessage?: string;
}

export default function ContactForm({
  title = "Entre em Contato",
  subtitle,
  email,
  showPhone = true,
  showSubject = true,
  buttonText = "Enviar",
  successMessage = "Mensagem enviada com sucesso!",
}: Props) {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const subject = (data.get("subject") as string) || "Contato via site";
    const body = [
      `Nome: ${data.get("name")}`,
      data.get("phone") ? `Telefone: ${data.get("phone")}` : "",
      `\n${data.get("message")}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-3 text-lg text-gray-500">{subtitle}</p>}
        </div>

        {sent ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="cf-name" className="mb-1 block text-sm font-medium text-gray-700">
                Nome *
              </label>
              <input
                id="cf-name"
                name="name"
                type="text"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            <div>
              <label htmlFor="cf-email" className="mb-1 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="cf-email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {showPhone && (
              <div>
                <label htmlFor="cf-phone" className="mb-1 block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  id="cf-phone"
                  name="phone"
                  type="tel"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            )}

            {showSubject && (
              <div>
                <label htmlFor="cf-subject" className="mb-1 block text-sm font-medium text-gray-700">
                  Assunto
                </label>
                <input
                  id="cf-subject"
                  name="subject"
                  type="text"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            )}

            <div>
              <label htmlFor="cf-message" className="mb-1 block text-sm font-medium text-gray-700">
                Mensagem *
              </label>
              <textarea
                id="cf-message"
                name="message"
                required
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-green-700 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800 transition-colors"
            >
              {buttonText}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
