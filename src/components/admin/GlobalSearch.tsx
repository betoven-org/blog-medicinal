"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

type SearchResult = {
  type: "post" | "category" | "author" | "product";
  id: number;
  label: string;
  href: string;
  meta?: string;
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  post: {
    label: "Posts",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  category: {
    label: "Categorias",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  author: {
    label: "Autores",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  product: {
    label: "Produtos",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
};

export default function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Cmd+K toggle
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setResults(json.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleValueChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), 250);
  }

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(href);
  }

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-[600px] items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white hover:border-gray-300"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="flex-1 text-left">Buscar posts, categorias, autores, produtos...</span>
        <kbd className="hidden rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs font-medium text-gray-400 sm:inline-block">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>

      {/* Command dialog */}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Busca global"
        className="fixed inset-0 z-50"
        shouldFilter={false}
      >
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

        {/* Panel */}
        <div className="fixed left-1/2 top-[20%] w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          {/* Input */}
          <div className="flex items-center gap-2 border-b border-gray-200 px-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-gray-400" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <Command.Input
              value={query}
              onValueChange={handleValueChange}
              placeholder="Buscar..."
              className="w-full border-0 bg-transparent py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); }}
                className="shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
                aria-label="Limpar"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Results */}
          <Command.List className="max-h-80 overflow-y-auto py-1">
            {loading && (
              <Command.Loading>
                <div className="px-4 py-6 text-center text-sm text-gray-400">Buscando...</div>
              </Command.Loading>
            )}

            <Command.Empty className="px-4 py-6 text-center text-sm text-gray-400">
              {query.length < 2 ? "Digite ao menos 2 caracteres..." : `Nenhum resultado para "${query}"`}
            </Command.Empty>

            {Object.entries(grouped).map(([type, items]) => {
              const config = TYPE_CONFIG[type];
              if (!config) return null;

              return (
                <Command.Group key={type} heading={config.label}>
                  <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {config.label}
                  </div>
                  {items.map((item) => (
                    <Command.Item
                      key={`${item.type}-${item.id}`}
                      value={`${item.type}-${item.id}-${item.label}`}
                      onSelect={() => navigate(item.href)}
                      className="mx-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors data-[selected=true]:bg-[#0d61ac]/5 data-[selected=true]:text-[#0d61ac]"
                    >
                      <span className="shrink-0 opacity-60">{config.icon}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.meta && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          item.meta === "published"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {item.meta === "published" ? "Publicado" : "Rascunho"}
                        </span>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              );
            })}
          </Command.List>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-gray-200 px-4 py-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono">&#8593;&#8595;</kbd>
              navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono">&#9166;</kbd>
              abrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono">esc</kbd>
              fechar
            </span>
          </div>
        </div>
      </Command.Dialog>
    </>
  );
}
