import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { isNotNull } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const docs = await db
    .select()
    .from(pages)
    .where(isNotNull(pages.draft));

  return NextResponse.json({ docs });
}
