"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Menu, ChevronRight, ChevronDown, LogOut } from "lucide-react";
import GlobalSearch from "./GlobalSearch";

type AdminHeaderProps = {
  title: string;
  onToggleSidebar: () => void;
  extra?: React.ReactNode;
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
      const isLast = i === segments.length - 1;
      crumbs.push({ label: "Editar", href: isLast ? undefined : undefined });
    }
  }

  return crumbs;
}

export default function AdminHeader({ title, onToggleSidebar, extra }: AdminHeaderProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const crumbs = getBreadcrumbs(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="mr-3 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="size-4 text-gray-400" />
              )}
              {crumb.href ? (
                <Link href={crumb.href} className="text-gray-500 transition-colors hover:text-primary">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-gray-900">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex flex-1 justify-center">
        <GlobalSearch />
      </div>

      <div className="flex flex-shrink-0 items-center justify-end gap-3">
        {extra}

        {/* User menu */}
        {mounted && status === "authenticated" && session?.user && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((p) => !p)}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">{session.user.name || "Usuario"}</p>
              <p className="text-xs text-gray-500 leading-tight">{session.user.email}</p>
            </div>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <ChevronDown className="size-4 text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <div className="border-b border-gray-100 px-4 py-2.5 sm:hidden">
                <p className="text-sm font-medium text-gray-900">{session.user.name || "Usuario"}</p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="flex w-full items-center gap-2.5 rounded-md px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <LogOut className="size-4" />
                Sair do sistema
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </header>
  );
}
