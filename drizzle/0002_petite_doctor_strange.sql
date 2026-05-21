ALTER TABLE "site_settings" ADD COLUMN "supabase_url" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "supabase_anon_key" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "supabase_service_role_key" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "supabase_sync_enabled" boolean DEFAULT false;