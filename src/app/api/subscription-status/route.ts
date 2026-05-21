import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

export async function GET() {
  const [sub] = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .limit(1);

  if (!sub) {
    return NextResponse.json({ status: "active" });
  }

  return NextResponse.json({ status: sub.status });
}
