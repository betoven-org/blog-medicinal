import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Mídia", plural: "Mídias" },
  admin: {
    group: "Conteúdo",
  },
  upload: {
    staticDir: "../public/media",
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300 },
      { name: "card", width: 768, height: 432 },
      { name: "hero", width: 1920, height: 800 },
    ],
  },
  fields: [
    {
      name: "alt",
      label: "Texto Alternativo",
      type: "text",
      required: true,
    },
  ],
};
