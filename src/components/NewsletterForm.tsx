"use client";

import { useState, useEffect } from "react";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function sanitizeEmail(value: string) {
  return value.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9.@_%+\-]/g, "");
}

function sanitizeName(value: string) {
  return value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "");
}

export function NewsletterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (message?.type === "success") {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  function handleEmailChange(value: string) {
    const sanitized = sanitizeEmail(value);
    setEmail(sanitized);
    if (emailError && sanitized && EMAIL_REGEX.test(sanitized)) {
      setEmailError("");
    }
  }

  function handleEmailBlur() {
    if (email && !EMAIL_REGEX.test(email)) {
      setEmailError("Informe um e-mail valido");
    } else {
      setEmailError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Informe um e-mail valido");
      return;
    }

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
      setEmailError("");
    } catch {
      setMessage({ text: "Erro de conexao. Tente novamente.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(sanitizeName(e.target.value))}
          placeholder="Seu nome"
          required
          disabled={loading}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#0d61ac] focus:outline-none disabled:opacity-50 sm:flex-1 sm:min-w-[140px]"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={handleEmailBlur}
          placeholder="seu@email.com"
          required
          disabled={loading}
          className={`rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:opacity-50 sm:flex-1 sm:min-w-[180px] ${
            emailError ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-[#0d61ac]"
          }`}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[#0d61ac] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0a4f8c] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
      {emailError && (
        <p className="mt-1 text-xs text-red-500">{emailError}</p>
      )}
      {message && (
        <p className={`mt-2 text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
