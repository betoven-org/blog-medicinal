"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

type AdminHeaderProps = {
  title: string;
  onToggleSidebar: () => void;
};

const breadcrumbMap: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/posts": "Posts",
  "/admin/posts/novo": "Novo Post",
  "/admin/categorias": "Categorias",
  "/admin/categorias/novo": "Nova Categoria",
  "/admin/autores": "Autores",
  "/admin/autores/novo": "Novo Autor",
  "/admin/midias": "Midias",
  "/admin/inscritos": "Inscritos",
  "/admin/configuracoes": "Configuracoes do Site",
  "/admin/env-vars": "Variaveis de Ambiente",
  "/admin/domains": "Dominios",
};

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const path = "/" + segments.slice(0, i + 1).join("/");
    const label = breadcrumbMap[path];

    if (label) {
      const isLast = i === segments.length - 1;
      crumbs.push({ label, href: isLast ? undefined : path });
    } else if (i >= 2) {
      // Dynamic [id] segment — show "Editar"
      const isLast = i === segments.length - 1;
      crumbs.push({ label: "Editar", href: isLast ? undefined : undefined });
    }
  }

  return crumbs;
}

export default function AdminHeader({ title, onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-gray-200 bg-white px-4 lg:px-6">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="mr-3 rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
        aria-label="Abrir menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 256 256"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z" />
        </svg>
      </button>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg
                width="14"
                height="14"
                viewBox="0 0 256 256"
                fill="currentColor"
                className="text-gray-400"
                aria-hidden="true"
              >
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-gray-500 transition-colors hover:text-[#0d61ac]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-gray-900">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
