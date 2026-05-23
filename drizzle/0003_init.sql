CREATE TYPE "public"."product_status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'author';--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'viewer';--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"meta_title" varchar(255),
	"meta_description" text,
	"og_title" varchar(255),
	"og_description" text,
	"og_image_url" text,
	"content" text,
	"draft" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"parent_id" integer,
	"image_id" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "product_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"description" text,
	"content" jsonb,
	"composition" text,
	"usage_instructions" text,
	"who_can_use" text,
	"benefits" jsonb,
	"differentials" jsonb,
	"product_category_id" integer,
	"image_id" integer,
	"gallery_images" jsonb,
	"seo_title" varchar(500),
	"seo_description" text,
	"brand" varchar(255),
	"is_kit" boolean DEFAULT false NOT NULL,
	"show_on_site" boolean DEFAULT true NOT NULL,
	"noindex" boolean DEFAULT false NOT NULL,
	"product_status" "product_status" DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"search_vector" "tsvector",
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "request_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"path" varchar(500) NOT NULL,
	"method" varchar(10) NOT NULL,
	"status_code" integer NOT NULL,
	"latency_ms" integer NOT NULL,
	"country" varchar(2),
	"city" varchar(100),
	"user_agent" text,
	"referer" text,
	"is_bot" boolean DEFAULT false NOT NULL,
	"content_length" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "excerpt" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "category_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "author_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ALTER COLUMN "copyright_text" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "authors" ADD COLUMN "supabase_id" uuid;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "supabase_id" uuid;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "supabase_url" text;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "blurhash" varchar(100);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "supabase_id" uuid;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "meta_title" varchar(500);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "meta_description" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "focus_keyword" varchar(255);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "secondary_keywords" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "og_title" varchar(500);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "og_description" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "og_image_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "schema_type" varchar(100);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "canonical_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "word_count" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "reading_time_minutes" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "seo_score" integer;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "seo_notes" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "last_seo_review_at" timestamp;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "noindex" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "nofollow" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "search_vector" "tsvector";--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "whatsapp" varchar(20);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "privacy_policy" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "robots_txt" text DEFAULT 'User-agent: *
Allow: /
Disallow: /admin
Disallow: /api';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "umami_website_id" varchar(100);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "umami_url" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "last_sync_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscribers" ADD COLUMN "name" varchar(255);--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_product_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."product_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_product_category_id_product_categories_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authors" ADD CONSTRAINT "authors_supabase_id_unique" UNIQUE("supabase_id");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_supabase_id_unique" UNIQUE("supabase_id");--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_supabase_url_unique" UNIQUE("supabase_url");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_supabase_id_unique" UNIQUE("supabase_id");