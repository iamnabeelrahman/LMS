import { Request, Response } from "express";
import { CourseService } from "./course.service.js";
import {
  createCourseSchema,
  updateCourseSchema,
  createSectionSchema,
  updateSectionSchema,
  createLessonSchema,
  updateLessonSchema,
  uploadFileSchema,
} from "./course.validation.js";
import { ZodError } from "zod";

const courseService = new CourseService();

export const courseController = {
  // Course CRUD
  async createCourse(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const validatedData = createCourseSchema.parse(req.body);

      const course = await courseService.createCourse(
        user.id,
        user.organizationId,
        validatedData,
      );

      res.status(201).json({
        success: true,
        data: course,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Error creating course:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create course",
      });
    }
  },

  async getCourse(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { id } = req.params;
      if (!id) throw new Error("Course id missing");

      const course = await courseService.getCourseById(
        parseInt(id as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : "Course not found",
      });
    }
  },

  async getCourses(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const isPublished =
        req.query.isPublished === "true"
          ? true
          : req.query.isPublished === "false"
            ? false
            : undefined;
      const level = req.query.level as string;
      const search = req.query.search as string;

      const result = await courseService.getCoursesByOrganization(
        user.organizationId,
        page,
        limit,
        { isPublished, level, search },
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch courses",
      });
    }
  },

  async updateCourse(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { id } = req.params;
      const validatedData = updateCourseSchema.parse(req.body);

      const course = await courseService.updateCourse(
        parseInt(id as string),
        user.organizationId,
        user.id,
        validatedData,
      );

      res.json({
        success: true,
        data: course,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Error updating course:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update course",
      });
    }
  },

  async deleteCourse(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { id } = req.params;

      await courseService.deleteCourse(
        parseInt(id as string),
        user.organizationId,
        user.id,
      );

      res.json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete course",
      });
    }
  },

  // Section CRUD
  async createSection(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { courseId } = req.params;
      const validatedData = createSectionSchema.parse(req.body);

      const section = await courseService.createSection(
        parseInt(courseId as string),
        user.organizationId,
        validatedData,
      );

      res.status(201).json({
        success: true,
        data: section,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Error creating section:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create section",
      });
    }
  },

  async getSection(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { courseId, sectionId } = req.params;

      const section = await courseService.getSectionById(
        parseInt(sectionId as string),
        parseInt(courseId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: section,
      });
    } catch (error) {
      console.error("Error fetching section:", error);
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : "Section not found",
      });
    }
  },

  async updateSection(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { courseId, sectionId } = req.params;
      const validatedData = updateSectionSchema.parse(req.body);

      const section = await courseService.updateSection(
        parseInt(sectionId as string),
        parseInt(courseId as string),
        user.organizationId,
        validatedData,
      );

      res.json({
        success: true,
        data: section,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Error updating section:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update section",
      });
    }
  },

  async deleteSection(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { courseId, sectionId } = req.params;

      await courseService.deleteSection(
        parseInt(sectionId as string),
        parseInt(courseId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        message: "Section deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting section:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete section",
      });
    }
  },

  // Lesson CRUD
  async createLesson(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { courseId, sectionId } = req.params;
      const validatedData = createLessonSchema.parse(req.body);

      const lesson = await courseService.createLesson(
        parseInt(sectionId as string),
        parseInt(courseId as string),
        user.organizationId,
        validatedData,
      );

      res.status(201).json({
        success: true,
        data: lesson,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Error creating lesson:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create lesson",
      });
    }
  },

  async getLesson(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { courseId, lessonId } = req.params;

      const lesson = await courseService.getLessonById(
        parseInt(lessonId as string),
        parseInt(courseId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: lesson,
      });
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : "Lesson not found",
      });
    }
  },

  async updateLesson(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { courseId, lessonId } = req.params;
      const validatedData = updateLessonSchema.parse(req.body);

      const lesson = await courseService.updateLesson(
        parseInt(lessonId as string),
        parseInt(courseId as string),
        user.organizationId,
        validatedData,
      );

      res.json({
        success: true,
        data: lesson,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Error updating lesson:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update lesson",
      });
    }
  },

  async deleteLesson(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { courseId, lessonId } = req.params;

      await courseService.deleteLesson(
        parseInt(lessonId as string),
        parseInt(courseId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        message: "Lesson deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete lesson",
      });
    }
  },

  // File Upload URL Generation
  async getUploadUrl(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const validatedData = uploadFileSchema.parse(req.body);

      const uploadData = await courseService.getUploadUrl(
        user.organizationId,
        validatedData.fileName,
        validatedData.fileType,
        validatedData.filePurpose,
      );

      res.json({
        success: true,
        data: uploadData,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      console.error("Error generating upload URL:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate upload URL",
      });
    }
  },
};
