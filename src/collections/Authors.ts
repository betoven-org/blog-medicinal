import type { CollectionConfig } from "payload";

export const Authors: CollectionConfig = {
  slug: "authors",
  labels: { singular: "Autor", plural: "Autores" },
  admin: {
    useAsTitle: "name",
    group: "Conteúdo",
    description: "Autores que assinam os posts do blog. Não têm acesso ao painel.",
  },
  fields: [
    {
      name: "name",
      label: "Nome",
      type: "text",
      required: true,
    },
    {
      name: "avatar",
      label: "Avatar",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "bio",
      label: "Biografia",
      type: "textarea",
    },
  ],
};
