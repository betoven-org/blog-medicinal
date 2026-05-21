CREATE TYPE "public"."subscription_status" AS ENUM('active', 'overdue', 'suspended');--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"next_due_date" timestamp NOT NULL,
	"grace_days" integer DEFAULT 7 NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_price_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_tenant_id_unique" UNIQUE("tenant_id")
);
