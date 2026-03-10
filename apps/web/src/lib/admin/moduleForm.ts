import { z } from 'zod';

export interface ModuleInput {
    title: string;
    course: string;
    order: number;
    description?: string;
}

function normalizeOptionalText(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
}

export function normalizeModuleInput(input: Record<string, unknown>): ModuleInput {
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    const course = typeof input.course === 'string' ? input.course.trim() : '';
    const rawOrder = typeof input.order === 'string' || typeof input.order === 'number'
        ? Number(input.order)
        : Number.NaN;

    return {
        title,
        course,
        order: rawOrder,
        description: normalizeOptionalText(input.description),
    };
}

export const moduleInputSchema = z.object({
    title: z.string().min(1, 'Judul module wajib diisi').max(200, 'Judul module maksimal 200 karakter'),
    course: z.string().min(1, 'Course wajib dipilih'),
    order: z
        .number({ invalid_type_error: 'Urutan module wajib berupa angka' })
        .int('Urutan module wajib bilangan bulat')
        .min(0, 'Urutan module minimal 0'),
    description: z.string().max(1000, 'Deskripsi module maksimal 1000 karakter').optional(),
});

export function validateModuleInput(input: Record<string, unknown>) {
    const normalized = normalizeModuleInput(input);
    return moduleInputSchema.safeParse(normalized);
}
