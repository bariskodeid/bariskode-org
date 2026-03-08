import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.PUBLIC_POCKETBASE_URL ?? 'http://localhost:8090';

/**
 * Create a new PocketBase instance.
 * For SSR: create per-request to avoid leaking auth state between users.
 */
export function createPocketBase() {
    const pb = new PocketBase(PB_URL);
    pb.autoCancellation(false); // Required for SSR
    return pb;
}

/**
 * Create a PocketBase instance pre-loaded with auth from a request cookie.
 */
export function createPBFromRequest(cookieHeader: string) {
    const pb = createPocketBase();
    pb.authStore.loadFromCookie(cookieHeader);
    return pb;
}

/**
 * Collection helpers for type-safe access.
 */
export const getCollections = (pb: PocketBase) => ({
    users: () => pb.collection('users'),
    courses: () => pb.collection('courses'),
    categories: () => pb.collection('categories'),
    modules: () => pb.collection('modules'),
    lessons: () => pb.collection('lessons'),
    quizQuestions: () => pb.collection('quiz_questions'),
    progress: () => pb.collection('user_progress'),
    certificates: () => pb.collection('certificates'),
    badges: () => pb.collection('badges'),
    userBadges: () => pb.collection('user_badges'),
    ctfChallenges: () => pb.collection('ctf_challenges'),
    ctfSolves: () => pb.collection('ctf_solves'),
    comments: () => pb.collection('comments'),
});
