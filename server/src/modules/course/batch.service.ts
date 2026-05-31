// batch.service.ts
import { batchRepository } from "./batch.repository.js";
import { programRepository } from "./program.repository.js";
import {
  CreateBatchDTO,
  UpdateBatchDTO,
  CreateBatchSectionDTO,
  UpdateBatchSectionDTO,
  AssignBatchSubjectDTO,
} from "./course.types.js";

export class BatchService {
  // ==================== BATCH CRUD ====================

  async createBatch(
    programId: number,
    organizationId: number,
    data: CreateBatchDTO,
  ) {
    // Verify program exists
    const program = await programRepository.getProgramById(programId, organizationId);
    if (!program) {
      throw new Error("Program not found");
    }

    // Verify curriculum exists and belongs to program
    const curriculum = await programRepository.getCurriculumById(
      data.curriculumId,
      programId,
    );
    if (!curriculum) {
      throw new Error("Curriculum not found for this program");
    }

    // Check if batch with same code exists
    if (data.batchCode) {
      const existingBatch = await batchRepository.getBatchByCode(
        data.batchCode,
        programId,
      );
      if (existingBatch) {
        throw new Error("Batch with this code already exists");
      }
    }

    // Create batch
    const batch = await batchRepository.createBatch({
      programId,
      curriculumId: data.curriculumId,
      name: data.name,
      batchCode: data.batchCode || null,
      startYear: data.startYear || null,
      endYear: data.endYear || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      maxSeats: data.maxSeats || null,
      waitlistCapacity: data.waitlistCapacity || 0,
      status: data.status || "upcoming",
      metadata: data.metadata || null,
    });

    return await batchRepository.getBatchById(batch.id, programId);
  }

  async getBatchById(id: number, organizationId: number) {
    const batch = await batchRepository.getBatchByIdWithOrg(id, organizationId);
    if (!batch) {
      throw new Error("Batch not found");
    }
    return batch;
  }

  async getBatchesByProgram(
    programId: number,
    organizationId: number,
    page: number = 1,
    limit: number = 10,
    filters?: { status?: string; search?: string },
  ) {
    // Verify program exists
    const program = await programRepository.getProgramById(programId, organizationId);
    if (!program) {
      throw new Error("Program not found");
    }

    return await batchRepository.getBatchesByProgram(programId, page, limit, filters);
  }

