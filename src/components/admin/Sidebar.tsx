"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  PanelLeftOpen,
  PanelLeftClose,
  X,
  Package,
  PanelBottom,
  ChevronDown,
  Search,
  Settings,
  Plug,
  BarChart3,
  HelpCircle,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
};

type NavGroup = {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Blog",
    icon: <FileText className="size-[18px]" />,
    items: [
      { href: "/admin/posts", label: "Posts" },
      { href: "/admin/categorias", label: "Categorias" },
      { href: "/admin/autores", label: "Autores" },
      { href: "/admin/midias", label: "Midias" },
    ],
  },
  {
    label: "Catalogo",
    icon: <Package className="size-[18px]" />,
    items: [
      { href: "/admin/produtos", label: "Produtos" },
      { href: "/admin/categorias-produto", label: "Categorias de Produto" },
    ],
  },
  {
    label: "Storefront",
    icon: <PanelBottom className="size-[18px]" />,
    items: [
      { href: "/admin/footer", label: "Footer" },
      { href: "/admin/newsletter", label: "Newsletter" },
      { href: "/admin/paginas", label: "Paginas" },
    ],
  },
  {
    label: "Analytics",
    icon: <BarChart3 className="size-[18px]" />,
    items: [
      { href: "/admin/analytics", label: "Metricas" },
    ],
  },
  {
    label: "SEO",
    icon: <Search className="size-[18px]" />,
    items: [
      { href: "/admin/robots", label: "Robots" },
    ],
  },
  {
    label: "Configuracoes",
    icon: <Settings className="size-[18px]" />,
    items: [
      { href: "/admin/inscritos", label: "Inscritos" },
      { href: "/admin/identidade", label: "Identidade do Site" },
      { href: "/admin/contato", label: "Contato" },
      { href: "/admin/redes-sociais", label: "Redes Sociais" },
      { href: "/admin/usuarios", label: "Usuarios e Permissoes" },
    ],
  },
  {
    label: "Integracoes",
    icon: <Plug className="size-[18px]" />,
    items: [
      { href: "/admin/supabase", label: "Supabase" },
      { href: "/admin/assinatura", label: "Assinatura" },
    ],
  },
  {
    label: "Ajuda",
    icon: <HelpCircle className="size-[18px]" />,
    items: [
      { href: "/admin/ajuda", label: "Guias" },
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

function findActiveGroup(pathname: string): string | null {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        return group.label;
      }
    }
  }
  return null;
}

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(() => findActiveGroup(pathname));

  useEffect(() => {
    const active = findActiveGroup(pathname);
    if (active) setOpenGroup(active);
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setOpenGroup((prev) => (prev === label ? null : label));
  };

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
              <Link href="/admin" className="lg:hidden">
                <img src="/logo.svg" alt="Logo" className="h-7" />
              </Link>
            </>
          ) : (
            <>
              <Link href="/admin">
                <img src="/logo.svg" alt="Logo" className="h-7" />
              </Link>
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
          {navGroups.map((group) => {
            const isGroupOpen = openGroup === group.label;
            const hasActiveItem = group.items.some(
              (item) => pathname === item.href || pathname.startsWith(item.href + "/")
            );

            const groupHeader = (
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className={[
                  "flex w-full items-center rounded-md text-[13px] font-semibold transition-colors",
                  collapsed ? "lg:justify-center lg:px-0 lg:py-2.5" : "gap-3 px-3 py-2",
                  "gap-3 px-3 py-2",
                  hasActiveItem
                    ? "text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                ].join(" ")}
              >
                <span className="flex-shrink-0">{group.icon}</span>
                <span className={`flex-1 text-left ${collapsed ? "lg:hidden" : ""}`}>{group.label}</span>
                <ChevronDown
                  className={[
                    "size-4 text-gray-400 transition-transform duration-200",
                    isGroupOpen ? "rotate-180" : "",
                    collapsed ? "lg:hidden" : "",
                  ].join(" ")}
                />
              </button>
            );

            return (
              <div key={group.label} className="mb-1">
                {collapsed ? (
                  <>
                    <div className="hidden lg:block">
                      <Tooltip label={group.label}>{groupHeader}</Tooltip>
                    </div>
                    <div className="lg:hidden">{groupHeader}</div>
                  </>
                ) : (
                  groupHeader
                )}

                <div
                  className={[
                    "overflow-hidden transition-all duration-200",
                    isGroupOpen && !collapsed ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                  ].join(" ")}
                >
                  <ul className="mt-0.5 space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => {
                              if (window.innerWidth < 1024) onClose();
                            }}
                            className={[
                              "flex items-center rounded-md text-[13px] font-medium transition-colors",
                              "gap-3 py-2",
                              collapsed ? "lg:pl-3" : "pl-10 pr-3",
                              "pl-10 pr-3",
                              isActive
                                ? "bg-primary/5 text-primary"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                            ].join(" ")}
                            aria-current={isActive ? "page" : undefined}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
