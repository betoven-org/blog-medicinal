"use client";

import { useEffect, useRef, useState } from "react";

function IconChevron({ direction = "right", size = 18 }: { direction?: "left" | "right"; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

type Props = {
  title: string;
  viewAllHref?: string;
  children: React.ReactNode;
};

export function ProductCarouselWrapper({ title, viewAllHref, children }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  function updateScrollButtons() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    const ro = new ResizeObserver(updateScrollButtons);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateScrollButtons); ro.disconnect(); };
  }, []);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("article")?.offsetWidth ?? 220;
    el.scrollBy({ left: dir === "left" ? -cardWidth * 2 : cardWidth * 2, behavior: "smooth" });
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-6 w-1 rounded-full bg-[#0d61ac]" aria-hidden="true" />
        <h2 id="product-showcase-heading" className="text-lg font-bold uppercase tracking-wide text-gray-900">
          {title}
        </h2>
        {viewAllHref && (
          <a href={viewAllHref} className="ml-auto shrink-0 text-sm font-medium text-[#0d61ac] hover:underline">
            Ver todos
          </a>
        )}
        <div className="hidden items-center gap-1 sm:flex">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="rounded-full border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
            aria-label="Anterior"
          >
            <IconChevron direction="left" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="rounded-full border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
            aria-label="Proximo"
          >
            <IconChevron direction="right" />
          </button>
        </div>
      </div>

      {/* Carousel track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
      >
        {children}
      </div>
    </>
  );
}
