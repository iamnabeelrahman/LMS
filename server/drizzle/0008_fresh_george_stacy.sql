ALTER TABLE "courses" DROP CONSTRAINT "courses_slug_unique";--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_slug_org_id_unique" UNIQUE("slug","org_id");