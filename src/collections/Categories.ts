import type { CollectionConfig } from "payload";

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: "Categoria", plural: "Categorias" },
  admin: {
    useAsTitle: "name",
    group: "Conteúdo",
  },
  fields: [
    {
      name: "name",
      label: "Nome",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
  ],
};
