import { z } from "zod";

// ── Helpers ─────────────────────────────────────────────────────────────────────

export function parseBody<T>(schema: z.ZodType<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join(", ");
    return { success: false as const, error: messages };
  }
  return { success: true as const, data: result.data };
}

// ── Posts ────────────────────────────────────────────────────────────────────────

export const createPostSchema = z.object({
  title: z.string().min(1, "Titulo e obrigatorio"),
  excerpt: z.string().min(1, "Excerpt e obrigatorio"),
  content: z.unknown().refine((v) => v != null, "Conteudo e obrigatorio"),
  categoryId: z.number({ error: "Categoria e obrigatoria" }).int(),
  authorId: z.number({ error: "Autor e obrigatorio" }).int(),
  heroImageId: z.number().int().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().max(500).nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  focusKeyword: z.string().max(255).nullable().optional(),
  secondaryKeywords: z.string().nullable().optional(),
  ogTitle: z.string().max(500).nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImageUrl: z.string().nullable().optional(),
  schemaType: z.string().max(100).nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  noindex: z.boolean().optional(),
  nofollow: z.boolean().optional(),
  seoScore: z.number().int().nullable().optional(),
  seoNotes: z.string().nullable().optional(),
});

export const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.unknown().optional(),
  categoryId: z.number().int().optional(),
  authorId: z.number().int().optional(),
  heroImageId: z.number().int().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  status: z.enum(["draft", "published"]).optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.string().nullable().optional(),
  metaTitle: z.string().max(500).nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  focusKeyword: z.string().max(255).nullable().optional(),
  secondaryKeywords: z.string().nullable().optional(),
  ogTitle: z.string().max(500).nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImageUrl: z.string().nullable().optional(),
  schemaType: z.string().max(100).nullable().optional(),
  canonicalUrl: z.string().nullable().optional(),
  noindex: z.boolean().optional(),
  nofollow: z.boolean().optional(),
  wordCount: z.number().int().nullable().optional(),
  readingTimeMinutes: z.number().int().nullable().optional(),
  seoScore: z.number().int().nullable().optional(),
  seoNotes: z.string().nullable().optional(),
  lastSeoReviewAt: z.string().nullable().optional(),
  approvedAt: z.string().nullable().optional(),
});

// ── Bulk actions ────────────────────────────────────────────────────────────────

export const bulkActionSchema = z.object({
  ids: z.array(z.number().int()).min(1, "IDs obrigatorios"),
  action: z.enum(["delete", "publish", "unpublish"]),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int()).min(1, "IDs obrigatorios"),
  action: z.literal("delete"),
});

// ── Products ────────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  description: z.string().nullable().optional(),
  content: z.unknown().optional(),
  composition: z.string().nullable().optional(),
  usageInstructions: z.string().nullable().optional(),
  whoCanUse: z.string().nullable().optional(),
  benefits: z.unknown().optional(),
  differentials: z.unknown().optional(),
  productCategoryId: z.number().int().nullable().optional(),
  imageId: z.number().int().nullable().optional(),
  galleryImages: z.unknown().optional(),
  seoTitle: z.string().max(500).nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  brand: z.string().max(255).nullable().optional(),
  isKit: z.boolean().optional(),
  showOnSite: z.boolean().optional(),
  noindex: z.boolean().optional(),
  status: z.enum(["draft", "published"]).optional(),
  featured: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ── Categories ──────────────────────────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  description: z.string().nullable().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
});

// ── Product Categories ──────────────────────────────────────────────────────────

export const createProductCategorySchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  description: z.string().nullable().optional(),
  imageId: z.number().int().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateProductCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  imageId: z.number().int().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

// ── Authors ─────────────────────────────────────────────────────────────────────

export const createAuthorSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  bio: z.string().nullable().optional(),
  avatarId: z.number().int().nullable().optional(),
});

export const updateAuthorSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().nullable().optional(),
  avatarId: z.number().int().nullable().optional(),
});

// ── Users ───────────────────────────────────────────────────────────────────────

const userRoles = ["admin", "editor", "author", "viewer"] as const;

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome e obrigatorio"),
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres"),
  role: z.enum(userRoles).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email("Email invalido").optional(),
  password: z.string().min(6, "Senha deve ter no minimo 6 caracteres").optional(),
  role: z.enum(userRoles).optional(),
});

// ── Pages ───────────────────────────────────────────────────────────────────────

export const createPageSchema = z.object({
  title: z.string().min(1, "Titulo e obrigatorio"),
  slug: z.string().min(1, "Slug e obrigatorio"),
});

export const updatePageSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().nullable().optional(),
  metaTitle: z.string().max(255).nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  ogTitle: z.string().max(255).nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImageUrl: z.string().nullable().optional(),
});

// ── Settings ────────────────────────────────────────────────────────────────────

export const updateSettingsSchema = z.object({
  siteName: z.string().max(255).optional(),
  siteDescription: z.string().nullable().optional(),
  logoId: z.number().int().nullable().optional(),
  faviconId: z.number().int().nullable().optional(),
  whatsapp: z.string().max(20).nullable().optional(),
  facebook: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  youtube: z.string().nullable().optional(),
  footerText: z.string().nullable().optional(),
  copyrightText: z.string().nullable().optional(),
  newsletterTitle: z.string().max(255).nullable().optional(),
  newsletterDescription: z.string().nullable().optional(),
  newsletterConsent: z.string().nullable().optional(),
  seoTitle: z.string().max(255).nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  seoKeywords: z.string().nullable().optional(),
  privacyPolicy: z.string().nullable().optional(),
  robotsTxt: z.string().nullable().optional(),
  supabaseUrl: z.string().nullable().optional(),
  supabaseAnonKey: z.string().nullable().optional(),
  supabaseServiceRoleKey: z.string().nullable().optional(),
  supabaseSyncEnabled: z.boolean().optional(),
});
