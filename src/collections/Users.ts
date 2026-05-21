import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Usuário", plural: "Usuários" },
  auth: true,
  admin: {
    useAsTitle: "name",
    group: "Configurações",
    description:
      "Usuários com acesso ao painel administrativo. Ao criar, um convite é enviado por e-mail via Supabase.",
  },
  fields: [
    {
      name: "name",
      label: "Nome",
      type: "text",
      required: true,
    },
    {
      name: "role",
      label: "Perfil",
      type: "select",
      defaultValue: "editor",
      options: [
        { label: "Administrador", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      admin: { position: "sidebar" },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation }) => {
        if (operation !== "create") return doc;

        try {
          const { getSupabaseAdmin } = await import("@/lib/supabase");
          const supabase = getSupabaseAdmin();
          const siteUrl =
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

          await supabase.auth.admin.inviteUserByEmail(doc.email, {
            data: {
              name: doc.name,
              role: doc.role,
              payload_id: doc.id,
            },
            redirectTo: `${siteUrl}/admin`,
          });

          console.log(`Convite enviado para ${doc.email}`);
        } catch (error) {
          console.warn(
            `Falha ao enviar convite para ${doc.email}:`,
            error instanceof Error ? error.message : error
          );
        }

        return doc;
      },
    ],
  },
};
