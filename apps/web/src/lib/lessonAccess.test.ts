import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { assertUserCanAccessLesson } from './lessonAccess';

const originalAdminUserIds = process.env.ADMIN_USER_IDS;

function createPocketBaseMock() {
    const lessons = { getOne: vi.fn() };
    const modules = { getOne: vi.fn(), getFullList: vi.fn() };
    const courses = { getOne: vi.fn() };

    return {
        collection: vi.fn((name: string) => {
            if (name === 'lessons') return lessons;
            if (name === 'modules') return modules;
            if (name === 'courses') return courses;
            throw new Error(`Unexpected collection: ${name}`);
        }),
        mocks: { lessons, modules, courses },
    };
}

describe('assertUserCanAccessLesson', () => {
    const lessonId = 'les123def456ghi';
    const moduleId = 'mod123def456ghi';
    const courseId = 'cou123def456ghi';

    beforeAll(() => {
        process.env.ADMIN_USER_IDS = 'use_admin_1';
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterAll(() => {
        process.env.ADMIN_USER_IDS = originalAdminUserIds;
    });

    it('rejects draft lesson access for non-allowlisted admin-role users', async () => {
        const pb = createPocketBaseMock();
        pb.mocks.lessons.getOne.mockResolvedValue({
            id: lessonId,
            module: moduleId,
            type: 'reading',
            status: 'draft',
            order: 1,
        });
        pb.mocks.modules.getOne.mockResolvedValue({ id: moduleId, course: courseId, status: 'draft' });
        pb.mocks.courses.getOne.mockResolvedValue({ id: courseId, instructor: 'use_instructor_1', status: 'draft' });

        await expect(
            assertUserCanAccessLesson(
                pb as never,
                {
                    id: 'use_fake_admin',
                    email: 'admin@example.test',
                    username: 'fakeadmin',
                    role: 'admin',
                    xp: 0,
                    level: 1,
                    streak_current: 0,
                    streak_longest: 0,
                },
                lessonId,
            ),
        ).rejects.toMatchObject({ status: 403, message: 'Lesson not available' });
    });

    it('allows trusted admins to access draft lesson content', async () => {
        const pb = createPocketBaseMock();
        pb.mocks.lessons.getOne.mockResolvedValue({
            id: lessonId,
            module: moduleId,
            type: 'reading',
            status: 'draft',
            order: 1,
        });
        pb.mocks.modules.getOne.mockResolvedValue({ id: moduleId, course: courseId, status: 'draft' });
        pb.mocks.courses.getOne.mockResolvedValue({ id: courseId, instructor: 'use_instructor_1', status: 'draft' });
        pb.mocks.modules.getFullList.mockResolvedValue([
            {
                id: moduleId,
                course: courseId,
                status: 'draft',
                expand: {
                    lessons_via_module: [
                        { id: lessonId, module: moduleId, order: 1, status: 'draft', type: 'reading' },
                    ],
                },
            },
        ]);

        const result = await assertUserCanAccessLesson(
            pb as never,
            {
                id: 'use_admin_1',
                email: 'admin@example.test',
                username: 'trustedadmin',
                role: 'admin',
                xp: 0,
                level: 1,
                streak_current: 0,
                streak_longest: 0,
            },
            lessonId,
        );

        expect(result.lesson.id).toBe(lessonId);
        expect(pb.mocks.modules.getFullList).toHaveBeenCalled();
    });
});
