// course.types.ts (complete updated version)
import { z } from "zod";

// Base types for database entities (existing)
export type Course = {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  demoUrl: string;
  level: string | null;
  price: number;
  estimatedPrice: number | null;
  teacherId: number;
  organizationId: number;
  ratings: number;
  totalReviews: number;
  purchased: number;
  isPublished: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CourseBenefit = {
  id: number;
  courseId: number;
  title: string;
};

export type CoursePrerequisite = {
  id: number;
  courseId: number;
  title: string;
};

export type CourseTag = {
  courseId: number;
  tagId: number;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
};

export type CourseSection = {
  id: number;
  courseId: number;
  title: string;
  position: number;
  createdAt: Date;
};

export type CourseLesson = {
  id: number;
  sectionId: number;
  title: string;
  description: string | null;
  videoUrl: string | null;
  videoThumbnail: string | null;
  videoLength: number | null;
  videoPlayer: string | null;
  position: number;
  isPreview: number;
  createdAt: Date;
  updatedAt: Date;
};

export type LessonResource = {
  id: number;
  lessonId: number;
  title: string | null;
  url: string | null;
};

export type CourseLink = {
  id: number;
  lessonId: number;
  title: string | null;
  url: string | null;
};

// New types for Program Management
export type Program = {
  id: number;
  organizationId: number;
  name: string;
  code: string | null;
  description: string | null;
  durationYears: number | null;
  durationType: "years" | "semesters" | "months";
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProgramCurriculum = {
  id: number;
  programId: number;
  version: string;
  name: string | null;
  description: string | null;
  isActive: number;
  isDefault: number;
  effectiveFrom: Date | null;
  effectiveTo: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AcademicTerm = {
  id: number;
  programCurriculumId: number;
  type: "year" | "semester" | "trimester" | "module";
  name: string;
  sequence: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
};

export type Subject = {
  id: number;
  programCurriculumId: number;
  code: string;
  name: string;
  description: string | null;
  credits: string | null;
  hoursPerWeek: number | null;
  academicTermId: number | null;
  isElective: number;
  isCore: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SubjectCurriculum = {
  id: number;
  subjectId: number;
  type:
    | "lecture"
    | "assignment"
    | "quiz"
    | "practical"
    | "workshop"
    | "project";
  title: string;
  description: string | null;
  position: number;
  duration: number | null;
  videoUrl: string | null;
  videoThumbnail: string | null;
  videoLength: number | null;
  maxScore: number | null;
  passingScore: number | null;
  dueDate: Date | null;
  quizData: any;
  isPublished: number;
  isRequired: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CurriculumResource = {
  id: number;
  curriculumId: number;
  title: string | null;
  type: "document" | "link" | "file" | "video" | null;
  url: string | null;
  createdAt: Date;
};

// Batch Management Types
export type ProgramBatch = {
  id: number;
  programId: number;
  curriculumId: number;
  name: string;
  batchCode: string | null;
  startYear: number | null;
  endYear: number | null;
  startDate: Date | null;
  endDate: Date | null;
  maxSeats: number | null;
  currentEnrollment: number;
  waitlistCapacity: number;
  status: "upcoming" | "active" | "completed" | "cancelled";
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
};

export type BatchSection = {
  id: number;
  batchId: number;
  name: string;
  sectionCode: string | null;
  classTeacherId: number | null;
  maxStudents: number | null;
  currentStudents: number;
  roomNumber: string | null;
  schedule: any;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
};

export type BatchSubject = {
  id: number;
  batchId: number;
  subjectId: number;
  academicTermId: number | null;
  teacherId: number | null;
  schedule: any;
  roomNumber: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
};

// Enrollment Types
export type StudentBatchEnrollment = {
  id: number;
  studentId: number;
  batchId: number;
  sectionId: number | null;
  enrollmentNumber: string;
  rollNumber: string | null;
  enrollmentDate: Date;
  status: "active" | "graduated" | "dropped" | "transferred" | "waitlisted";
  currentYear: number | null;
  currentSemester: number | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
};

export type StudentSubjectEnrollment = {
  studentBatchId: number;
  batchSubjectId: number;
  enrolledAt: Date;
  status: "enrolled" | "dropped" | "completed";
  isElective: number;
};

export type StudentCurriculumProgress = {
  studentBatchId: number;
  curriculumId: number;
  status: "not_started" | "in_progress" | "completed" | "failed";
  score: string | null;
  grade: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  submittedAt: Date | null;
  attempts: number;
  answers: any;
  watchTime: number | null;
  createdAt: Date;
  updatedAt: Date;
};

// Organization Settings Type
export type OrganizationSettings = {
  id: number;
  organizationId: number;
  type: "school" | "college" | "coaching" | "teacher_academy";
  features: any;
  academicStructure: "yearly" | "semester" | "trimester" | "flexible";
  gradingSystem: "percentage" | "gpa" | "cgpa" | "letter";
  enableLms: number;
  enableCertificates: number;
  enableDiscussionForums: number;
  createdAt: Date;
  updatedAt: Date;
};

// DTOs for API requests/responses (Existing)
export interface CreateCourseDTO {
  title: string;
  description: string;
  thumbnail?: string;
  demoUrl?: string;
  level?: string;
  price?: number;
  estimatedPrice?: number;
  tags?: string[];
  benefits?: { title: string }[];
  prerequisites?: { title: string }[];
}

export interface UpdateCourseDTO extends Partial<CreateCourseDTO> {}

export interface CreateSectionDTO {
  title: string;
  position?: number;
}

export interface UpdateSectionDTO {
  title?: string;
  position?: number;
}

export interface CreateLessonDTO {
  title: string;
  description?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoLength?: number;
  videoPlayer?: string;
  position?: number;
  isPreview?: boolean;
  links?: { title: string; url: string }[];
  resources?: { title: string; url: string }[];
}

export interface UpdateLessonDTO extends Partial<CreateLessonDTO> {}

// New DTOs for Program Management
export interface CreateProgramDTO {
  name: string;
  code?: string;
  description?: string;
  durationYears?: number;
  durationType?: "years" | "semesters" | "months";
  isActive?: boolean;
  tags?: string[];
}

export interface UpdateProgramDTO extends Partial<CreateProgramDTO> {}

export interface CreateCurriculumDTO {
  version: string;
  name?: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface UpdateCurriculumDTO extends Partial<CreateCurriculumDTO> {}

export interface CreateAcademicTermDTO {
  type: "year" | "semester" | "trimester" | "module";
  name: string;
  sequence: number;
  startDate?: string;
  endDate?: string;
}

export interface CreateSubjectDTO {
  code: string;
  name: string;
  description?: string;
  credits?: number;
  hoursPerWeek?: number;
  academicTermId?: number;
  isElective?: boolean;
  isCore?: boolean;
  tags?: string[];
}

export interface UpdateSubjectDTO extends Partial<CreateSubjectDTO> {}

export interface CreateSubjectCurriculumDTO {
  type:
    | "lecture"
    | "assignment"
    | "quiz"
    | "practical"
    | "workshop"
    | "project";
  title: string;
  description?: string;
  position?: number;
  duration?: number;
  videoUrl?: string;
  videoThumbnail?: string;
  videoLength?: number;
  maxScore?: number;
  passingScore?: number;
  dueDate?: string;
  quizData?: any;
  isPublished?: boolean;
  isRequired?: boolean;
  resources?: { title: string; type: string; url: string }[];
}

export interface UpdateSubjectCurriculumDTO extends Partial<CreateSubjectCurriculumDTO> {}

// Batch DTOs
export interface CreateBatchDTO {
  name: string;
  batchCode?: string;
  curriculumId: number;
  startYear?: number;
  endYear?: number;
  startDate?: string;
  endDate?: string;
  maxSeats?: number;
  waitlistCapacity?: number;
  status?: "upcoming" | "active" | "completed" | "cancelled";
  metadata?: Record<string, any>;
}

export interface UpdateBatchDTO extends Partial<CreateBatchDTO> {}

export interface CreateBatchSectionDTO {
  name: string;
  sectionCode?: string;
  classTeacherId?: number;
  maxStudents?: number;
  roomNumber?: string;
  schedule?: Record<string, any>;
  isActive?: boolean;
}

export interface UpdateBatchSectionDTO extends Partial<CreateBatchSectionDTO> {}

export interface AssignBatchSubjectDTO {
  subjectId: number;
  academicTermId?: number;
  teacherId?: number;
  schedule?: Record<string, any>;
  roomNumber?: string;
  startDate?: string;
  endDate?: string;
}

// Enrollment DTOs
export interface EnrollStudentDTO {
  studentId: number;
  sectionId?: number;
  enrollmentNumber?: string;
  rollNumber?: string;
  currentYear?: number;
  currentSemester?: number;
  metadata?: Record<string, any>;
}

export interface UpdateEnrollmentDTO {
  sectionId?: number;
  rollNumber?: string;
  status?: "active" | "graduated" | "dropped" | "transferred" | "waitlisted";
  currentYear?: number;
  currentSemester?: number;
  metadata?: Record<string, any>;
}

export interface UpdateProgressDTO {
  status: "not_started" | "in_progress" | "completed" | "failed";
  score?: number;
  grade?: string;
  watchTime?: number;
  answers?: any;
  startedAt?: string;
  completedAt?: string;
  submittedAt?: string;
}

// Organization Settings DTO
export interface OrganizationSettingsDTO {
  type?: "school" | "college" | "coaching" | "teacher_academy";
  features?: Record<string, any>;
  academicStructure?: "yearly" | "semester" | "trimester" | "flexible";
  gradingSystem?: "percentage" | "gpa" | "cgpa" | "letter";
  enableLms?: boolean;
  enableCertificates?: boolean;
  enableDiscussionForums?: boolean;
}

// File upload response type
export interface FileUploadResponse {
  url: string;
  key: string;
  provider: string;
}
