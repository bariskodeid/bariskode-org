import { z } from 'zod';

import type { LessonStatus, LessonType } from '@/types';

export interface LessonInput {
    title: string;
    slug: string;
    module: string;
    type: LessonType;
    content?: string;
    video_url?: string;
    starter_code?: string;
    expected_output?: string;
    xp_reward: number;
    order: number;
    status: LessonStatus;
    estimated_minutes?: number;
    passing_score?: number;
    max_attempts?: number;
}

function normalizeRequiredText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalText(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
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

function isSafeHttpUrl(value: string) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

export function slugifyLessonTitle(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function normalizeLessonInput(input: Record<string, unknown>): LessonInput {
    const title = normalizeRequiredText(input.title);
    const rawSlug = normalizeRequiredText(input.slug);

    return {
        title,
        slug: slugifyLessonTitle(rawSlug || title),
        module: normalizeRequiredText(input.module),
        type: normalizeRequiredText(input.type) as LessonType,
        content: normalizeOptionalText(input.content),
        video_url: normalizeOptionalText(input.video_url),
        starter_code: normalizeOptionalText(input.starter_code),
        expected_output: normalizeOptionalText(input.expected_output),
        xp_reward: Number(input.xp_reward),
        order: Number(input.order),
        status: normalizeRequiredText(input.status) as LessonStatus,
        estimated_minutes: normalizeOptionalNumber(input.estimated_minutes),
        passing_score: normalizeOptionalNumber(input.passing_score),
        max_attempts: normalizeOptionalNumber(input.max_attempts),
    };
}

export const lessonInputSchema = z.object({
    title: z.string().min(1, 'Judul lesson wajib diisi').max(200, 'Judul lesson maksimal 200 karakter'),
    slug: z
        .string()
        .min(1, 'Slug lesson wajib diisi')
        .max(200, 'Slug lesson maksimal 200 karakter')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
    module: z.string().min(1, 'Module wajib dipilih'),
    type: z.enum(['reading', 'video', 'quiz', 'coding'], {
        errorMap: () => ({ message: 'Tipe lesson tidak valid' }),
    }),
    content: z.string().max(20000, 'Konten lesson maksimal 20000 karakter').optional(),
    video_url: z
        .string()
        .url('URL video tidak valid')
        .max(2000, 'URL video maksimal 2000 karakter')
        .refine(isSafeHttpUrl, 'URL video harus menggunakan http atau https')
        .optional(),
    starter_code: z.string().max(20000, 'Starter code maksimal 20000 karakter').optional(),
    expected_output: z.string().max(5000, 'Expected output maksimal 5000 karakter').optional(),
    xp_reward: z
        .number({ invalid_type_error: 'XP reward wajib berupa angka' })
        .int('XP reward wajib bilangan bulat')
        .min(0, 'XP reward minimal 0'),
    order: z
        .number({ invalid_type_error: 'Urutan lesson wajib berupa angka' })
        .int('Urutan lesson wajib bilangan bulat')
        .min(0, 'Urutan lesson minimal 0'),
    status: z.enum(['draft', 'published'], {
        errorMap: () => ({ message: 'Status lesson tidak valid' }),
    }),
    estimated_minutes: z
        .number({ invalid_type_error: 'Estimasi menit wajib berupa angka' })
        .int('Estimasi menit wajib bilangan bulat')
        .min(0, 'Estimasi menit minimal 0')
        .optional(),
    passing_score: z
        .number({ invalid_type_error: 'Passing score wajib berupa angka' })
        .int('Passing score wajib bilangan bulat')
        .min(0, 'Passing score minimal 0')
        .max(100, 'Passing score maksimal 100')
        .optional(),
    max_attempts: z
        .number({ invalid_type_error: 'Maksimal attempt wajib berupa angka' })
        .int('Maksimal attempt wajib bilangan bulat')
        .min(0, 'Maksimal attempt minimal 0')
        .optional(),
}).superRefine((value, context) => {
    if (value.status !== 'published') {
        return;
    }

    if (value.type === 'quiz') {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['status'],
            message: 'Lesson quiz belum bisa dipublish dari admin lesson CRUD fase ini',
        });
        return;
    }

    if (value.type === 'reading' && !value.content) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['content'],
            message: 'Lesson reading yang published wajib memiliki konten',
        });
    }

    if (value.type === 'video' && !value.video_url) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['video_url'],
            message: 'Lesson video yang published wajib memiliki URL video',
        });
    }

    if (value.type === 'coding' && !value.starter_code) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['starter_code'],
            message: 'Lesson coding yang published wajib memiliki starter code',
        });
    }

    if (value.type === 'coding' && !value.expected_output) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['expected_output'],
            message: 'Lesson coding yang published wajib memiliki expected output',
        });
    }
});

export function validateLessonInput(input: Record<string, unknown>) {
    const normalized = normalizeLessonInput(input);
    return lessonInputSchema.safeParse(normalized);
}
