import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    createLesson,
    deleteLesson,
    listAdminLessonsByModule,
    updateLesson,
} from './lessonService';

function createCollectionMock() {
    const courses = {
        getOne: vi.fn(),
    };

    const modules = {
        getOne: vi.fn(),
    };

    const lessons = {
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
                if (name === 'lessons') return lessons;
                throw new Error(`Unexpected collection: ${name}`);
            }),
        },
        courses,
        modules,
        lessons,
    };
}

describe('lessonService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('lists lessons for a module sorted by order and title', async () => {
        const { pb, courses, modules, lessons } = createCollectionMock();
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        modules.getOne.mockResolvedValue({ id: 'mod123def456ghi', course: 'cou123def456ghi' });
        lessons.getFullList.mockResolvedValue([{ id: 'les123def456ghi' }]);

        const result = await listAdminLessonsByModule(pb as never, 'cou123def456ghi', 'mod123def456ghi');

        expect(lessons.getFullList).toHaveBeenCalledWith({
            filter: "module = 'mod123def456ghi'",
            sort: 'order,title',
        });
        expect(result).toEqual([{ id: 'les123def456ghi' }]);
    });

    it('creates a lesson after validating course and module ownership', async () => {
        const { pb, courses, modules, lessons } = createCollectionMock();
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        modules.getOne.mockResolvedValue({ id: 'mod123def456ghi', course: 'cou123def456ghi' });
        lessons.create.mockResolvedValue({ id: 'les123def456ghi' });

        await createLesson(pb as never, 'cou123def456ghi', {
            title: 'Intro to XSS',
            slug: 'intro-to-xss',
            module: 'mod123def456ghi',
            type: 'reading',
            content: 'Materi',
            xp_reward: 25,
            order: 0,
            status: 'draft',
        });

        expect(lessons.create).toHaveBeenCalledWith({
            title: 'Intro to XSS',
            slug: 'intro-to-xss',
            module: 'mod123def456ghi',
            type: 'reading',
            content: 'Materi',
            xp_reward: 25,
            order: 0,
            status: 'draft',
        });
    });

    it('rejects create when course is missing', async () => {
        const { pb, courses } = createCollectionMock();
        courses.getOne.mockRejectedValue({ status: 404 });

        await expect(
            createLesson(pb as never, 'cou123def456ghi', {
                title: 'Intro to XSS',
                slug: 'intro-to-xss',
                module: 'mod123def456ghi',
                type: 'reading',
                xp_reward: 25,
                order: 0,
                status: 'draft',
            }),
        ).rejects.toMatchObject({ code: 'course_not_found', status: 404 });
    });

    it('rejects create when module is missing', async () => {
        const { pb, courses, modules } = createCollectionMock();
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        modules.getOne.mockRejectedValue({ status: 404 });

        await expect(
            createLesson(pb as never, 'cou123def456ghi', {
                title: 'Intro to XSS',
                slug: 'intro-to-xss',
                module: 'mod123def456ghi',
                type: 'reading',
                xp_reward: 25,
                order: 0,
                status: 'draft',
            }),
        ).rejects.toMatchObject({ code: 'module_not_found', status: 404 });
    });

    it('rejects create when module belongs to another course', async () => {
        const { pb, courses, modules } = createCollectionMock();
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        modules.getOne.mockResolvedValue({ id: 'mod123def456ghi', course: 'cou999def456ghi' });

        await expect(
            createLesson(pb as never, 'cou123def456ghi', {
                title: 'Intro to XSS',
                slug: 'intro-to-xss',
                module: 'mod123def456ghi',
                type: 'reading',
                xp_reward: 25,
                order: 0,
                status: 'draft',
            }),
        ).rejects.toMatchObject({ code: 'module_not_found', status: 404 });
    });

    it('updates an existing lesson', async () => {
        const { pb, courses, modules, lessons } = createCollectionMock();
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        modules.getOne.mockResolvedValue({ id: 'mod123def456ghi', course: 'cou123def456ghi' });
        lessons.getOne.mockResolvedValue({ id: 'les123def456ghi', module: 'mod123def456ghi' });
        lessons.update.mockResolvedValue({ id: 'les123def456ghi' });

        await updateLesson(pb as never, 'cou123def456ghi', 'les123def456ghi', {
            title: 'Stored XSS Lab',
            slug: 'stored-xss-lab',
            module: 'mod123def456ghi',
            type: 'quiz',
            xp_reward: 50,
            order: 2,
            status: 'published',
            passing_score: 80,
            max_attempts: 3,
        });

        expect(lessons.update).toHaveBeenCalledWith('les123def456ghi', {
            title: 'Stored XSS Lab',
            slug: 'stored-xss-lab',
            module: 'mod123def456ghi',
            type: 'quiz',
            xp_reward: 50,
            order: 2,
            status: 'published',
            passing_score: 80,
            max_attempts: 3,
        });
    });

    it('rejects update when lesson is missing', async () => {
        const { pb, lessons } = createCollectionMock();
        lessons.getOne.mockRejectedValue({ status: 404 });

        await expect(
            updateLesson(pb as never, 'cou123def456ghi', 'les123def456ghi', {
                title: 'Stored XSS Lab',
                slug: 'stored-xss-lab',
                module: 'mod123def456ghi',
                type: 'quiz',
                xp_reward: 50,
                order: 2,
                status: 'published',
            }),
        ).rejects.toMatchObject({ code: 'lesson_not_found', status: 404 });
    });

    it('rejects update when lesson belongs to another module', async () => {
        const { pb, lessons } = createCollectionMock();
        lessons.getOne.mockResolvedValue({ id: 'les123def456ghi', module: 'mod999def456ghi' });

        await expect(
            updateLesson(pb as never, 'cou123def456ghi', 'les123def456ghi', {
                title: 'Stored XSS Lab',
                slug: 'stored-xss-lab',
                module: 'mod123def456ghi',
                type: 'quiz',
                xp_reward: 50,
                order: 2,
                status: 'published',
            }),
        ).rejects.toMatchObject({ code: 'lesson_not_found', status: 404 });
    });

    it('rejects update when module belongs to another course', async () => {
        const { pb, courses, modules, lessons } = createCollectionMock();
        lessons.getOne.mockResolvedValue({ id: 'les123def456ghi', module: 'mod123def456ghi' });
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        modules.getOne.mockResolvedValue({ id: 'mod123def456ghi', course: 'cou999def456ghi' });

        await expect(
            updateLesson(pb as never, 'cou123def456ghi', 'les123def456ghi', {
                title: 'Stored XSS Lab',
                slug: 'stored-xss-lab',
                module: 'mod123def456ghi',
                type: 'quiz',
                xp_reward: 50,
                order: 2,
                status: 'published',
            }),
        ).rejects.toMatchObject({ code: 'module_not_found', status: 404 });
    });

    it('deletes an existing lesson', async () => {
        const { pb, courses, modules, lessons } = createCollectionMock();
        lessons.getOne.mockResolvedValue({ id: 'les123def456ghi', module: 'mod123def456ghi' });
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        modules.getOne.mockResolvedValue({ id: 'mod123def456ghi', course: 'cou123def456ghi' });

        await deleteLesson(pb as never, 'cou123def456ghi', 'mod123def456ghi', 'les123def456ghi');

        expect(lessons.delete).toHaveBeenCalledWith('les123def456ghi');
    });

    it('rejects delete when lesson belongs to another module', async () => {
        const { pb, lessons } = createCollectionMock();
        lessons.getOne.mockResolvedValue({ id: 'les123def456ghi', module: 'mod999def456ghi' });

        await expect(
            deleteLesson(pb as never, 'cou123def456ghi', 'mod123def456ghi', 'les123def456ghi'),
        ).rejects.toMatchObject({ code: 'lesson_not_found', status: 404 });
    });

    it('rejects delete when module belongs to another course', async () => {
        const { pb, courses, modules, lessons } = createCollectionMock();
        lessons.getOne.mockResolvedValue({ id: 'les123def456ghi', module: 'mod123def456ghi' });
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        modules.getOne.mockResolvedValue({ id: 'mod123def456ghi', course: 'cou999def456ghi' });

        await expect(
            deleteLesson(pb as never, 'cou123def456ghi', 'mod123def456ghi', 'les123def456ghi'),
        ).rejects.toMatchObject({ code: 'module_not_found', status: 404 });
        expect(lessons.delete).not.toHaveBeenCalled();
    });
});
