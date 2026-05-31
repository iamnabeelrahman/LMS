// batch.repository.ts
import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import DB from "../../config/db.js";
import {
  programBatches,
  batchSections,
  batchSubjects,
  studentBatchEnrollments,
  studentSubjectEnrollments,
  programs,
  programCurriculums,
  subjects,
  users,
} from "../../db/schema/index.js";

export const batchRepository = {
  // ==================== BATCH CRUD ====================

  async createBatch(data: typeof programBatches.$inferInsert) {
    const [batch] = await DB.insert(programBatches).values(data).returning();
    return batch;
  },

  async getBatchByCode(batchCode: string, programId: number) {
    const [batch] = await DB.select()
      .from(programBatches)
      .where(
        and(
          eq(programBatches.batchCode, batchCode),
          eq(programBatches.programId, programId),
        ),
      );
    return batch ?? null;
  },

  async getBatchById(id: number, programId: number) {
    const [batch] = await DB.select()
      .from(programBatches)
      .where(
        and(eq(programBatches.id, id), eq(programBatches.programId, programId)),
      );

    if (!batch) return null;

    // Get sections
    const sections = await DB.select()
      .from(batchSections)
      .where(eq(batchSections.batchId, id))
      .orderBy(asc(batchSections.name));

    // Get batch subjects
    const batchSubjectsData = await DB.select({
      id: batchSubjects.id,
      subjectId: batchSubjects.subjectId,
      academicTermId: batchSubjects.academicTermId,
      teacherId: batchSubjects.teacherId,
      schedule: batchSubjects.schedule,
      roomNumber: batchSubjects.roomNumber,
      startDate: batchSubjects.startDate,
      endDate: batchSubjects.endDate,
      subject: subjects,
    })
      .from(batchSubjects)
      .innerJoin(subjects, eq(batchSubjects.subjectId, subjects.id))
      .where(eq(batchSubjects.batchId, id));

    return {
      ...batch,
      sections,
      subjects: batchSubjectsData,
    };
  },

  async getBatchByIdWithOrg(id: number, organizationId: number) {
    const result = await DB.select({
      batch: programBatches,
      program: programs,
    })
      .from(programBatches)
      .innerJoin(programs, eq(programBatches.programId, programs.id))
      .where(
        and(
          eq(programBatches.id, id),
          eq(programs.organizationId, organizationId),
        ),
      );

    if (result.length === 0) return null;
    return {
      ...result[0].batch,
      program: result[0].program,
    };
  },

  async getBatchesByProgram(
    programId: number,
    page: number = 1,
    limit: number = 10,
    filters?: { status?: string; search?: string },
  ) {
    const offset = (page - 1) * limit;
    const conditions = [eq(programBatches.programId, programId)];

    if (filters?.status) {
      conditions.push(
        eq(
          programBatches.status,
          filters.status as "active" | "upcoming" | "completed" | "cancelled",
        ),
      );
    }

    if (filters?.search) {
      conditions.push(
        sql`${programBatches.name} ILIKE ${`%${filters.search}%`} OR ${programBatches.batchCode} ILIKE ${`%${filters.search}%`}`,
      );
    }

    const whereClause = and(...conditions);

    const totalResult = await DB.select({ count: sql<number>`count(*)` })
      .from(programBatches)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    const items = await DB.select()
      .from(programBatches)
      .where(whereClause)
      .orderBy(desc(programBatches.createdAt))
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

  async updateBatch(
    id: number,
    programId: number,
    data: Partial<typeof programBatches.$inferInsert>,
  ) {
    const [updated] = await DB.update(programBatches)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(programBatches.id, id), eq(programBatches.programId, programId)),
      )
      .returning();
    return updated;
  },

  async deleteBatch(id: number, programId: number) {
    const [deleted] = await DB.delete(programBatches)
      .where(
        and(eq(programBatches.id, id), eq(programBatches.programId, programId)),
      )
      .returning();
    return deleted;
  },

  async incrementBatchEnrollment(batchId: number) {
    await DB.update(programBatches)
      .set({ currentEnrollment: sql`${programBatches.currentEnrollment} + 1` })
      .where(eq(programBatches.id, batchId));
  },

  async decrementBatchEnrollment(batchId: number) {
    await DB.update(programBatches)
      .set({ currentEnrollment: sql`${programBatches.currentEnrollment} - 1` })
      .where(eq(programBatches.id, batchId));
  },

  async getBatchEnrollmentCount(batchId: number) {
    const result = await DB.select({ count: sql<number>`count(*)` })
      .from(studentBatchEnrollments)
      .where(eq(studentBatchEnrollments.batchId, batchId));
    return result[0]?.count || 0;
  },

  // ==================== BATCH SECTIONS ====================

  async createBatchSection(data: typeof batchSections.$inferInsert) {
    const [section] = await DB.insert(batchSections).values(data).returning();
    return section;
  },

  async getBatchSectionById(id: number, batchId: number) {
    const [section] = await DB.select()
      .from(batchSections)
      .where(and(eq(batchSections.id, id), eq(batchSections.batchId, batchId)));
    return section ?? null;
  },

  async getBatchSectionByName(batchId: number, name: string) {
    const [section] = await DB.select()
      .from(batchSections)
      .where(
        and(eq(batchSections.batchId, batchId), eq(batchSections.name, name)),
      );
    return section ?? null;
  },

  async getBatchSections(batchId: number) {
    return await DB.select()
      .from(batchSections)
      .where(eq(batchSections.batchId, batchId))
      .orderBy(asc(batchSections.name));
  },

  async updateBatchSection(
    id: number,
    batchId: number,
    data: Partial<typeof batchSections.$inferInsert>,
  ) {
    const [updated] = await DB.update(batchSections)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(batchSections.id, id), eq(batchSections.batchId, batchId)))
      .returning();
    return updated;
  },

  async deleteBatchSection(id: number, batchId: number) {
    const [deleted] = await DB.delete(batchSections)
      .where(and(eq(batchSections.id, id), eq(batchSections.batchId, batchId)))
      .returning();
    return deleted;
  },

  async incrementSectionStudents(sectionId: number) {
    await DB.update(batchSections)
      .set({ currentStudents: sql`${batchSections.currentStudents} + 1` })
      .where(eq(batchSections.id, sectionId));
  },

  async decrementSectionStudents(sectionId: number) {
    await DB.update(batchSections)
      .set({ currentStudents: sql`${batchSections.currentStudents} - 1` })
      .where(eq(batchSections.id, sectionId));
  },

  async getSectionStudentCount(sectionId: number) {
    const result = await DB.select({ count: sql<number>`count(*)` })
      .from(studentBatchEnrollments)
      .where(eq(studentBatchEnrollments.sectionId, sectionId));
    return result[0]?.count || 0;
  },

  // ==================== BATCH SUBJECTS ====================

  async createBatchSubject(data: typeof batchSubjects.$inferInsert) {
    const [batchSubject] = await DB.insert(batchSubjects)
      .values(data)
      .returning();
    return batchSubject;
  },

  async getBatchSubjectAssignment(batchId: number, subjectId: number) {
    const [assignment] = await DB.select()
      .from(batchSubjects)
      .where(
        and(
          eq(batchSubjects.batchId, batchId),
          eq(batchSubjects.subjectId, subjectId),
        ),
      );
    return assignment ?? null;
  },

  async getBatchSubjects(batchId: number) {
    return await DB.select({
      id: batchSubjects.id,
      subjectId: batchSubjects.subjectId,
      academicTermId: batchSubjects.academicTermId,
      teacherId: batchSubjects.teacherId,
      schedule: batchSubjects.schedule,
      roomNumber: batchSubjects.roomNumber,
      startDate: batchSubjects.startDate,
      endDate: batchSubjects.endDate,
      subject: subjects,
      teacher: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
      .from(batchSubjects)
      .innerJoin(subjects, eq(batchSubjects.subjectId, subjects.id))
      .leftJoin(users, eq(batchSubjects.teacherId, users.id))
      .where(eq(batchSubjects.batchId, batchId));
  },

  async deleteBatchSubject(id: number, batchId: number) {
    const [deleted] = await DB.delete(batchSubjects)
      .where(and(eq(batchSubjects.id, id), eq(batchSubjects.batchId, batchId)))
      .returning();
    return deleted;
  },

  async getBatchSubjectEnrollmentCount(batchSubjectId: number) {
    const result = await DB.select({ count: sql<number>`count(*)` })
      .from(studentSubjectEnrollments)
      .where(eq(studentSubjectEnrollments.batchSubjectId, batchSubjectId));
    return result[0]?.count || 0;
  },
};
