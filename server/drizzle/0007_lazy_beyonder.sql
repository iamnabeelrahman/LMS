ALTER TABLE "member_permissions" RENAME COLUMN "permission" TO "action";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "system_status" text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "suspend_reason" text;