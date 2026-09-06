ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "tax_percent" integer NOT NULL DEFAULT 15,
  ADD COLUMN IF NOT EXISTS "quantity_on_hand" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "description" text,
  ADD COLUMN IF NOT EXISTS "attributes" jsonb NOT NULL DEFAULT '[]'::jsonb;
