"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type LandingPage = {
  title: string;
  slug: string;
};

type Props = {
  categories: Category[];
  landingPages?: LandingPage[];
};

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((w, i) =>
      i > 0 && ["e", "de", "do", "da", "dos", "das"].includes(w)
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
}

export function CategoryMenu({ categories, landingPages = [] }: Props) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <nav aria-label="Categorias de produtos" className="relative">
      {/* Fade + arrow left */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 z-10 flex h-full items-center bg-gradient-to-r from-white via-white/80 to-transparent pr-4">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex size-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-gray-300 hover:text-gray-700"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        className="flex items-center justify-between py-2.5 overflow-x-auto scrollbar-none"
      >
        <Link
          href="/produtos"
          className="shrink-0 rounded-full bg-[#0d61ac] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#0a4f8c]"
        >
          Ver Todos os Produtos
        </Link>
        {categories.map((cat) => {
          const isActive = pathname === `/produtos/${cat.slug}`;
          return (
            <Link
              key={cat.id}
              href={`/produtos/${cat.slug}`}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#0d61ac] text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {toTitleCase(cat.name)}
            </Link>
          );
        })}
        {landingPages.length > 0 && (
          <>
            <span className="mx-1 h-5 w-px shrink-0 bg-gray-200" aria-hidden="true" />
            {landingPages.map((lp) => {
              const isActive = pathname === `/campanhas/${lp.slug}`;
              return (
                <Link
                  key={lp.slug}
                  href={`/campanhas/${lp.slug}`}
                  className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                  }`}
                >
                  {toTitleCase(lp.title)}
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* Fade + arrow right */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 z-10 flex h-full items-center bg-gradient-to-l from-white via-white/80 to-transparent pl-4">
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex size-7 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:border-gray-300 hover:text-gray-700"
            aria-label="Rolar para direita"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </nav>
  );
}
