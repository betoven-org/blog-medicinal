import { fetchSitemapXml } from "@/lib/sitemap";

export const revalidate = 60;

export async function GET() {
  return fetchSitemapXml("posts");
}
