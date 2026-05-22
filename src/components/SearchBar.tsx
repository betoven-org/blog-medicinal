"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Package, FileText } from "lucide-react";

type ProductResult = {
  id: number;
  name: string;
  href: string;
  imageUrl: string | null;
};

type PostResult = {
  id: number;
  title: string;
  href: string;
};

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [posts, setPosts] = useState<PostResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const totalResults = products.length + posts.length;

  // Click outside
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setProducts([]);
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setProducts(json.products ?? []);
      setPosts(json.posts ?? []);
      setActiveIndex(-1);
    } catch {
      setProducts([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), 250);
  };

  const navigate = (href: string) => {
    setQuery("");
    setProducts([]);
    setPosts([]);
    setOpen(false);
    router.push(href);
  };

  const clearSearch = () => {
    setQuery("");
    setProducts([]);
    setPosts([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  // Build flat list for keyboard nav
  const allItems: { href: string }[] = [
    ...products.map((p) => ({ href: p.href })),
    ...posts.map((p) => ({ href: p.href })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || totalResults === 0) {
      if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
      if (e.key === "Enter" && query.trim()) {
        e.preventDefault();
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < totalResults - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : totalResults - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && allItems[activeIndex]) {
        navigate(allItems[activeIndex].href);
      } else if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = open && query.length >= 2;
  let flatIdx = 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder="O que voce esta procurando?"
          autoComplete="off"
          className="w-full rounded-md border bg-card py-2.5 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Limpar busca"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
          {loading && (
            <div className="px-4 py-5 text-center text-sm text-gray-400">Buscando...</div>
          )}

          {!loading && totalResults === 0 && (
            <div className="px-4 py-5 text-center text-sm text-gray-400">
              Nenhum resultado para &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && totalResults > 0 && (
            <div className="max-h-[420px] overflow-y-auto">
              {/* Produtos */}
              {products.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Produtos</span>
                    <span className="text-xs text-gray-400">{products.length} resultados</span>
                  </div>
                  {products.map((product) => {
                    const idx = flatIdx++;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={`p-${product.id}`}
                        type="button"
                        onClick={() => navigate(product.href)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isActive ? "bg-[#0d61ac]/5" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={32}
                              height={32}
                              className="rounded object-contain"
                            />
                          ) : (
                            <Package size={16} className="text-gray-300" aria-hidden="true" />
                          )}
                        </div>
                        <span className={`text-sm leading-snug line-clamp-2 ${isActive ? "text-[#0d61ac] font-medium" : "text-gray-700"}`}>
                          {product.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Posts */}
              {posts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Artigos</span>
                    <span className="text-xs text-gray-400">{posts.length} resultados</span>
                  </div>
                  {posts.map((post) => {
                    const idx = flatIdx++;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={`a-${post.id}`}
                        type="button"
                        onClick={() => navigate(post.href)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          isActive ? "bg-[#0d61ac]/5" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50">
                          <FileText size={16} className="text-gray-400" aria-hidden="true" />
                        </div>
                        <span className={`text-sm leading-snug line-clamp-2 ${isActive ? "text-[#0d61ac] font-medium" : "text-gray-700"}`}>
                          {post.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Ver todos */}
              <div className="border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(query.trim())}`)}
                  className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[#0d61ac] transition-colors hover:bg-gray-50"
                >
                  <Search size={14} aria-hidden="true" />
                  Ver todos os resultados para &ldquo;{query}&rdquo;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
