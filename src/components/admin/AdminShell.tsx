"use client";

import { useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";

const STORAGE_KEY = "admin-sidebar-collapsed";

type AdminShellProps = {
  title: string;
  children: React.ReactNode;
};

function ShellInner({ title, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  function handleToggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <div
        className={`transition-all duration-200 ${
          collapsed ? "lg:pl-[68px]" : "lg:pl-60"
        }`}
      >
        <AdminHeader
          title={title}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminShell({ title, children }: AdminShellProps) {
  return (
    <SessionProvider>
      <ShellInner title={title}>{children}</ShellInner>
    </SessionProvider>
  );
}
