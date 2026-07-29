import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cms } from "@/lib/cms";
import type { SectionBlock } from "@/lib/cms";
import { SectionRenderer } from "@/components/SectionRenderer";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await cms.pages.get(`lp-${slug}`);
  if (!page) return {};

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
    alternates: { canonical: `/lp/${slug}` },
    openGraph: {
      title: page.ogTitle || page.metaTitle || page.title,
      description: page.ogDescription || page.metaDescription || undefined,
      type: "website",
      url: `/lp/${slug}`,
      images: page.ogImageUrl ? [{ url: page.ogImageUrl }] : [],
    },
  };
}

export default async function LandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await cms.pages.get(`lp-${slug}`);

  if (!page) notFound();

  const blocks: SectionBlock[] = page.sections ?? [];

  if (blocks.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">{page.title}</h1>
        {page.content && (
          <div
            className="prose prose-gray mx-auto mt-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}
      </div>
    );
  }

  return <SectionRenderer blocks={blocks} />;
}
