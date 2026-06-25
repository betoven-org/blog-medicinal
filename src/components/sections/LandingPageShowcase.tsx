import Image from "next/image";
import Link from "next/link";
import { cms } from "@/lib/cms";

/**
 * @title Vitrine de Landing Pages
 * @description Exibe campanhas/LPs com destaque na marcada como featured e grid nas demais
 * @group Home
 */
export interface Props {
  /** @title Titulo da secao */
  /** @default Guias Especiais */
  title?: string;

  /** @title Limite de LPs */
  /** @default 10 */
  limit?: number;
}

function IconArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

type LpCard = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  featured: boolean;
};

export default async function LandingPageShowcase({
  title = "Guias Especiais",
  limit = 10,
}: Props) {
  const result = await cms.collections.list("campanhas", { limit });

  const lps: LpCard[] = result.docs
    .filter((item) => item.status === "published")
    .map((item) => ({
      slug: item.slug,
      title: (item.data?.title as string) || item.slug,
      excerpt: (item.data?.excerpt as string) || "",
      coverImage: (item.data?.cover_image as string) || null,
      featured: !!(item as Record<string, unknown>).featured,
    }));

  if (lps.length === 0) return null;

  // LP marcada como featured vai pro destaque; fallback: primeira da lista
  const featuredIdx = lps.findIndex((lp) => lp.featured);
  const featured = featuredIdx >= 0 ? lps[featuredIdx] : lps[0];
  const rest = lps.filter((lp) => lp !== featured);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="h-6 w-1 rounded-full bg-[#0d61ac]" aria-hidden="true" />
        <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">
          {title}
        </h2>
      </div>

      {/* Featured LP — card grande, imagem + texto lado a lado */}
      <Link
        href={`/campanhas/${featured.slug}`}
        className="group mb-6 block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
      >
        <article className="flex flex-col sm:flex-row">
          {featured.coverImage && (
            <div className="relative h-56 w-full shrink-0 overflow-hidden bg-gray-100 sm:h-auto sm:min-h-[240px] sm:w-1/2">
              <Image
                src={featured.coverImage}
                alt={featured.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <div className={`flex flex-col justify-center gap-3 p-6 ${featured.coverImage ? "sm:w-1/2" : "w-full"}`}>
            <h3 className="text-xl font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#0d61ac] sm:text-2xl">
              {featured.title}
            </h3>
            {featured.excerpt && (
              <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                {featured.excerpt}
              </p>
            )}
            <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0d61ac]">
              Saiba mais
              <IconArrowRight size={14} />
            </span>
          </div>
        </article>
      </Link>

      {/* Demais LPs — grid de cards menores */}
      {rest.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((lp) => (
            <Link
              key={lp.slug}
              href={`/campanhas/${lp.slug}`}
              className="group flex gap-4 overflow-hidden rounded-lg border border-gray-100 bg-white p-3 transition-shadow hover:shadow-md"
            >
              {lp.coverImage && (
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  <Image
                    src={lp.coverImage}
                    alt={lp.title}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-col justify-center gap-1">
                <h3 className="text-sm font-bold text-gray-900 transition-colors group-hover:text-[#0d61ac]">
                  {lp.title}
                </h3>
                {lp.excerpt && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">
                    {lp.excerpt}
                  </p>
                )}
                <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-[#0d61ac]">
                  Ver campanha
                  <IconArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
