"use client";

import { AdminShell, AssinaturaSection } from "@brasa/admin";

export default function AssinaturaPage() {
  return (
    <AdminShell title="Assinatura">
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <AssinaturaSection />
      </div>
    </AdminShell>
  );
}
