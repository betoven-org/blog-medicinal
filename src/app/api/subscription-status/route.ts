import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";

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
