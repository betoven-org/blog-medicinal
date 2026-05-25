import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/queries";
import { Breadcrumb } from "@/components/Breadcrumb";
import { cms } from "@/lib/cms";
import { SectionRenderer } from "@/components/SectionRenderer";
import type { SectionBlock } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("politica-de-privacidade");
  return {
    title: page?.metaTitle ?? "Politica de Privacidade",
    description: page?.metaDescription ?? "Politica de privacidade e protecao de dados.",
  };
}

export default async function PrivacyPolicyPage() {
  const cmsPage = await cms.pages.get("politica-de-privacidade");
  const sectionBlocks: SectionBlock[] = cmsPage?.sections ?? [];
  if (sectionBlocks.length > 0) {
    return <SectionRenderer blocks={sectionBlocks} />;
  }

  const page = await getPageBySlug("politica-de-privacidade");
  const content = page?.content ?? "";

  const breadcrumbItems = [
    { label: "Inicio", href: "/" },
    { label: "Politica de Privacidade" },
  ];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold text-foreground">Politica de Privacidade</h1>

      {content ? (
        <div
          className="prose prose-sm mt-6 max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          Conteudo em breve. Acesse o painel administrativo para adicionar a politica de privacidade.
        </p>
      )}
    </main>
  );
}
