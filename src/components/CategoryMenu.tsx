"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  label: string;
  url: string;
  highlight?: boolean;
};

type Props = {
  navLinks: NavLink[];
};

export function CategoryMenu({ navLinks }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegacao">
      <div className="flex flex-wrap items-center gap-1.5 py-2.5">
        {navLinks.map((link) => {
          const isActive = pathname === link.url || pathname.startsWith(link.url + "/");
          return (
            <Link
              key={link.url}
              href={link.url}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#0d61ac] text-white"
                  : link.highlight
                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
