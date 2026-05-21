"use client";

import { useEffect, useState } from "react";

type Stats = {
  posts: number;
  published: number;
  drafts: number;
  categories: number;
  subscribers: number;
  media: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [postsAll, postsPub, postsDraft, cats, subs, media] =
          await Promise.all([
            fetch("/api/posts?limit=0&depth=0").then((r) => r.json()),
            fetch("/api/posts?limit=0&depth=0&where[status][equals]=published").then((r) => r.json()),
            fetch("/api/posts?limit=0&depth=0&where[status][equals]=draft").then((r) => r.json()),
            fetch("/api/categories?limit=0&depth=0").then((r) => r.json()),
            fetch("/api/subscribers?limit=0&depth=0").then((r) => r.json()),
            fetch("/api/media?limit=0&depth=0").then((r) => r.json()),
          ]);
        setStats({
          posts: postsAll.totalDocs ?? 0,
          published: postsPub.totalDocs ?? 0,
          drafts: postsDraft.totalDocs ?? 0,
          categories: cats.totalDocs ?? 0,
          subscribers: subs.totalDocs ?? 0,
          media: media.totalDocs ?? 0,
        });
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = stats
    ? [
        { label: "Total de Posts", value: stats.posts, href: "/admin/collections/posts" },
        { label: "Publicados", value: stats.published, href: "/admin/collections/posts" },
        { label: "Rascunhos", value: stats.drafts, href: "/admin/collections/posts" },
        { label: "Categorias", value: stats.categories, href: "/admin/collections/categories" },
        { label: "Inscritos", value: stats.subscribers, href: "/admin/collections/subscribers" },
        { label: "Arquivos", value: stats.media, href: "/admin/collections/media" },
      ]
    : [];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: 28,
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 20,
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#9ca3af",
            margin: "0 0 6px",
          }}
        >
          Dashboard
        </p>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#111827",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          Visao geral
        </h1>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: "#f9fafb",
                  borderRadius: 8,
                  padding: "18px 20px",
                  height: 88,
                }}
              />
            ))
          : cards.map((card) => (
              <a
                key={card.label}
                href={card.href}
                style={{
                  display: "block",
                  background: "#f9fafb",
                  border: "1px solid #f3f4f6",
                  borderRadius: 8,
                  padding: "18px 20px",
                  textDecoration: "none",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#d1d5db";
                  e.currentTarget.style.background = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#f3f4f6";
                  e.currentTarget.style.background = "#f9fafb";
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: 6,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#111827",
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {card.value}
                </div>
              </a>
            ))}
      </div>
    </div>
  );
}
