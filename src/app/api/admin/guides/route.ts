import { NextResponse } from "next/server";
import { auth } from "@brasa/core/auth";
import { db } from "@brasa/core/db";
import { cmsGuides } from "@brasa/core/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const guides = await db
    .select()
    .from(cmsGuides)
    .orderBy(asc(cmsGuides.sortOrder));

  return NextResponse.json(guides);
}
