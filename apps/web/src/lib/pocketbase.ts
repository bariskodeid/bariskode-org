import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.PUBLIC_POCKETBASE_URL ?? 'http://localhost:8090';
const PB_ADMIN_EMAIL = import.meta.env.POCKETBASE_ADMIN_EMAIL;
const PB_ADMIN_PASSWORD = import.meta.env.POCKETBASE_ADMIN_PASSWORD;

export function getPocketBaseUrl() {
    return PB_URL;
}

/**
 * Create a new PocketBase instance.
 * For SSR: create per-request to avoid leaking auth state between users.
 */
export function createPocketBase() {
    const pb = new PocketBase(PB_URL);
    pb.autoCancellation(false); // Required for SSR
    return pb;
}

export async function createTrustedPocketBase() {
    if (!PB_ADMIN_EMAIL || !PB_ADMIN_PASSWORD) {
        throw new Error('Trusted PocketBase client is not configured');
    }

    const pb = createPocketBase();
    await pb.admins.authWithPassword(PB_ADMIN_EMAIL, PB_ADMIN_PASSWORD);
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
