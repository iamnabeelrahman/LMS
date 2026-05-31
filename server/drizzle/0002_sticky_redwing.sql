ALTER TABLE "users" RENAME COLUMN "isverified" TO "isEmailVerified";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "system_role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isPhoneVerified" integer DEFAULT 0 NOT NULL;