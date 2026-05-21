"use client";

import AdminShell from "@/components/admin/AdminShell";
import EnvVarsView from "@/components/admin/EnvVarsView";

export default function EnvVarsPage() {
  return (
    <AdminShell title="Variaveis de Ambiente">
      <EnvVarsView />
    </AdminShell>
  );
}
