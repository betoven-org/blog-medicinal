"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

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
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,160Z" />
          </svg>
        ),
      },
      {
        href: "/admin/categorias",
        label: "Categorias",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M216,64H131.31L104,36.69A15.86,15.86,0,0,0,92.69,32H40A16,16,0,0,0,24,48V208a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM40,48H92.69l16,16H40ZM216,208H40V80H216Z" />
          </svg>
        ),
      },
      {
        href: "/admin/autores",
        label: "Autores",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z" />
          </svg>
        ),
      },
      {
        href: "/admin/midias",
        label: "Midias",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,200V172l52-52,80,80H40Zm176,0H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Configuracoes",
    items: [
      {
        href: "/admin/inscritos",
        label: "Inscritos",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z" />
          </svg>
        ),
      },
      {
        href: "/admin/configuracoes",
        label: "Configuracoes do Site",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187.11,168a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14A8,8,0,0,0,173.24,182l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.6,210.8a91.57,91.57,0,0,1-15-6.23L82.76,182a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14A8,8,0,0,0,68.88,168l-22.58-2.51a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.07,95.07a91.57,91.57,0,0,1,6.23-15L68.88,82.76A8,8,0,0,0,74,80.12a74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.76,68.88l2.51-22.58a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.4,40.07a91.57,91.57,0,0,1,15,6.23l2.64,22.58a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.9,123.66Z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Infraestrutura",
    items: [
      {
        href: "/admin/env-vars",
        label: "Variaveis de Ambiente",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z" />
          </svg>
        ),
      },
      {
        href: "/admin/domains",
        label: "Dominios",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm-26.37,144H154.37a142.39,142.39,0,0,1-26.37,55.11A142.39,142.39,0,0,1,101.63,168Zm-3.13-16A140.81,140.81,0,0,1,96,128a140.81,140.81,0,0,1,2.5-24h59a140.81,140.81,0,0,1,2.5,24,140.81,140.81,0,0,1-2.5,24Zm-58,0A88.53,88.53,0,0,1,40,128a88.53,88.53,0,0,1,.5-24H80.47a156.81,156.81,0,0,0-2,24,156.81,156.81,0,0,0,2,24Zm16,16h33a160.59,160.59,0,0,0,21.79,45.15A88.29,88.29,0,0,1,56.53,168Zm-1-120A88.29,88.29,0,0,1,110.4,42.85,160.59,160.59,0,0,0,88.63,88H55.49ZM154.37,88a142.39,142.39,0,0,0-26.37-55.11A142.39,142.39,0,0,0,101.63,88Zm12.89,16H216a88,88,0,0,1,0,48H175.53a156.81,156.81,0,0,0,2-24A156.81,156.81,0,0,0,175.53,104H216ZM200.51,88H167.37a160.59,160.59,0,0,0-21.79-45.15A88.29,88.29,0,0,1,200.51,88ZM145.6,213.15A160.59,160.59,0,0,0,167.37,168h33.14A88.29,88.29,0,0,1,145.6,213.15Z" />
          </svg>
        ),
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
  const { data: session } = useSession();

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
          collapsed ? "lg:w-16" : "lg:w-64",
          "w-64 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className={`flex h-14 items-center border-b border-gray-200 ${collapsed ? "lg:justify-center lg:px-0" : ""} justify-center px-5`}>
          <Link href="/admin" className={collapsed ? "lg:mx-auto" : ""}>
            {collapsed ? (
              <>
                <span className="hidden lg:block">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="#0d61ac" aria-hidden="true">
                    <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM184,96a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,96Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,128Zm0,32a8,8,0,0,1-8,8H80a8,8,0,0,1,0-16h96A8,8,0,0,1,184,160Z" />
                  </svg>
                </span>
                <img src="/logo.svg" alt="Logo" className="h-8 lg:hidden" />
              </>
            ) : (
              <img src="/logo.svg" alt="Logo" className="h-8" />
            )}
          </Link>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
            aria-label="Fechar menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
              <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? "lg:px-1.5" : "px-3"} px-3`}>
          {navGroups.map((group) => (
            <div key={group.label} className="mb-6">
              <p className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 ${collapsed ? "lg:hidden" : ""}`}>
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
                        // Only close on mobile — never toggle collapsed state
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={[
                        "flex items-center rounded-md text-sm font-medium transition-colors",
                        collapsed ? "lg:justify-center lg:px-0 lg:py-2.5" : "",
                        "gap-3 px-3 py-2",
                        isActive
                          ? "bg-[#0d61ac] text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
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

        {/* Collapse toggle + User info */}
        <div className="border-t border-gray-200">
          {/* Collapse button — desktop only */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 lg:flex ${collapsed ? "justify-center" : ""}`}
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
            title={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {collapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
                </svg>
                <span>Recolher</span>
              </>
            )}
          </button>

          {/* User info */}
          <div className="p-4">
            {session?.user && (
              <div className={`flex items-center ${collapsed ? "lg:justify-center" : "gap-3"} gap-3`}>
                {collapsed ? (
                  <Tooltip label={session.user.name || "Usuario"}>
                    <div className="hidden lg:block">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0d61ac] text-sm font-semibold text-white">
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </div>
                  </Tooltip>
                ) : null}
                <div className={collapsed ? "lg:hidden" : ""}>
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0d61ac] text-sm font-semibold text-white">
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>
                <div className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
                  <p className="truncate text-sm font-medium text-gray-900">{session.user.name || "Usuario"}</p>
                  <p className="truncate text-xs text-gray-500">{session.user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className={`flex-shrink-0 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 ${collapsed ? "lg:hidden" : ""}`}
                  aria-label="Sair"
                  title="Sair"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
