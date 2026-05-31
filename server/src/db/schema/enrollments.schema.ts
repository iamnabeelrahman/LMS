import {
  check,
  index,
  integer,
  pgTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";
import { courses } from "./courses.schema.js";
import { batches } from "./batches.schema.js";
import { organizations } from "./organizations.schema.js";
import { sql } from "drizzle-orm";

export const courseEnrollments = pgTable(
  "course_enrollments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    studentId: integer("user_id")
      .references(() => users.id)
      .notNull(),

    courseId: integer("course_id").references(() => courses.id),

    batchId: integer("batch_id").references(() => batches.id),

    orderId: integer("order_id")
      .references(() => orders.id)
      .notNull(),

    purchasedPrice: integer("purchased_price"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueCourseEnrollment: unique().on(table.studentId, table.courseId),
    uniqueBatchEnrollment: unique().on(table.studentId, table.batchId),

    userIndex: index("enrollment_user_idx").on(table.studentId),
    courseIndex: index("enrollment_course_idx").on(table.courseId),
    batchIndex: index("enrollment_batch_idx").on(table.batchId),

    onlyOneItem: check(
      "only_one_item",
      sql`(
        (course_id IS NOT NULL AND batch_id IS NULL)
        OR
        (course_id IS NULL AND batch_id IS NOT NULL)
      )`,
    ),
  }),
);

export const orders = pgTable(
  "orders",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    organizationId: integer("organization_id")
      .references(() => organizations.id)
      .notNull(),

    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),

    itemType: varchar("item_type", { length: 50 })
      .$type<"course" | "batch">()
      .notNull(),

    itemId: integer("item_id").notNull(), // Polymorphic association to course or batch

    amount: integer("amount").notNull(),

    currency: varchar("currency", { length: 10 }).default("INR"),

    status: varchar("status", { length: 50 })
      .$type<"pending" | "paid" | "failed" | "refunded">()
      .default("pending"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIndex: index("orders_user_idx").on(table.userId),
    itemIndex: index("item_idx").on(table.itemType, table.itemId),
  }),
);
