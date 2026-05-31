// course.router.ts (updated)
import { Router } from "express";
import { courseController } from "./course.controller.js";
import { programController } from "./program.controller.js";
import { batchController } from "./batch.controller.js";
import { enrollmentController } from "./enrollment.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import {
  loadMemberPermissionsMiddleware,
  organizationMemberMiddleware,
  requirePermission,
} from "../../middleware/permission.middleware.js";

const courseRouter = Router();

// All routes require authentication
courseRouter.use(isAuthenticated);
courseRouter.use(organizationMemberMiddleware);
courseRouter.use(loadMemberPermissionsMiddleware);

// ============ FILE UPLOAD ============
courseRouter.post(
  "/upload-url",
  requirePermission("storage", "upload"),
  courseController.getUploadUrl,
);

// ============ COURSE CRUD (Existing) ============
courseRouter.post(
  "/",
  requirePermission("course", "create"),
  courseController.createCourse,
);
courseRouter.get("/", courseController.getCourses);
courseRouter.get(
  "/:id",
  requirePermission("course", "read"),
  courseController.getCourse,
);
courseRouter.put(
  "/:id",
  requirePermission("course", "update"),
  courseController.updateCourse,
);
courseRouter.delete(
  "/:id",
  requirePermission("course", "delete"),
  courseController.deleteCourse,
);

// Course sections
courseRouter.post("/:courseId/sections", courseController.createSection);
courseRouter.get("/:courseId/sections/:sectionId", courseController.getSection);
courseRouter.put(
  "/:courseId/sections/:sectionId",
  courseController.updateSection,
);
courseRouter.delete(
  "/:courseId/sections/:sectionId",
  courseController.deleteSection,
);

// Course lessons
courseRouter.post(
  "/:courseId/sections/:sectionId/lessons",
  courseController.createLesson,
);
courseRouter.get("/:courseId/lessons/:lessonId", courseController.getLesson);
courseRouter.put("/:courseId/lessons/:lessonId", courseController.updateLesson);
courseRouter.delete(
  "/:courseId/lessons/:lessonId",
  courseController.deleteLesson,
);

// ============ PROGRAM MANAGEMENT ============
courseRouter.get("/programs", programController.getPrograms);
courseRouter.post(
  "/programs",
  requirePermission("program", "create"),
  programController.createProgram,
);
courseRouter.get("/programs/:id", programController.getProgram);
courseRouter.put(
  "/programs/:id",
  requirePermission("program", "update"),
  programController.updateProgram,
);
courseRouter.delete(
  "/programs/:id",
  requirePermission("program", "delete"),
  programController.deleteProgram,
);

// Program Curriculums
courseRouter.post(
  "/programs/:programId/curriculums",
  requirePermission("curriculum", "create"),
  programController.createCurriculum,
);
courseRouter.get(
  "/programs/:programId/curriculums",
  programController.getCurriculums,
);
courseRouter.get(
  "/programs/:programId/curriculums/:curriculumId",
  programController.getCurriculum,
);
courseRouter.put(
  "/programs/:programId/curriculums/:curriculumId",
  requirePermission("curriculum", "update"),
  programController.updateCurriculum,
);
courseRouter.delete(
  "/programs/:programId/curriculums/:curriculumId",
  requirePermission("curriculum", "delete"),
  programController.deleteCurriculum,
);

// Academic Terms
courseRouter.post(
  "/curriculums/:curriculumId/terms",
  requirePermission("academic", "create"),
  programController.createAcademicTerm,
);
courseRouter.get(
  "/curriculums/:curriculumId/terms",
  programController.getAcademicTerms,
);

// Subjects
courseRouter.post(
  "/curriculums/:curriculumId/subjects",
  requirePermission("subject", "create"),
  programController.createSubject,
);
courseRouter.get(
  "/curriculums/:curriculumId/subjects",
  programController.getSubjects,
);
courseRouter.get("/subjects/:subjectId", programController.getSubject);
courseRouter.put(
  "/subjects/:subjectId",
  requirePermission("subject", "update"),
  programController.updateSubject,
);
courseRouter.delete(
  "/subjects/:subjectId",
  requirePermission("subject", "delete"),
  programController.deleteSubject,
);

