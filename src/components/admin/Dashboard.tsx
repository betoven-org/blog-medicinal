"use client";

import { useEffect, useState } from "react";

type Stats = {
  posts: number;
  categories: number;
  authors: number;
  subscribers: number;
};

const quickLinks = [
  {
    label: "Novo Post",
    href: "/admin/collections/posts/create",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    color: "#0d61ac",
  },
  {
    label: "Todos os Posts",
    href: "/admin/collections/posts",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    color: "#6366f1",
  },
  {
    label: "Midias",
    href: "/admin/collections/media",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    color: "#f59e0b",
  },
  {
    label: "Configuracoes",
    href: "/admin/globals/site-settings",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    color: "#64748b",
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const collections = ["posts", "categories", "authors", "subscribers"];
        const results = await Promise.all(
          collections.map((c) =>
            fetch(`/api/${c}?limit=0&depth=0`)
              .then((r) => r.json())
              .then((d) => d.totalDocs ?? 0)
              .catch(() => 0)
          )
        );
        setStats({
          posts: results[0],
          categories: results[1],
          authors: results[2],
          subscribers: results[3],
        });
      } catch {
        // silently fail
      }
    }
    fetchStats();
  }, []);

  return (
    <div style={{ padding: "40px 24px", maxWidth: 960, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#1f2937",
            margin: "0 0 8px",
          }}
        >
          Bem-vindo ao painel
        </h1>
        <p style={{ fontSize: 15, color: "#6b7280", margin: 0 }}>
          Gerencie posts, categorias, midias e configuracoes do Medicinal na Web.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {[
            { label: "Posts", value: stats.posts, color: "#0d61ac" },
            { label: "Categorias", value: stats.categories, color: "#6366f1" },
            { label: "Autores", value: stats.authors, color: "#f59e0b" },
            { label: "Inscritos", value: stats.subscribers, color: "#10b981" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                {s.label}
              </span>
              <span style={{ fontSize: 32, fontWeight: 700, color: s.color }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div style={{ marginBottom: 16 }}>
        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0 0 16px",
          }}
        >
          Acesso rapido
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 20px",
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                textDecoration: "none",
                color: "#1f2937",
                fontSize: 15,
                fontWeight: 600,
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = link.color;
                e.currentTarget.style.boxShadow = `0 2px 8px ${link.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${link.color}10`,
                  color: link.color,
                  flexShrink: 0,
                }}
              >
                {link.icon}
              </span>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
