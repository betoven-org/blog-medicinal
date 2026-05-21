"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

/* ── Types ────────────────────────────────────────────────────────────────────── */

type StatCard = {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  href: string;
};

type AnalyticsOverview = {
  totalViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  topPage: string;
  topCountry: string;
};

type TimeseriesPoint = {
  date: string;
  views: number;
};

type RankedItem = {
  name: string;
  count: number;
};

type AnalyticsData = {
  overview: AnalyticsOverview | null;
  timeseries: TimeseriesPoint[];
  topPages: RankedItem[];
  topCountries: RankedItem[];
  topReferrers: RankedItem[];
};

/* ── Helpers ──────────────────────────────────────────────────────────────────── */

function getDateRange(days: number) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

async function fetchCount(url: string): Promise<number> {
  try {
    const res = await fetch(url);
    if (!res.ok) return 0;
    const json = await res.json();
    return json.totalDocs ?? json.docs?.length ?? 0;
  } catch {
    return 0;
  }
}

/* ── Skeleton ─────────────────────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 h-10 w-10 rounded-lg bg-gray-100" />
      <div className="mb-2 h-8 w-16 rounded bg-gray-100" />
      <div className="h-4 w-24 rounded bg-gray-100" />
    </div>
  );
}

function SkeletonBar() {
  return (
    <div className="flex items-end gap-1">
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 animate-pulse rounded-t bg-gray-100"
          style={{ height: `${20 + Math.random() * 60}%` }}
        />
      ))}
    </div>
  );
}

/* ── SVG Icons ────────────────────────────────────────────────────────────────── */

const ICONS = {
  posts: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,160Z" />
    </svg>
  ),
  published: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z" />
    </svg>
  ),
  draft: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
    </svg>
  ),
  categories: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z" />
    </svg>
  ),
  subscribers: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z" />
    </svg>
  ),
  media: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,200V172l52-52,80,80H40Zm176,0H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z" />
    </svg>
  ),
};

