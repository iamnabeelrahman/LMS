// program.repository.ts
import { eq, and, desc, asc, sql, inArray, isNull } from "drizzle-orm";
import DB from "../../config/db.js";
import {
  programs,
  programCurriculums,
  academicTerms,
  subjects,
  subjectCurriculum,
  curriculumResources,
  tags,
  programTags,
  subjectTags,
  organizationSettings,
} from "../../db/schema/index.js";

export const programRepository = {
  // ==================== PROGRAM CRUD ====================

  async createProgram(data: typeof programs.$inferInsert) {
    const [program] = await DB.insert(programs).values(data).returning();
    return program;
  },

  async getProgramByCode(code: string, organizationId: number) {
    const [program] = await DB.select()
      .from(programs)
      .where(
        and(eq(programs.code, code), eq(programs.organizationId, organizationId)),
      );
    return program ?? null;
  },

  async getProgramById(id: number, organizationId: number) {
    const [program] = await DB.select()
      .from(programs)
      .where(and(eq(programs.id, id), eq(programs.organizationId, organizationId)));

    if (!program) return null;

    // Get tags
    const tagsData = await DB.select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
      .from(programTags)
      .innerJoin(tags, eq(programTags.tagId, tags.id))
      .where(eq(programTags.programId, id));

    // Get curriculums
    const curriculums = await DB.select()
      .from(programCurriculums)
      .where(eq(programCurriculums.programId, id))
      .orderBy(desc(programCurriculums.createdAt));

    return {
      ...program,
      tags: tagsData,
      curriculums,
    };
  },

  async getProgramsByOrganization(
    organizationId: number,
    page: number = 1,
    limit: number = 10,
    filters?: { isActive?: boolean; search?: string },
  ) {
    const offset = (page - 1) * limit;
    const conditions = [eq(programs.organizationId, organizationId)];

    if (filters?.isActive !== undefined) {
      conditions.push(eq(programs.isActive, filters.isActive));
    }

    if (filters?.search) {
      conditions.push(
        sql`${programs.name} ILIKE ${`%${filters.search}%`} OR ${programs.code} ILIKE ${`%${filters.search}%`}`,
      );
    }

    const whereClause = and(...conditions);

    const totalResult = await DB.select({ count: sql<number>`count(*)` })
      .from(programs)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    const items = await DB.select()
      .from(programs)
      .where(whereClause)
      .orderBy(desc(programs.createdAt))
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

  async updateProgram(id: number, organizationId: number, data: Partial<typeof programs.$inferInsert>) {
    const [updated] = await DB.update(programs)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(programs.id, id), eq(programs.organizationId, organizationId)))
      .returning();
    return updated;
  },

  async deleteProgram(id: number, organizationId: number) {
    const [deleted] = await DB.delete(programs)
      .where(and(eq(programs.id, id), eq(programs.organizationId, organizationId)))
      .returning();
    return deleted;
  },

  // ==================== CURRICULUM CRUD ====================

  async createCurriculum(data: typeof programCurriculums.$inferInsert) {
    const [curriculum] = await DB.insert(programCurriculums).values(data).returning();
    return curriculum;
  },

  async getCurriculumsByProgram(programId: number) {
    return await DB.select()
      .from(programCurriculums)
      .where(eq(programCurriculums.programId, programId))
      .orderBy(desc(programCurriculums.isDefault), desc(programCurriculums.createdAt));
  },

  async getCurriculumById(id: number, programId: number) {
    const [curriculum] = await DB.select()
      .from(programCurriculums)
      .where(and(eq(programCurriculums.id, id), eq(programCurriculums.programId, programId)));
    return curriculum ?? null;
  },

  async getCurriculumWithProgram(id: number) {
    const result = await DB.select({
      curriculum: programCurriculums,
      program: programs,
    })
      .from(programCurriculums)
      .innerJoin(programs, eq(programCurriculums.programId, programs.id))
      .where(eq(programCurriculums.id, id));

    if (result.length === 0) return null;
    return {
      ...result[0].curriculum,
      program: result[0].program,
    };
  },

  async unsetDefaultCurriculum(programId: number) {
    await DB.update(programCurriculums)
      .set({ isDefault: false })
      .where(and(eq(programCurriculums.programId, programId), eq(programCurriculums.isDefault, true)));
  },

  async updateCurriculum(id: number, programId: number, data: Partial<typeof programCurriculums.$inferInsert>) {
    const [updated] = await DB.update(programCurriculums)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(programCurriculums.id, id), eq(programCurriculums.programId, programId)))
      .returning();
    return updated;
  },

  async deleteCurriculum(id: number, programId: number) {
    const [deleted] = await DB.delete(programCurriculums)
      .where(and(eq(programCurriculums.id, id), eq(programCurriculums.programId, programId)))
      .returning();
    return deleted;
  },

  // ==================== ACADEMIC TERMS ====================

  async createAcademicTerm(data: typeof academicTerms.$inferInsert) {
    const [term] = await DB.insert(academicTerms).values(data).returning();
    return term;
  },

  async getAcademicTermById(id: number) {
    const [term] = await DB.select().from(academicTerms).where(eq(academicTerms.id, id));
    return term ?? null;
  },

  async getAcademicTermBySequence(curriculumId: number, sequence: number) {
    const [term] = await DB.select()
      .from(academicTerms)
      .where(and(eq(academicTerms.programCurriculumId, curriculumId), eq(academicTerms.sequence, sequence)));
    return term ?? null;
  },

  async getAcademicTermsByCurriculum(curriculumId: number) {
    return await DB.select()
      .from(academicTerms)
      .where(eq(academicTerms.programCurriculumId, curriculumId))
      .orderBy(asc(academicTerms.sequence));
  },

  // ==================== SUBJECTS ====================

  async createSubject(data: typeof subjects.$inferInsert) {
    const [subject] = await DB.insert(subjects).values(data).returning();
    return subject;
  },

  async getSubjectByCode(code: string, curriculumId: number) {
    const [subject] = await DB.select()
      .from(subjects)
      .where(and(eq(subjects.code, code), eq(subjects.programCurriculumId, curriculumId)));
    return subject ?? null;
  },

  async getSubjectById(id: number) {
    const [subject] = await DB.select().from(subjects).where(eq(subjects.id, id));
    if (!subject) return null;

    // Get tags
    const tagsData = await DB.select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
      .from(subjectTags)
      .innerJoin(tags, eq(subjectTags.tagId, tags.id))
      .where(eq(subjectTags.subjectId, id));

    // Get curriculum items
    const curriculumItems = await DB.select()
      .from(subjectCurriculum)
      .where(eq(subjectCurriculum.subjectId, id))
      .orderBy(asc(subjectCurriculum.position));

    return {
      ...subject,
      tags: tagsData,
      curriculum: curriculumItems,
    };
  },

  async getSubjectsByCurriculum(curriculumId: number) {
    const results = await DB.select()
      .from(subjects)
      .where(eq(subjects.programCurriculumId, curriculumId))
      .orderBy(asc(subjects.code));

    // Get tags for each subject
    const subjectsWithTags = [];
    for (const subject of results) {
      const tagsData = await DB.select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
        .from(subjectTags)
        .innerJoin(tags, eq(subjectTags.tagId, tags.id))
        .where(eq(subjectTags.subjectId, subject.id));

      subjectsWithTags.push({
        ...subject,
        tags: tagsData,
      });
    }

    return subjectsWithTags;
  },

  async updateSubject(id: number, data: Partial<typeof subjects.$inferInsert>) {
    const [updated] = await DB.update(subjects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subjects.id, id))
      .returning();
    return updated;
  },

  async deleteSubject(id: number) {
    const [deleted] = await DB.delete(subjects).where(eq(subjects.id, id)).returning();
    return deleted;
  },

  // ==================== SUBJECT CURRICULUM ====================

  async createSubjectCurriculum(data: typeof subjectCurriculum.$inferInsert) {
    const [item] = await DB.insert(subjectCurriculum).values(data).returning();
    return item;
  },

  async getSubjectCurriculumById(id: number) {
    const [item] = await DB.select().from(subjectCurriculum).where(eq(subjectCurriculum.id, id));
    if (!item) return null;

    // Get resources
    const resources = await DB.select()
      .from(curriculumResources)
      .where(eq(curriculumResources.curriculumId, id));

    return {
      ...item,
      resources,
    };
  },

  async getSubjectCurriculums(subjectId: number) {
    const items = await DB.select()
      .from(subjectCurriculum)
      .where(eq(subjectCurriculum.subjectId, subjectId))
      .orderBy(asc(subjectCurriculum.position));

    // Get resources for each item
    const itemsWithResources = [];
    for (const item of items) {
      const resources = await DB.select()
        .from(curriculumResources)
        .where(eq(curriculumResources.curriculumId, item.id));

      itemsWithResources.push({
        ...item,
        resources,
      });
    }

    return itemsWithResources;
  },

  async updateSubjectCurriculum(id: number, data: Partial<typeof subjectCurriculum.$inferInsert>) {
    const [updated] = await DB.update(subjectCurriculum)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(subjectCurriculum.id, id))
      .returning();
    return updated;
  },

  async deleteSubjectCurriculum(id: number) {
    const [deleted] = await DB.delete(subjectCurriculum).where(eq(subjectCurriculum.id, id)).returning();
    return deleted;
  },

  // ==================== CURRICULUM RESOURCES ====================

  async createCurriculumResources(curriculumId: number, resources: Omit<typeof curriculumResources.$inferInsert, 'curriculumId'>[]) {
    if (!resources.length) return [];
    return await DB.insert(curriculumResources)
      .values(resources.map(r => ({ curriculumId, title: r.title, type: r.type, url: r.url })))
      .returning();
  },

  async deleteCurriculumResources(curriculumId: number) {
    await DB.delete(curriculumResources).where(eq(curriculumResources.curriculumId, curriculumId));
  },

  // ==================== TAGS ====================

  async createOrGetTags(tagNames: string[]) {
    const tagResults = [];

    for (const name of tagNames) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      let [existingTag] = await DB.select().from(tags).where(eq(tags.name, name));

      if (existingTag) {
        tagResults.push(existingTag);
      } else {
        const [newTag] = await DB.insert(tags).values({ name, slug }).returning();
        tagResults.push(newTag);
      }
    }

    return tagResults;
  },

  async linkProgramTags(programId: number, tagIds: number[]) {
    if (!tagIds.length) return [];
    return await DB.insert(programTags)
      .values(tagIds.map(tagId => ({ programId, tagId })))
      .returning();
  },

  async deleteProgramTags(programId: number) {
    await DB.delete(programTags).where(eq(programTags.programId, programId));
  },

  async linkSubjectTags(subjectId: number, tagIds: number[]) {
    if (!tagIds.length) return [];
    return await DB.insert(subjectTags)
      .values(tagIds.map(tagId => ({ subjectId, tagId })))
      .returning();
  },

  async deleteSubjectTags(subjectId: number) {
    await DB.delete(subjectTags).where(eq(subjectTags.subjectId, subjectId));
  },

  // ==================== ORGANIZATION SETTINGS ====================

  async getOrganizationSettings(organizationId: number) {
    const [settings] = await DB.select()
      .from(organizationSettings)
      .where(eq(organizationSettings.organizationId, organizationId));
    return settings ?? null;
  },

  async createOrganizationSettings(data: typeof organizationSettings.$inferInsert) {
    const [settings] = await DB.insert(organizationSettings).values(data).returning();
    return settings;
  },

  async updateOrganizationSettings(organizationId: number, data: Partial<typeof organizationSettings.$inferInsert>) {
    const [updated] = await DB.update(organizationSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(organizationSettings.organizationId, organizationId))
      .returning();
    return updated;
  },
};