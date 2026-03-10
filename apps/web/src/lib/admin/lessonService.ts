import type PocketBase from 'pocketbase';

import type { Lesson, Module } from '@/types';

import type { LessonInput } from './lessonForm';

export class AdminLessonError extends Error {
    code: 'course_not_found' | 'module_not_found' | 'lesson_not_found';
    status: number;

    constructor(code: AdminLessonError['code'], message: string, status: number) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

async function assertCourseExists(pb: Pick<PocketBase, 'collection'>, courseId: string) {
    await pb.collection('courses').getOne(courseId).catch((error: any) => {
        if (error?.status === 404) {
            throw new AdminLessonError('course_not_found', 'Course tidak ditemukan', 404);
        }

        throw error;
    });
}

async function getModuleOrThrow(pb: Pick<PocketBase, 'collection'>, moduleId: string) {
    return pb.collection('modules').getOne<Module>(moduleId).catch((error: any) => {
        if (error?.status === 404) {
            throw new AdminLessonError('module_not_found', 'Module tidak ditemukan', 404);
        }

        throw error;
    });
}

async function assertModuleBelongsToCourse(pb: Pick<PocketBase, 'collection'>, courseId: string, moduleId: string) {
    await assertCourseExists(pb, courseId);
    const module = await getModuleOrThrow(pb, moduleId);

    if (module.course !== courseId) {
        throw new AdminLessonError('module_not_found', 'Module tidak ditemukan', 404);
    }

    return module;
}

async function getLessonOrThrow(pb: Pick<PocketBase, 'collection'>, lessonId: string) {
    return pb.collection('lessons').getOne<Lesson & { module?: string }>(lessonId).catch((error: any) => {
        if (error?.status === 404) {
            throw new AdminLessonError('lesson_not_found', 'Lesson tidak ditemukan', 404);
        }

        throw error;
    });
}

export async function listAdminLessonsByModule(
    pb: Pick<PocketBase, 'collection'>,
    courseId: string,
    moduleId: string,
): Promise<Lesson[]> {
    await assertModuleBelongsToCourse(pb, courseId, moduleId);

    return pb.collection('lessons').getFullList<Lesson>({
        filter: `module = '${moduleId}'`,
        sort: 'order,title',
    });
}

export async function createLesson(pb: Pick<PocketBase, 'collection'>, courseId: string, input: LessonInput) {
    await assertModuleBelongsToCourse(pb, courseId, input.module);
    return pb.collection('lessons').create(input);
}

export async function updateLesson(
    pb: Pick<PocketBase, 'collection'>,
    courseId: string,
    lessonId: string,
    input: LessonInput,
) {
    const existingLesson = await getLessonOrThrow(pb, lessonId);

    if (existingLesson.module !== input.module) {
        throw new AdminLessonError('lesson_not_found', 'Lesson tidak ditemukan', 404);
    }

    await assertModuleBelongsToCourse(pb, courseId, input.module);
    return pb.collection('lessons').update(lessonId, input);
}

export async function deleteLesson(
    pb: Pick<PocketBase, 'collection'>,
    courseId: string,
    moduleId: string,
    lessonId: string,
) {
    const existingLesson = await getLessonOrThrow(pb, lessonId);

    if (existingLesson.module !== moduleId) {
        throw new AdminLessonError('lesson_not_found', 'Lesson tidak ditemukan', 404);
    }

    await assertModuleBelongsToCourse(pb, courseId, moduleId);
    await pb.collection('lessons').delete(lessonId);
}
