"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Erro ao inscrever.");
        return;
      }

      setStatus("success");
      setMessage(data.message);
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Erro de conexao. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        required
        disabled={status === "loading"}
        className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0d61ac] focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-[#0d61ac] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a4f8c] disabled:opacity-50"
      >
        {status === "loading" ? "Enviando..." : "Enviar"}
      </button>
      {message && (
        <span
          className={`self-center text-xs ${status === "error" ? "text-red-600" : "text-green-600"}`}
        >
          {message}
        </span>
      )}
    </form>
  );
}
