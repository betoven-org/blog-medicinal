import { NextResponse } from "next/server";
import { auth } from "@brasa/core/auth";
import { db } from "@brasa/core/db";
import { subscriptions } from "@brasa/core/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const [sub] = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .limit(1);

  if (!sub) {
    return NextResponse.json({ status: "active" });
  }

  return NextResponse.json({ status: sub.status });
}