// Subject Curriculum
courseRouter.post(
  "/subjects/:subjectId/curriculum",
  requirePermission("curriculum", "create"),
  programController.createSubjectCurriculum,
);
courseRouter.get(
  "/subjects/:subjectId/curriculum",
  programController.getSubjectCurriculums,
);
courseRouter.put(
  "/subjects/:subjectId/curriculum/:curriculumItemId",
  requirePermission("curriculum", "update"),
  programController.updateSubjectCurriculum,
);
courseRouter.delete(
  "/subjects/:subjectId/curriculum/:curriculumItemId",
  requirePermission("curriculum", "delete"),
  programController.deleteSubjectCurriculum,
);

// ============ BATCH MANAGEMENT ============
courseRouter.post(
  "/programs/:programId/batches",
  requirePermission("batch", "create"),
  batchController.createBatch,
);
courseRouter.get("/programs/:programId/batches", batchController.getBatches);
courseRouter.get("/batches/:batchId", batchController.getBatch);
courseRouter.put(
  "/batches/:batchId",
  requirePermission("batch", "update"),
  batchController.updateBatch,
);
courseRouter.delete(
  "/batches/:batchId",
  requirePermission("batch", "delete"),
  batchController.deleteBatch,
);

// Batch Sections
courseRouter.post(
  "/batches/:batchId/sections",
  requirePermission("batch", "create"),
  batchController.createSection,
);
courseRouter.get("/batches/:batchId/sections", batchController.getSections);
courseRouter.put(
  "/batches/:batchId/sections/:sectionId",
  requirePermission("batch", "update"),
  batchController.updateSection,
);
courseRouter.delete(
  "/batches/:batchId/sections/:sectionId",
  requirePermission("batch", "delete"),
  batchController.deleteSection,
);

// Batch Subjects
courseRouter.post(
  "/batches/:batchId/subjects",
  requirePermission("batch", "update"),
  batchController.assignBatchSubject,
);
courseRouter.get(
  "/batches/:batchId/subjects",
  batchController.getBatchSubjects,
);
courseRouter.delete(
  "/batches/:batchId/subjects/:batchSubjectId",
  requirePermission("batch", "update"),
  batchController.removeBatchSubject,
);

// ============ ENROLLMENT MANAGEMENT ============
courseRouter.post(
  "/batches/:batchId/enrollments",
  requirePermission("enrollment", "create"),
  enrollmentController.enrollStudent,
);
courseRouter.get(
  "/batches/:batchId/enrollments",
  requirePermission("enrollment", "read"),
  enrollmentController.getBatchEnrollments,
);
courseRouter.get(
  "/students/:studentId/enrollments",
  enrollmentController.getStudentEnrollments,
);
courseRouter.put(
  "/enrollments/:enrollmentId",
  requirePermission("enrollment", "update"),
  enrollmentController.updateEnrollment,
);
courseRouter.delete(
  "/enrollments/:enrollmentId",
  requirePermission("enrollment", "delete"),
  enrollmentController.deleteEnrollment,
);

// Student Progress
courseRouter.get(
  "/enrollments/:enrollmentId/progress",
  enrollmentController.getStudentProgress,
);
courseRouter.post(
  "/enrollments/:enrollmentId/progress/:curriculumId",
  requirePermission("enrollment", "update"),
  enrollmentController.updateProgress,
);

// ============ ORGANIZATION SETTINGS ============
courseRouter.get(
  "/settings",
  requirePermission("settings", "read"),
  programController.getOrganizationSettings,
);
courseRouter.put(
  "/settings",
  requirePermission("settings", "update"),
  programController.updateOrganizationSettings,
);

export default courseRouter;
