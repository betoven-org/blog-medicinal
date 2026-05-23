import { NextRequest, NextResponse } from "next/server";
import { auth } from "@brasa/core/auth";
import { db } from "@brasa/core/db";
import { pages } from "@brasa/core/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { parseBody } from "@brasa/core/validations";

const schema = z.object({
  ids: z.array(z.number().int()).min(1, "Selecione ao menos uma pagina"),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  const body = await request.json();
  const parsed = parseBody(schema, body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { ids } = parsed.data;

  const pending = await db
    .select()
    .from(pages)
    .where(inArray(pages.id, ids));

  let published = 0;

  for (const page of pending) {
    if (!page.draft) continue;
    const draft = page.draft as Record<string, unknown>;

    await db
      .update(pages)
      .set({
        title: (draft.title as string) ?? page.title,
        metaTitle: (draft.metaTitle as string) ?? page.metaTitle,
        metaDescription: (draft.metaDescription as string) ?? page.metaDescription,
        ogTitle: (draft.ogTitle as string) ?? page.ogTitle,
        ogDescription: (draft.ogDescription as string) ?? page.ogDescription,
        ogImageUrl: (draft.ogImageUrl as string) ?? page.ogImageUrl,
        content: (draft.content as string) ?? page.content,
        draft: null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(pages.id, page.id));

    published++;
  }

  revalidateTag("pages");

  return NextResponse.json({ success: true, published });
}
