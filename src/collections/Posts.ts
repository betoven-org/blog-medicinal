import type { CollectionConfig } from "payload";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Post", plural: "Posts" },
  admin: {
    useAsTitle: "title",
    group: "Conteúdo",
    defaultColumns: ["title", "category", "author", "status", "publishedAt"],
  },
  fields: [
    {
      name: "title",
      label: "Título",
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
    {
      name: "excerpt",
      label: "Resumo",
      type: "textarea",
      required: true,
    },
    {
      name: "heroImage",
      label: "Imagem de Capa",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "content",
      label: "Conteúdo",
      type: "richText",
      required: true,
    },
    {
      name: "category",
      label: "Categoria",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
    {
      name: "author",
      label: "Autor",
      type: "relationship",
      relationTo: "authors",
      required: true,
    },
    {
      name: "tags",
      label: "Tags",
      type: "array",
      fields: [
        {
          name: "tag",
          type: "text",
        },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Rascunho", value: "draft" },
        { label: "Publicado", value: "published" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "featured",
      label: "Destaque",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "publishedAt",
      label: "Data de Publicação",
      type: "date",
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayOnly",
        },
      },
    },
  ],
};
