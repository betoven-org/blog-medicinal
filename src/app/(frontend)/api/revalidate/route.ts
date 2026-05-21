import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const collection = body.collection as string;

  if (collection === "posts") revalidateTag("posts");
  else if (collection === "categories") revalidateTag("categories");
  else if (collection === "site-settings") revalidateTag("settings");

  return NextResponse.json({ revalidated: true, collection });
}
