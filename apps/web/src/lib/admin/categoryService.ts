import type PocketBase from 'pocketbase';

import type { Category } from '@/types';

import type { CategoryInput } from './categoryForm';

export class AdminCategoryError extends Error {
    code: 'category_not_found' | 'duplicate_slug' | 'category_in_use';
    status: number;

    constructor(code: AdminCategoryError['code'], message: string, status: number) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

export async function listAdminCategories(pb: Pick<PocketBase, 'collection'>): Promise<Category[]> {
    return pb.collection('categories').getFullList<Category>({
        sort: 'order,name',
    });
}

async function findCategoryBySlug(pb: Pick<PocketBase, 'collection'>, slug: string) {
    try {
        return await pb.collection('categories').getFirstListItem(`slug = '${slug}'`);
    } catch (error: any) {
        if (error?.status === 404) {
            return null;
        }

        throw error;
    }
}

export async function createCategory(pb: Pick<PocketBase, 'collection'>, input: CategoryInput) {
    const existing = await findCategoryBySlug(pb, input.slug);
    if (existing) {
        throw new AdminCategoryError('duplicate_slug', 'Slug kategori sudah digunakan', 409);
    }

    return pb.collection('categories').create(input);
}

export async function updateCategory(
    pb: Pick<PocketBase, 'collection'>,
    categoryId: string,
    input: CategoryInput,
) {
    const existingCategory = await pb.collection('categories').getOne(categoryId).catch((error: any) => {
        if (error?.status === 404) {
            throw new AdminCategoryError('category_not_found', 'Kategori tidak ditemukan', 404);
        }

        throw error;
    });

    const existingSlug = await findCategoryBySlug(pb, input.slug);
    if (existingSlug && existingSlug.id !== existingCategory.id) {
        throw new AdminCategoryError('duplicate_slug', 'Slug kategori sudah digunakan', 409);
    }

    return pb.collection('categories').update(categoryId, input);
}

export async function deleteCategory(pb: Pick<PocketBase, 'collection'>, categoryId: string) {
    await pb.collection('categories').getOne(categoryId).catch((error: any) => {
        if (error?.status === 404) {
            throw new AdminCategoryError('category_not_found', 'Kategori tidak ditemukan', 404);
        }

        throw error;
    });

    const relatedCourses = await pb.collection('courses').getList(1, 1, {
        filter: `category = '${categoryId}'`,
        fields: 'id',
    });

    if (relatedCourses.totalItems > 0) {
        throw new AdminCategoryError(
            'category_in_use',
            'Kategori masih digunakan oleh course dan tidak bisa dihapus',
            409,
        );
    }

    await pb.collection('categories').delete(categoryId);
}
