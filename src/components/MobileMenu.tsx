"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";

function IconFacebook({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconInstagram({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function IconYoutube({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  );
}

type NavLink = {
  label: string;
  url: string;
  highlight?: boolean;
};

type Props = {
  navLinks: NavLink[];
  socials: {
    facebook?: string | null;
    instagram?: string | null;
    youtube?: string | null;
  };
};

export function MobileMenu({ navLinks, socials }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary md:hidden"
      >
        <Menu size={22} aria-hidden="true" />
      </button>

      {open && (
        <>
          {/* Overlay */}
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <div
            ref={panelRef}
            id="mobile-menu-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegacao"
            className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col bg-white shadow-xl"
          >
            {/* Header do painel */}
            <div className="flex h-16 items-center justify-between border-b px-4">
              <span className="text-sm font-semibold text-foreground">Menu</span>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={handleClose}
                className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Busca */}
            <div className="border-b px-4 py-3">
              <form action="/search" method="GET">
                <div className="relative">
                  <Search
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    name="q"
                    type="search"
                    placeholder="O que voce esta procurando?"
                    className="w-full rounded-md border bg-card py-2.5 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </div>
              </form>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y">
                {navLinks.map((link) => (
                  <li key={link.url}>
                    <Link
                      href={link.url}
                      onClick={handleClose}
                      className={`block px-4 py-3.5 text-sm font-medium transition-colors ${
                        link.highlight
                          ? "text-emerald-700 hover:bg-emerald-50"
                          : "text-foreground hover:bg-primary/5 hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sociais */}
            {(socials.facebook || socials.instagram || socials.youtube) && (
              <div className="flex items-center gap-3 border-t px-4 py-4">
                {socials.facebook && (
                  <a
                    href={socials.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <IconFacebook size={20} />
                  </a>
                )}
                {socials.instagram && (
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <IconInstagram size={20} />
                  </a>
                )}
                {socials.youtube && (
                  <a
                    href={socials.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
                  >
                    <IconYoutube size={20} />
                  </a>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
