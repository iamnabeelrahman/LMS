import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations.schema.js";
import { relations } from "drizzle-orm";

export const paymentIntegrations = pgTable("payment_integrations", {
  id: serial("id").primaryKey(),

  organizationId: integer("organization_id")
    .notNull()
    .references(() => organizations.id),

  provider: varchar("provider", { length: 50 })
    .$type<"stripe" | "razorpay">()
    .notNull(),

  config: jsonb("config").notNull(),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentIntegrationsRelations = relations(
  paymentIntegrations,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [paymentIntegrations.organizationId],
      references: [organizations.id],
    }),
  }),
);
