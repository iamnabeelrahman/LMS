import {
  integer,
  pgTable,
  primaryKey,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema.js";
import { organizations } from "./organizations.schema.js";

/* COURSES */

// export const courses = pgTable(
//   "courses",
//   {
//     id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

//     title: varchar("title", { length: 255 }).notNull(),

//     slug: varchar("slug", { length: 255 }).notNull(),

//     description: varchar("description", { length: 2000 }).notNull(),

//     thumbnail: varchar("thumbnail", { length: 500 }).notNull(),

//     demoUrl: varchar("demo_url", { length: 500 }).notNull(),

//     level: varchar("level", { length: 50 }),

//     price: integer("price").default(0),

//     estimatedPrice: integer("estimated_price"),

//     teacherId: integer("teacher_id")
//       .references(() => users.id)
//       .notNull(),

//     organizationId: integer("org_id")
//       .references(() => organizations.id)
//       .notNull(),

//     ratings: integer("ratings").default(0),

//     totalReviews: integer("total_reviews").default(0),

//     purchased: integer("purchased").default(0),

//     isPublished: integer("is_published").default(0),

//     createdAt: timestamp("created_at").defaultNow(),

//     updatedAt: timestamp("updated_at").defaultNow(),
//   },
//   (table) => ({
//     uniqueSlugPerOrg: unique().on(table.slug, table.organizationId),
//   }),
// );

/* COURSE BENEFITS */

// export const courseBenefits = pgTable("course_benefits", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

//   courseId: integer("course_id")
//     .references(() => courses.id)
//     .notNull(),

//   title: varchar("title", { length: 255 }).notNull(),
// });

/* COURSE PREREQUISITES */

// export const coursePrerequisites = pgTable("course_prerequisites", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

//   courseId: integer("course_id")
//     .references(() => courses.id)
//     .notNull(),

//   title: varchar("title", { length: 255 }).notNull(),
// });

/* COURSE TAGS */

// export const tags = pgTable("tags", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

//   name: varchar("name", { length: 100 }).notNull().unique(),

//   slug: varchar("slug", { length: 120 }).notNull().unique(),

//   createdAt: timestamp("created_at").defaultNow(),
// });

// export const courseTags = pgTable(
//   "course_tags",
//   {
//     courseId: integer("course_id")
//       .references(() => courses.id)
//       .notNull(),

//     tagId: integer("tag_id")
//       .references(() => tags.id)
//       .notNull(),
//   },
//   (table) => ({
//     pk: primaryKey({ columns: [table.courseId, table.tagId] }),
//   }),
// );

/* COURSE SECTIONS */
// export const courseSections = pgTable("course_sections", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

//   courseId: integer("course_id")
//     .references(() => courses.id)
//     .notNull(),

//   title: varchar("title", { length: 255 }).notNull(),

//   position: integer("position").notNull(),

//   createdAt: timestamp("created_at").defaultNow(),
// });

/* COURSE LESSONS */
// export const courseLessons = pgTable("course_lessons", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

//   sectionId: integer("section_id")
//     .references(() => courseSections.id)
//     .notNull(),

//   // need to add type of content - video, text, quiz etc

//   title: varchar("title", { length: 255 }).notNull(),

//   description: varchar("description", { length: 2000 }),

//   videoUrl: varchar("video_url", { length: 500 }),

//   videoThumbnail: varchar("video_thumbnail", { length: 500 }),

//   videoLength: integer("video_length"),

//   videoPlayer: varchar("video_player", { length: 50 }),

//   position: integer("position").notNull(),

//   isPreview: integer("is_preview").default(0),

//   createdAt: timestamp("created_at").defaultNow(),
//   updatedAt: timestamp("updated_at").defaultNow(),
// });

/* LESSON RESOURCES */

// export const lessonResources = pgTable("lesson_resources", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

//   lessonId: integer("lesson_id")
//     .references(() => courseLessons.id)
//     .notNull(),

//   title: varchar("title", { length: 255 }),

//   url: varchar("url", { length: 500 }),
// });

/* LESSON QUESTIONS */
//  not moved to academic.schema.ts as it is not directly related to course content but more about student engagement
// export const lessonQuestions = pgTable("lesson_questions", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

//   lessonId: integer("lesson_id")
//     .references(() => courseLessons.id)
//     .notNull(),

//   userId: integer("user_id")
//     .references(() => users.id)
//     .notNull(),

//   question: varchar("question", { length: 2000 }),

//   createdAt: timestamp("created_at").defaultNow(),
// });  

//  not moved
// export const courseLinks = pgTable("course_links", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

//   lessonId: integer("lesson_id")
//     .references(() => courseLessons.id)
//     .notNull(),

//   title: varchar("title", { length: 255 }),

//   url: varchar("url", { length: 500 }),
// });

/* QUESTION REPLIES */

// export const questionReplies = pgTable("question_replies", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

//   questionId: integer("question_id")
//     .references(() => lessonQuestions.id)
//     .notNull(),

//   userId: integer("user_id")
//     .references(() => users.id)
//     .notNull(),

//   reply: varchar("reply", { length: 2000 }),

//   createdAt: timestamp("created_at").defaultNow(),
// });

/* COURSE REVIEWS */

// export const courseReviews = pgTable("course_reviews", {
//   id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

//   courseId: integer("course_id")
//     .references(() => courses.id)
//     .notNull(),

//   userId: integer("user_id")
//     .references(() => users.id)
//     .notNull(),

//   rating: integer("rating").notNull(),

//   comment: varchar("comment", { length: 2000 }),

//   createdAt: timestamp("created_at").defaultNow(),
// });

/* REVIEW REPLIES */

export const reviewReplies = pgTable("review_replies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  reviewId: integer("review_id")
    .references(() => courseReviews.id)
    .notNull(),

  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),

  reply: varchar("reply", { length: 2000 }),

  createdAt: timestamp("created_at").defaultNow(),
});
