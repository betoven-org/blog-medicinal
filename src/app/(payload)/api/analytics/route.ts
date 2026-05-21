import { NextRequest, NextResponse } from "next/server";

const VERCEL_API = "https://vercel.com/api/web-analytics";
const VALID_ENDPOINTS = [
  "timeseries",
  "pages",
  "referrers",
  "countries",
  "cities",
  "devices",
  "os",
  "browsers",
  "events",
];

export async function GET(req: NextRequest) {
  const token = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return NextResponse.json(
      { error: "VERCEL_API_TOKEN and VERCEL_PROJECT_ID are required" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint") || "timeseries";

  if (!VALID_ENDPOINTS.includes(endpoint)) {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  }

  const from = searchParams.get("from") || new Date(Date.now() - 7 * 86400000).toISOString();
  const to = searchParams.get("to") || new Date().toISOString();

  const params = new URLSearchParams({
    projectId,
    from,
    to,
    environment: "production",
  });
  if (teamId) params.set("teamId", teamId);

  try {
    const res = await fetch(`${VERCEL_API}/${endpoint}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Vercel API ${res.status}: ${text}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
