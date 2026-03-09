import type PocketBase from 'pocketbase';

export class QuizSubmissionLockError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

interface QuizSubmissionLockRecord {
    id: string;
    created?: string;
}

const LOCK_TTL_MS = 30_000;

async function findLock(pb: PocketBase, key: string): Promise<QuizSubmissionLockRecord | null> {
    try {
        return await pb.collection('quiz_submission_locks').getFirstListItem<QuizSubmissionLockRecord>(
            `key = '${key}'`,
            { fields: 'id,created' }
        );
    } catch {
        return null;
    }
}

export function isQuizSubmissionLockStale(createdAt?: string, now = Date.now()): boolean {
    if (!createdAt) {
        return false;
    }

    return now - new Date(createdAt).getTime() > LOCK_TTL_MS;
}

export async function acquireQuizSubmissionLock(
    pb: PocketBase,
    userId: string,
    lessonId: string
): Promise<string> {
    const key = `${userId}:${lessonId}`;

    const existingLock = await findLock(pb, key);
    if (existingLock && isQuizSubmissionLockStale(existingLock.created)) {
        await pb.collection('quiz_submission_locks').delete(existingLock.id).catch(() => null);
    }

    try {
        const lock = await pb.collection('quiz_submission_locks').create<QuizSubmissionLockRecord>({
            user: userId,
            lesson: lessonId,
            key,
        });

        return lock.id;
    } catch (error: any) {
        if (error?.status === 400 || error?.status === 409) {
            const conflictingLock = await findLock(pb, key);
            if (conflictingLock && isQuizSubmissionLockStale(conflictingLock.created)) {
                await pb.collection('quiz_submission_locks').delete(conflictingLock.id).catch(() => null);

                const lock = await pb.collection('quiz_submission_locks').create<QuizSubmissionLockRecord>({
                    user: userId,
                    lesson: lessonId,
                    key,
                });

                return lock.id;
            }

            throw new QuizSubmissionLockError(429, 'Quiz submission already in progress');
        }

        throw error;
    }
}


export async function releaseQuizSubmissionLock(pb: PocketBase, lockId: string | null): Promise<void> {
    if (!lockId) {
        return;
    }

    try {
        await pb.collection('quiz_submission_locks').delete(lockId);
    } catch {
        // Best-effort cleanup.
    }
}
