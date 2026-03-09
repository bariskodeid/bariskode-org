import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LessonAccessError } from './lessonAccess';
import { resolveLessonPageAccess } from './lessonPageAccess';

const lessonAccessMocks = vi.hoisted(() => ({
    assertUserCanAccessLesson: vi.fn(),
    assertLessonUnlocked: vi.fn(),
}));

vi.mock('./lessonAccess', async () => {
    const actual = await vi.importActual<typeof import('./lessonAccess')>('./lessonAccess');
    return {
        ...actual,
        assertUserCanAccessLesson: lessonAccessMocks.assertUserCanAccessLesson,
        assertLessonUnlocked: lessonAccessMocks.assertLessonUnlocked,
    };
});

const user = {
    id: 'abc123def456ghi',
    email: 'user@example.com',
    username: 'tester',
    role: 'student' as const,
    xp: 0,
    level: 1,
    streak_current: 0,
    streak_longest: 0,
};

const context = {
    lesson: { id: 'les123def456ghi', type: 'reading', status: 'published' },
    module: { id: 'mod123def456ghi', course: 'cou123def456ghi', status: 'published' },
    course: { id: 'cou123def456ghi', slug: 'intro-security', status: 'published' },
    orderedLessons: [],
};

describe('resolveLessonPageAccess', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects unauthenticated users to login', async () => {
        const result = await resolveLessonPageAccess({} as never, null, 'les123def456ghi', {
            currentPath: '/learn/les123def456ghi',
            lockedMessage: 'locked',
        });

        expect(result).toEqual({
            kind: 'redirect',
            location: '/login?redirect=%2Flearn%2Fles123def456ghi',
        });
        expect(lessonAccessMocks.assertUserCanAccessLesson).not.toHaveBeenCalled();
    });

    it('redirects to 404 for invalid lesson ids', async () => {
        const result = await resolveLessonPageAccess({} as never, user, 'bad-id', {
            currentPath: '/learn/bad-id',
            lockedMessage: 'locked',
        });

        expect(result).toEqual({ kind: 'redirect', location: '/404' });
        expect(lessonAccessMocks.assertUserCanAccessLesson).not.toHaveBeenCalled();
    });

    it('redirects locked users back to the course page', async () => {
        lessonAccessMocks.assertUserCanAccessLesson.mockResolvedValue(context);
        lessonAccessMocks.assertLessonUnlocked.mockRejectedValue(new LessonAccessError(409, 'locked'));

        const result = await resolveLessonPageAccess({} as never, user, 'les123def456ghi', {
            currentPath: '/learn/les123def456ghi',
            lockedMessage: 'locked',
        });

        expect(result).toEqual({
            kind: 'redirect',
            location: '/courses/intro-security',
        });
    });

    it('redirects quiz-only pages to 404 for non-quiz lessons', async () => {
        lessonAccessMocks.assertUserCanAccessLesson.mockResolvedValue(context);

        const result = await resolveLessonPageAccess({} as never, user, 'les123def456ghi', {
            currentPath: '/quiz/les123def456ghi',
            lockedMessage: 'locked',
            requireQuiz: true,
        });

        expect(result).toEqual({ kind: 'redirect', location: '/404' });
        expect(lessonAccessMocks.assertLessonUnlocked).not.toHaveBeenCalled();
    });

    it('returns the access context for unlocked quiz lessons', async () => {
        lessonAccessMocks.assertUserCanAccessLesson.mockResolvedValue({
            ...context,
            lesson: { ...context.lesson, type: 'quiz' },
        });
        lessonAccessMocks.assertLessonUnlocked.mockResolvedValue(undefined);

        const result = await resolveLessonPageAccess({} as never, user, 'les123def456ghi', {
            currentPath: '/quiz/les123def456ghi',
            lockedMessage: 'locked',
            requireQuiz: true,
        });

        expect(result).toEqual({
            kind: 'ok',
            context: {
                ...context,
                lesson: { ...context.lesson, type: 'quiz' },
            },
        });
    });
});
