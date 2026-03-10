import { z } from 'zod';

export interface CategoryInput {
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    order: number;
}

function normalizeOptionalText(value: unknown): string | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
}

export function slugifyCategoryName(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function normalizeCategoryInput(input: Record<string, unknown>): CategoryInput {
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const rawSlug = typeof input.slug === 'string' ? input.slug.trim() : '';
    const slug = slugifyCategoryName(rawSlug || name);
    const icon = normalizeOptionalText(input.icon);
    const description = normalizeOptionalText(input.description);
    const rawOrder = typeof input.order === 'string' || typeof input.order === 'number'
        ? Number(input.order)
        : Number.NaN;

    return {
        name,
        slug,
        icon,
        description,
        order: rawOrder,
    };
}

export const categoryInputSchema = z.object({
    name: z.string().min(1, 'Nama kategori wajib diisi').max(100, 'Nama kategori maksimal 100 karakter'),
    slug: z
        .string()
        .min(1, 'Slug kategori wajib diisi')
        .max(100, 'Slug kategori maksimal 100 karakter')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
    icon: z.string().max(50, 'Icon maksimal 50 karakter').optional(),
    description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
    order: z
        .number({ invalid_type_error: 'Urutan wajib berupa angka' })
        .int('Urutan wajib bilangan bulat')
        .min(0, 'Urutan minimal 0'),
});

export function validateCategoryInput(input: Record<string, unknown>) {
    const normalized = normalizeCategoryInput(input);
    return categoryInputSchema.safeParse(normalized);
}
