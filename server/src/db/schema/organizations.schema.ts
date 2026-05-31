import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

export const organizations = pgTable("organizations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  name: varchar("name", { length: 255 }).notNull(),

  type: varchar("type", { length: 30 })
    .$type<"school" | "College" | "coaching" | "teacher_academy">()
    .notNull(),

  ownerId: integer("owner_id").references(() => users.id),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
});

export const organizationMembers = pgTable("organization_members", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  organizationId: integer("org_id")
    .references(() => organizations.id)
    .notNull(),

  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),

  role: varchar("role", { length: 30 })
    .$type<"admin" | "teacher" | "staff">()
    .notNull(),

  joinedAt: timestamp("joined_at").defaultNow(),
});

export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  organizationId: integer("org_id")
    .references(() => organizations.id)
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(),
});

export const departmentMembers = pgTable("department_members", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  departmentId: integer("department_id")
    .references(() => departments.id)
    .notNull(),

  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
});

export const memberPermissions = pgTable("member_permissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  memberId: integer("member_id")
    .references(() => organizationMembers.id)
    .notNull(),

  module: varchar("module", { length: 100 }).notNull(), // setting

  action: varchar("action", { length: 100 }).notNull(), // read

  createdAt: timestamp("created_at").defaultNow(),
});

export const students = pgTable("students", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  organizationId: integer("org_id")
    .references(() => organizations.id)
    .notNull(),

  userId: integer("user_id").references(() => users.id),

  admissionNumber: varchar("admission_number", { length: 50 }),

  joinedAt: timestamp("joined_at").defaultNow(),
});
