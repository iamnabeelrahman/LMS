// program.service.ts
import { programRepository } from "./program.repository.js";
import {
  CreateProgramDTO,
  UpdateProgramDTO,
  CreateCurriculumDTO,
  UpdateCurriculumDTO,
  CreateAcademicTermDTO,
  CreateSubjectDTO,
  UpdateSubjectDTO,
  CreateSubjectCurriculumDTO,
  UpdateSubjectCurriculumDTO,
  OrganizationSettingsDTO,
} from "./course.types.js";
import { slugify } from "../../utils/slugify.js";

export class ProgramService {
  // ==================== PROGRAM CRUD ====================

  async createProgram(organizationId: number, data: CreateProgramDTO) {
    // Check if program with same code exists
    if (data.code) {
      const existingProgram = await programRepository.getProgramByCode(
        data.code,
        organizationId,
      );
      if (existingProgram) {
        throw new Error("Program with this code already exists");
      }
    }

    // Create program
    const program = await programRepository.createProgram({
      organizationId,
      name: data.name,
      code: data.code || null,
      description: data.description || null,
      durationYears: data.durationYears || null,
      durationType: data.durationType || "years",
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    // Add tags if provided
    if (data.tags?.length) {
      const tags = await programRepository.createOrGetTags(data.tags);
      await programRepository.linkProgramTags(
        program.id,
        tags.map((t) => t.id),
      );
    }

    return await programRepository.getProgramById(program.id, organizationId);
  }

  async getProgramById(id: number, organizationId: number) {
    const program = await programRepository.getProgramById(id, organizationId);
    if (!program) {
      throw new Error("Program not found");
    }
    return program;
  }

  async getProgramsByOrganization(
    organizationId: number,
    page: number = 1,
    limit: number = 10,
    filters?: { isActive?: boolean; search?: string },
  ) {
    return await programRepository.getProgramsByOrganization(
      organizationId,
      page,
      limit,
      filters,
    );
  }

  async updateProgram(
    id: number,
    organizationId: number,
    data: UpdateProgramDTO,
  ) {
    const existingProgram = await programRepository.getProgramById(
      id,
      organizationId,
    );
    if (!existingProgram) {
      throw new Error("Program not found");
    }

    // Check code uniqueness if updating
    if (data.code && data.code !== existingProgram.code) {
      const programWithCode = await programRepository.getProgramByCode(
        data.code,
        organizationId,
      );
      if (programWithCode && programWithCode.id !== id) {
        throw new Error("Program with this code already exists");
      }
    }

    // Update program
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.durationYears !== undefined)
      updateData.durationYears = data.durationYears;
    if (data.durationType !== undefined)
      updateData.durationType = data.durationType;
    if (data.isActive !== undefined)
      updateData.isActive = data.isActive ? 1 : 0;

    await programRepository.updateProgram(id, organizationId, updateData);

    // Update tags if provided
    if (data.tags) {
      await programRepository.deleteProgramTags(id);
      if (data.tags.length) {
        const tags = await programRepository.createOrGetTags(data.tags);
        await programRepository.linkProgramTags(
          id,
          tags.map((t) => t.id),
        );
      }
    }

    return await programRepository.getProgramById(id, organizationId);
  }

  async deleteProgram(id: number, organizationId: number) {
    const existingProgram = await programRepository.getProgramById(
      id,
      organizationId,
    );
    if (!existingProgram) {
      throw new Error("Program not found");
    }

    return await programRepository.deleteProgram(id, organizationId);
  }

  // ==================== CURRICULUM CRUD ====================

  async createCurriculum(
    programId: number,
    organizationId: number,
    data: CreateCurriculumDTO,
  ) {
    // Verify program exists
    const program = await programRepository.getProgramById(
      programId,
      organizationId,
    );
    if (!program) {
      throw new Error("Program not found");
    }

    // If this curriculum is set as default, unset other defaults
    if (data.isDefault) {
      await programRepository.unsetDefaultCurriculum(programId);
    }

    // Create curriculum
    const curriculum = await programRepository.createCurriculum({
      programId,
      version: data.version,
      name: data.name || null,
      description: data.description || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isDefault: data.isDefault !== undefined ? data.isDefault : false,
      effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : null,
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
    });

    return curriculum;
  }

  async getCurriculumsByProgram(programId: number, organizationId: number) {
    // Verify program exists
    const program = await programRepository.getProgramById(
      programId,
      organizationId,
    );
    if (!program) {
      throw new Error("Program not found");
    }

    return await programRepository.getCurriculumsByProgram(programId);
  }

  async getCurriculumById(
    id: number,
    programId: number,
    organizationId: number,
  ) {
    // Verify program exists
    const program = await programRepository.getProgramById(
      programId,
      organizationId,
    );
    if (!program) {
      throw new Error("Program not found");
    }

    const curriculum = await programRepository.getCurriculumById(id, programId);
    if (!curriculum) {
      throw new Error("Curriculum not found");
    }

    return curriculum;
  }

  async updateCurriculum(
    id: number,
    programId: number,
    organizationId: number,
    data: UpdateCurriculumDTO,
  ) {
    // Verify curriculum exists
    const curriculum = await this.getCurriculumById(
      id,
      programId,
      organizationId,
    );

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await programRepository.unsetDefaultCurriculum(programId);
    }

    // Update curriculum
    const updateData: any = {};
    if (data.version !== undefined) updateData.version = data.version;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.isActive !== undefined)
      updateData.isActive = data.isActive ? 1 : 0;
    if (data.isDefault !== undefined)
      updateData.isDefault = data.isDefault ? 1 : 0;
    if (data.effectiveFrom !== undefined)
      updateData.effectiveFrom = data.effectiveFrom
        ? new Date(data.effectiveFrom)
        : null;
    if (data.effectiveTo !== undefined)
      updateData.effectiveTo = data.effectiveTo
        ? new Date(data.effectiveTo)
        : null;

