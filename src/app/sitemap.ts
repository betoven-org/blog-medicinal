import type { MetadataRoute } from "next";

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/sitemaps/posts.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemaps/produtos.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemaps/categorias.xml`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/sitemaps/paginas.xml`,
      lastModified: new Date(),
    },
  ];
}
