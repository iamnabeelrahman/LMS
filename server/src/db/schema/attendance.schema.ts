import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { batches } from "./batches.schema.js";
import { users } from "./users.schema.js";

export const attendance = pgTable("attendance", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  batchId: integer("batch_id")
    .references(() => batches.id)
    .notNull(),

  studentId: integer("student_id")
    .references(() => users.id)
    .notNull(),

  date: timestamp("date").notNull(),

  status: varchar("status", { length: 10 })
    .$type<"present" | "absent">()
    .notNull(),
});
