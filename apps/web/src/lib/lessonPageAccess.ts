import type PocketBase from 'pocketbase';

import type { User } from '../types';
import { assertLessonUnlocked, assertUserCanAccessLesson, type LessonAccessContext, LessonAccessError } from './lessonAccess';
import { isValidPocketBaseId } from './validation';

interface LessonPageAccessOptions {
    currentPath: string;
    requireQuiz?: boolean;
    lockedMessage: string;
}

type LessonPageRedirect = {
    kind: 'redirect';
    location: string;
};

type LessonPageOk = {
    kind: 'ok';
    context: LessonAccessContext;
};

export type LessonPageAccessResult = LessonPageRedirect | LessonPageOk;

function toLoginRedirect(currentPath: string): LessonPageRedirect {
    return {
        kind: 'redirect',
        location: `/login?redirect=${encodeURIComponent(currentPath)}`,
    };
}

export async function resolveLessonPageAccess(
    pb: PocketBase,
    user: User | null | undefined,
    lessonId: string | undefined,
    options: LessonPageAccessOptions
): Promise<LessonPageAccessResult> {
    if (!user) {
        return toLoginRedirect(options.currentPath);
    }

    if (!isValidPocketBaseId(lessonId)) {
        return { kind: 'redirect', location: '/404' };
    }

    let context: LessonAccessContext;
    try {
        context = await assertUserCanAccessLesson(pb, user, lessonId);
    } catch (error) {
        if (error instanceof LessonAccessError) {
            return {
                kind: 'redirect',
                location: error.status === 400 || error.status === 404 ? '/404' : '/403',
            };
        }

        return { kind: 'redirect', location: '/404' };
    }

    if (options.requireQuiz && context.lesson.type !== 'quiz') {
        return { kind: 'redirect', location: '/404' };
    }

    try {
        await assertLessonUnlocked(pb, user.id, context, options.lockedMessage);
    } catch (error) {
        if (error instanceof LessonAccessError) {
            if (error.status === 409 && context.course.slug) {
                return { kind: 'redirect', location: `/courses/${context.course.slug}` };
            }

            return {
                kind: 'redirect',
                location: error.status === 400 || error.status === 404 ? '/404' : '/403',
            };
        }

        return { kind: 'redirect', location: '/403' };
    }

    return { kind: 'ok', context };
}
