import { courseRepository } from "./course.repository.js";
import {
  CreateCourseDTO,
  UpdateCourseDTO,
  CreateSectionDTO,
  UpdateSectionDTO,
  CreateLessonDTO,
  UpdateLessonDTO,
} from "./course.types.js";
import { storageRepository } from "../storage/storage.repository.js";
import { storageFactory } from "../storage/storage.factory.js";
import { StorageService } from "../storage/storage.service.js";
import { slugify } from "../../utils/slugify.js";

export class CourseService {
  // Course CRUD
  async createCourse(
    teacherId: number,
    organizationId: number,
    data: CreateCourseDTO,
  ) {
    // Generate slug from title
    const slug = slugify(data.title);

    // Check if slug exists
    console.log("slug: ", slug);
    console.log("organizationId: ", organizationId);
    const existingCourse = await courseRepository.getCourseBySlug(
      slug,
      organizationId,
    );

    console.log("existing course: ", existingCourse);
    if (existingCourse) {
      throw new Error("Course with similar title/slug already exists");
    }

    // Validate level is one of the allowed values
    const validLevels = [
      "beginner",
      "intermediate",
      "advanced",
      "all_levels",
    ] as const;
    const level =
      data.level && validLevels.includes(data.level as any)
        ? (data.level as (typeof validLevels)[number])
        : null;

    // Create course
    const course = await courseRepository.createCourse({
      title: data.title,
      slug,
      description: data.description,
      thumbnail: data.thumbnail || "",
      demoUrl: data.demoUrl || "",
      level,
      price: data.price || 0,
      estimatedPrice: data.estimatedPrice || null,
      teacherId,
      organizationId,
      isPublished: false,
    });

    // Add benefits if provided
    if (data.benefits?.length) {
      await courseRepository.createBenefits(course.id, data.benefits);
    }

    // Add prerequisites if provided
    if (data.prerequisites?.length) {
      await courseRepository.createPrerequisites(course.id, data.prerequisites);
    }

    // Add tags if provided
    if (data.tags?.length) {
      const tags = await courseRepository.createOrGetTags(data.tags);
      await courseRepository.linkCourseTags(
        course.id,
        tags.map((t) => t.id),
      );
    }

    // Return complete course
    return await courseRepository.getCourseById(course.id, organizationId);
  }

  async getCourseById(id: number, organizationId: number) {
    const course = await courseRepository.getCourseById(id, organizationId);
    if (!course) {
      throw new Error("Course not found");
    }
    return course;
  }

  async getCoursesByOrganization(
    organizationId: number,
    page: number = 1,
    limit: number = 10,
    filters?: { isPublished?: boolean; level?: string; search?: string },
  ) {
    const validLevels = [
      "beginner",
      "intermediate",
      "advanced",
      "all_levels",
    ] as const;

    const sanitizedFilters = filters
      ? {
          ...filters,
          level:
            filters.level && validLevels.includes(filters.level as any)
              ? (filters.level as (typeof validLevels)[number])
              : undefined,
        }
      : undefined;

    return await courseRepository.getCoursesByOrganization(
      organizationId,
      page,
      limit,
      sanitizedFilters,
    );
  }

  async updateCourse(
    id: number,
    organizationId: number,
    teacherId: number,
    data: UpdateCourseDTO,
  ) {
    const existingCourse = await courseRepository.getCourseById(
      id,
      organizationId,
    );
    if (!existingCourse) {
      throw new Error("Course not found");
    }

    // Check if user is the teacher or admin (you can add admin check)
    if (existingCourse.teacherId !== teacherId) {
      throw new Error("Unauthorized to update this course");
    }

    // Update slug if title changed
    let updateData: any = { ...data };
    if (data.title && data.title !== existingCourse.title) {
      const newSlug = slugify(data.title);
      const slugExists = await courseRepository.getCourseBySlug(
        newSlug,
        organizationId,
      );
      if (slugExists && slugExists.id !== id) {
        throw new Error("Course with similar title already exists");
      }
      updateData.slug = newSlug;
    }

    // Update course
    const updated = await courseRepository.updateCourse(
      id,
      organizationId,
      updateData,
    );

    // Update benefits if provided
    if (data.benefits) {
      await courseRepository.deleteBenefits(id);
      if (data.benefits.length) {
        await courseRepository.createBenefits(id, data.benefits);
      }
    }

    // Update prerequisites if provided
    if (data.prerequisites) {
      await courseRepository.deletePrerequisites(id);
      if (data.prerequisites.length) {
        await courseRepository.createPrerequisites(id, data.prerequisites);
      }
    }

    // Update tags if provided
    if (data.tags) {
      await courseRepository.deleteCourseTags(id);
      if (data.tags.length) {
        const tags = await courseRepository.createOrGetTags(data.tags);
        await courseRepository.linkCourseTags(
          id,
          tags.map((t) => t.id),
        );
      }
    }

    return await courseRepository.getCourseById(id, organizationId);
  }

