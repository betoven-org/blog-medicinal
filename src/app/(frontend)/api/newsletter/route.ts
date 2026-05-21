import { NextRequest, NextResponse } from "next/server";
import { getPayloadClient } from "@/payload-utils";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "E-mail inválido" },
        { status: 400 },
      );
    }

    const payload = await getPayloadClient();

    const existing = await payload.find({
      collection: "subscribers",
      where: { email: { equals: email.toLowerCase().trim() } },
      limit: 1,
    });

    if (existing.docs.length > 0) {
      return NextResponse.json(
        { error: "Este e-mail já está inscrito" },
        { status: 409 },
      );
    }

    await payload.create({
      collection: "subscribers",
      data: { email: email.toLowerCase().trim(), active: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar inscrição" },
      { status: 500 },
    );
  }
}
