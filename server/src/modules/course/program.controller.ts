import { Request, Response } from "express";
import { ProgramService } from "./program.service.js";
import {
  createProgramSchema,
  updateProgramSchema,
  createCurriculumSchema,
  updateCurriculumSchema,
  createAcademicTermSchema,
  createSubjectSchema,
  updateSubjectSchema,
  createSubjectCurriculumSchema,
  updateSubjectCurriculumSchema,
  organizationSettingsSchema,
} from "./course.validation.js";
import { ZodError } from "zod";

const programService = new ProgramService();

export const programController = {
  // Program CRUD
  async createProgram(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const validatedData = createProgramSchema.parse(req.body);

      const program = await programService.createProgram(
        user.organizationId,
        validatedData,
      );

      res.status(201).json({
        success: true,
        data: program,
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
      console.error("Error creating program:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create program",
      });
    }
  },

  async getProgram(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { id } = req.params;

      const program = await programService.getProgramById(
        parseInt(id as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: program,
      });
    } catch (error) {
      console.error("Error fetching program:", error);
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : "Program not found",
      });
    }
  },

  async getPrograms(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const isActive =
        req.query.isActive === "true"
          ? true
          : req.query.isActive === "false"
            ? false
            : undefined;
      const search = req.query.search as string;

      const result = await programService.getProgramsByOrganization(
        user.organizationId,
        page,
        limit,
        { isActive, search },
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error fetching programs:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch programs",
      });
    }
  },

  async updateProgram(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { id } = req.params;
      const validatedData = updateProgramSchema.parse(req.body);

      const program = await programService.updateProgram(
        parseInt(id as string),
        user.organizationId,
        validatedData,
      );

      res.json({
        success: true,
        data: program,
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
      console.error("Error updating program:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update program",
      });
    }
  },

  async deleteProgram(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { id } = req.params;

      await programService.deleteProgram(
        parseInt(id as string),
        user.organizationId,
      );

      res.json({
        success: true,
        message: "Program deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting program:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete program",
      });
    }
  },

  // Curriculum CRUD
  async createCurriculum(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { programId } = req.params;
      const validatedData = createCurriculumSchema.parse(req.body);

      const curriculum = await programService.createCurriculum(
        parseInt(programId as string),
        user.organizationId,
        validatedData,
      );

      res.status(201).json({
        success: true,
        data: curriculum,
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
      console.error("Error creating curriculum:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create curriculum",
      });
    }
  },

  async getCurriculums(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { programId } = req.params;

      const curriculums = await programService.getCurriculumsByProgram(
        parseInt(programId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: curriculums,
      });
    } catch (error) {
      console.error("Error fetching curriculums:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch curriculums",
      });
    }
  },

  async getCurriculum(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { programId, curriculumId } = req.params;

      const curriculum = await programService.getCurriculumById(
        parseInt(curriculumId as string),
        parseInt(programId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: curriculum,
      });
    } catch (error) {
      console.error("Error fetching curriculum:", error);
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : "Curriculum not found",
      });
    }
  },

  async updateCurriculum(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { programId, curriculumId } = req.params;
      const validatedData = updateCurriculumSchema.parse(req.body);

      const curriculum = await programService.updateCurriculum(
        parseInt(curriculumId as string),
        parseInt(programId as string),
        user.organizationId,
        validatedData,
      );

      res.json({
        success: true,
        data: curriculum,
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
      console.error("Error updating curriculum:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update curriculum",
      });
    }
  },

  async deleteCurriculum(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { programId, curriculumId } = req.params;

      await programService.deleteCurriculum(
        parseInt(curriculumId as string),
        parseInt(programId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        message: "Curriculum deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting curriculum:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete curriculum",
      });
    }
  },

  // Academic Terms
  async createAcademicTerm(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { curriculumId } = req.params;
      const validatedData = createAcademicTermSchema.parse(req.body);

      const term = await programService.createAcademicTerm(
        parseInt(curriculumId as string),
        user.organizationId,
        validatedData,
      );

      res.status(201).json({
        success: true,
        data: term,
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
      console.error("Error creating academic term:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create academic term",
      });
    }
  },

  async getAcademicTerms(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { curriculumId } = req.params;

      const terms = await programService.getAcademicTermsByCurriculum(
        parseInt(curriculumId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: terms,
      });
    } catch (error) {
      console.error("Error fetching academic terms:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch academic terms",
      });
    }
  },

  // Subjects
  async createSubject(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { curriculumId } = req.params;
      const validatedData = createSubjectSchema.parse(req.body);

      const subject = await programService.createSubject(
        parseInt(curriculumId as string),
        user.organizationId,
        validatedData,
      );

      res.status(201).json({
        success: true,
        data: subject,
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
      console.error("Error creating subject:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create subject",
      });
    }
  },

  async getSubjects(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { curriculumId } = req.params;

      const subjects = await programService.getSubjectsByCurriculum(
        parseInt(curriculumId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: subjects,
      });
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch subjects",
      });
    }
  },

  async getSubject(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { subjectId } = req.params;

      const subject = await programService.getSubjectById(
        parseInt(subjectId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: subject,
      });
    } catch (error) {
      console.error("Error fetching subject:", error);
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : "Subject not found",
      });
    }
  },

  async updateSubject(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { subjectId } = req.params;
      const validatedData = updateSubjectSchema.parse(req.body);

      const subject = await programService.updateSubject(
        parseInt(subjectId as string),
        user.organizationId,
        validatedData,
      );

      res.json({
        success: true,
        data: subject,
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
      console.error("Error updating subject:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update subject",
      });
    }
  },

  async deleteSubject(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { subjectId } = req.params;

      await programService.deleteSubject(
        parseInt(subjectId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        message: "Subject deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete subject",
      });
    }
  },

  // Subject Curriculum
  async createSubjectCurriculum(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { subjectId } = req.params;
      const validatedData = createSubjectCurriculumSchema.parse(req.body);

      const curriculumItem = await programService.createSubjectCurriculum(
        parseInt(subjectId as string),
        user.organizationId,
        validatedData,
      );

      res.status(201).json({
        success: true,
        data: curriculumItem,
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
      console.error("Error creating subject curriculum:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create curriculum item",
      });
    }
  },

  async getSubjectCurriculums(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { subjectId } = req.params;

      const curriculumItems = await programService.getSubjectCurriculums(
        parseInt(subjectId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        data: curriculumItems,
      });
    } catch (error) {
      console.error("Error fetching subject curriculum:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch curriculum items",
      });
    }
  },

  async updateSubjectCurriculum(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { subjectId, curriculumItemId } = req.params;
      const validatedData = updateSubjectCurriculumSchema.parse(req.body);

      const curriculumItem = await programService.updateSubjectCurriculum(
        parseInt(curriculumItemId as string),
        parseInt(subjectId as string),
        user.organizationId,
        validatedData,
      );

      res.json({
        success: true,
        data: curriculumItem,
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
      console.error("Error updating subject curriculum:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update curriculum item",
      });
    }
  },

  async deleteSubjectCurriculum(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const { subjectId, curriculumItemId } = req.params;

      await programService.deleteSubjectCurriculum(
        parseInt(curriculumItemId as string),
        parseInt(subjectId as string),
        user.organizationId,
      );

      res.json({
        success: true,
        message: "Curriculum item deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting subject curriculum:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete curriculum item",
      });
    }
  },

  // Organization Settings
  async getOrganizationSettings(req: Request, res: Response) {
    try {
      const user = req.user as any;

      const settings = await programService.getOrganizationSettings(
        user.organizationId,
      );

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error("Error fetching organization settings:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch settings",
      });
    }
  },

  async updateOrganizationSettings(req: Request, res: Response) {
    try {
      const user = req.user as any;
      const validatedData = organizationSettingsSchema.parse(req.body);

      const settings = await programService.updateOrganizationSettings(
        user.organizationId,
        validatedData,
      );

      res.json({
        success: true,
        data: settings,
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
      console.error("Error updating organization settings:", error);
      res.status(500).json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update settings",
      });
    }
  },
};
