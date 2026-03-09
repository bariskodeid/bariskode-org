/// <reference types="astro/client" />

import type PocketBase from 'pocketbase';
import type { User } from './types';
import type { LessonAccessContext } from './lib/lessonAccess';

declare global {
    namespace App {
        interface Locals {
            pb: PocketBase;
            user: User | null;
            lessonAccess?: LessonAccessContext;
        }
    }
}

export {};
