import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const permissions = pgTable("permissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  name: varchar("name", { length: 100 }).notNull(),

  module: varchar("module", { length: 100 }).notNull(),

  action: varchar("action", { length: 50 }).notNull(),
});