  async updateBatch(
    id: number,
    organizationId: number,
    data: UpdateBatchDTO,
  ) {
    const existingBatch = await this.getBatchById(id, organizationId);

    // Update batch
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.batchCode !== undefined) updateData.batchCode = data.batchCode;
    if (data.curriculumId !== undefined) {
      // Verify new curriculum belongs to same program
      const curriculum = await programRepository.getCurriculumById(
        data.curriculumId,
        existingBatch.programId,
      );
      if (!curriculum) {
        throw new Error("Curriculum not found for this program");
      }
      updateData.curriculumId = data.curriculumId;
    }
    if (data.startYear !== undefined) updateData.startYear = data.startYear;
    if (data.endYear !== undefined) updateData.endYear = data.endYear;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.maxSeats !== undefined) updateData.maxSeats = data.maxSeats;
    if (data.waitlistCapacity !== undefined) updateData.waitlistCapacity = data.waitlistCapacity;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    await batchRepository.updateBatch(id, existingBatch.programId, updateData);

    return await batchRepository.getBatchById(id, existingBatch.programId);
  }

  async deleteBatch(id: number, organizationId: number) {
    const existingBatch = await this.getBatchById(id, organizationId);
    
    // Check if there are any enrollments
    const enrollmentCount = await batchRepository.getBatchEnrollmentCount(id);
    if (enrollmentCount > 0) {
      throw new Error("Cannot delete batch with existing enrollments");
    }

    return await batchRepository.deleteBatch(id, existingBatch.programId);
  }

  // ==================== BATCH SECTIONS ====================

  async createBatchSection(
    batchId: number,
    organizationId: number,
    data: CreateBatchSectionDTO,
  ) {
    // Verify batch exists
    const batch = await this.getBatchById(batchId, organizationId);

    // Check if section with same name exists
    const existingSection = await batchRepository.getBatchSectionByName(
      batchId,
      data.name,
    );
    if (existingSection) {
      throw new Error("Section with this name already exists in this batch");
    }

    const section = await batchRepository.createBatchSection({
      batchId,
      name: data.name,
      sectionCode: data.sectionCode || null,
      classTeacherId: data.classTeacherId || null,
      maxStudents: data.maxStudents || null,
      roomNumber: data.roomNumber || null,
      schedule: data.schedule || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    return section;
  }

  async getBatchSections(batchId: number, organizationId: number) {
    await this.getBatchById(batchId, organizationId);
    return await batchRepository.getBatchSections(batchId);
  }

  async updateBatchSection(
    id: number,
    batchId: number,
    organizationId: number,
    data: UpdateBatchSectionDTO,
  ) {
    await this.getBatchById(batchId, organizationId);

    const existingSection = await batchRepository.getBatchSectionById(id, batchId);
    if (!existingSection) {
      throw new Error("Section not found");
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.sectionCode !== undefined) updateData.sectionCode = data.sectionCode;
    if (data.classTeacherId !== undefined) updateData.classTeacherId = data.classTeacherId;
    if (data.maxStudents !== undefined) updateData.maxStudents = data.maxStudents;
    if (data.roomNumber !== undefined) updateData.roomNumber = data.roomNumber;
    if (data.schedule !== undefined) updateData.schedule = data.schedule;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    await batchRepository.updateBatchSection(id, batchId, updateData);

    return await batchRepository.getBatchSectionById(id, batchId);
  }

  async deleteBatchSection(id: number, batchId: number, organizationId: number) {
    await this.getBatchById(batchId, organizationId);

    // Check if section has students
    const studentCount = await batchRepository.getSectionStudentCount(id);
    if (studentCount > 0) {
      throw new Error("Cannot delete section with enrolled students");
    }

    return await batchRepository.deleteBatchSection(id, batchId);
  }

  // ==================== BATCH SUBJECTS ====================

  async assignBatchSubject(
    batchId: number,
    organizationId: number,
    data: AssignBatchSubjectDTO,
  ) {
    const batch = await this.getBatchById(batchId, organizationId);

    // Verify subject exists and belongs to the batch's curriculum
    const subject = await programRepository.getSubjectById(data.subjectId);
    if (!subject || subject.programCurriculumId !== batch.curriculumId) {
      throw new Error("Subject not found in batch curriculum");
    }

    // Check if subject already assigned to this batch
    const existingAssignment = await batchRepository.getBatchSubjectAssignment(
      batchId,
      data.subjectId,
    );
    if (existingAssignment) {
      throw new Error("Subject already assigned to this batch");
    }

    // Verify academic term if provided
    if (data.academicTermId) {
      const term = await programRepository.getAcademicTermById(data.academicTermId);
      if (!term || term.programCurriculumId !== batch.curriculumId) {
        throw new Error("Academic term not found in batch curriculum");
      }
    }

    const batchSubject = await batchRepository.createBatchSubject({
      batchId,
      subjectId: data.subjectId,
      academicTermId: data.academicTermId || null,
      teacherId: data.teacherId || null,
      schedule: data.schedule || null,
      roomNumber: data.roomNumber || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
    });

    return batchSubject;
  }

  async getBatchSubjects(batchId: number, organizationId: number) {
    await this.getBatchById(batchId, organizationId);
    return await batchRepository.getBatchSubjects(batchId);
  }

  async removeBatchSubject(
    batchSubjectId: number,
    batchId: number,
    organizationId: number,
  ) {
    await this.getBatchById(batchId, organizationId);

    // Check if any students are enrolled in this subject
    const enrollmentCount = await batchRepository.getBatchSubjectEnrollmentCount(
      batchSubjectId,
    );
    if (enrollmentCount > 0) {
      throw new Error("Cannot remove subject with student enrollments");
    }

    return await batchRepository.deleteBatchSubject(batchSubjectId, batchId);
  }
}