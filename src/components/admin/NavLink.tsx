"use client";

import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/env-vars", label: "Variaveis de Ambiente" },
  { href: "/admin/domains", label: "Dominios" },
];

export default function NavLink() {
  const pathname = usePathname();

  return (
    <div className="nav-group">
      <button
        type="button"
        className="nav-group__toggle"
        tabIndex={-1}
        style={{ pointerEvents: "none" }}
      >
        <div className="nav-group__label">Infraestrutura</div>
      </button>
      <div className="nav-group__content">
        <ul className="nav-group__content-list">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`nav__link ${isActive ? "active" : ""}`}
                >
                  <span className="nav__link-label">{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
