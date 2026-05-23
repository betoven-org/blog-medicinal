import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { siteSettings, media } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { parseBody, updateSettingsSchema } from "@/lib/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const result = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, 1),
      with: {
        logo: true,
        favicon: true,
      },
    });

    if (!result) {
      return NextResponse.json(null);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Settings get error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configuracoes" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = parseBody(updateSettingsSchema, body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

    // Check if settings row exists
    const [existing] = await db
      .select({ id: siteSettings.id })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);

    let result;

    if (existing) {
      [result] = await db
        .update(siteSettings)
        .set({ ...parsed.data, updatedAt: new Date().toISOString() })
        .where(eq(siteSettings.id, 1))
        .returning();
    } else {
      [result] = await db
        .insert(siteSettings)
        .values({ id: 1, ...parsed.data })
        .returning();
    }

    revalidateTag("settings");

    // Re-fetch with relations for the response
    const updated = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, 1),
      with: {
        logo: true,
        favicon: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configuracoes" },
      { status: 500 },
    );
  }
}
