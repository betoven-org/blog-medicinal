import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  timestamp,
  integer,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["admin", "editor"]);
export const postStatusEnum = pgEnum("post_status", ["draft", "published"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "overdue",
  "suspended",
]);

// ── Users ──────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").default("editor").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// ── Categories ─────────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// ── Media ──────────────────────────────────────────────────────────────────────

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  alt: varchar("alt", { length: 255 }).notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  cardUrl: text("card_url"),
  heroUrl: text("hero_url"),
  mimeType: varchar("mime_type", { length: 100 }),
  size: integer("size"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

// ── Authors ────────────────────────────────────────────────────────────────────

export const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  bio: text("bio"),
  avatarId: integer("avatar_id").references(() => media.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// ── Posts ───────────────────────────────────────────────────────────────────────

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: jsonb("content").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  authorId: integer("author_id")
    .notNull()
    .references(() => authors.id),
  heroImageId: integer("hero_image_id").references(() => media.id, {
    onDelete: "set null",
  }),
  coverUrl: text("cover_url"),
  status: postStatusEnum("status").default("draft").notNull(),
  featured: boolean("featured").default(false).notNull(),
  publishedAt: timestamp("published_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// ── Tags ───────────────────────────────────────────────────────────────────────

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  tag: varchar("tag", { length: 100 }).notNull(),
});

// ── Subscribers ────────────────────────────────────────────────────────────────

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
});

// ── Site Settings ──────────────────────────────────────────────────────────────

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 255 }).default("Medicinal na Web"),
  siteDescription: text("site_description"),
  logoId: integer("logo_id").references(() => media.id, {
    onDelete: "set null",
  }),
  faviconId: integer("favicon_id").references(() => media.id, {
    onDelete: "set null",
  }),
  facebook: text("facebook"),
  instagram: text("instagram"),
  youtube: text("youtube"),
  footerText: text("footer_text"),
  copyrightText: varchar("copyright_text", { length: 255 }),
  newsletterTitle: varchar("newsletter_title", { length: 255 }),
  newsletterDescription: text("newsletter_description"),
  newsletterConsent: text("newsletter_consent"),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  supabaseUrl: text("supabase_url"),
  supabaseAnonKey: text("supabase_anon_key"),
  supabaseServiceRoleKey: text("supabase_service_role_key"),
  supabaseSyncEnabled: boolean("supabase_sync_enabled").default(false),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// ── Subscriptions ─────────────────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().unique(),
  status: subscriptionStatusEnum("status").default("active").notNull(),
  nextDueDate: timestamp("next_due_date", { mode: "string" }).notNull(),
  graceDays: integer("grace_days").default(7).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

// ── Relations ──────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, () => ({}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const mediaRelations = relations(media, () => ({}));

export const authorsRelations = relations(authors, ({ one }) => ({
  avatar: one(media, {
    fields: [authors.avatarId],
    references: [media.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  author: one(authors, {
    fields: [posts.authorId],
    references: [authors.id],
  }),
  heroImage: one(media, {
    fields: [posts.heroImageId],
    references: [media.id],
  }),
  tags: many(tags),
}));

export const tagsRelations = relations(tags, ({ one }) => ({
  post: one(posts, {
    fields: [tags.postId],
    references: [posts.id],
  }),
}));

export const subscribersRelations = relations(subscribers, () => ({}));

export const siteSettingsRelations = relations(siteSettings, ({ one }) => ({
  logo: one(media, {
    fields: [siteSettings.logoId],
    references: [media.id],
  }),
  favicon: one(media, {
    fields: [siteSettings.faviconId],
    references: [media.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, () => ({}));
