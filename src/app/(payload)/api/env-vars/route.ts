import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@/payload.config";

const VERCEL_API = "https://api.vercel.com";

const SENSITIVE_KEYS = new Set([
  "DATABASE_URI",
  "PAYLOAD_SECRET",
  "VERCEL_TOKEN",
  "VERCEL_PROJECT_ID",
  "SUPABASE_SERVICE_ROLE_KEY",
]);

async function getUser(req: NextRequest) {
  const payload = await getPayload({ config: configPromise });
  const token =
    req.cookies.get("payload-token")?.value ||
    req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const { user } = await payload.auth({ headers: req.headers, collection: "users" } as any);
    return user;
  } catch {
    return null;
  }
}

function getVercelHeaders() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN not configured");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function getProjectId() {
  const id = process.env.VERCEL_PROJECT_ID;
  if (!id) throw new Error("VERCEL_PROJECT_ID not configured");
  return id;
}

// GET - List env vars
export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projectId = getProjectId();
    const res = await fetch(
      `${VERCEL_API}/v9/projects/${projectId}/env`,
      { headers: getVercelHeaders() }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const envs = data.envs.map((env: any) => ({
      id: env.id,
      key: env.key,
      value: SENSITIVE_KEYS.has(env.key) ? "••••••••" : env.value,
      target: env.target,
      type: env.type,
      sensitive: SENSITIVE_KEYS.has(env.key),
    }));

    return NextResponse.json({ envs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH - Update an env var
export async function PATCH(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, key, value, target } = await req.json();

    if (SENSITIVE_KEYS.has(key)) {
      return NextResponse.json(
        { error: `${key} is protected and cannot be edited from the admin` },
        { status: 403 }
      );
    }

    const projectId = getProjectId();
    const res = await fetch(
      `${VERCEL_API}/v9/projects/${projectId}/env/${id}`,
      {
        method: "PATCH",
        headers: getVercelHeaders(),
        body: JSON.stringify({ value, target: target || ["production"] }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Create a new env var
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, value, target } = await req.json();

    if (!key || !value) {
      return NextResponse.json({ error: "key and value required" }, { status: 400 });
    }

    const projectId = getProjectId();
    const res = await fetch(
      `${VERCEL_API}/v9/projects/${projectId}/env`,
      {
        method: "POST",
        headers: getVercelHeaders(),
        body: JSON.stringify({
          key,
          value,
          target: target || ["production"],
          type: key.startsWith("NEXT_PUBLIC_") ? "plain" : "encrypted",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Remove an env var
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, key } = await req.json();

    if (SENSITIVE_KEYS.has(key)) {
      return NextResponse.json(
        { error: `${key} is protected` },
        { status: 403 }
      );
    }

    const projectId = getProjectId();
    const res = await fetch(
      `${VERCEL_API}/v9/projects/${projectId}/env/${id}`,
      { method: "DELETE", headers: getVercelHeaders() }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
