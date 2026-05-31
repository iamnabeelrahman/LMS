import {
  integer,
  pgTable,
  timestamp,
  varchar,
  primaryKey,
  text,
  boolean,
  jsonb,
  decimal,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { organizations } from "./organizations.schema.js";
import { users } from "./users.schema.js";

/* ============================================
   PROGRAMS (Academic Programs)
   Example: BTech Mechanical, Class 11, MBA
   ============================================ */

export const programs = pgTable("programs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  organizationId: integer("org_id")
    .references(() => organizations.id)
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 50 }), // BTECH-CS, CLASS-11

  description: text("description"),

  durationYears: integer("duration_years"), // 4 for BTech, 2 for Class 11-12
  durationType: varchar("duration_type", { length: 20 })
    .$type<"years" | "semesters" | "months">()
    .default("years"),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ============================================
   PROGRAM CURRICULUMS (Versioning)
   Example: UGC 2020, CBSE 2024, AICTE 2023
   ============================================ */

export const programCurriculums = pgTable("program_curriculums", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  programId: integer("program_id")
    .references(() => programs.id)
    .notNull(),

  version: varchar("version", { length: 50 }).notNull(), // "2020", "2024", "2023-24"
  name: varchar("name", { length: 255 }), // "CBSE 2024 Curriculum", "UGC 2023"

  description: text("description"),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),

  effectiveFrom: timestamp("effective_from"),
  effectiveTo: timestamp("effective_to"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ============================================
   ACADEMIC YEARS / SEMESTERS
   Flexible structure for different academic systems
   ============================================ */

export const academicTerms = pgTable("academic_terms", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  programCurriculumId: integer("program_curriculum_id")
    .references(() => programCurriculums.id)
    .notNull(),

  type: varchar("type", { length: 20 })
    .$type<"year" | "semester" | "trimester" | "module">()
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(), // "Year 1", "Semester 1", "Module 1"
  sequence: integer("sequence").notNull(), // 1, 2, 3...

  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* ============================================
   SUBJECTS (Courses within a curriculum)
   Example: Physics, Mathematics, Data Structures
   ============================================ */

export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  programCurriculumId: integer("program_curriculum_id")
    .references(() => programCurriculums.id)
    .notNull(), // Which curriculum this belongs to

  code: varchar("code", { length: 50 }).notNull(), // PHY101, CS201
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),

  credits: decimal("credits", { precision: 3, scale: 1 }), // 3.0, 4.5
  hoursPerWeek: integer("hours_per_week"),

  academicTermId: integer("academic_term_id").references(
    () => academicTerms.id,
  ), // Which year/semester this belongs to

  isElective: boolean("is_elective").default(false),
  isCore: boolean("is_core").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ============================================
   SUBJECT CURRICULUM (Topics/Lessons within a subject)
   Flexible structure that can be lectures, quizzes, assignments
   ============================================ */

export const subjectCurriculum = pgTable("subject_curriculum", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  subjectId: integer("subject_id")
    .references(() => subjects.id)
    .notNull(),

  type: varchar("type", { length: 50 })
    .$type<
      "lecture" | "assignment" | "quiz" | "practical" | "workshop" | "project"
    >()
    .notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  position: integer("position").default(0),
  duration: integer("duration"), // in minutes

  // For lectures
  videoUrl: varchar("video_url", { length: 500 }),
  videoThumbnail: varchar("video_thumbnail", { length: 500 }),
  videoLength: integer("video_length"), // in seconds

  // For assignments/quizzes
  maxScore: integer("max_score"),
  passingScore: integer("passing_score"),
  dueDate: timestamp("due_date"),

  // For quizzes - can store quiz structure in JSON
  quizData: jsonb("quiz_data"),

  isPublished: boolean("is_published").default(false),
  isRequired: boolean("is_required").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ============================================
   SUBJECT CURRICULUM RESOURCES
   Additional resources for curriculum items
   ============================================ */

export const curriculumResources = pgTable("curriculum_resources", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  curriculumId: integer("curriculum_id")
    .references(() => subjectCurriculum.id)
    .notNull(),

  title: varchar("title", { length: 255 }),
  type: varchar("type", { length: 50 }).$type<
    "document" | "link" | "file" | "video"
  >(),
  url: varchar("url", { length: 500 }),

  createdAt: timestamp("created_at").defaultNow(),
});

/* ============================================
   PROGRAM BATCHES (Actual batches of students)
   Example: BTech CS Batch 2024, Class 11 Batch 2025-26
   ============================================ */

export const programBatches = pgTable("program_batches", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  programId: integer("program_id")
    .references(() => programs.id)
    .notNull(),

  curriculumId: integer("curriculum_id")
    .references(() => programCurriculums.id)
    .notNull(),

  name: varchar("name", { length: 255 }).notNull(), // "Batch 2024", "Class of 2028"
  batchCode: varchar("batch_code", { length: 50 }), // BTECH2024, CLASS11-2025

  startYear: integer("start_year"),
  endYear: integer("end_year"),

  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),

  // Capacity management
  maxSeats: integer("max_seats"),
  currentEnrollment: integer("current_enrollment").default(0),
  waitlistCapacity: integer("waitlist_capacity").default(0),

  status: varchar("status", { length: 50 })
    .$type<"upcoming" | "active" | "completed" | "cancelled">()
    .default("upcoming"),

  metadata: jsonb("metadata"), // For flexible data like shift, campus, etc.

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ============================================
   BATCH SECTIONS
   Example: Section A, B, C (for dividing large batches)
   ============================================ */

export const batchSections = pgTable("batch_sections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  batchId: integer("batch_id")
    .references(() => programBatches.id)
    .notNull(),

  name: varchar("name", { length: 50 }).notNull(), // "A", "B", "Morning", "Evening"
  sectionCode: varchar("section_code", { length: 50 }),

  classTeacherId: integer("class_teacher_id").references(() => users.id),

  maxStudents: integer("max_students"),
  currentStudents: integer("current_students").default(0),

  roomNumber: varchar("room_number", { length: 50 }),
  schedule: jsonb("schedule"), // For storing class timings

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ============================================
   BATCH SUBJECT ASSIGNMENT
   Which subjects are taught in which term for this batch
   ============================================ */

export const batchSubjects = pgTable("batch_subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  batchId: integer("batch_id")
    .references(() => programBatches.id)
    .notNull(),

  subjectId: integer("subject_id")
    .references(() => subjects.id)
    .notNull(),

  academicTermId: integer("academic_term_id").references(
    () => academicTerms.id,
  ),

  teacherId: integer("teacher_id").references(() => users.id),

  // Schedule for this subject
  schedule: jsonb("schedule"), // Days and times
  roomNumber: varchar("room_number", { length: 50 }),

  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* ============================================
   STUDENT ENROLLMENT IN BATCH
   ============================================ */

export const studentBatchEnrollments = pgTable("student_batch_enrollments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  studentId: integer("student_id")
    .references(() => users.id) // Assuming students are users
    .notNull(),

  batchId: integer("batch_id")
    .references(() => programBatches.id)
    .notNull(),

  sectionId: integer("section_id").references(() => batchSections.id),

  enrollmentNumber: varchar("enrollment_number", { length: 100 }).unique(),
  rollNumber: varchar("roll_number", { length: 50 }),

  enrollmentDate: timestamp("enrollment_date").defaultNow(),

  status: varchar("status", { length: 50 })
    .$type<"active" | "graduated" | "dropped" | "transferred" | "waitlisted">()
    .default("active"),

  // Academic tracking
  currentYear: integer("current_year"),
  currentSemester: integer("current_semester"),

  metadata: jsonb("metadata"), // For any custom fields

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ============================================
   STUDENT SUBJECT ENROLLMENT
   Which subjects a student is enrolled in (for elective tracking)
   ============================================ */

export const studentSubjectEnrollments = pgTable(
  "student_subject_enrollments",
  {
    studentBatchId: integer("student_batch_id")
      .references(() => studentBatchEnrollments.id)
      .notNull(),

    batchSubjectId: integer("batch_subject_id")
      .references(() => batchSubjects.id)
      .notNull(),

    enrolledAt: timestamp("enrolled_at").defaultNow(),

    status: varchar("status", { length: 50 })
      .$type<"enrolled" | "dropped" | "completed">()
      .default("enrolled"),

    // For elective courses
    isElective: boolean("is_elective").default(false),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.studentBatchId, table.batchSubjectId] }),
  }),
);

