// enrollment.controller.ts
import { Request, Response } from "express";
import { EnrollmentService } from "./enrollment.service.js";
import {
  enrollStudentSchema,
  updateEnrollmentSchema,
  updateProgressSchema,
} from "./course.validation.js";
import { ZodError } from "zod";

const enrollmentService = new EnrollmentService();

export const enrollmentController = {
  async enrollStudent(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { batchId } = req.params;
      const validatedData = enrollStudentSchema.parse(req.body);

      const enrollment = await enrollmentService.enrollStudent(
        parseInt(batchId as string),
        user.organizationId,
        validatedData,
      );

      res.status(201).json({
        success: true,
        data: enrollment,
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
      console.error("Error enrolling student:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to enroll student",
      });
    }
  },

  async getBatchEnrollments(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { batchId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const result = await enrollmentService.getBatchEnrollments(
        parseInt(batchId as string),
        user.organizationId,
        page,
        limit,
        { status },
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch enrollments",
      });
    }
  },

  async getStudentEnrollments(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { studentId } = req.params;

      const enrollments = await enrollmentService.getStudentEnrollments(
        parseInt(studentId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: enrollments,
      });
    } catch (error) {
      console.error("Error fetching student enrollments:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch student enrollments",
      });
    }
  },

  async updateEnrollment(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { enrollmentId } = req.params;
      const validatedData = updateEnrollmentSchema.parse(req.body);

      const enrollment = await enrollmentService.updateEnrollment(
        parseInt(enrollmentId as string),
        user.organizationId,
        validatedData,
      );

      res.json({
        success: true,
        data: enrollment,
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
      console.error("Error updating enrollment:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update enrollment",
      });
    }
  },

  async deleteEnrollment(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { enrollmentId } = req.params;

      await enrollmentService.deleteEnrollment(
        parseInt(enrollmentId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        message: "Enrollment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete enrollment",
      });
    }
  },

  async getStudentProgress(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { enrollmentId } = req.params;

      const progress = await enrollmentService.getStudentProgress(
        parseInt(enrollmentId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error("Error fetching student progress:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch student progress",
      });
    }
  },

  async updateProgress(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { enrollmentId, curriculumId } = req.params;
      const validatedData = updateProgressSchema.parse(req.body);

      const progress = await enrollmentService.updateProgress(
        parseInt(enrollmentId as string),
        parseInt(curriculumId as string),
        user.organizationId,
        validatedData,
      );

      res.json({
        success: true,
        data: progress,
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
      console.error("Error updating progress:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update progress",
      });
    }
  },
};
