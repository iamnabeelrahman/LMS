import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export type IUserInsert = typeof users.$inferInsert;
export type IUser = typeof users.$inferSelect;

export const users = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phoneNumber: varchar({ length: 20 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  // comparePassword: varchar({ length: 255 }).notNull(),
  avatar: varchar({ length: 255 }),
  systemRole: varchar("system_role", { length: 30 })
    .$type<"system_admin" | "moderator" | "user">()
    .default("user")
    .notNull(),
  isEmailVerified: integer().notNull().default(0) /* 0 for false, 1 for true */,
  isPhoneVerified: integer().notNull().default(0) /* 0 for false, 1 for true */,

  systemStatus: text("system_status", {
    enum: ["active", "blocked", "pending", "idle", "suspended", "deleted"],
  })
    .default("active")
    .notNull(),
  suspendReason: text("suspend_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
