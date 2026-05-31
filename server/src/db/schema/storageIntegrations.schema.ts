import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations.schema.js";
import { relations } from "drizzle-orm";

export const storageIntegrations = pgTable("storage_integrations", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id),
  provider: varchar("provider", { length: 50 })
    .$type<"aws_s3" | "google_drive" | "cloudinary">()
    .notNull(),
  config: jsonb("config").notNull(),
  isActive: boolean("is_active").default(true),
  region: text("region"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const storageIntegrationsRelations = relations(
  storageIntegrations,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [storageIntegrations.organizationId],
      references: [organizations.id],
    }),
  }),
);