/* ============================================
   STUDENT CURRICULUM PROGRESS
   Track progress through subject curriculum items
   ============================================ */

export const studentCurriculumProgress = pgTable(
  "student_curriculum_progress",
  {
    studentBatchId: integer("student_batch_id")
      .references(() => studentBatchEnrollments.id)
      .notNull(),

    curriculumId: integer("curriculum_id")
      .references(() => subjectCurriculum.id)
      .notNull(),

    status: varchar("status", { length: 50 })
      .$type<"not_started" | "in_progress" | "completed" | "failed">()
      .default("not_started"),

    score: decimal("score", { precision: 5, scale: 2 }),
    grade: varchar("grade", { length: 5 }),

    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    submittedAt: timestamp("submitted_at"),

    // For quizzes/assignments
    attempts: integer("attempts").default(0),
    answers: jsonb("answers"), // Store their answers

    // For lectures (watch time)
    watchTime: integer("watch_time"), // in seconds

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.studentBatchId, table.curriculumId] }),
    studentIdx: index("student_progress_idx").on(table.studentBatchId),
  }),
);

/* ============================================
   COURSES (Standalone courses like Udemy)
   For coaching, teacher_academy, or self-paced learning
   ============================================ */

export const courses = pgTable(
  "courses",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    organizationId: integer("org_id")
      .references(() => organizations.id)
      .notNull(),

    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description").notNull(),

    thumbnail: varchar("thumbnail", { length: 500 }),
    demoUrl: varchar("demo_url", { length: 500 }),

    level: varchar("level", { length: 50 }).$type<
      "beginner" | "intermediate" | "advanced" | "all_levels"
    >(),

    price: integer("price").default(0),
    estimatedPrice: integer("estimated_price"),

    teacherId: integer("teacher_id")
      .references(() => users.id)
      .notNull(),

    // Statistics
    ratings: decimal("ratings", { precision: 3, scale: 2 }).default("0"),
    totalReviews: integer("total_reviews").default(0),
    purchased: integer("purchased").default(0),

    isPublished: boolean("is_published").default(false),

    // For teacher_academy or its a direct course like udemy
    isSelfPaced: boolean("is_self_paced").default(true),
    estimatedDuration: integer("estimated_duration"), // in hours

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    uniqueSlugPerOrg: unique().on(table.slug, table.organizationId),
  }),
);

