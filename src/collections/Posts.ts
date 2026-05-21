import type { CollectionConfig, CollectionBeforeChangeHook, CollectionBeforeValidateHook } from "payload";

/**
 * Gera um slug em kebab-case a partir de um texto.
 * Remove acentos, caracteres especiais, e normaliza espaços.
 */
function generateSlug(text: string): string {
  return text
    .normalize("NFD")                   // Decompõe acentos (á → a + ́)
    .replace(/[\u0300-\u036f]/g, "")    // Remove diacríticos
    .toLowerCase()
    .replace(/[çÇ]/g, "c")             // ç → c (caso não coberto pelo NFD)
    .replace(/[ñÑ]/g, "n")             // ñ → n
    .replace(/[^a-z0-9\s-]/g, "")      // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, "-")              // Espaços → hífens
    .replace(/-+/g, "-");              // Múltiplos hífens → um hífen
}

/**
 * Hook beforeValidate: auto-gera slug a partir do título se estiver vazio.
 */
const autoGenerateSlug: CollectionBeforeValidateHook = ({ data }) => {
  if (data && (!data.slug || data.slug.trim() === "") && data.title) {
    data.slug = generateSlug(data.title);
  }
  return data;
};

/**
 * Hook beforeChange: define publishedAt automaticamente ao publicar.
 */
const autoSetPublishedAt: CollectionBeforeChangeHook = ({ data }) => {
  if (data && data.status === "published" && !data.publishedAt) {
    data.publishedAt = new Date().toISOString();
  }
  return data;
};

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Post", plural: "Posts" },
  defaultSort: "-publishedAt",
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 5,
  },
  admin: {
    useAsTitle: "title",
    group: "Conteúdo",
    defaultColumns: ["title", "status", "category", "publishedAt", "updatedAt"],
    listSearchableFields: ["title", "slug", "excerpt"],
  },
  hooks: {
    beforeValidate: [autoGenerateSlug],
    beforeChange: [autoSetPublishedAt],
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
      name: "coverUrl",
      label: "URL externa da capa",
      type: "text",
      admin: {
        description: "URL de imagem externa (ex: Framer CDN). Tem prioridade sobre o upload.",
        position: "sidebar",
      },
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
