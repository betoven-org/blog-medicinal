import type { CollectionConfig } from "payload";

export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  labels: { singular: "Inscrito", plural: "Inscritos" },
  admin: {
    useAsTitle: "email",
    group: "Configurações",
    defaultColumns: ["email", "createdAt"],
  },
  fields: [
    {
      name: "email",
      label: "E-mail",
      type: "email",
      required: true,
      unique: true,
    },
    {
      name: "active",
      label: "Ativo",
      type: "checkbox",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
  ],
};
