import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.schema.js";
import { courses } from "./academic.schema.js";
import { users } from "./users.schema.js";

export const batches = pgTable("batches", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  name: varchar("name", { length: 255 }).notNull(),

  organizationId: integer("org_id")
    .references(() => organizations.id)
    .notNull(),

  courseId: integer("course_id").references(() => courses.id),

  teacherId: integer("teacher_id")
    .references(() => users.id)
    .notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

export const programs = pgTable("programs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  organizationId: integer("org_id")
    .references(() => organizations.id)
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(), // BTech Mechanical

  // level: varchar("level", { length: 100 }), // UG / School

  durationYears: integer("duration_years"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const programCurriculums = pgTable("program_curriculums", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  programId: integer("program_id")
    .references(() => programs.id)
    .notNull(),

  version: varchar("version", { length: 50 }), // 2020, 2025

  isActive: integer("is_active").default(1),

  createdAt: timestamp("created_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  curriculumId: integer("curriculum_id")
    .references(() => programCurriculums.id)
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(),

  year: integer("year"), // 1st year, 2nd year

  semester: integer("semester"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const subjectCurriculum = pgTable("subject_curriculum", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  subjectId: integer("subject_id")
    .references(() => subjects.id)
    .notNull(),

  title: varchar("title", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow(),
});

export const programBatches = pgTable("program_batches", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  programId: integer("program_id")
    .references(() => programs.id)
    .notNull(),

  curriculumId: integer("curriculum_id")
    .references(() => programCurriculums.id)
    .notNull(),

  startYear: integer("start_year"),

  endYear: integer("end_year"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const batchSections = pgTable("batch_sections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  batchId: integer("batch_id")
    .references(() => programBatches.id)
    .notNull(),

  name: varchar("name", { length: 10 }), // A,B,C

  teacherId: integer("teacher_id").references(() => users.id),

  createdAt: timestamp("created_at").defaultNow(),
});

// school -> Don Bosco Hisgh School
// School Program -> Mechanical Engineering (Btech)
// Program Year -> 2024-2028 Mechanical Engineering Batch
// ProgramYEarSubjects -> Workships, physics, mathemarixs, chamistry
// ssubject_curriculum -> syllabus of physics, syllabus of mathematics, syllabus of chemistry, quiz, assignments etc
// enrollments -> students's enrollmenst in ProgramYEarSubjects
// studentBatch -> connected with subject_curriculum, many to many enrollment