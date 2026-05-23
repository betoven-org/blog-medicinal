import { NextRequest, NextResponse } from "next/server";
import { auth } from "@brasa/core/auth";
import { db } from "@brasa/core/db";
import { media } from "@brasa/core/schema";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { revalidateTag } from "next/cache";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const mediaId = Number(id);

    if (isNaN(mediaId)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const [record] = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: "Media nao encontrada" }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error("Media get error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar media" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });

  try {
    const { id } = await params;
    const mediaId = Number(id);

    if (isNaN(mediaId)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const [record] = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (!record) {
      return NextResponse.json({ error: "Media nao encontrada" }, { status: 404 });
    }

    // Delete blobs from Vercel Blob
    const urlsToDelete = [
      record.url,
      record.thumbnailUrl,
      record.cardUrl,
      record.heroUrl,
    ].filter((url): url is string => url !== null && url !== undefined);

    try {
      await del(urlsToDelete);
    } catch (blobError) {
      console.error("Blob deletion failed (continuing with DB delete):", blobError);
    }

    await db.delete(media).where(eq(media.id, mediaId));

    revalidateTag("media");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media delete error:", error);
    return NextResponse.json(
      { error: "Erro ao deletar media" },
      { status: 500 },
    );
  }
}
