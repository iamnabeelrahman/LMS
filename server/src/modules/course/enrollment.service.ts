// enrollment.service.ts
import { enrollmentRepository } from "./enrollment.repository.js";
import { batchRepository } from "./batch.repository.js";
import { programRepository } from "./program.repository.js";
import {
  EnrollStudentDTO,
  UpdateEnrollmentDTO,
  UpdateProgressDTO,
} from "./course.types.js";

export class EnrollmentService {
  async enrollStudent(
    batchId: number,
    organizationId: number,
    data: EnrollStudentDTO,
  ) {
    // Verify batch exists
    const batch = await batchRepository.getBatchByIdWithOrg(
      batchId,
      organizationId,
    );
    if (!batch) {
      throw new Error("Batch not found");
    }

    const currentEnrollment = batch.currentEnrollment ?? 0;

    // Check if batch has capacity
    if (batch.maxSeats && currentEnrollment >= batch.maxSeats) {
      if (
        batch.waitlistCapacity &&
        currentEnrollment >= batch.maxSeats + batch.waitlistCapacity
      ) {
        throw new Error("Batch is full");
      }
      // If no waitlist capacity, just throw error
      if (!batch.waitlistCapacity) {
        throw new Error("Batch is full");
      }
    }

    // Check if student is already enrolled in this batch
    const existingEnrollment =
      await enrollmentRepository.getEnrollmentByStudentAndBatch(
        data.studentId,
        batchId,
      );
    if (existingEnrollment) {
      throw new Error("Student is already enrolled in this batch");
    }

    // Verify section if provided
    if (data.sectionId) {
      const section = await batchRepository.getBatchSectionById(
        data.sectionId,
        batchId,
      );
      if (!section) {
        throw new Error("Section not found");
      }

      // Check section capacity
      if (
        section.maxStudents &&
        (section.currentStudents ?? 0) >= section.maxStudents
      ) {
        throw new Error("Section is full");
      }
    }

    // Determine status (waitlisted if batch is full)
    let status = "active";
    if (batch.maxSeats && currentEnrollment >= batch.maxSeats) {
      status = "waitlisted";
    }

    // Generate enrollment number if not provided
    let enrollmentNumber = data.enrollmentNumber;
    if (!enrollmentNumber) {
      enrollmentNumber = await this.generateEnrollmentNumber(
        batchId,
        data.studentId,
      );
    }

    const enrollment = await enrollmentRepository.createEnrollment({
      studentId: data.studentId,
      batchId,
      sectionId: data.sectionId || null,
      enrollmentNumber,
      rollNumber: data.rollNumber || null,
      enrollmentDate: new Date(),
      status: status as any,
      currentYear: data.currentYear || null,
      currentSemester: data.currentSemester || null,
      metadata: data.metadata || null,
    });

    // Update batch current enrollment count
    await batchRepository.incrementBatchEnrollment(batchId);

    // Update section current students count if section provided
    if (data.sectionId) {
      await batchRepository.incrementSectionStudents(data.sectionId);
    }

    return await enrollmentRepository.getEnrollmentById(enrollment.id);
  }

  async getBatchEnrollments(
    batchId: number,
    organizationId: number,
    page: number = 1,
    limit: number = 10,
    filters?: { status?: string },
  ) {
    // Verify batch exists
    await batchRepository.getBatchByIdWithOrg(batchId, organizationId);

    return await enrollmentRepository.getEnrollmentsByBatch(
      batchId,
      page,
      limit,
      filters,
    );
  }

  async getStudentEnrollments(studentId: number, organizationId: number) {
    return await enrollmentRepository.getEnrollmentsByStudent(
      studentId,
      organizationId,
    );
  }