/* COURSE BENEFITS */
export const courseBenefits = pgTable("course_benefits", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  benefit: varchar("benefit", { length: 255 }).notNull(),
});

/* COURSE PREREQUISITES */
export const coursePrerequisites = pgTable("course_prerequisites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  prerequisite: varchar("prerequisite", { length: 255 }).notNull(),
});

/* COURSE SECTIONS (Modules) */
export const courseSections = pgTable("course_sections", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/* COURSE LESSONS */
export const courseLessons = pgTable("course_lessons", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sectionId: integer("section_id")
    .references(() => courseSections.id)
    .notNull(),

  type: varchar("type", { length: 50 })
    .$type<"video" | "text" | "quiz" | "assignment" | "resource">()
    .default("video"),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  // Video content
  videoUrl: varchar("video_url", { length: 500 }),
  videoThumbnail: varchar("video_thumbnail", { length: 500 }),
  videoLength: integer("video_length"), // in seconds
  videoPlayer: varchar("video_player", { length: 50 }),

  // Text content
  content: text("content"),

  // Quiz data
  quizData: jsonb("quiz_data"),

  position: integer("position").notNull(),
  isPreview: boolean("is_preview").default(false),
  isFree: boolean("is_free").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessonQuestions = pgTable("lesson_questions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  lessonId: integer("lesson_id")
    .references(() => courseLessons.id)
    .notNull(),

  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),

  question: varchar("question", { length: 2000 }),

  createdAt: timestamp("created_at").defaultNow(),
});