    await programRepository.updateCurriculum(id, programId, updateData);

    return await programRepository.getCurriculumById(id, programId);
  }

  async deleteCurriculum(
    id: number,
    programId: number,
    organizationId: number,
  ) {
    await this.getCurriculumById(id, programId, organizationId);
    return await programRepository.deleteCurriculum(id, programId);
  }

  // ==================== ACADEMIC TERMS ====================

  async createAcademicTerm(
    curriculumId: number,
    organizationId: number,
    data: CreateAcademicTermDTO,
  ) {
    // Verify curriculum exists through program
    const curriculum =
      await programRepository.getCurriculumWithProgram(curriculumId);
    if (!curriculum || curriculum.program.organizationId !== organizationId) {
      throw new Error("Curriculum not found");
    }

    // Check if sequence already exists
    const existingTerm = await programRepository.getAcademicTermBySequence(
      curriculumId,
      data.sequence,
    );
    if (existingTerm) {
      throw new Error(
        `Academic term with sequence ${data.sequence} already exists`,
      );
    }

    const term = await programRepository.createAcademicTerm({
      programCurriculumId: curriculumId,
      type: data.type,
      name: data.name,
      sequence: data.sequence,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    });

    return term;
  }

  async getAcademicTermsByCurriculum(
    curriculumId: number,
    organizationId: number,
  ) {
    // Verify curriculum exists through program
    const curriculum =
      await programRepository.getCurriculumWithProgram(curriculumId);
    if (!curriculum || curriculum.program.organizationId !== organizationId) {
      throw new Error("Curriculum not found");
    }

    return await programRepository.getAcademicTermsByCurriculum(curriculumId);
  }

  // ==================== SUBJECTS ====================

  async createSubject(
    curriculumId: number,
    organizationId: number,
    data: CreateSubjectDTO,
  ) {
    // Verify curriculum exists
    const curriculum =
      await programRepository.getCurriculumWithProgram(curriculumId);
    if (!curriculum || curriculum.program.organizationId !== organizationId) {
      throw new Error("Curriculum not found");
    }

    // Check if subject with same code exists in this curriculum
    const existingSubject = await programRepository.getSubjectByCode(
      data.code,
      curriculumId,
    );
    if (existingSubject) {
      throw new Error(
        "Subject with this code already exists in this curriculum",
      );
    }

    // Create subject
    const subject = await programRepository.createSubject({
      programCurriculumId: curriculumId,
      code: data.code,
      name: data.name,
      description: data.description || null,
      credits: data.credits !== undefined ? data.credits.toString() : null,
      hoursPerWeek: data.hoursPerWeek || null,
      academicTermId: data.academicTermId || null,
      isElective: data.isElective ? true : false,
      isCore: data.isCore !== undefined ? (data.isCore ? true : false) : true,
    });

    // Add tags if provided
    if (data.tags?.length) {
      const tags = await programRepository.createOrGetTags(data.tags);
      await programRepository.linkSubjectTags(
        subject.id,
        tags.map((t) => t.id),
      );
    }

    return await programRepository.getSubjectById(subject.id);
  }

  async getSubjectsByCurriculum(curriculumId: number, organizationId: number) {
    const curriculum =
      await programRepository.getCurriculumWithProgram(curriculumId);
    if (!curriculum || curriculum.program.organizationId !== organizationId) {
      throw new Error("Curriculum not found");
    }

    return await programRepository.getSubjectsByCurriculum(curriculumId);
  }

  async getSubjectById(id: number, organizationId: number) {
    const subject = await programRepository.getSubjectById(id);
    if (!subject) {
      throw new Error("Subject not found");
    }

    // Verify organization access through curriculum -> program
    const curriculum = await programRepository.getCurriculumWithProgram(
      subject.programCurriculumId,
    );
    if (!curriculum || curriculum.program.organizationId !== organizationId) {
      throw new Error("Subject not found in your organization");
    }

    return subject;
  }

  async updateSubject(
    id: number,
    organizationId: number,
    data: UpdateSubjectDTO,
  ) {
    const existingSubject = await this.getSubjectById(id, organizationId);

    // Check code uniqueness if updating
    if (data.code && data.code !== existingSubject.code) {
      const subjectWithCode = await programRepository.getSubjectByCode(
        data.code,
        existingSubject.programCurriculumId,
      );
      if (subjectWithCode && subjectWithCode.id !== id) {
        throw new Error(
          "Subject with this code already exists in this curriculum",
        );
      }
    }

    // Update subject
    const updateData: any = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.credits !== undefined)
      updateData.credits = data.credits.toString();
    if (data.hoursPerWeek !== undefined)
      updateData.hoursPerWeek = data.hoursPerWeek;
    if (data.academicTermId !== undefined)
      updateData.academicTermId = data.academicTermId;
    if (data.isElective !== undefined)
      updateData.isElective = data.isElective ? 1 : 0;
    if (data.isCore !== undefined) updateData.isCore = data.isCore ? 1 : 0;

    await programRepository.updateSubject(id, updateData);

    // Update tags if provided
    if (data.tags) {
      await programRepository.deleteSubjectTags(id);
      if (data.tags.length) {
        const tags = await programRepository.createOrGetTags(data.tags);
        await programRepository.linkSubjectTags(
          id,
          tags.map((t) => t.id),
        );
      }
    }

    return await programRepository.getSubjectById(id);
  }

  async deleteSubject(id: number, organizationId: number) {
    await this.getSubjectById(id, organizationId);
    return await programRepository.deleteSubject(id);
  }

  // ==================== SUBJECT CURRICULUM ====================

  async createSubjectCurriculum(
    subjectId: number,
    organizationId: number,
    data: CreateSubjectCurriculumDTO,
  ) {
    // Verify subject exists
    const subject = await this.getSubjectById(subjectId, organizationId);

    // Create curriculum item
    const curriculumItem = await programRepository.createSubjectCurriculum({
      subjectId,
      type: data.type,
      title: data.title,
      description: data.description || null,
      position: data.position !== undefined ? data.position : 0,
      duration: data.duration || null,
      videoUrl: data.videoUrl || null,
      videoThumbnail: data.videoThumbnail || null,
      videoLength: data.videoLength || null,
      maxScore: data.maxScore || null,
      passingScore: data.passingScore || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      quizData: data.quizData || null,
      isPublished: data.isPublished ? true : false,
      isRequired:
        data.isRequired !== undefined ? (data.isRequired ? true : false) : true,
    });

    // Add resources if provided
    if (data.resources?.length) {
      const curriculumResources = data.resources.map((resource) => ({
        title: resource.title,
        type: resource.type as "link" | "document" | "file" | "video",
        url: resource.url,
      }));

      await programRepository.createCurriculumResources(
        curriculumItem.id,
        curriculumResources,
      );
    }

    return await programRepository.getSubjectCurriculumById(curriculumItem.id);
  }

  async getSubjectCurriculums(subjectId: number, organizationId: number) {
    await this.getSubjectById(subjectId, organizationId);
    return await programRepository.getSubjectCurriculums(subjectId);
  }

  async updateSubjectCurriculum(
    id: number,
    subjectId: number,
    organizationId: number,
    data: UpdateSubjectCurriculumDTO,
  ) {
    // Verify subject exists
    await this.getSubjectById(subjectId, organizationId);

    // Verify curriculum item belongs to subject
    const existingItem = await programRepository.getSubjectCurriculumById(id);
    if (!existingItem || existingItem.subjectId !== subjectId) {
      throw new Error("Curriculum item not found");
    }

    // Update curriculum item
    const updateData: any = {};
    if (data.type !== undefined) updateData.type = data.type;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl;
    if (data.videoThumbnail !== undefined)
      updateData.videoThumbnail = data.videoThumbnail;
    if (data.videoLength !== undefined)
      updateData.videoLength = data.videoLength;
    if (data.maxScore !== undefined) updateData.maxScore = data.maxScore;
    if (data.passingScore !== undefined)
      updateData.passingScore = data.passingScore;
    if (data.dueDate !== undefined)
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.quizData !== undefined) updateData.quizData = data.quizData;
    if (data.isPublished !== undefined)
      updateData.isPublished = data.isPublished ? 1 : 0;
    if (data.isRequired !== undefined)
      updateData.isRequired = data.isRequired ? 1 : 0;

    await programRepository.updateSubjectCurriculum(id, updateData);

    // Update resources if provided
    if (data.resources) {
      await programRepository.deleteCurriculumResources(id);
      if (data.resources.length) {
        const curriculumResources = data.resources.map((resource) => ({
          title: resource.title,
          type: resource.type as "link" | "document" | "file" | "video",
          url: resource.url,
        }));

        await programRepository.createCurriculumResources(id, curriculumResources);
      }
    }

    return await programRepository.getSubjectCurriculumById(id);
  }

  async deleteSubjectCurriculum(
    id: number,
    subjectId: number,
    organizationId: number,
  ) {
    await this.updateSubjectCurriculum(id, subjectId, organizationId, {});
    return await programRepository.deleteSubjectCurriculum(id);
  }

  // ==================== ORGANIZATION SETTINGS ====================

  async getOrganizationSettings(organizationId: number) {
    let settings =
      await programRepository.getOrganizationSettings(organizationId);

    if (!settings) {
      // Create default settings
      settings = await programRepository.createOrganizationSettings({
        organizationId,
        type: "coaching",
        features: {},
        academicStructure: "semester",
        gradingSystem: "percentage",
        enableLms: true,
        enableCertificates: false,
        enableDiscussionForums: true,
      });
    }

    return settings;
  }

  async updateOrganizationSettings(
    organizationId: number,
    data: OrganizationSettingsDTO,
  ) {
    const existingSettings =
      await programRepository.getOrganizationSettings(organizationId);

    if (!existingSettings) {
      return await programRepository.createOrganizationSettings({
        organizationId,
        ...data,
        type: data.type ?? "coaching",
        features: data.features ?? {},
        academicStructure: data.academicStructure ?? "semester",
        gradingSystem: data.gradingSystem ?? "percentage",
        enableLms: data.enableLms ?? true,
        enableCertificates: data.enableCertificates ?? false,
        enableDiscussionForums: data.enableDiscussionForums ?? true,
      });
    }

    return await programRepository.updateOrganizationSettings(
      organizationId,
      data,
    );
  }
}
