"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Category = {
  id: number;
  name: string;
  slug: string;
};

type LandingPage = {
  title: string;
  slug: string;
};

type Props = {
  categories: Category[];
  landingPages?: LandingPage[];
};

function toTitleCase(str: string) {
  return str
    .toLowerCase()
    .split(" ")
    .map((w, i) =>
      i > 0 && ["e", "de", "do", "da", "dos", "das"].includes(w)
        ? w
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
}

export function CategoryMenu({ categories, landingPages = [] }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label="Categorias de produtos">
      <div className="flex flex-wrap items-center gap-1.5 py-2.5">
        <Link
          href="/produtos"
          className="rounded-full bg-[#0d61ac] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#0a4f8c]"
        >
          Ver Todos os Produtos
        </Link>
        {categories.map((cat) => {
          const isActive = pathname === `/produtos/${cat.slug}`;
          return (
            <Link
              key={cat.id}
              href={`/produtos/${cat.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#0d61ac] text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {toTitleCase(cat.name)}
            </Link>
          );
        })}
        {landingPages.length > 0 && (
          <>
            <span className="mx-1 h-5 w-px bg-gray-200" aria-hidden="true" />
            {landingPages.map((lp) => {
              const isActive = pathname === `/campanhas/${lp.slug}`;
              return (
                <Link
                  key={lp.slug}
                  href={`/campanhas/${lp.slug}`}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {lp.title}
                </Link>
              );
            })}
          </>
        )}
      </div>
    </nav>
  );
}
