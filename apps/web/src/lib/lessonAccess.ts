import type PocketBase from 'pocketbase';

import type { User } from '../types';
import { isValidPocketBaseId } from './validation';

interface LessonRecord {
    id: string;
    title?: string;
    module?: string;
    type: string;
    xp_reward?: number;
    status: string;
    order?: number;
    passing_score?: number;
    max_attempts?: number;
}

interface ModuleRecord {
    id: string;
    course?: string;
    order?: number;
    status?: string;
    expand?: {
        lessons_via_module?: LessonRecord[];
    };
}

interface CourseRecord {
    id: string;
    instructor?: string;
    slug?: string;
    status: string;
}

export interface LessonAccessContext {
    lesson: LessonRecord;
    module: ModuleRecord;
    course: CourseRecord;
    orderedLessons: LessonRecord[];
}

export class LessonAccessError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function getProgressRecord(pb: PocketBase, userId: string, lessonId: string) {
    return pb.collection('user_progress').getFirstListItem(
        `user = '${userId}' && lesson = '${lessonId}'`,
        { fields: 'id,status,attempts,completed_at,updated' }
    );
}

export async function assertUserCanAccessLesson(
    pb: PocketBase,
    user: User,
    lessonId: string
): Promise<LessonAccessContext> {
    if (!isValidPocketBaseId(lessonId)) {
        throw new LessonAccessError(400, 'Invalid lessonId');
    }

    const lesson = await pb.collection('lessons').getOne<LessonRecord>(lessonId, {
        fields: 'id,title,module,type,xp_reward,status,order,passing_score,max_attempts',
    });

    if (!lesson.module) {
        throw new LessonAccessError(404, 'Lesson module not found');
    }

    const module = await pb.collection('modules').getOne<ModuleRecord>(lesson.module, {
        fields: 'id,course,order,status',
    });

    if (!module.course) {
        throw new LessonAccessError(404, 'Course not found for lesson');
    }

    const course = await pb.collection('courses').getOne<CourseRecord>(module.course, {
        fields: 'id,instructor,slug,status',
    });

    const isAdmin = user.role === 'admin';
    const isInstructorOwner = user.role === 'instructor' && course.instructor === user.id;
    const canAccessDraft = isAdmin || isInstructorOwner;

    if (lesson.status !== 'published' && !canAccessDraft) {
        throw new LessonAccessError(403, 'Lesson not available');
    }

    if (course.status !== 'published' && !canAccessDraft) {
        throw new LessonAccessError(403, 'Course not available');
    }

    if (module.status && module.status !== 'published' && !canAccessDraft) {
        throw new LessonAccessError(403, 'Module not available');
    }

    const modules = await pb.collection('modules').getFullList<ModuleRecord>({
        filter: `course = '${course.id}'`,
        sort: '+order',
        expand: 'lessons_via_module',
        fields: 'id,course,order,status,expand.lessons_via_module.id,expand.lessons_via_module.module,expand.lessons_via_module.order,expand.lessons_via_module.status,expand.lessons_via_module.type',
    });

    const orderedLessons = modules.flatMap((moduleRecord) =>
        ((moduleRecord.status === 'published' || canAccessDraft) ? (moduleRecord.expand?.lessons_via_module ?? []) : [])
            .filter((courseLesson) => courseLesson.status === 'published' || canAccessDraft)
            .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
    );

    if (!orderedLessons.some((courseLesson) => courseLesson.id === lessonId)) {
        throw new LessonAccessError(403, 'Lesson is not accessible in this course');
    }

    return { lesson, module, course, orderedLessons };
}

export async function assertLessonUnlocked(
    pb: PocketBase,
    userId: string,
    context: LessonAccessContext,
    lockedMessage: string
): Promise<void> {
    const currentIndex = context.orderedLessons.findIndex((courseLesson) => courseLesson.id === context.lesson.id);
    const previousLesson = currentIndex > 0 ? context.orderedLessons[currentIndex - 1] : null;

    if (!previousLesson) {
        return;
    }

    try {
        const previousProgress = await getProgressRecord(pb, userId, previousLesson.id);
        if (previousProgress.status !== 'completed') {
            throw new LessonAccessError(409, lockedMessage);
        }
    } catch (error) {
        if (error instanceof LessonAccessError) {
            throw error;
        }

        throw new LessonAccessError(409, lockedMessage);
    }
}

export async function getUserProgressRecord(pb: PocketBase, userId: string, lessonId: string) {
    try {
        return await getProgressRecord(pb, userId, lessonId);
    } catch {
        return null;
    }
}
