import { NextRequest, NextResponse } from "next/server";

const VERCEL_API = "https://vercel.com/api/web-analytics";

const VALID_GROUP_BY = [
  "path", "route", "country", "os_name", "device_type",
  "client_name", "referrer", "utm", "ref", "hostname",
  "event_name", "flags",
];

export async function GET(req: NextRequest) {
  const token = process.env.ANALYTICS_TOKEN || process.env.VERCEL_API_TOKEN;
  const projectId = process.env.ANALYTICS_PROJECT_ID;
  const teamId = process.env.ANALYTICS_TEAM_ID;

  if (!token || !projectId) {
    return NextResponse.json(
      { error: "ANALYTICS_TOKEN and ANALYTICS_PROJECT_ID are required" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "timeseries"; // "timeseries" | "overview"
  const groupBy = searchParams.get("groupBy") || "";
  const from = searchParams.get("from") || new Date(Date.now() - 7 * 86400000).toISOString();
  const to = searchParams.get("to") || new Date().toISOString();

  if (groupBy && !VALID_GROUP_BY.includes(groupBy)) {
    return NextResponse.json({ error: "Invalid groupBy" }, { status: 400 });
  }

  const params = new URLSearchParams({
    projectId,
    from,
    to,
    environment: "production",
  });
  if (teamId) params.set("teamId", teamId);
  if (groupBy) params.set("groupBy", groupBy);
  if (searchParams.get("limit")) params.set("limit", searchParams.get("limit")!);

  const endpoint = type === "overview" ? "overview" : "timeseries";

  try {
    const res = await fetch(`${VERCEL_API}/${endpoint}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Vercel API ${res.status}: ${text}` }, { status: res.status });
    }

    const raw = await res.json();

    // Normalize response format
    if (type === "overview") {
      return NextResponse.json(raw);
    }

    // Timeseries: raw.data.groups is { [groupKey]: TimeseriesPoint[] }
    const groups = raw?.data?.groups || {};

    if (!groupBy) {
      // No groupBy: groups has "all" key
      return NextResponse.json({ timeseries: groups.all || [] });
    }

    // With groupBy: aggregate each group's totals
    const ranked = Object.entries(groups)
      .filter(([key]) => key !== "")
      .map(([key, points]) => ({
        key,
        value: (points as any[]).reduce((sum: number, p: any) => sum + (p.total || 0), 0),
      }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json({ ranked });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