/* ── Component ────────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [analyticsPeriod, setAnalyticsPeriod] = useState(7);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    overview: null,
    timeseries: [],
    topPages: [],
    topCountries: [],
    topReferrers: [],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(false);

  /* ── Fetch CMS stats ─────────────────────────────────────────────────────── */

  useEffect(() => {
    async function loadStats() {
      setStatsLoading(true);
      const [total, published, drafts, cats, subs, mediaCount] =
        await Promise.all([
          fetchCount("/api/admin/posts?limit=1"),
          fetchCount("/api/admin/posts?limit=1&status=published"),
          fetchCount("/api/admin/posts?limit=1&status=draft"),
          fetchCount("/api/admin/categories?limit=1"),
          fetchCount("/api/admin/subscribers?limit=1"),
          fetchCount("/api/admin/media?limit=1"),
        ]);

      setStats([
        { label: "Posts", value: total, icon: ICONS.posts, href: "/admin/posts" },
        { label: "Publicados", value: published, icon: ICONS.published, href: "/admin/posts?status=published" },
        { label: "Rascunhos", value: drafts, icon: ICONS.draft, href: "/admin/posts?status=draft" },
        { label: "Categorias", value: cats, icon: ICONS.categories, href: "/admin/categorias" },
        { label: "Inscritos", value: subs, icon: ICONS.subscribers, href: "/admin/inscritos" },
        { label: "Midias", value: mediaCount, icon: ICONS.media, href: "/admin/midias" },
      ]);
      setStatsLoading(false);
    }

    loadStats();
  }, []);

  /* ── Fetch Analytics ─────────────────────────────────────────────────────── */

  const fetchAnalytics = useCallback(async (days: number) => {
    setAnalyticsLoading(true);
    setAnalyticsError(false);
    const { from, to } = getDateRange(days);

    try {
      const base = `/api/admin/analytics?from=${from}&to=${to}`;

      const [overviewRes, timeseriesRes, pagesRes, countriesRes, referrersRes] =
        await Promise.allSettled([
          fetch(`${base}&type=overview`),
          fetch(`${base}&type=timeseries`),
          fetch(`${base}&groupBy=path&limit=10`),
          fetch(`${base}&groupBy=country&limit=10`),
          fetch(`${base}&groupBy=referrer&limit=10`),
        ]);

      const parseJson = async (result: PromiseSettledResult<Response>) => {
        if (result.status === "fulfilled" && result.value.ok) {
          return result.value.json();
        }
        return null;
      };

      const [overviewData, timeseriesData, pagesData, countriesData, referrersData] =
        await Promise.all([
          parseJson(overviewRes),
          parseJson(timeseriesRes),
          parseJson(pagesRes),
          parseJson(countriesRes),
          parseJson(referrersRes),
        ]);

      // Se nenhuma requisicao retornou dados, marca erro
      if (!overviewData && !timeseriesData) {
        setAnalyticsError(true);
        return;
      }

      setAnalytics({
        overview: overviewData,
        timeseries: Array.isArray(timeseriesData) ? timeseriesData : [],
        topPages: Array.isArray(pagesData) ? pagesData : [],
        topCountries: Array.isArray(countriesData) ? countriesData : [],
        topReferrers: Array.isArray(referrersData) ? referrersData : [],
      });
    } catch {
      setAnalyticsError(true);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(analyticsPeriod);
  }, [analyticsPeriod, fetchAnalytics]);

  /* ── Mini bar chart ──────────────────────────────────────────────────────── */

  const maxViews = Math.max(...analytics.timeseries.map((p) => p.views), 1);

  /* ── Render ──────────────────────────────────────────────────────────────── */

  return (
    <AdminShell title="Dashboard">
      {/* ── CMS Stats ───────────────────────────────────────────────────────── */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Estatisticas do CMS
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {statsLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : stats.map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-[#0d61ac]/30 hover:shadow-md"
                >
                  <div className="mb-3 inline-flex rounded-lg bg-[#0d61ac]/10 p-2.5 text-[#0d61ac] transition-colors group-hover:bg-[#0d61ac]/20">
                    {card.icon}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {card.value ?? "--"}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">{card.label}</p>
                </Link>
              ))}
        </div>
      </section>

      {/* ── Analytics ───────────────────────────────────────────────────────── */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Analytics</h2>
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            {[
              { days: 7, label: "7 dias" },
              { days: 30, label: "30 dias" },
              { days: 90, label: "90 dias" },
            ].map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => setAnalyticsPeriod(opt.days)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  analyticsPeriod === opt.days
                    ? "bg-white text-[#0d61ac] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {analyticsError ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
            <svg
              className="mx-auto mb-3 text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 256 256"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-8,56a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm8,104a12,12,0,1,1,12-12A12,12,0,0,1,128,184Z" />
            </svg>
            <p className="text-sm font-medium text-gray-500">
              Analytics indisponivel
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Nao foi possivel carregar os dados de analytics no momento.
            </p>
          </div>
        ) : analyticsLoading ? (
          <div className="space-y-4">
            {/* Skeleton overview */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="mb-2 h-3 w-20 rounded bg-gray-100" />
                  <div className="h-7 w-14 rounded bg-gray-100" />
                </div>
              ))}
            </div>
            {/* Skeleton chart */}
            <div className="h-48 rounded-xl border border-gray-200 bg-white p-4">
              <SkeletonBar />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overview stats */}
            {analytics.overview && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  {
                    label: "Total Visualizacoes",
                    value: analytics.overview.totalViews?.toLocaleString("pt-BR") ?? "--",
                  },
                  {
                    label: "Visitantes Unicos",
                    value: analytics.overview.uniqueVisitors?.toLocaleString("pt-BR") ?? "--",
                  },
                  {
                    label: "Bounce Rate",
                    value: analytics.overview.bounceRate != null
                      ? `${analytics.overview.bounceRate.toFixed(1)}%`
                      : "--",
                  },
                  {
                    label: "Pagina Mais Vista",
                    value: analytics.overview.topPage || "--",
                  },
                  {
                    label: "Pais Principal",
                    value: analytics.overview.topCountry || "--",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <p className="text-xs font-medium text-gray-500">
                      {item.label}
                    </p>
                    <p className="mt-1 truncate text-xl font-bold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Mini bar chart */}
            {analytics.timeseries.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h3 className="mb-4 text-sm font-semibold text-gray-700">
                  Visualizacoes Diarias
                </h3>
                <div className="flex h-40 items-end gap-[2px]">
                  {analytics.timeseries.map((point, i) => {
                    const pct = (point.views / maxViews) * 100;
                    return (
                      <div
                        key={i}
                        className="group relative flex-1"
                        title={`${point.date}: ${point.views} visualizacoes`}
                      >
                        <div
                          className="w-full rounded-t bg-[#0d61ac]/70 transition-colors group-hover:bg-[#0d61ac]"
                          style={{ height: `${Math.max(pct, 2)}%` }}
                        />
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow group-hover:block">
                          <span className="font-medium">{point.views}</span>
                          <br />
                          <span className="text-gray-300">{point.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                  <span>{analytics.timeseries[0]?.date ?? ""}</span>
                  <span>
                    {analytics.timeseries[analytics.timeseries.length - 1]?.date ?? ""}
                  </span>
                </div>
              </div>
            )}

            {/* Ranked lists */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Top Pages */}
              {analytics.topPages.length > 0 && (
                <RankedList title="Top Paginas" items={analytics.topPages} />
              )}

              {/* Top Countries */}
              {analytics.topCountries.length > 0 && (
                <RankedList title="Top Paises" items={analytics.topCountries} />
              )}

              {/* Top Referrers */}
              {analytics.topReferrers.length > 0 && (
                <RankedList
                  title="Top Referrers"
                  items={analytics.topReferrers}
                />
              )}
            </div>

            {/* Empty analytics state */}
            {!analytics.overview &&
              analytics.timeseries.length === 0 &&
              analytics.topPages.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
                  <svg
                    className="mx-auto mb-3 text-gray-300"
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 256 256"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l56-56a8,8,0,0,1,11.31,0L148,141.37,207.31,82a8,8,0,0,1,11.32,11.31l-64,64a8,8,0,0,1-11.32,0L103,116.69,48,171.31V200H224A8,8,0,0,1,232,208Z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-500">
                    Sem dados de analytics
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Os dados aparecerão aqui quando houver trafego registrado.
                  </p>
                </div>
              )}
          </div>
        )}
      </section>
    </AdminShell>
  );
}

/* ── Ranked List Component ────────────────────────────────────────────────────── */

function RankedList({
  title,
  items,
}: {
  title: string;
  items: RankedItem[];
}) {
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, i) => {
          const pct = (item.count / maxCount) * 100;
          return (
            <li key={i} className="relative">
              <div
                className="absolute inset-y-0 left-0 rounded bg-[#0d61ac]/5"
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between px-2 py-1.5">
                <span className="truncate text-sm text-gray-700">
                  {item.name || "(direto)"}
                </span>
                <span className="ml-2 flex-shrink-0 text-sm font-medium text-gray-900">
                  {item.count.toLocaleString("pt-BR")}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
