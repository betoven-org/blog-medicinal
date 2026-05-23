import { NextResponse } from "next/server";
import { auth } from "@brasa/core/auth";
import { db } from "@brasa/core/db";
import { pages } from "@brasa/core/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { getTenantId } from "@/lib/tenant";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const tenantId = await getTenantId();
  const docs = await db
    .select()
    .from(pages)
    .where(and(isNotNull(pages.draft), eq(pages.tenantId, tenantId)));

  return NextResponse.json({ docs });
}
