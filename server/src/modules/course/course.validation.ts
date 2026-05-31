// course.validation.ts (updated with new schemas)
import { z } from "zod";

// Existing schemas...
export const createCourseSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(2000),
  thumbnail: z.string().url().optional(),
  demoUrl: z.string().url().optional(),
  level: z.string().max(50).optional(),
  price: z.number().int().min(0).optional().default(0),
  estimatedPrice: z.number().int().min(0).optional(),
  tags: z.array(z.string().max(100)).optional(),
  benefits: z
    .array(
      z.object({
        title: z.string().max(255),
      }),
    )
    .optional(),
  prerequisites: z
    .array(
      z.object({
        title: z.string().max(255),
      }),
    )
    .optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createSectionSchema = z.object({
  title: z.string().min(1).max(255),
  position: z.number().int().min(0).optional(),
});

export const updateSectionSchema = createSectionSchema.partial();

export const createLessonSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  videoUrl: z.string().url().optional(),
  videoThumbnail: z.string().url().optional(),
  videoLength: z.number().int().min(0).optional(),
  videoPlayer: z.string().max(50).optional(),
  position: z.number().int().min(0).optional(),
  isPreview: z.boolean().optional(),
  links: z
    .array(
      z.object({
        title: z.string().max(255),
        url: z.string().url(),
      }),
    )
    .optional(),
  resources: z
    .array(
      z.object({
        title: z.string().max(255),
        url: z.string().url(),
      }),
    )
    .optional(),
});

export const updateLessonSchema = createLessonSchema.partial();

// New schemas for Program Management
export const createProgramSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().max(50).optional(),
  description: z.string().optional(),
  durationYears: z.number().int().min(0).optional(),
  durationType: z
    .enum(["years", "semesters", "months"])
    .optional()
    .default("years"),
  isActive: z.boolean().optional().default(true),
  tags: z.array(z.string().max(100)).optional(),
});

export const updateProgramSchema = createProgramSchema.partial();

export const createCurriculumSchema = z.object({
  version: z.string().max(50),
  name: z.string().max(255).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  isDefault: z.boolean().optional().default(false),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
});

export const updateCurriculumSchema = createCurriculumSchema.partial();

export const createAcademicTermSchema = z.object({
  type: z.enum(["year", "semester", "trimester", "module"]),
  name: z.string().max(255),
  sequence: z.number().int(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const createSubjectSchema = z.object({
  code: z.string().max(50),
  name: z.string().max(255),
  description: z.string().optional(),
  credits: z.number().min(0).max(999).optional(),
  hoursPerWeek: z.number().int().min(0).optional(),
  academicTermId: z.number().int().optional(),
  isElective: z.boolean().optional().default(false),
  isCore: z.boolean().optional().default(true),
  tags: z.array(z.string().max(100)).optional(),
});

export const updateSubjectSchema = createSubjectSchema.partial();

export const createSubjectCurriculumSchema = z.object({
  type: z.enum([
    "lecture",
    "assignment",
    "quiz",
    "practical",
    "workshop",
    "project",
  ]),
  title: z.string().max(255),
  description: z.string().optional(),
  position: z.number().int().min(0).optional().default(0),
  duration: z.number().int().min(0).optional(),
  videoUrl: z.string().url().optional(),
  videoThumbnail: z.string().url().optional(),
  videoLength: z.number().int().min(0).optional(),
  maxScore: z.number().int().min(0).optional(),
  passingScore: z.number().int().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  quizData: z.any().optional(),
  isPublished: z.boolean().optional().default(false),
  isRequired: z.boolean().optional().default(true),
  resources: z
    .array(
      z.object({
        title: z.string().max(255),
        type: z.enum(["document", "link", "file", "video"]),
        url: z.string().url(),
      }),
    )
    .optional(),
});

export const updateSubjectCurriculumSchema =
  createSubjectCurriculumSchema.partial();

// Batch schemas
export const createBatchSchema = z.object({
  name: z.string().max(255),
  batchCode: z.string().max(50).optional(),
  curriculumId: z.number().int(),
  startYear: z.number().int().min(1900).max(2100).optional(),
  endYear: z.number().int().min(1900).max(2100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  maxSeats: z.number().int().min(0).optional(),
  waitlistCapacity: z.number().int().min(0).optional().default(0),
  status: z
    .enum(["upcoming", "active", "completed", "cancelled"])
    .optional()
    .default("upcoming"),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateBatchSchema = createBatchSchema.partial();

export const createBatchSectionSchema = z.object({
  name: z.string().max(50),
  sectionCode: z.string().max(50).optional(),
  classTeacherId: z.number().int().optional(),
  maxStudents: z.number().int().min(0).optional(),
  roomNumber: z.string().max(50).optional(),
  schedule: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateBatchSectionSchema = createBatchSectionSchema.partial();

export const assignBatchSubjectSchema = z.object({
  subjectId: z.number().int(),
  academicTermId: z.number().int().optional(),
  teacherId: z.number().int().optional(),
  schedule: z.record(z.string(), z.any()).optional(),
  roomNumber: z.string().max(50).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Enrollment schemas
export const enrollStudentSchema = z.object({
  studentId: z.number().int(),
  sectionId: z.number().int().optional(),
  enrollmentNumber: z.string().max(100).optional(),
  rollNumber: z.string().max(50).optional(),
  currentYear: z.number().int().optional(),
  currentSemester: z.number().int().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateEnrollmentSchema = z.object({
  sectionId: z.number().int().optional(),
  rollNumber: z.string().max(50).optional(),
  status: z
    .enum(["active", "graduated", "dropped", "transferred", "waitlisted"])
    .optional(),
  currentYear: z.number().int().optional(),
  currentSemester: z.number().int().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const updateProgressSchema = z.object({
  status: z.enum(["not_started", "in_progress", "completed", "failed"]),
  score: z.number().min(0).max(100).optional(),
  grade: z.string().max(5).optional(),
  watchTime: z.number().int().min(0).optional(),
  answers: z.any().optional(),
});

// Organization settings schema
export const organizationSettingsSchema = z.object({
  type: z.enum(["school", "college", "coaching", "teacher_academy"]).optional(),
  features: z.record(z.string(), z.any()).optional(),
  academicStructure: z
    .enum(["yearly", "semester", "trimester", "flexible"])
    .optional(),
  gradingSystem: z.enum(["percentage", "gpa", "cgpa", "letter"]).optional(),
  enableLms: z.boolean().optional(),
  enableCertificates: z.boolean().optional(),
  enableDiscussionForums: z.boolean().optional(),
});

// File upload validation
export const uploadFileSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  filePurpose: z.enum(["thumbnail", "video", "resource", "document"]),
  courseId: z.number().optional(),
  lessonId: z.number().optional(),
  subjectId: z.number().optional(),
  curriculumItemId: z.number().optional(),
});