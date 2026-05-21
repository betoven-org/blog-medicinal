"use client";

const linkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 16px",
  fontSize: 13,
  color: "var(--theme-text, #374151)",
  textDecoration: "none",
  borderRadius: 4,
  transition: "background 0.15s",
};

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      style={linkStyle}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--theme-elevation-100, #f3f4f6)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {icon}
      {label}
    </a>
  );
}

export default function NavLink() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--theme-elevation-100, #e5e7eb)" }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--theme-elevation-500, #9ca3af)", padding: "4px 16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        Infraestrutura
      </span>
      <NavItem
        href="/admin/env-vars"
        label="Variaveis de Ambiente"
        icon={
          <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-68a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,148Zm0-32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,116Z" />
          </svg>
        }
      />
      <NavItem
        href="/admin/domains"
        label="Dominios"
        icon={
          <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM101.63,168h52.74C149,186.34,140,201.79,128,211.3,116,201.79,107,186.34,101.63,168ZM98,152a145.72,145.72,0,0,1,0-48h60a145.72,145.72,0,0,1,0,48ZM40,128a87.61,87.61,0,0,1,3.33-24H81.79a161.79,161.79,0,0,0,0,48H43.33A87.61,87.61,0,0,1,40,128Zm114.37-40H101.63C107,69.66,116,54.21,128,44.7,140,54.21,149,69.66,154.37,88Zm19.84,16h38.46a88.15,88.15,0,0,1,0,48H174.21a161.79,161.79,0,0,0,0-48Zm32.49-16H170.94a142.39,142.39,0,0,0-20.26-45A88.37,88.37,0,0,1,206.7,88ZM105.32,43A142.39,142.39,0,0,0,85.06,88H49.3A88.37,88.37,0,0,1,105.32,43ZM49.3,168H85.06a142.39,142.39,0,0,0,20.26,45A88.37,88.37,0,0,1,49.3,168Zm101.38,45a142.39,142.39,0,0,0,20.26-45H206.7A88.37,88.37,0,0,1,150.68,213Z" />
          </svg>
        }
      />
    </div>
  );
}
