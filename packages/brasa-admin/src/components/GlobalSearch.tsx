"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, FolderOpen, User, Package } from "lucide-react";

type SearchResult = {
  type: "post" | "category" | "author" | "product";
  id: number;
  label: string;
  href: string;
  meta?: string;
};

const TYPE_CONFIG = {
  post: { label: "Post", icon: FileText },
  category: { label: "Categoria", icon: FolderOpen },
  author: { label: "Autor", icon: User },
  product: { label: "Produto", icon: Package },
};

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Cmd+K / Ctrl+K focuses input
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Click outside closes dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    if (showResults) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showResults]);

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
      setActiveIndex(0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setShowResults(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), 300);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    inputRef.current?.focus();
  };

  const navigate = (href: string) => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) {
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setShowResults(false);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : results.length - 1));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex].href);
    } else if (e.key === "Escape") {
      setShowResults(false);
      inputRef.current?.blur();
    }
  };

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  let flatIndex = 0;
  const hasDropdown = showResults && query.length >= 2;

  return (
    <div ref={containerRef} className="relative w-full max-w-[600px]">
      {/* Input */}
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (query.length >= 2) setShowResults(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar posts, categorias, autores, produtos..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-20 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0d61ac]/20"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded p-0.5 text-gray-400 hover:text-gray-600"
              aria-label="Limpar busca"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
          <kbd className="hidden rounded border border-gray-200 bg-white px-1.5 py-0.5 text-xs font-medium text-gray-400 sm:inline-block">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </div>
      </div>

      {/* Dropdown */}
      {hasDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="px-4 py-4 text-center text-sm text-gray-400">
                Buscando...
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="px-4 py-4 text-center text-sm text-gray-400">
                Nenhum resultado para &ldquo;{query}&rdquo;
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="py-1">
                {Object.entries(grouped).map(([type, items]) => {
                  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
                  const Icon = config.icon;

                  return (
                    <div key={type}>
                      <div className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {config.label}s
                      </div>
                      {items.map((item) => {
                        const idx = flatIndex++;
                        const isActive = idx === activeIndex;

                        return (
                          <button
                            key={`${item.type}-${item.id}`}
                            type="button"
                            onClick={() => navigate(item.href)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                              isActive
                                ? "bg-[#0d61ac]/5 text-[#0d61ac]"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <Icon className="size-4 flex-shrink-0 opacity-60" aria-hidden="true" />
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.meta && (
                              <span className={`rounded-full px-2 py-0.5 text-xs ${
                                item.meta === "published"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}>
                                {item.meta === "published" ? "Publicado" : "Rascunho"}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
