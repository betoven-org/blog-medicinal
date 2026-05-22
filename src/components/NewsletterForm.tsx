"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error || "Erro ao inscrever.", type: "error" });
        setLoading(false);
        return;
      }

      setMessage({ text: "Inscrito com sucesso!", type: "success" });
      setName("");
      setEmail("");
    } catch {
      setMessage({ text: "Erro de conexao. Tente novamente.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  if (message?.type === "success") {
    return (
      <p className="mt-3 text-sm font-medium text-green-600">
        {message.text}
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          required
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0d61ac] focus:outline-none disabled:opacity-50"
        />
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            disabled={loading}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0d61ac] focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className={`rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>
      {message?.type === "error" && (
        <p className="mt-3 text-sm font-medium text-red-600">
          {message.text}
        </p>
      )}
    </div>
  );
}