  async deleteCourse(id: number, organizationId: number, teacherId: number) {
    const existingCourse = await courseRepository.getCourseById(
      id,
      organizationId,
    );
    if (!existingCourse) {
      throw new Error("Course not found");
    }

    if (existingCourse.teacherId !== teacherId) {
      throw new Error("Unauthorized to delete this course");
    }

    return await courseRepository.deleteCourse(id, organizationId);
  }

  // Section Management
  async createSection(
    courseId: number,
    organizationId: number,
    data: CreateSectionDTO,
  ) {
    const course = await courseRepository.getCourseById(
      courseId,
      organizationId,
    );
    if (!course) {
      throw new Error("Course not found");
    }

    return await courseRepository.createSection(courseId, data);
  }

  async getSectionById(id: number, courseId: number, organizationId: number) {
    const course = await courseRepository.getCourseById(
      courseId,
      organizationId,
    );
    if (!course) {
      throw new Error("Course not found");
    }

    const section = await courseRepository.getSectionById(id, courseId);
    if (!section) {
      throw new Error("Section not found");
    }

    return section;
  }

  async updateSection(
    id: number,
    courseId: number,
    organizationId: number,
    data: UpdateSectionDTO,
  ) {
    const course = await courseRepository.getCourseById(
      courseId,
      organizationId,
    );
    if (!course) {
      throw new Error("Course not found");
    }

    return await courseRepository.updateSection(id, courseId, data);
  }

  async deleteSection(id: number, courseId: number, organizationId: number) {
    const course = await courseRepository.getCourseById(
      courseId,
      organizationId,
    );
    if (!course) {
      throw new Error("Course not found");
    }

    return await courseRepository.deleteSection(id, courseId);
  }

  // Lesson Management
  async createLesson(
    sectionId: number,
    courseId: number,
    organizationId: number,
    data: CreateLessonDTO,
  ) {
    // Verify course exists and user has access
    const course = await courseRepository.getCourseById(
      courseId,
      organizationId,
    );
    if (!course) {
      throw new Error("Course not found");
    }

    // Verify section belongs to course
    const section = await courseRepository.getSectionById(sectionId, courseId);
    if (!section) {
      throw new Error("Section not found");
    }

    // Create lesson
    const lesson = await courseRepository.createLesson(sectionId, {
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      videoThumbnail: data.videoThumbnail,
      videoLength: data.videoLength,
      videoPlayer: data.videoPlayer,
      position: data.position,
      isPreview: data.isPreview ? true : false,
    });

    // Add links if provided
    if (data.links?.length) {
      await courseRepository.createLessonLinks(lesson.id, data.links);
    }

    // Add resources if provided
    if (data.resources?.length) {
      await courseRepository.createLessonResources(lesson.id, data.resources);
    }

    return await courseRepository.getLessonById(lesson.id);
  }

  async getLessonById(id: number, courseId: number, organizationId: number) {
    const course = await courseRepository.getCourseById(
      courseId,
      organizationId,
    );
    if (!course) {
      throw new Error("Course not found");
    }

    const lesson = await courseRepository.getLessonById(id);
    if (!lesson || lesson.section.courseId !== courseId) {
      throw new Error("Lesson not found");
    }

    return lesson;
  }

  async updateLesson(
    id: number,
    courseId: number,
    organizationId: number,
    data: UpdateLessonDTO,
  ) {
    const lesson = await this.getLessonById(id, courseId, organizationId);

    // Update lesson
    const updatedLesson = await courseRepository.updateLesson(id, {
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      videoThumbnail: data.videoThumbnail,
      videoLength: data.videoLength,
      videoPlayer: data.videoPlayer,
      position: data.position,
      isPreview: data.isPreview ? true : false,
    });

    // Update links if provided
    if (data.links) {
      await courseRepository.deleteLessonLinks(id);
      if (data.links.length) {
        await courseRepository.createLessonLinks(id, data.links);
      }
    }

    // Update resources if provided
    if (data.resources) {
      await courseRepository.deleteLessonResources(id);
      if (data.resources.length) {
        await courseRepository.createLessonResources(id, data.resources);
      }
    }

    return await courseRepository.getLessonById(id);
  }

  async deleteLesson(id: number, courseId: number, organizationId: number) {
    await this.getLessonById(id, courseId, organizationId);
    return await courseRepository.deleteLesson(id);
  }

  // File Upload Helper
  async getUploadUrl(
    organizationId: number,
    fileName: string,
    fileType: string,
    filePurpose: string,
  ) {
    const integration =
      await storageRepository.getActiveIntegration(organizationId);
    if (!integration) {
      throw new Error("No active storage integration found");
    }

    const adapter = storageFactory(integration as any);
    const storage = new StorageService(adapter as any);

    const result = await storage.generateUploadUrl(fileName, fileType);

    return {
      ...result,
      provider: integration.provider,
      purpose: filePurpose,
    };
  }
}
