// enrollment.repository.ts
import { eq, and, desc, sql, inArray, asc } from "drizzle-orm";
import DB from "../../config/db.js";
import {
  studentBatchEnrollments,
  studentSubjectEnrollments,
  studentCurriculumProgress,
  programBatches,
  programs,
  users,
  batchSubjects,
  subjects,
  subjectCurriculum,
} from "../../db/schema/index.js";

export const enrollmentRepository = {
  // ==================== ENROLLMENTS ====================

  async createEnrollment(data: typeof studentBatchEnrollments.$inferInsert) {
    const [enrollment] = await DB.insert(studentBatchEnrollments)
      .values(data)
      .returning();
    return enrollment;
  },

  async getEnrollmentById(id: number) {
    const [enrollment] = await DB.select()
      .from(studentBatchEnrollments)
      .where(eq(studentBatchEnrollments.id, id));

    if (!enrollment) return null;

    // Get batch info
    const [batch] = await DB.select()
      .from(programBatches)
      .where(eq(programBatches.id, enrollment.batchId));

    return {
      ...enrollment,
      batch,
    };
  },

  async getEnrollmentByStudentAndBatch(studentId: number, batchId: number) {
    const [enrollment] = await DB.select()
      .from(studentBatchEnrollments)
      .where(
        and(
          eq(studentBatchEnrollments.studentId, studentId),
          eq(studentBatchEnrollments.batchId, batchId),
        ),
      );
    return enrollment ?? null;
  },

  async getEnrollmentsByBatch(
    batchId: number,
    page: number = 1,
    limit: number = 10,
    filters?: { status?: string },
  ) {
    const offset = (page - 1) * limit;
    const conditions = [eq(studentBatchEnrollments.batchId, batchId)];

    if (filters?.status) {
      conditions.push(
        eq(
          studentBatchEnrollments.status,
          filters.status as
            | "active"
            | "graduated"
            | "dropped"
            | "transferred"
            | "waitlisted",
        ),
      );
    }

    const whereClause = and(...conditions);

    const totalResult = await DB.select({ count: sql<number>`count(*)` })
      .from(studentBatchEnrollments)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    const items = await DB.select({
      enrollment: studentBatchEnrollments,
      student: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
      .from(studentBatchEnrollments)
      .innerJoin(users, eq(studentBatchEnrollments.studentId, users.id))
      .where(whereClause)
      .orderBy(desc(studentBatchEnrollments.enrollmentDate))
      .limit(limit)
      .offset(offset);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getEnrollmentsByStudent(studentId: number, organizationId: number) {
    const results = await DB.select({
      enrollment: studentBatchEnrollments,
      batch: programBatches,
      program: programs,
    })
      .from(studentBatchEnrollments)
      .innerJoin(
        programBatches,
        eq(studentBatchEnrollments.batchId, programBatches.id),
      )
      .innerJoin(programs, eq(programBatches.programId, programs.id))
      .where(
        and(
          eq(studentBatchEnrollments.studentId, studentId),
          eq(programs.organizationId, organizationId),
        ),
      )
      .orderBy(desc(studentBatchEnrollments.enrollmentDate));

    return results;
  },

  async updateEnrollment(
    id: number,
    data: Partial<typeof studentBatchEnrollments.$inferInsert>,
  ) {
    const [updated] = await DB.update(studentBatchEnrollments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(studentBatchEnrollments.id, id))
      .returning();
    return updated;
  },

  async deleteEnrollment(id: number) {
    const [deleted] = await DB.delete(studentBatchEnrollments)
      .where(eq(studentBatchEnrollments.id, id))
      .returning();
    return deleted;
  },

  // ==================== STUDENT SUBJECT ENROLLMENTS ====================

  async createSubjectEnrollment(
    data: typeof studentSubjectEnrollments.$inferInsert,
  ) {
    const [enrollment] = await DB.insert(studentSubjectEnrollments)
      .values(data)
      .returning();
    return enrollment;
  },

  async getSubjectEnrollment(studentBatchId: number, batchSubjectId: number) {
    const [enrollment] = await DB.select()
      .from(studentSubjectEnrollments)
      .where(
        and(
          eq(studentSubjectEnrollments.studentBatchId, studentBatchId),
          eq(studentSubjectEnrollments.batchSubjectId, batchSubjectId),
        ),
      );
    return enrollment ?? null;
  },

  async updateSubjectEnrollment(
    studentBatchId: number,
    batchSubjectId: number,
    data: Partial<typeof studentSubjectEnrollments.$inferInsert>,
  ) {
    const [updated] = await DB.update(studentSubjectEnrollments)
      .set(data)
      .where(
        and(
          eq(studentSubjectEnrollments.studentBatchId, studentBatchId),
          eq(studentSubjectEnrollments.batchSubjectId, batchSubjectId),
        ),
      )
      .returning();
    return updated;
  },

  // ==================== STUDENT PROGRESS ====================

  async upsertProgress(
    studentBatchId: number,
    curriculumId: number,
    data: Partial<typeof studentCurriculumProgress.$inferInsert>,
  ) {
    const existing = await this.getProgress(studentBatchId, curriculumId);

    if (existing) {
      const [updated] = await DB.update(studentCurriculumProgress)
        .set({ ...data, updatedAt: new Date() })
        .where(
          and(
            eq(studentCurriculumProgress.studentBatchId, studentBatchId),
            eq(studentCurriculumProgress.curriculumId, curriculumId),
          ),
        )
        .returning();
      return updated;
    } else {
      const [created] = await DB.insert(studentCurriculumProgress)
        .values({
          studentBatchId,
          curriculumId,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      return created;
    }
  },

  async getProgress(studentBatchId: number, curriculumId: number) {
    const [progress] = await DB.select()
      .from(studentCurriculumProgress)
      .where(
        and(
          eq(studentCurriculumProgress.studentBatchId, studentBatchId),
          eq(studentCurriculumProgress.curriculumId, curriculumId),
        ),
      );
    return progress ?? null;
  },

  async getStudentProgress(studentBatchId: number) {
    const progress = await DB.select({
      progress: studentCurriculumProgress,
      curriculumItem: subjectCurriculum,
    })
      .from(studentCurriculumProgress)
      .innerJoin(
        subjectCurriculum,
        eq(studentCurriculumProgress.curriculumId, subjectCurriculum.id),
      )
      .where(eq(studentCurriculumProgress.studentBatchId, studentBatchId))
      .orderBy(asc(subjectCurriculum.position));

    return progress;
  },

  async getBatchProgress(batchId: number) {
    const progress = await DB.select({
      studentId: studentBatchEnrollments.studentId,
      enrollmentId: studentBatchEnrollments.id,
      progress: studentCurriculumProgress,
    })
      .from(studentBatchEnrollments)
      .leftJoin(
        studentCurriculumProgress,
        eq(
          studentBatchEnrollments.id,
          studentCurriculumProgress.studentBatchId,
        ),
      )
      .where(eq(studentBatchEnrollments.batchId, batchId));

    return progress;
  },
};
