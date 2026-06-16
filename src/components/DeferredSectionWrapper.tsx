"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { SectionBlock } from "@/lib/cms";

type Props = {
  block: SectionBlock;
  Component: ComponentType<any>;
};

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || process.env.CMS_URL || "";
const API_KEY = process.env.NEXT_PUBLIC_CMS_API_KEY || process.env.CMS_API_KEY || "";

export function DeferredSectionWrapper({ block, Component }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [resolved, setResolved] = useState<SectionBlock | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || resolved || !CMS_URL) return;
    const controller = new AbortController();

    fetch(`${CMS_URL}/api/v1/sections/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": API_KEY },
      body: JSON.stringify({ section: block }),
      signal: controller.signal,
    })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then(setResolved)
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("[Deferred]", block.component, err);
          // Render with original props as fallback
          setResolved(block);
        }
      });

    return () => controller.abort();
  }, [visible, resolved, block]);

  if (!visible) {
    return (
      <div ref={ref} data-section-id={block.id} data-section-type={block.component} data-deferred>
        <div className="min-h-48 animate-pulse bg-muted/30 rounded-lg" />
      </div>
    );
  }

  if (!resolved) {
    return (
      <div ref={ref} data-section-id={block.id} data-section-type={block.component} data-deferred="loading">
        <div className="min-h-48 animate-pulse bg-muted/30 rounded-lg" />
      </div>
    );
  }

  return (
    <section ref={ref} data-section-id={block.id} data-section-type={block.component} data-deferred="resolved">
      <Component {...resolved.props} loaderData={resolved.loaderData} />
    </section>
  );
}
