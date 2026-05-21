"use client";

export default function NavLink() {
  return (
    <a
      href="/admin/env-vars"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 16px",
        fontSize: 13,
        color: "var(--theme-text, #374151)",
        textDecoration: "none",
        borderRadius: 4,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--theme-elevation-100, #f3f4f6)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-68a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,148Zm0-32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,116Z" />
      </svg>
      Variaveis de Ambiente
    </a>
  );
}