export const courseLinks = pgTable("course_links", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  lessonId: integer("lesson_id")
    .references(() => courseLessons.id)
    .notNull(),

  title: varchar("title", { length: 255 }),

  url: varchar("url", { length: 500 }),
});

/* COURSE LESSON RESOURCES */
export const lessonResources = pgTable("lesson_resources", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  lessonId: integer("lesson_id")
    .references(() => courseLessons.id)
    .notNull(),
  title: varchar("title", { length: 255 }),
  type: varchar("type", { length: 50 }).$type<"document" | "link" | "file">(),
  url: varchar("url", { length: 500 }),
});

/* STUDENT COURSE ENROLLMENT */
export const studentCourseEnrollments = pgTable("student_course_enrollments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  studentId: integer("student_id")
    .references(() => users.id)
    .notNull(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),

  enrolledAt: timestamp("enrolled_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: integer("progress").default(0), // Percentage

  paymentId: varchar("payment_id", { length: 255 }),
  amount: integer("amount"),

  status: varchar("status", { length: 50 })
    .$type<"active" | "completed" | "cancelled">()
    .default("active"),

  certificateIssued: boolean("certificate_issued").default(false),
  certificateUrl: varchar("certificate_url", { length: 500 }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* STUDENT COURSE LESSON PROGRESS */
export const studentLessonProgress = pgTable(
  "student_lesson_progress",
  {
    enrollmentId: integer("enrollment_id")
      .references(() => studentCourseEnrollments.id)
      .notNull(),

    lessonId: integer("lesson_id")
      .references(() => courseLessons.id)
      .notNull(),

    status: varchar("status", { length: 50 })
      .$type<"not_started" | "in_progress" | "completed">()
      .default("not_started"),

    watchTime: integer("watch_time"), // in seconds
    completedAt: timestamp("completed_at"),

    // For quizzes
    score: decimal("score", { precision: 5, scale: 2 }),
    attempts: integer("attempts").default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.enrollmentId, table.lessonId] }),
  }),
);

/* ============================================
   TAGS (For both programs and courses)
   ============================================ */

export const tags = pgTable("tags", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const programTags = pgTable(
  "program_tags",
  {
    programId: integer("program_id")
      .references(() => programs.id)
      .notNull(),
    tagId: integer("tag_id")
      .references(() => tags.id)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.programId, table.tagId] }),
  }),
);

export const courseTags = pgTable(
  "course_tags",
  {
    courseId: integer("course_id")
      .references(() => courses.id)
      .notNull(),
    tagId: integer("tag_id")
      .references(() => tags.id)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.courseId, table.tagId] }),
  }),
);

/* ============================================
   REVIEWS & Q&A (For both programs and courses)
   ============================================ */

export const programReviews = pgTable("program_reviews", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  programId: integer("program_id")
    .references(() => programs.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseReviews = pgTable("course_reviews", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const courseQuestions = pgTable("course_questions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  lessonId: integer("lesson_id").references(() => courseLessons.id),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  question: text("question").notNull(),
  isResolved: boolean("is_resolved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const questionReplies = pgTable("question_replies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  questionId: integer("question_id")
    .references(() => courseQuestions.id)
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  reply: text("reply").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ============================================
   ORGANIZATION SETTINGS (To handle different org types)
   ============================================ */

export const organizationSettings = pgTable("organization_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  organizationId: integer("org_id")
    .references(() => organizations.id)
    .notNull()
    .unique(),

  type: varchar("type", { length: 50 })
    .$type<"school" | "college" | "coaching" | "teacher_academy">()
    .notNull(),

  // Feature flags
  features: jsonb("features").default({}),

  // Academic settings
  academicStructure: varchar("academic_structure", { length: 20 })
    .$type<"yearly" | "semester" | "trimester" | "flexible">()
    .default("semester"),

  gradingSystem: varchar("grading_system", { length: 20 })
    .$type<"percentage" | "gpa" | "cgpa" | "letter">()
    .default("percentage"),

  // Course/LMS settings
  enableLms: boolean("enable_lms").default(true),
  enableCertificates: boolean("enable_certificates").default(false),
  enableDiscussionForums: boolean("enable_discussion_forums").default(true),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
