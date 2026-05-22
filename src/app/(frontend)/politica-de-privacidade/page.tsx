import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Politica de Privacidade",
  description: "Politica de privacidade e protecao de dados.",
};

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const content = (settings as any)?.privacyPolicy || "";

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
