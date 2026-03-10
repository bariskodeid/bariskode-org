import { z } from 'zod';

import type { CourseStatus, DifficultyLevel } from '@/types';

export interface CourseInput {
    title: string;
    slug: string;
    description: string;
    instructor: string;
    category: string;
    difficulty: DifficultyLevel;
    status: CourseStatus;
    tags: string[];
    estimated_hours?: number;
}

function normalizeRequiredText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalNumber(value: unknown): number | undefined {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return undefined;
    }

    const stringValue = String(value).trim();
    if (!stringValue) {
        return undefined;
    }

    return Number(stringValue);
}

export function slugifyCourseTitle(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function normalizeCourseTags(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === 'string' ? item.trim() : ''))
            .filter(Boolean);
    }

    if (typeof value !== 'string') {
        return [];
    }

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

export function normalizeCourseInput(input: Record<string, unknown>): CourseInput {
    const title = normalizeRequiredText(input.title);
    const rawSlug = normalizeRequiredText(input.slug);
    const description = normalizeRequiredText(input.description);

    return {
        title,
        slug: slugifyCourseTitle(rawSlug || title),
        description,
        instructor: normalizeRequiredText(input.instructor),
        category: normalizeRequiredText(input.category),
        difficulty: normalizeRequiredText(input.difficulty) as DifficultyLevel,
        status: normalizeRequiredText(input.status) as CourseStatus,
        tags: normalizeCourseTags(input.tags),
        estimated_hours: normalizeOptionalNumber(input.estimated_hours),
    };
}

export const courseInputSchema = z.object({
    title: z.string().min(1, 'Judul course wajib diisi').max(200, 'Judul course maksimal 200 karakter'),
    slug: z
        .string()
        .min(1, 'Slug course wajib diisi')
        .max(200, 'Slug course maksimal 200 karakter')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
    description: z
        .string()
        .min(1, 'Deskripsi course wajib diisi')
        .max(2000, 'Deskripsi course maksimal 2000 karakter'),
    instructor: z.string().min(1, 'Instructor wajib dipilih'),
    category: z.string().min(1, 'Kategori wajib dipilih'),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
        errorMap: () => ({ message: 'Difficulty course tidak valid' }),
    }),
    status: z.enum(['draft', 'published'], {
        errorMap: () => ({ message: 'Status course tidak valid' }),
    }),
    tags: z.array(z.string().min(1).max(50)).max(20, 'Tag maksimal 20 item'),
    estimated_hours: z
        .number({ invalid_type_error: 'Estimasi jam wajib berupa angka' })
        .min(0, 'Estimasi jam minimal 0')
        .optional(),
});

export function validateCourseInput(input: Record<string, unknown>) {
    const normalized = normalizeCourseInput(input);
    return courseInputSchema.safeParse(normalized);
}
