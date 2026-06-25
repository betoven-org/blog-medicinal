"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * @title Vitrine Inteligente
 * @description Carrossel de produtos recomendados com base na temperatura e horario do usuario
 * @group Home
 */
export interface Props {
  /** @title Limite de produtos */
  /** @default 8 */
  limit?: number;
}

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
};

type ContextInfo = {
  tag: string;
  title: string;
  subtitle: string;
};

type SmartProductsResponse = {
  products: ProductItem[];
  context: ContextInfo | null;
  temperature: number | null;
};

function IconThermometer({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}

function IconMoon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconSun({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function IconSnowflake({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
    </svg>
  );
}

function IconChevron({ direction = "right", size = 20 }: { direction?: "left" | "right"; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === "left" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
    </svg>
  );
}

const CONTEXT_ICONS: Record<string, React.ReactNode> = {
  frio: <IconSnowflake size={18} />,
  calor: <IconSun size={18} />,
  noite: <IconMoon size={18} />,
  manha: <IconSun size={18} />,
  tarde: <IconSun size={18} />,
};

export default function SmartProductShowcase({ limit = 8 }: Props) {
  const [data, setData] = useState<SmartProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) { reject(new Error("no geolocation")); return; }
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
            maximumAge: 300000,
          });
        });

        const hour = new Date().getHours();
        const url = `/api/smart-products?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}&hour=${hour}&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("fetch failed");
        const json: SmartProductsResponse = await res.json();
        if (!cancelled) setData(json);
      } catch {
        try {
          const hour = new Date().getHours();
          const url = `/api/smart-products?lat=-23.55&lng=-46.63&hour=${hour}&limit=${limit}`;
          const res = await fetch(url);
          if (res.ok) {
            const json: SmartProductsResponse = await res.json();
            if (!cancelled) setData(json);
          }
        } catch { /* silent */ }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [limit]);

  function updateScrollButtons() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !data?.products.length) return;
    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    const ro = new ResizeObserver(updateScrollButtons);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", updateScrollButtons); ro.disconnect(); };
  }, [data]);

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("article")?.offsetWidth ?? 260;
    el.scrollBy({ left: dir === "left" ? -cardWidth * 2 : cardWidth * 2, behavior: "smooth" });
  }

  if (loading || !data?.context || !data.products.length) return null;

  const { context, temperature, products } = data;

  return (
    <section aria-labelledby="smart-products-heading" className="border-t border-gray-200">
      <div className="mx-auto max-w-7xl w-full px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-[#0d61ac]" aria-hidden="true" />
              <span className="text-[#0d61ac]">
                {CONTEXT_ICONS[context.tag] ?? <IconThermometer size={18} />}
              </span>
              <h2 id="smart-products-heading" className="text-lg font-bold uppercase tracking-wide text-gray-900">
                {context.title}
              </h2>
              {temperature !== null && (
                <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {Math.round(temperature)}°C
                </span>
              )}
            </div>
            <p className="ml-10 text-sm text-gray-500 sm:ml-0">{context.subtitle}</p>
          </div>

          {/* Navigation arrows */}
          <div className="hidden items-center gap-1 sm:flex">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className="rounded-full border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
              aria-label="Anterior"
            >
              <IconChevron direction="left" size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className="rounded-full border border-gray-200 p-1.5 text-gray-500 transition-colors hover:border-[#0d61ac] hover:text-[#0d61ac] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
              aria-label="Proximo"
            >
              <IconChevron direction="right" size={18} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
        >
          {products.map((product) => (
            <article
              key={product.id}
              className="w-[260px] shrink-0 snap-start group rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-[#0d61ac]/30 hover:shadow-md"
            >
              <a href={`/${product.slug}/p`} className="block">
                <div className="flex items-center justify-center rounded-lg bg-[#f8f9fa] p-4">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.imageAlt ?? product.name}
                      width={300}
                      height={300}
                      sizes="300px"
                      className="h-56 w-56 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-56 w-56 items-center justify-center text-gray-300" aria-hidden="true">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#0d61ac]">
                  {product.name}
                </h3>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#0d61ac]/5 px-3 py-1.5 text-xs font-semibold text-[#0d61ac] transition-colors group-hover:bg-[#0d61ac] group-hover:text-white">
                  Conhecer
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
