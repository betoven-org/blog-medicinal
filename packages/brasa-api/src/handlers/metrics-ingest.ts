import { NextRequest, NextResponse } from "next/server";
import { db } from "@brasa/core/db";
import { requestMetrics } from "@brasa/core/schema";

const INGEST_SECRET = process.env.METRICS_INGEST_SECRET || "metrics-internal-key";

const BOT_PATTERNS = /bot|crawl|spider|slurp|facebookexternalhit|linkedinbot|twitterbot|whatsapp|telegram|googlebot|bingbot|yandex|baidu|duckduck|semrush|ahref|mj12bot|dotbot|petalbot|bytespider/i;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-metrics-secret");
  if (secret !== INGEST_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const userAgent = body.userAgent || "";
    const isBot = BOT_PATTERNS.test(userAgent);

    await db.insert(requestMetrics).values({
      tenantId: body.tenantId || 1,
      path: body.path,
      method: body.method,
      statusCode: body.statusCode,
      latencyMs: body.latencyMs,
      country: body.country || null,
      city: body.city || null,
      userAgent: userAgent || null,
      referer: body.referer || null,
      isBot,
      contentLength: body.contentLength || null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[metrics/ingest]", err);
    return NextResponse.json({ error: "Failed to ingest" }, { status: 500 });
  }
}
