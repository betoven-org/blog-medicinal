import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cms } from "@/lib/cms";
import type { SectionBlock } from "@/lib/cms";
import { SectionRenderer } from "@/components/SectionRenderer";

export const revalidate = 300;

type PageProps = { params: Promise<{ path: string[] }> };

/**
 * Catch-all route — resolves any URL not handled by specific routes
 * against the CMS pages API. Works for:
 * - Static pages: /politica-de-cookies, /sobre
 * - Collection detail pages: /campanhas/morosil, /blog/meu-post
 * - Any new collection with a pageSlugPattern
 *
 * No code changes needed when a new collection is created in the CMS.
 */

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { path } = await params;
  const slug = path.join("/");
  const page = await cms.pages.get(slug);
  if (!page) return {};

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    alternates: { canonical: `${baseUrl}/${slug}` },
    openGraph: {
      title: page.ogTitle || page.metaTitle || page.title,
      description: page.ogDescription || page.metaDescription || undefined,
      type: "website",
      url: `${baseUrl}/${slug}`,
      images: page.ogImageUrl ? [{ url: page.ogImageUrl }] : [],
    },
  };
}

export default async function CatchAllPage({ params }: PageProps) {
  const { path } = await params;
  const slug = path.join("/");
  const page = await cms.pages.get(slug);

  if (!page) notFound();

  const blocks: SectionBlock[] = page.sections ?? [];

  if (blocks.length === 0 && page.content) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
        <div
          className="prose prose-gray mx-auto mt-6 max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    );
  }

  if (blocks.length === 0) {
    notFound();
  }

  return <SectionRenderer blocks={blocks} />;
}
