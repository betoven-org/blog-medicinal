import { fetchSitemapXml } from "@/lib/sitemap";

export const revalidate = 300;

export async function GET() {
  return fetchSitemapXml("paginas");
}
