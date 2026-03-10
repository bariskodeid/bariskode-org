import type PocketBase from 'pocketbase';

import type { Module } from '@/types';

import type { ModuleInput } from './moduleForm';

export class AdminModuleError extends Error {
    code: 'course_not_found' | 'module_not_found';
    status: number;

    constructor(code: AdminModuleError['code'], message: string, status: number) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

async function assertCourseExists(pb: Pick<PocketBase, 'collection'>, courseId: string) {
    await pb.collection('courses').getOne(courseId).catch((error: any) => {
        if (error?.status === 404) {
            throw new AdminModuleError('course_not_found', 'Course tidak ditemukan', 404);
        }

        throw error;
    });
}

async function getModuleOrThrow(pb: Pick<PocketBase, 'collection'>, moduleId: string) {
    return pb.collection('modules').getOne<Module>(moduleId).catch((error: any) => {
        if (error?.status === 404) {
            throw new AdminModuleError('module_not_found', 'Module tidak ditemukan', 404);
        }

        throw error;
    });
}

export async function listAdminModulesByCourse(pb: Pick<PocketBase, 'collection'>, courseId: string): Promise<Module[]> {
    await assertCourseExists(pb, courseId);

    return pb.collection('modules').getFullList<Module>({
        filter: `course = '${courseId}'`,
        sort: 'order,title',
    });
}

export async function createModule(pb: Pick<PocketBase, 'collection'>, input: ModuleInput) {
    await assertCourseExists(pb, input.course);
    return pb.collection('modules').create(input);
}

export async function updateModule(pb: Pick<PocketBase, 'collection'>, moduleId: string, input: ModuleInput) {
    const existingModule = await getModuleOrThrow(pb, moduleId);

    if (existingModule.course !== input.course) {
        throw new AdminModuleError('module_not_found', 'Module tidak ditemukan', 404);
    }

    await assertCourseExists(pb, input.course);
    return pb.collection('modules').update(moduleId, input);
}

export async function deleteModule(pb: Pick<PocketBase, 'collection'>, moduleId: string, courseId: string) {
    const existingModule = await getModuleOrThrow(pb, moduleId);

    if (existingModule.course !== courseId) {
        throw new AdminModuleError('module_not_found', 'Module tidak ditemukan', 404);
    }

    await pb.collection('modules').delete(moduleId);
}
