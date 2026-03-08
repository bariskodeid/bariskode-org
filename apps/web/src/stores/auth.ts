import { atom, computed } from 'nanostores';
import type { User } from '@/types';

/**
 * Client-side auth store using nanostores.
 * Server-side auth is handled by middleware + cookies.
 * This store is for React islands that need reactive user state.
 */

export const $user = atom<User | null>(null);
export const $isAuthenticated = computed($user, (user) => user !== null);
export const $userRole = computed($user, (user) => user?.role ?? 'student');

/**
 * Initialize auth store from server-provided data.
 * Called by layouts/pages that pass user from Astro.locals.
 */
export function initAuthStore(user: User | null) {
    $user.set(user);
}
