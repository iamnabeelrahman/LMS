import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import DB from "../../config/db.js";
import {
  courses,
  courseBenefits,
  coursePrerequisites,
  courseTags,
  tags,
  courseSections,
  courseLessons,
  lessonResources,
  courseLinks,
  courseReviews,
  lessonQuestions,
  questionReplies,
  reviewReplies,
} from "../../db/schema/index.js";

export const courseRepository = {
  // ==================== COURSE CRUD ====================

  async createCourse(data: typeof courses.$inferInsert) {
    const [course] = await DB.insert(courses).values(data).returning();
    return course;
  },

  async getCourseBySlug(slug: string, organizationId: number) {
    const [course] = await DB.select()
      .from(courses)
      .where(
        and(eq(courses.slug, slug), eq(courses.organizationId, organizationId)),
      );

    return course ?? null;
  },

  async getCourseById(id: number, organizationId: number) {
    // Get course basic info
    const [course] = await DB.select()
      .from(courses)
      .where(
        and(eq(courses.id, id), eq(courses.organizationId, organizationId)),
      );

    if (!course) return null;

    // Get benefits
    const benefits = await DB.select()
      .from(courseBenefits)
      .where(eq(courseBenefits.courseId, id));

    // Get prerequisites
    const prerequisites = await DB.select()
      .from(coursePrerequisites)
      .where(eq(coursePrerequisites.courseId, id));

    // Get tags with their details
    const tagsData = await DB.select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
    })
      .from(courseTags)
      .innerJoin(tags, eq(courseTags.tagId, tags.id))
      .where(eq(courseTags.courseId, id));

    // Get sections
    const sections = await DB.select()
      .from(courseSections)
      .where(eq(courseSections.courseId, id))
      .orderBy(asc(courseSections.position));

    // Get lessons for all sections
    let lessons: any[] = [];
    if (sections.length > 0) {
      const sectionIds = sections.map((s) => s.id);
      lessons = await DB.select()
        .from(courseLessons)
        .where(inArray(courseLessons.sectionId, sectionIds))
        .orderBy(asc(courseLessons.position));

      // Get links and resources for lessons
      if (lessons.length > 0) {
        const lessonIds = lessons.map((l) => l.id);

        const links = await DB.select()
          .from(courseLinks)
          .where(inArray(courseLinks.lessonId, lessonIds));

        const resources = await DB.select()
          .from(lessonResources)
          .where(inArray(lessonResources.lessonId, lessonIds));

        lessons = lessons.map((lesson) => ({
          ...lesson,
          links: links.filter((l) => l.lessonId === lesson.id),
          resources: resources.filter((r) => r.lessonId === lesson.id),
        }));
      }
    }

    // Map lessons to sections
    const sectionsWithLessons = sections.map((section) => ({
      ...section,
      lessons: lessons.filter((l) => l.sectionId === section.id),
    }));

    // Get reviews with user info
    const reviews = await DB.select({
      id: courseReviews.id,
      courseId: courseReviews.courseId,
      userId: courseReviews.userId,
      rating: courseReviews.rating,
      comment: courseReviews.comment,
      createdAt: courseReviews.createdAt,
    })
      .from(courseReviews)
      .where(eq(courseReviews.courseId, id))
      .orderBy(desc(courseReviews.createdAt));

    return {
      ...course,
      benefits,
      prerequisites,
      tags: tagsData,
      sections: sectionsWithLessons,
      reviews,
    };
  },

  async getCoursesByOrganization(
    organizationId: number,
    page: number = 1,
    limit: number = 10,
    filters?: {
      isPublished?: boolean;
      level?: "beginner" | "intermediate" | "advanced" | "all_levels";
      search?: string;
    },
  ) {
    const offset = (page - 1) * limit;

    let conditions = [eq(courses.organizationId, organizationId)];

    if (filters?.isPublished !== undefined) {
      conditions.push(eq(courses.isPublished, filters.isPublished));
    }
    if (filters?.level) {
      conditions.push(eq(courses.level, filters.level));
    }

    const whereClause = and(...conditions);

    if (filters?.search) {
      conditions.push(
        sql`${courses.title} ILIKE ${`%${filters.search}%`} OR ${courses.description} ILIKE ${`%${filters.search}%`}`,
      );
    }

    const finalWhereClause = and(...conditions);
    let query = DB.select().from(courses).where(finalWhereClause);

    const totalResult = await DB.select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    const items = await query
      .orderBy(desc(courses.createdAt))
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

  async updateCourse(
    id: number,
    organizationId: number,
    data: Partial<typeof courses.$inferInsert>,
  ) {
    const [updated] = await DB.update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(courses.id, id), eq(courses.organizationId, organizationId)),
      )
      .returning();
    return updated;
  },

  async deleteCourse(id: number, organizationId: number) {
    const [deleted] = await DB.delete(courses)
      .where(
        and(eq(courses.id, id), eq(courses.organizationId, organizationId)),
      )
      .returning();
    return deleted;
  },

  // ==================== COURSE BENEFITS ====================

  async createBenefits(courseId: number, benefits: { title: string }[]) {
    if (!benefits.length) return [];
    return await DB.insert(courseBenefits)
      .values(benefits.map((benefit) => ({ courseId, benefit: benefit.title })))
      .returning();
  },

  async deleteBenefits(courseId: number) {
    await DB.delete(courseBenefits).where(
      eq(courseBenefits.courseId, courseId),
    );
  },

  // ==================== COURSE PREREQUISITES ====================

  async createPrerequisites(
    courseId: number,
    prerequisites: { title: string }[],
  ) {
    if (!prerequisites.length) return [];
    return await DB.insert(coursePrerequisites)
      .values(
        prerequisites.map((prereq) => ({
          courseId,
          prerequisite: prereq.title,
        })),
      )
      .returning();
  },

  async deletePrerequisites(courseId: number) {
    await DB.delete(coursePrerequisites).where(
      eq(coursePrerequisites.courseId, courseId),
    );
  },

  // ==================== TAGS ====================

  async createOrGetTags(tagNames: string[]) {
    const tagResults = [];

    for (const name of tagNames) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      let [existingTag] = await DB.select()
        .from(tags)
        .where(eq(tags.name, name));

      if (existingTag) {
        tagResults.push(existingTag);
      } else {
        const [newTag] = await DB.insert(tags)
          .values({ name, slug })
          .returning();
        tagResults.push(newTag);
      }
    }

    return tagResults;
  },

  async linkCourseTags(courseId: number, tagIds: number[]) {
    if (!tagIds.length) return [];
    return await DB.insert(courseTags)
      .values(tagIds.map((tagId) => ({ courseId, tagId })))
      .returning();
  },

  async deleteCourseTags(courseId: number) {
    await DB.delete(courseTags).where(eq(courseTags.courseId, courseId));
  },

  // ==================== SECTIONS ====================

  async createSection(
    courseId: number,
    data: { title: string; position?: number },
  ) {
    let position = data.position;
    if (position === undefined) {
      const maxPositionResult = await DB.select({
        max: sql<number>`MAX(position)`,
      })
        .from(courseSections)
        .where(eq(courseSections.courseId, courseId));
      position = (maxPositionResult[0]?.max || -1) + 1;
    }

    const [section] = await DB.insert(courseSections)
      .values({ courseId, title: data.title, position })
      .returning();
    return section;
  },

  async getSectionById(id: number, courseId: number) {
    const [section] = await DB.select()
      .from(courseSections)
      .where(
        and(eq(courseSections.id, id), eq(courseSections.courseId, courseId)),
      );

    if (!section) return null;

    // Get lessons for this section
    const lessons = await DB.select()
      .from(courseLessons)
      .where(eq(courseLessons.sectionId, id))
      .orderBy(asc(courseLessons.position));

    // Get links and resources for lessons
    if (lessons.length > 0) {
      const lessonIds = lessons.map((l) => l.id);

      const links = await DB.select()
        .from(courseLinks)
        .where(inArray(courseLinks.lessonId, lessonIds));

      const resources = await DB.select()
        .from(lessonResources)
        .where(inArray(lessonResources.lessonId, lessonIds));

      lessons.forEach((lesson) => {
        (lesson as any).links = links.filter((l) => l.lessonId === lesson.id);
        (lesson as any).resources = resources.filter(
          (r) => r.lessonId === lesson.id,
        );
      });
    }

    return {
      ...section,
      lessons,
    };
  },

  async updateSection(
    id: number,
    courseId: number,
    data: Partial<{ title: string; position: number }>,
  ) {
    const [updated] = await DB.update(courseSections)
      .set(data)
      .where(
        and(eq(courseSections.id, id), eq(courseSections.courseId, courseId)),
      )
      .returning();
    return updated;
  },

  async deleteSection(id: number, courseId: number) {
    const [deleted] = await DB.delete(courseSections)
      .where(
        and(eq(courseSections.id, id), eq(courseSections.courseId, courseId)),
      )
      .returning();
    return deleted;
  },

  // ==================== LESSONS ====================

  async createLesson(
    sectionId: number,
    data: {
      title: string;
      description?: string;
      videoUrl?: string;
      videoThumbnail?: string;
      videoLength?: number;
      videoPlayer?: string;
      position?: number;
      isPreview?: boolean;
    },
  ) {
    let position = data.position;
    if (position === undefined) {
      const maxPositionResult = await DB.select({
        max: sql<number>`MAX(position)`,
      })
        .from(courseLessons)
        .where(eq(courseLessons.sectionId, sectionId));
      position = (maxPositionResult[0]?.max || -1) + 1;
    }

    const [lesson] = await DB.insert(courseLessons)
      .values({
        ...data,
        sectionId,
        position,
        isPreview: data.isPreview || false,
      })
      .returning();
    return lesson;
  },

  async getLessonById(id: number) {
    const [lesson] = await DB.select()
      .from(courseLessons)
      .where(eq(courseLessons.id, id));

    if (!lesson) return null;

    // Get section info
    const [section] = await DB.select()
      .from(courseSections)
      .where(eq(courseSections.id, lesson.sectionId));

    // Get course info
    const [course] = await DB.select()
      .from(courses)
      .where(eq(courses.id, section.courseId));

    // Get links
    const links = await DB.select()
      .from(courseLinks)
      .where(eq(courseLinks.lessonId, id));

    // Get resources
    const resources = await DB.select()
      .from(lessonResources)
      .where(eq(lessonResources.lessonId, id));

    // Get questions with replies
    const questions = await DB.select({
      id: lessonQuestions.id,
      lessonId: lessonQuestions.lessonId,
      userId: lessonQuestions.userId,
      question: lessonQuestions.question,
      createdAt: lessonQuestions.createdAt,
    })
      .from(lessonQuestions)
      .where(eq(lessonQuestions.lessonId, id))
      .orderBy(desc(lessonQuestions.createdAt));

    // Get replies for questions
    if (questions.length > 0) {
      const questionIds = questions.map((q) => q.id);
      const replies = await DB.select({
        id: questionReplies.id,
        questionId: questionReplies.questionId,
        userId: questionReplies.userId,
        reply: questionReplies.reply,
        createdAt: questionReplies.createdAt,
      })
        .from(questionReplies)
        .where(inArray(questionReplies.questionId, questionIds))
        .orderBy(asc(questionReplies.createdAt));

      questions.forEach((question) => {
        (question as any).replies = replies.filter(
          (r) => r.questionId === question.id,
        );
      });
    }

    return {
      ...lesson,
      section: {
        ...section,
        course,
      },
      links,
      resources,
      questions,
    };
  },

  async updateLesson(
    id: number,
    data: Partial<typeof courseLessons.$inferInsert>,
  ) {
    const [updated] = await DB.update(courseLessons)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courseLessons.id, id))
      .returning();
    return updated;
  },

  async deleteLesson(id: number) {
    const [deleted] = await DB.delete(courseLessons)
      .where(eq(courseLessons.id, id))
      .returning();
    return deleted;
  },

  // ==================== LESSON LINKS ====================

  async createLessonLinks(
    lessonId: number,
    links: { title: string; url: string }[],
  ) {
    if (!links.length) return [];
    return await DB.insert(courseLinks)
      .values(
        links.map((link) => ({ lessonId, title: link.title, url: link.url })),
      )
      .returning();
  },

  async deleteLessonLinks(lessonId: number) {
    await DB.delete(courseLinks).where(eq(courseLinks.lessonId, lessonId));
  },

  // ==================== LESSON RESOURCES ====================

  async createLessonResources(
    lessonId: number,
    resources: { title: string; url: string }[],
  ) {
    if (!resources.length) return [];
    return await DB.insert(lessonResources)
      .values(
        resources.map((resource) => ({
          lessonId,
          title: resource.title,
          url: resource.url,
        })),
      )
      .returning();
  },

  async deleteLessonResources(lessonId: number) {
    await DB.delete(lessonResources).where(
      eq(lessonResources.lessonId, lessonId),
    );
  },
};
