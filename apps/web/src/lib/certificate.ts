import type PocketBase from 'pocketbase';

/**
 * Check if a user has completed all published lessons in a course.
 */
export async function isCourseCompleted(
    pb: PocketBase,
    userId: string,
    courseId: string
): Promise<boolean> {
    // Get all modules for this course
    const modules = await pb.collection('modules').getFullList({
        filter: `course = '${courseId}'`,
        fields: 'id',
    });

    if (modules.length === 0) return false;

    // Get all published lessons in those modules
    const moduleFilter = modules.map((m) => `module = '${m.id}'`).join(' || ');
    const lessons = await pb.collection('lessons').getFullList({
        filter: `(${moduleFilter}) && status = 'published'`,
        fields: 'id',
    });

    if (lessons.length === 0) return false;

    // Check if all lessons are completed
    const lessonIds = lessons.map((l) => `'${l.id}'`).join(',');
    const completedProgress = await pb.collection('user_progress').getFullList({
        filter: `user = '${userId}' && status = 'completed' && lesson IN (${lessonIds})`,
        fields: 'lesson',
    });

    return completedProgress.length >= lessons.length;
}

/**
 * Get completion stats for a user on a course.
 */
export async function getCourseCompletionStats(
    pb: PocketBase,
    userId: string,
    courseId: string
): Promise<{ completed: number; total: number; percent: number }> {
    const modules = await pb.collection('modules').getFullList({
        filter: `course = '${courseId}'`,
        fields: 'id',
    });

    if (modules.length === 0) return { completed: 0, total: 0, percent: 0 };

    const moduleFilter = modules.map((m) => `module = '${m.id}'`).join(' || ');
    const lessons = await pb.collection('lessons').getFullList({
        filter: `(${moduleFilter}) && status = 'published'`,
        fields: 'id',
    });

    if (lessons.length === 0) return { completed: 0, total: 0, percent: 0 };

    const lessonIds = lessons.map((l) => `'${l.id}'`).join(',');
    const completedProgress = await pb.collection('user_progress').getFullList({
        filter: `user = '${userId}' && status = 'completed' && lesson IN (${lessonIds})`,
        fields: 'lesson',
    });

    const total = lessons.length;
    const completed = completedProgress.length;
    const percent = Math.round((completed / total) * 100);

    return { completed, total, percent };
}
