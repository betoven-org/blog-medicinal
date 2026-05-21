import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.status, "overdue"))
    .limit(1);

  if (!sub) {
    return NextResponse.json({ action: "no_overdue_subscriptions" });
  }

  const now = new Date();
  const dueDate = new Date(sub.nextDueDate);
  const diffMs = now.getTime() - dueDate.getTime();
  const daysLate = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (daysLate >= sub.graceDays) {
    await db
      .update(subscriptions)
      .set({
        status: "suspended",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(subscriptions.id, sub.id));

    return NextResponse.json({ action: "suspended", daysLate });
  }

  return NextResponse.json({
    action: "still_in_grace",
    daysLate,
    graceDays: sub.graceDays,
  });
}
