import type PocketBase from 'pocketbase';

import type { Category, Course, User } from '@/types';

import type { CourseInput } from './courseForm';

const SAFE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class AdminCourseError extends Error {
    code: 'course_not_found' | 'duplicate_slug' | 'category_not_found' | 'instructor_not_found';
    status: number;

    constructor(code: AdminCourseError['code'], message: string, status: number) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

export async function listAdminCourses(pb: Pick<PocketBase, 'collection'>): Promise<Course[]> {
    return pb.collection('courses').getFullList<Course>({
        sort: 'title',
        expand: 'category,instructor',
    });
}

export async function listAdminCourseInstructors(pb: Pick<PocketBase, 'collection'>): Promise<User[]> {
    return pb.collection('users').getFullList<User>({
        filter: "role = 'instructor' || role = 'admin'",
        sort: 'username',
        fields: 'id,email,username,role',
    });
}

async function findCourseBySlug(pb: Pick<PocketBase, 'collection'>, slug: string) {
    if (!SAFE_SLUG_REGEX.test(slug)) {
        return null;
    }

    try {
        return await pb.collection('courses').getFirstListItem(`slug = '${slug}'`);
    } catch (error: any) {
        if (error?.status === 404) {
            return null;
        }

        throw error;
    }
}

async function assertCategoryExists(pb: Pick<PocketBase, 'collection'>, categoryId: string) {
    await pb.collection('categories').getOne(categoryId).catch((error: any) => {
        if (error?.status === 404) {
            throw new AdminCourseError('category_not_found', 'Kategori tidak ditemukan', 404);
        }

        throw error;
    });
}

async function assertInstructorExists(pb: Pick<PocketBase, 'collection'>, instructorId: string) {
    const user = await pb.collection('users').getOne<{ id: string; role?: string }>(instructorId).catch((error: any) => {
        if (error?.status === 404) {
            throw new AdminCourseError('instructor_not_found', 'Instructor tidak ditemukan', 404);
        }

        throw error;
    });

    if (user.role !== 'instructor' && user.role !== 'admin') {
        throw new AdminCourseError('instructor_not_found', 'Instructor tidak valid', 404);
    }
}

export async function createCourse(pb: Pick<PocketBase, 'collection'>, input: CourseInput) {
    const existing = await findCourseBySlug(pb, input.slug);
    if (existing) {
        throw new AdminCourseError('duplicate_slug', 'Slug course sudah digunakan', 409);
    }

    await assertCategoryExists(pb, input.category);
    await assertInstructorExists(pb, input.instructor);

    return pb.collection('courses').create({
        ...input,
        total_lessons: 0,
        enrolled_count: 0,
    });
}

export async function updateCourse(pb: Pick<PocketBase, 'collection'>, courseId: string, input: CourseInput) {
    const existingCourse = await pb.collection('courses').getOne(courseId).catch((error: any) => {
        if (error?.status === 404) {
            throw new AdminCourseError('course_not_found', 'Course tidak ditemukan', 404);
        }

        throw error;
    });

    const existingSlug = await findCourseBySlug(pb, input.slug);
    if (existingSlug && existingSlug.id !== existingCourse.id) {
        throw new AdminCourseError('duplicate_slug', 'Slug course sudah digunakan', 409);
    }

    await assertCategoryExists(pb, input.category);
    await assertInstructorExists(pb, input.instructor);

    return pb.collection('courses').update(courseId, input);
}

export async function listAdminCourseCategories(pb: Pick<PocketBase, 'collection'>): Promise<Category[]> {
    return pb.collection('categories').getFullList<Category>({
        sort: 'order,name',
    });
}
