import { fetchSitemapXml } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  return fetchSitemapXml("paginas");
}
