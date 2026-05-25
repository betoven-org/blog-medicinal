import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getCategoriesWithCount } from "@/lib/queries";
import { cms } from "@/lib/cms";
import { SectionRenderer } from "@/components/SectionRenderer";
import type { SectionBlock } from "@/lib/cms";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Categorias",
  description: "Explore todas as categorias de artigos sobre saude e bem-estar.",
};

const categoryIcons: Record<string, React.ReactNode> = {
  saude: <svg width="32" height="32" viewBox="0 0 256 256" fill="currentColor"><path d="M216,80H176V56a24,24,0,0,0-24-24H104A24,24,0,0,0,80,56V80H40A16,16,0,0,0,24,96v48a16,16,0,0,0,16,16v48a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V160a16,16,0,0,0,16-16V96A16,16,0,0,0,216,80ZM96,56a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8V80H96ZM200,208H56V160H200Zm16-64H40V96H216Zm-104-8a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H136A8,8,0,0,1,128,136Z"/></svg>,
  suplementos: <svg width="32" height="32" viewBox="0 0 256 256" fill="currentColor"><path d="M216.42,39.6a53.26,53.26,0,0,0-75.32,0L39.6,141.09a53.26,53.26,0,0,0,75.32,75.31h0L216.42,114.91A53.26,53.26,0,0,0,216.42,39.6ZM103.61,205.09h0a37.26,37.26,0,0,1-52.7-52.69L96,107.31,155.31,166.6l-45.09,45.1ZM205.11,103.6,166.6,142.11,107.31,82.8l38.52-38.51a37.26,37.26,0,0,1,52.69,52.7Z"/></svg>,
  nutricao: <svg width="32" height="32" viewBox="0 0 256 256" fill="currentColor"><path d="M168,32a8,8,0,0,1-8,8,48.05,48.05,0,0,0-48,48,8,8,0,0,1-16,0A64.07,64.07,0,0,1,160,24,8,8,0,0,1,168,32ZM223.3,169.32a8.07,8.07,0,0,1,.7,3.28V200a32,32,0,0,1-32,32H64a32,32,0,0,1-32-32V172.6a8,8,0,0,1,.7-3.28L57.08,113A87.46,87.46,0,0,1,80,79.24V56a8,8,0,0,1,16,0V72.43A88.22,88.22,0,0,1,128,64a88.22,88.22,0,0,1,32,8.43V56a8,8,0,0,1,16,0V79.24A87.46,87.46,0,0,1,198.92,113ZM48,200a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V176H48Zm138.94-40L164.18,113a72,72,0,0,0-72.36,0L69.06,160Z"/></svg>,
  "bem-estar": <svg width="32" height="32" viewBox="0 0 256 256" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm72,0a12,12,0,1,1,12,12A12,12,0,0,1,152,108Zm24,52a8,8,0,0,1-6.4,3.2,60,60,0,0,1-83.2,0A8,8,0,0,1,99.2,150.4a44,44,0,0,0,57.6,0A8,8,0,0,1,176,160Z"/></svg>,
  receitas: <svg width="32" height="32" viewBox="0 0 256 256" fill="currentColor"><path d="M80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,120,64Zm32,0a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,152,64Zm96,56v8a40,40,0,0,1-37.51,39.91,96.13,96.13,0,0,1-27,40.09H208a8,8,0,0,1,0,16H48a8,8,0,0,1,0-16H72.54a96.13,96.13,0,0,1-27-40.09A40,40,0,0,1,8,128v-8a8,8,0,0,1,8-8H240A8,8,0,0,1,248,120Zm-16,8H24v0a24,24,0,0,0,24,24,8,8,0,0,1,8,8,80,80,0,0,0,144,0,8,8,0,0,1,8-8,24,24,0,0,0,24-24Z"/></svg>,
  colunistas: <svg width="32" height="32" viewBox="0 0 256 256" fill="currentColor"><path d="M227.32,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152a15.86,15.86,0,0,0-4.69,11.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.32,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.32,64l24-24L216,84.69Z"/></svg>,
};

export default async function CategoriesPage() {
  const cmsPage = await cms.pages.get("categorias");
  const sectionBlocks: SectionBlock[] = cmsPage?.sections ?? [];
  if (sectionBlocks.length > 0) {
    return <SectionRenderer blocks={sectionBlocks} />;
  }

  const categories = await getCategoriesWithCount();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categorias" },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
        <p className="mt-2 text-gray-500">
          Explore todos os temas do Medicinal na Web
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat: any) => {
          const slug = cat.slug as string;
          return (
            <Link
              key={cat.id}
              href={`/categorias/${slug}`}
              className="group flex items-center gap-4 rounded-xl border border-gray-200 p-6 transition-colors hover:border-[#0d61ac] hover:bg-blue-50/30"
            >
              <span
                aria-hidden="true"
                className="flex shrink-0 text-gray-500 transition-colors group-hover:text-[#0d61ac]"
              >
                {categoryIcons[slug] ?? categoryIcons.saude}
              </span>
              <div>
                <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-[#0d61ac]">
                  {cat.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {cat.postCount} {cat.postCount === 1 ? "artigo" : "artigos"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
