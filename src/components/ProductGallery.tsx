"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

type GalleryImage = { id: number; url: string; alt: string };

type Props = {
  mainImage: string | null;
  mainImageAlt: string;
  gallery: GalleryImage[];
  productName: string;
};

export function ProductGallery({
  mainImage,
  mainImageAlt,
  gallery,
  productName,
}: Props) {
  const allImages: { url: string; alt: string }[] =
    gallery.length > 0
      ? gallery.map((g) => ({ url: g.url, alt: g.alt }))
      : mainImage
        ? [{ url: mainImage, alt: mainImageAlt }]
        : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const active = allImages[activeIndex] ?? null;
  const hasMultiple = allImages.length > 1;
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < allImages.length - 1;

  const goPrev = () => { if (hasPrev) setActiveIndex((i) => i - 1); };
  const goNext = () => { if (hasNext) setActiveIndex((i) => i + 1); };

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbsRef.current) return;
    const el = thumbsRef.current.children[activeIndex] as HTMLElement | undefined;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIndex]);

  // Keyboard nav for zoom
  const handleZoomKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setZoomed(false);
    if (e.key === "ArrowLeft" && activeIndex > 0) setActiveIndex((i) => i - 1);
    if (e.key === "ArrowRight" && activeIndex < allImages.length - 1) setActiveIndex((i) => i + 1);
  }, [activeIndex, allImages.length]);

  useEffect(() => {
    if (zoomed) {
      document.addEventListener("keydown", handleZoomKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleZoomKeyDown);
      document.body.style.overflow = "";
    };
  }, [zoomed, handleZoomKeyDown]);

  if (!active) {
    return (
      <div
        className="flex aspect-square w-full items-center justify-center rounded-lg border border-border bg-muted/10"
        aria-label={`Imagem de ${productName} indisponivel`}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-muted-foreground/30"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Imagem principal */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted/10">
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="relative block size-full cursor-zoom-in"
            aria-label="Ampliar imagem"
          >
            <Image
              src={active.url}
              alt={active.alt || productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />
            <span className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
              <ZoomIn className="size-3.5" aria-hidden="true" />
              Ampliar
            </span>
          </button>

          {/* Setas sempre visiveis */}
          {hasPrev && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900"
              aria-label="Proxima imagem"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          )}

          {/* Counter */}
          {hasMultiple && (
            <span className="absolute bottom-2 right-2 z-10 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
              {activeIndex + 1} / {allImages.length}
            </span>
          )}
        </div>

        {/* Thumbnails */}
        {hasMultiple && (
          <div
            ref={thumbsRef}
            className="flex gap-2 overflow-x-auto scrollbar-none"
            role="list"
            aria-label="Galeria de imagens"
          >
            {allImages.map((img, i) => (
              <button
                key={i}
                type="button"
                role="listitem"
                aria-label={`Ver imagem ${i + 1}`}
                aria-current={i === activeIndex ? "true" : undefined}
                onClick={() => setActiveIndex(i)}
                className={[
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-muted/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  i === activeIndex
                    ? "border-[#0d61ac]"
                    : "border-border hover:border-[#0d61ac]/50",
                ].join(" ")}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} - imagem ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom modal */}
      {zoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          {/* Close */}
          <button
            type="button"
            onClick={() => setZoomed(false)}
            className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Fechar zoom"
          >
            <X className="size-6" aria-hidden="true" />
          </button>

          {/* Counter */}
          {hasMultiple && (
            <span className="absolute left-4 top-4 z-20 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
              {activeIndex + 1} / {allImages.length}
            </span>
          )}

          {/* Prev */}
          {hasPrev && (
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Imagem anterior"
            >
              <ChevronLeft className="size-7" aria-hidden="true" />
            </button>
          )}

          {/* Next */}
          {hasNext && (
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Proxima imagem"
            >
              <ChevronRight className="size-7" aria-hidden="true" />
            </button>
          )}

          {/* Image */}
          <div className="relative h-[85vh] w-[85vw]">
            <Image
              src={allImages[activeIndex].url}
              alt={allImages[activeIndex].alt || productName}
              fill
              sizes="85vw"
              className="object-contain"
            />
          </div>

          {/* Click backdrop to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setZoomed(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
}
