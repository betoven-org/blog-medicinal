"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autofocus when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Debounced fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.docs ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 px-4 pt-16 transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar posts"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 256 256"
            fill="currentColor"
            className="shrink-0 text-gray-400"
            aria-hidden="true"
          >
            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar posts..."
            className="w-full bg-transparent text-base text-gray-900 placeholder-gray-400 outline-none"
            aria-label="Termo de busca"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar busca"
            className="shrink-0 p-1 text-gray-400 hover:text-gray-600"
          >
            <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
            </svg>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">Buscando...</p>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              Nenhum resultado encontrado
            </p>
          )}

          {!loading && results.length > 0 && (
            <ul role="list">
              {results.map((post) => (
                <li key={post.id} className="border-b border-gray-100 last:border-0">
                  <Link
                    href={`/posts/${post.slug}`}
                    onClick={onClose}
                    className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {post.category && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                          {post.category}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 line-clamp-1">
                      {post.title}
                    </span>
                    {post.excerpt && (
                      <span className="text-xs text-gray-500 line-clamp-2">
                        {post.excerpt}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!loading && query.length < 2 && (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              Digite ao menos 2 caracteres para buscar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
