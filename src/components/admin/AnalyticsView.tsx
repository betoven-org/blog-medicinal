"use client";

import { useEffect, useState, useCallback } from "react";

type TimeseriesPoint = { key: string; total: number; devices: number };
type RankedItem = { key: string; value: number; deviceValue?: number };
type AnalyticsData = {
  timeseries: TimeseriesPoint[];
  pages: RankedItem[];
  referrers: RankedItem[];
  countries: RankedItem[];
  devices: RankedItem[];
  os: RankedItem[];
  browsers: RankedItem[];
};

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

const s = {
  container: { fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: 1100, margin: "0 auto" } as React.CSSProperties,
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 16,
  } as React.CSSProperties,
  title: { fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 } as React.CSSProperties,
  subtitle: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.06em",
    color: "#9ca3af",
    margin: "0 0 4px",
  } as React.CSSProperties,
  pillRow: { display: "flex", gap: 6 } as React.CSSProperties,
  pill: (active: boolean) =>
    ({
      padding: "5px 14px",
      fontSize: 13,
      fontWeight: 500,
      borderRadius: 6,
      border: "1px solid",
      borderColor: active ? "#0d61ac" : "#d1d5db",
      background: active ? "#0d61ac" : "transparent",
      color: active ? "#fff" : "#374151",
      cursor: "pointer",
      transition: "all 0.15s",
    }) as React.CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 16,
    marginBottom: 24,
  } as React.CSSProperties,
  card: {
    background: "#f9fafb",
    border: "1px solid #f3f4f6",
    borderRadius: 8,
    padding: "16px 20px",
  } as React.CSSProperties,
  cardTitle: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    color: "#6b7280",
    margin: "0 0 12px",
  } as React.CSSProperties,
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #f3f4f6",
  } as React.CSSProperties,
  rowLabel: { fontSize: 14, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: "70%" } as React.CSSProperties,
  rowValue: { fontSize: 14, fontWeight: 600, color: "#374151", fontVariantNumeric: "tabular-nums" } as React.CSSProperties,
  statRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 24 } as React.CSSProperties,
  stat: { background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 8, padding: "14px 18px" } as React.CSSProperties,
  statLabel: { fontSize: 12, fontWeight: 500, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.04em" } as React.CSSProperties,
  statValue: { fontSize: 24, fontWeight: 700, color: "#111827", lineHeight: 1, marginTop: 4, fontVariantNumeric: "tabular-nums" } as React.CSSProperties,
  bar: (pct: number) =>
    ({
      height: 4,
      borderRadius: 2,
      background: "#e5e7eb",
      marginTop: 4,
      position: "relative" as const,
      overflow: "hidden",
    }),
  barFill: (pct: number) =>
    ({
      position: "absolute" as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: `${pct}%`,
      background: "#0d61ac",
      borderRadius: 2,
      transition: "width 0.3s ease",
    }),
  empty: { fontSize: 14, color: "#9ca3af", textAlign: "center" as const, padding: 40 } as React.CSSProperties,
  loading: { fontSize: 14, color: "#9ca3af", padding: 40, textAlign: "center" as const } as React.CSSProperties,
  error: { fontSize: 14, color: "#dc2626", background: "#fef2f2", borderRadius: 8, padding: "12px 16px", marginBottom: 16 } as React.CSSProperties,
};

function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString("pt-BR");
}

function RankedList({ title, items, max = 10 }: { title: string; items: RankedItem[]; max?: number }) {
  const top = items.slice(0, max);
  const highest = top[0]?.value || 1;
  return (
    <div style={s.card}>
      <h3 style={s.cardTitle}>{title}</h3>
      {top.length === 0 ? (
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Sem dados</p>
      ) : (
        top.map((item, i) => (
          <div key={i}>
            <div style={s.row}>
              <span style={s.rowLabel} title={item.key}>{item.key || "(direto)"}</span>
              <span style={s.rowValue}>{fmt(item.value)}</span>
            </div>
            <div style={s.bar(0)}>
              <div style={s.barFill((item.value / highest) * 100)} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const from = new Date(Date.now() - days * 86400000).toISOString();
    const to = new Date().toISOString();
    const base = `/api/analytics?from=${from}&to=${to}`;

    try {
      const endpoints = ["timeseries", "pages", "referrers", "countries", "devices", "os", "browsers"];
      const results = await Promise.all(
        endpoints.map((ep) =>
          fetch(`${base}&endpoint=${ep}`)
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .catch(() => ({ data: [] }))
        )
      );

      setData({
        timeseries: results[0].data || [],
        pages: results[1].data || [],
        referrers: results[2].data || [],
        countries: results[3].data || [],
        devices: results[4].data || [],
        os: results[5].data || [],
        browsers: results[6].data || [],
      });
    } catch {
      setError("Falha ao carregar analytics. Verifique as variaveis de ambiente.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalViews = data?.timeseries.reduce((sum, p) => sum + (p.total || 0), 0) ?? 0;
  const totalVisitors = data?.timeseries.reduce((sum, p) => sum + (p.devices || 0), 0) ?? 0;
  const topPage = data?.pages[0]?.key ?? "-";
  const topCountry = data?.countries[0]?.key ?? "-";

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <p style={s.subtitle}>Analytics</p>
          <h1 style={s.title}>Web Analytics</h1>
        </div>
        <div style={s.pillRow}>
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              style={s.pill(days === p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div style={s.error}>{error}</div>}

      {loading ? (
        <div style={s.loading}>Carregando dados...</div>
      ) : !data ? (
        <div style={s.empty}>
          Nenhum dado disponivel. Configure VERCEL_API_TOKEN,
          VERCEL_PROJECT_ID e VERCEL_TEAM_ID nas variaveis de ambiente.
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div style={s.statRow}>
            <div style={s.stat}>
              <div style={s.statLabel}>Page Views</div>
              <div style={s.statValue}>{fmt(totalViews)}</div>
            </div>
            <div style={s.stat}>
              <div style={s.statLabel}>Visitantes</div>
              <div style={s.statValue}>{fmt(totalVisitors)}</div>
            </div>
            <div style={s.stat}>
              <div style={s.statLabel}>Pagina Top</div>
              <div style={{ ...s.statValue, fontSize: 16, marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={topPage}>
                {topPage}
              </div>
            </div>
            <div style={s.stat}>
              <div style={s.statLabel}>Pais Top</div>
              <div style={{ ...s.statValue, fontSize: 16, marginTop: 6 }}>{topCountry}</div>
            </div>
          </div>

          {/* Detailed panels */}
          <div style={s.grid}>
            <RankedList title="Paginas" items={data.pages} max={15} />
            <RankedList title="Paises" items={data.countries} />
            <RankedList title="Dispositivos" items={data.devices} />
            <RankedList title="Sistemas Operacionais" items={data.os} />
            <RankedList title="Navegadores" items={data.browsers} />
            <RankedList title="Referrers" items={data.referrers} />
          </div>
        </>
      )}
    </div>
  );
}
