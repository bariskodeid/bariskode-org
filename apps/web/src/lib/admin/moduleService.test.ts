import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    createModule,
    deleteModule,
    listAdminModulesByCourse,
    updateModule,
} from './moduleService';

function createCollectionMock() {
    const courses = {
        getOne: vi.fn(),
    };

    const modules = {
        getFullList: vi.fn(),
        create: vi.fn(),
        getOne: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };

    return {
        pb: {
            collection: vi.fn((name: string) => {
                if (name === 'courses') return courses;
                if (name === 'modules') return modules;
                throw new Error(`Unexpected collection: ${name}`);
            }),
        },
        courses,
        modules,
    };
}

describe('moduleService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('lists modules for a course sorted by order and title', async () => {
        const { pb, courses, modules } = createCollectionMock();
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        modules.getFullList.mockResolvedValue([{ id: 'mod123def456ghi' }]);

        const result = await listAdminModulesByCourse(pb as never, 'cou123def456ghi');

        expect(modules.getFullList).toHaveBeenCalledWith({
            filter: "course = 'cou123def456ghi'",
            sort: 'order,title',
        });
        expect(result).toEqual([{ id: 'mod123def456ghi' }]);
    });

    it('creates a module after validating course existence', async () => {
        const { pb, courses, modules } = createCollectionMock();
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        modules.create.mockResolvedValue({ id: 'mod123def456ghi' });

        await createModule(pb as never, {
            title: 'Fundamentals',
            course: 'cou123def456ghi',
            order: 0,
            description: 'Pengenalan',
        });

        expect(modules.create).toHaveBeenCalledWith({
            title: 'Fundamentals',
            course: 'cou123def456ghi',
            order: 0,
            description: 'Pengenalan',
        });
    });

    it('rejects create when course is missing', async () => {
        const { pb, courses } = createCollectionMock();
        courses.getOne.mockRejectedValue({ status: 404 });

        await expect(
            createModule(pb as never, {
                title: 'Fundamentals',
                course: 'cou123def456ghi',
                order: 0,
            }),
        ).rejects.toMatchObject({ code: 'course_not_found', status: 404 });
    });

    it('updates an existing module', async () => {
        const { pb, courses, modules } = createCollectionMock();
        modules.getOne.mockResolvedValue({ id: 'mod123def456ghi', course: 'cou123def456ghi' });
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        modules.update.mockResolvedValue({ id: 'mod123def456ghi' });

        await updateModule(pb as never, 'mod123def456ghi', {
            title: 'Advanced Fundamentals',
            course: 'cou123def456ghi',
            order: 1,
            description: 'Update',
        });

        expect(modules.update).toHaveBeenCalledWith('mod123def456ghi', {
            title: 'Advanced Fundamentals',
            course: 'cou123def456ghi',
            order: 1,
            description: 'Update',
        });
    });

    it('rejects update when module is missing', async () => {
        const { pb, modules } = createCollectionMock();
        modules.getOne.mockRejectedValue({ status: 404 });

        await expect(
            updateModule(pb as never, 'mod123def456ghi', {
                title: 'Fundamentals',
                course: 'cou123def456ghi',
                order: 0,
            }),
        ).rejects.toMatchObject({ code: 'module_not_found', status: 404 });
    });

    it('deletes an existing module', async () => {
        const { pb, modules } = createCollectionMock();
        modules.getOne.mockResolvedValue({ id: 'mod123def456ghi', course: 'cou123def456ghi' });

        await deleteModule(pb as never, 'mod123def456ghi', 'cou123def456ghi');

        expect(modules.delete).toHaveBeenCalledWith('mod123def456ghi');
    });

    it('rejects update when module belongs to another course', async () => {
        const { pb, modules } = createCollectionMock();
        modules.getOne.mockResolvedValue({ id: 'mod123def456ghi', course: 'cou999def456ghi' });

        await expect(
            updateModule(pb as never, 'mod123def456ghi', {
                title: 'Fundamentals',
                course: 'cou123def456ghi',
                order: 0,
            }),
        ).rejects.toMatchObject({ code: 'module_not_found', status: 404 });
    });

    it('rejects delete when module belongs to another course', async () => {
        const { pb, modules } = createCollectionMock();
        modules.getOne.mockResolvedValue({ id: 'mod123def456ghi', course: 'cou999def456ghi' });

        await expect(deleteModule(pb as never, 'mod123def456ghi', 'cou123def456ghi')).rejects.toMatchObject({
            code: 'module_not_found',
            status: 404,
        });
        expect(modules.delete).not.toHaveBeenCalled();
    });
});
