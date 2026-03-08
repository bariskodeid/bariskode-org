/// <reference types="astro/client" />

import type PocketBase from 'pocketbase';
import type { User } from './types';

declare namespace App {
    interface Locals {
        pb: PocketBase;
        user: User | null;
    }
}
