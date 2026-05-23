import { NextRequest, NextResponse } from "next/server";
import { auth } from "@brasa/core/auth";
import { db } from "@brasa/core/db";
import { media } from "@brasa/core/schema";
import { desc, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "20")));
    const offset = (page - 1) * limit;

    const [docs, [total]] = await Promise.all([
      db
        .select()
        .from(media)
        .orderBy(desc(media.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(media),
    ]);

    const totalDocs = total.count;
    const totalPages = Math.ceil(totalDocs / limit);

    return NextResponse.json({ docs, totalDocs, totalPages });
  } catch (error) {
    console.error("Media list error:", error);
    return NextResponse.json(
      { error: "Erro ao listar media" },
      { status: 500 },
    );
  }
}
