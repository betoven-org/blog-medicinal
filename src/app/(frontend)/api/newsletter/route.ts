import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Nome invalido" }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "E-mail invalido" }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const trimmedName = name.trim();

    const supabase = getSupabaseAdmin();

    // Check if already exists
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", normalized)
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Este e-mail ja esta inscrito" },
        { status: 409 },
      );
    }

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ name: trimmedName, email: normalized, active: true });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Este e-mail ja esta inscrito" },
          { status: 409 },
        );
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar inscricao" },
      { status: 500 },
    );
  }
}
