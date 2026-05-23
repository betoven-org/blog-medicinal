import { auth } from "@brasa/core/auth";
import { db } from "@brasa/core/db";
import { users } from "@brasa/core/schema";
import { desc, count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { parseBody, createUserSchema } from "@brasa/core/validations";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin")
      return NextResponse.json({ error: "Sem permissao" }, { status: 403 });

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;

    const [docs, totalResult] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(users),
    ]);

    const totalDocs = totalResult[0]?.total ?? 0;
    const totalPages = Math.ceil(totalDocs / limit);

    return NextResponse.json({ docs, totalDocs, totalPages, page });
  } catch (error) {
    console.error("[GET /api/admin/users]", error);
    return NextResponse.json({ error: "Erro ao listar usuarios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin")
      return NextResponse.json({ error: "Sem permissao" }, { status: 403 });

    const body = await req.json();
    const parsed = parseBody(createUserSchema, body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { name, email, password, role } = parsed.data;

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: "Ja existe um usuario com esse email" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: role ?? "viewer",
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/users]", error);
    return NextResponse.json({ error: "Erro ao criar usuario" }, { status: 500 });
  }
}