  async updateEnrollment(
    enrollmentId: number,
    organizationId: number,
    data: UpdateEnrollmentDTO,
  ) {
    const enrollment =
      await enrollmentRepository.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Verify batch exists in organization
    const batch = await batchRepository.getBatchByIdWithOrg(
      enrollment.batchId,
      organizationId,
    );
    if (!batch) {
      throw new Error("Enrollment not found in your organization");
    }

    // Handle section change
    if (
      data.sectionId !== undefined &&
      data.sectionId !== enrollment.sectionId
    ) {
      // Remove from old section
      if (enrollment.sectionId) {
        await batchRepository.decrementSectionStudents(enrollment.sectionId);
      }

      // Add to new section
      if (data.sectionId) {
        const section = await batchRepository.getBatchSectionById(
          data.sectionId,
          enrollment.batchId,
        );
        if (!section) {
          throw new Error("Section not found");
        }
        if (
          section.maxStudents &&
          (section.currentStudents ?? 0) >= section.maxStudents
        ) {
          throw new Error("Section is full");
        }
        await batchRepository.incrementSectionStudents(data.sectionId);
      }
    }

    const updateData: any = {};
    if (data.sectionId !== undefined) updateData.sectionId = data.sectionId;
    if (data.rollNumber !== undefined) updateData.rollNumber = data.rollNumber;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.currentYear !== undefined)
      updateData.currentYear = data.currentYear;
    if (data.currentSemester !== undefined)
      updateData.currentSemester = data.currentSemester;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    await enrollmentRepository.updateEnrollment(enrollmentId, updateData);

    return await enrollmentRepository.getEnrollmentById(enrollmentId);
  }

  async deleteEnrollment(enrollmentId: number, organizationId: number) {
    const enrollment =
      await enrollmentRepository.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Verify batch exists in organization
    const batch = await batchRepository.getBatchByIdWithOrg(
      enrollment.batchId,
      organizationId,
    );
    if (!batch) {
      throw new Error("Enrollment not found in your organization");
    }

    // Decrement counts
    await batchRepository.decrementBatchEnrollment(enrollment.batchId);

    if (enrollment.sectionId) {
      await batchRepository.decrementSectionStudents(enrollment.sectionId);
    }

    return await enrollmentRepository.deleteEnrollment(enrollmentId);
  }

  async getStudentProgress(enrollmentId: number, organizationId: number) {
    const enrollment =
      await enrollmentRepository.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Verify batch exists in organization
    await batchRepository.getBatchByIdWithOrg(
      enrollment.batchId,
      organizationId,
    );

    const progress =
      await enrollmentRepository.getStudentProgress(enrollmentId);

    // Calculate overall progress
    const totalItems = progress.length;
    const completedItems = progress.filter(
      (p) => p.progress.status === "completed",
    ).length;
    const overallProgress =
      totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return {
      items: progress,
      summary: {
        totalItems,
        completedItems,
        inProgressItems: progress.filter(
          (p) => p.progress.status === "in_progress",
        ).length,
        notStartedItems: progress.filter(
          (p) => p.progress.status === "not_started",
        ).length,
        overallProgress: Math.round(overallProgress),
      },
    };
  }

  async updateProgress(
    enrollmentId: number,
    curriculumId: number,
    organizationId: number,
    data: UpdateProgressDTO,
  ) {
    const enrollment =
      await enrollmentRepository.getEnrollmentById(enrollmentId);
    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Verify batch exists in organization
    await batchRepository.getBatchByIdWithOrg(
      enrollment.batchId,
      organizationId,
    );

    // Verify curriculum item exists and belongs to a subject in the batch's curriculum
    const curriculumItem =
      await programRepository.getSubjectCurriculumById(curriculumId);
    if (!curriculumItem) {
      throw new Error("Curriculum item not found");
    }

    const subject = await programRepository.getSubjectById(
      curriculumItem.subjectId,
    );
    if (
      !subject ||
      subject.programCurriculumId !== enrollment.batch?.curriculumId
    ) {
      throw new Error("Curriculum item not part of batch curriculum");
    }

    const updateData: any = {
      status: data.status,
    };
    if (data.score !== undefined) updateData.score = data.score;
    if (data.grade !== undefined) updateData.grade = data.grade;
    if (data.watchTime !== undefined) updateData.watchTime = data.watchTime;
    if (data.answers !== undefined) updateData.answers = data.answers;

    if (data.status === "completed" && !data.completedAt) {
      updateData.completedAt = new Date();
    }
    if (data.status === "in_progress" && !data.startedAt) {
      updateData.startedAt = new Date();
    }

    const progress = await enrollmentRepository.upsertProgress(
      enrollmentId,
      curriculumId,
      updateData,
    );

    return progress;
  }

  private async generateEnrollmentNumber(
    batchId: number,
    studentId: number,
  ): Promise<string> {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ENR-${batchId}-${studentId}-${timestamp}-${random}`;
  }
}
