import { notFound } from "next/navigation";
import Script from "next/script";
import { cms } from "@/lib/cms";
import type { SectionBlock } from "@/lib/cms";
import { SectionRenderer } from "@/components/SectionRenderer";

const CMS_URL = process.env.CMS_URL || "https://cms.brasa.tech";

// No cache — always fetch fresh data from CMS
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = { params: Promise<{ path: string[] }> };

export default async function PreviewPage({ params }: PageProps) {
  const { path } = await params;
  const slug = path.join("/");

  // Fetch with draft mode — gets draftSections instead of published
  const page = await cms.pages.get(slug, { draft: true });
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
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-sm text-gray-500">Nenhuma section configurada para esta pagina.</p>
      </div>
    );
  }

  return (
    <>
      <SectionRenderer blocks={blocks} />
      <Script src={`${CMS_URL}/brasa-editor.js`} strategy="afterInteractive" />
    </>
  );
}
