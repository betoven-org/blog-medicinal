"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  FolderOpen,
  Users,
  Image,
  Mail,
  Settings,
  PanelLeftOpen,
  PanelLeftClose,
  X,
  Package,
  Tags,
  Shield,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Conteudo",
    items: [
      {
        href: "/admin/posts",
        label: "Posts",
        icon: <FileText className="size-[18px]" />,
      },
      {
        href: "/admin/categorias",
        label: "Categorias",
        icon: <FolderOpen className="size-[18px]" />,
      },
      {
        href: "/admin/autores",
        label: "Autores",
        icon: <Users className="size-[18px]" />,
      },
      {
        href: "/admin/midias",
        label: "Midias",
        icon: <Image className="size-[18px]" />,
      },
    ],
  },
  {
    label: "Catalogo",
    items: [
      {
        href: "/admin/produtos",
        label: "Produtos",
        icon: <Package className="size-[18px]" />,
      },
      {
        href: "/admin/categorias-produto",
        label: "Categorias de Produto",
        icon: <Tags className="size-[18px]" />,
      },
    ],
  },
  {
    label: "Configuracoes",
    items: [
      {
        href: "/admin/inscritos",
        label: "Inscritos",
        icon: <Mail className="size-[18px]" />,
      },
      {
        href: "/admin/configuracoes",
        label: "Configuracoes do Site",
        icon: <Settings className="size-[18px]" />,
      },
      {
        href: "/admin/usuarios",
        label: "Usuarios e Permissoes",
        icon: <Shield className="size-[18px]" />,
      },
    ],
  },
];

/* ── Tooltip ─────────────────────────────────────────────────────────── */

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPosition({ top: rect.top + rect.height / 2, left: rect.right + 8 });
    }
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  }, []);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <div ref={ref} onMouseEnter={show} onMouseLeave={hide} className="relative">
      {children}
      {visible && (
        <div
          className="pointer-events-none fixed z-[9999] whitespace-nowrap rounded bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
          style={{ top: position.top, left: position.left, transform: "translateY(-50%)" }}
          role="tooltip"
        >
          {label}
        </div>
      )}
    </div>
  );
}

/* ── Sidebar ─────────────────────────────────────────────────────────── */

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed top-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-200",
          collapsed ? "lg:w-[68px]" : "lg:w-60",
          "w-60 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header: Logo + Collapse toggle */}
        <div className={`flex h-14 items-center border-b border-gray-200 ${collapsed ? "lg:justify-center lg:px-2" : "justify-between px-4"} justify-between px-4`}>
          {/* Desktop collapsed: botao de expandir no lugar do logo */}
          {collapsed ? (
            <>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:flex"
                aria-label="Expandir sidebar"
              >
                <PanelLeftOpen className="size-5" />
              </button>
              {/* Mobile: logo normal */}
              <Link href="/admin" className="lg:hidden">
                <img src="/logo.svg" alt="Logo" className="h-7" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/admin">
                <img src="/logo.svg" alt="Logo" className="h-7" />
              </Link>
              {/* Collapse button — desktop only */}
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 lg:flex"
                aria-label="Recolher sidebar"
              >
                <PanelLeftClose className="size-4" />
              </button>
            </>
          )}

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-3 ${collapsed ? "lg:px-2" : "px-3"} px-3`}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className={`mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 ${collapsed ? "lg:hidden" : ""}`}>
                {group.label}
              </p>
              {collapsed && <div className="mx-auto mb-2 hidden w-6 border-t border-gray-200 lg:block" />}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  const link = (
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={[
                        "flex items-center rounded-md text-[13px] font-medium transition-colors",
                        collapsed ? "lg:justify-center lg:px-0 lg:py-2.5" : "",
                        "gap-3 px-3 py-2",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      ].join(" ")}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
                    </Link>
                  );

                  return (
                    <li key={item.href}>
                      {collapsed ? (
                        <>
                          <div className="hidden lg:block">
                            <Tooltip label={item.label}>{link}</Tooltip>
                          </div>
                          <div className="lg:hidden">{link}</div>
                        </>
                      ) : (
                        link
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
