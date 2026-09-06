CREATE TABLE IF NOT EXISTS "customer_tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL
);--> statement-breakpoint
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "tax_percent" integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS "quantity_on_hand" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "description" text,
  ADD COLUMN IF NOT EXISTS "attributes" jsonb NOT NULL DEFAULT '[]'::jsonb;
