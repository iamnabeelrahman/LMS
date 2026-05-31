import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

export const courseEnrollments = pgTable("course_enrollments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["read", "unread"] })
    .default("unread")
    .notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  status: "read" | "unread";
  createdAt: Date;
}
