"use client";

import AdminShell from "@/components/admin/AdminShell";
import DomainsView from "@/components/admin/DomainsView";

export default function DomainsPage() {
  return (
    <AdminShell title="Dominios">
      <DomainsView />
    </AdminShell>
  );
}
