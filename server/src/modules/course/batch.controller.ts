// batch.controller.ts
import { Request, Response } from "express";
import { BatchService } from "./batch.service.js";
import {
  createBatchSchema,
  updateBatchSchema,
  createBatchSectionSchema,
  updateBatchSectionSchema,
  assignBatchSubjectSchema,
} from "./course.validation.js";
import { ZodError } from "zod";

const batchService = new BatchService();

export const batchController = {
  // Batch CRUD
  async createBatch(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { programId } = req.params;
      const validatedData = createBatchSchema.parse(req.body);

      const batch = await batchService.createBatch(
        parseInt(programId as string),
        user.organizationId,
        validatedData,
      );

      res.status(201).json({
        success: true,
        data: batch,
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
      console.error("Error creating batch:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create batch",
      });
    }
  },

  async getBatch(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { batchId } = req.params;

      const batch = await batchService.getBatchById(
        parseInt(batchId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: batch,
      });
    } catch (error) {
      console.error("Error fetching batch:", error);
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : "Batch not found",
      });
    }
  },

  async getBatches(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { programId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const result = await batchService.getBatchesByProgram(
        parseInt(programId as string),
        user.organizationId,
        page,
        limit,
        { status, search },
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error fetching batches:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch batches",
      });
    }
  },

  async updateBatch(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { batchId } = req.params;
      const validatedData = updateBatchSchema.parse(req.body);

      const batch = await batchService.updateBatch(
        parseInt(batchId as string),
        user.organizationId,
        validatedData,
      );

      res.json({
        success: true,
        data: batch,
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
      console.error("Error updating batch:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update batch",
      });
    }
  },

  async deleteBatch(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { batchId } = req.params;

      await batchService.deleteBatch(parseInt(batchId as string), user.organizationId);

      res.json({
        success: true,
        message: "Batch deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting batch:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete batch",
      });
    }
  },

  // Batch Sections
  async createSection(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { batchId } = req.params;
      const validatedData = createBatchSectionSchema.parse(req.body);

      const section = await batchService.createBatchSection(
        parseInt(batchId as string),
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

  async getSections(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { batchId } = req.params;

      const sections = await batchService.getBatchSections(
        parseInt(batchId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: sections,
      });
    } catch (error) {
      console.error("Error fetching sections:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch sections",
      });
    }
  },

  async updateSection(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { batchId, sectionId } = req.params;
      const validatedData = updateBatchSectionSchema.parse(req.body);

      const section = await batchService.updateBatchSection(
        parseInt(sectionId as string),
        parseInt(batchId as string),
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
      const { batchId, sectionId } = req.params;

      await batchService.deleteBatchSection(
        parseInt(sectionId as string),
        parseInt(batchId as string),
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

  // Batch Subjects
  async assignBatchSubject(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { batchId } = req.params;
      const validatedData = assignBatchSubjectSchema.parse(req.body);

      const batchSubject = await batchService.assignBatchSubject(
        parseInt(batchId as string),
        user.organizationId,
        validatedData,
      );

      res.status(201).json({
        success: true,
        data: batchSubject,
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
      console.error("Error assigning batch subject:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to assign subject",
      });
    }
  },

  async getBatchSubjects(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { batchId } = req.params;

      const batchSubjects = await batchService.getBatchSubjects(
        parseInt(batchId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: batchSubjects,
      });
    } catch (error) {
      console.error("Error fetching batch subjects:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch batch subjects",
      });
    }
  },

  async removeBatchSubject(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { batchId, batchSubjectId } = req.params;

      await batchService.removeBatchSubject(
        parseInt(batchSubjectId as string),
        parseInt(batchId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        message: "Subject removed from batch successfully",
      });
    } catch (error) {
      console.error("Error removing batch subject:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to remove subject",
      });
    }
  },
};
