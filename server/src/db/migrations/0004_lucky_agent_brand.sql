ALTER TYPE "quotation_status" ADD VALUE IF NOT EXISTS 'draft';--> statement-breakpoint
ALTER TYPE "quotation_status" ADD VALUE IF NOT EXISTS 'pending_approval';--> statement-breakpoint
ALTER TYPE "quotation_status" ADD VALUE IF NOT EXISTS 'approved';--> statement-breakpoint
ALTER TYPE "quotation_status" ADD VALUE IF NOT EXISTS 'rejected';--> statement-breakpoint
ALTER TYPE "quotation_status" ADD VALUE IF NOT EXISTS 'revision_required';--> statement-breakpoint
ALTER TYPE "quotation_status" ADD VALUE IF NOT EXISTS 'fulfillment';--> statement-breakpoint
ALTER TYPE "quotation_status" ADD VALUE IF NOT EXISTS 'confirmed';--> statement-breakpoint
ALTER TYPE "quotation_status" ADD VALUE IF NOT EXISTS 'under_negotiation';--> statement-breakpoint
DROP INDEX IF EXISTS "quotations_stalled_scan_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quotations_stalled_scan_idx" ON "quotations" USING btree ("last_activity_at") WHERE "quotations"."status" IN ('draft', 'under_negotiation');