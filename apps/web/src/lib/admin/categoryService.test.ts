import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    createCategory,
    deleteCategory,
    listAdminCategories,
    updateCategory,
} from './categoryService';

function createCollectionMock() {
    const categories = {
        getFullList: vi.fn(),
        getFirstListItem: vi.fn(),
        create: vi.fn(),
        getOne: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };

    const courses = {
        getList: vi.fn(),
    };

    return {
        pb: {
            collection: vi.fn((name: string) => {
                if (name === 'categories') return categories;
                if (name === 'courses') return courses;
                throw new Error(`Unexpected collection: ${name}`);
            }),
        },
        categories,
        courses,
    };
}

describe('categoryService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('lists categories sorted by order and name', async () => {
        const { pb, categories } = createCollectionMock();
        categories.getFullList.mockResolvedValue([{ id: 'cat123def456ghi' }]);

        const result = await listAdminCategories(pb as never);

        expect(categories.getFullList).toHaveBeenCalledWith({ sort: 'order,name' });
        expect(result).toEqual([{ id: 'cat123def456ghi' }]);
    });

    it('rejects duplicate slug on create', async () => {
        const { pb, categories } = createCollectionMock();
        categories.getFirstListItem.mockResolvedValue({ id: 'cat123def456ghi' });

        await expect(
            createCategory(pb as never, {
                name: 'Networking',
                slug: 'networking',
                order: 6,
            }),
        ).rejects.toMatchObject({
            code: 'duplicate_slug',
            status: 409,
        });
    });

    it('allows update when the slug belongs to the same category', async () => {
        const { pb, categories } = createCollectionMock();
        categories.getOne.mockResolvedValue({ id: 'cat123def456ghi' });
        categories.getFirstListItem.mockResolvedValue({ id: 'cat123def456ghi' });
        categories.update.mockResolvedValue({ id: 'cat123def456ghi', slug: 'networking' });

        await updateCategory(pb as never, 'cat123def456ghi', {
            name: 'Networking',
            slug: 'networking',
            order: 6,
        });

        expect(categories.update).toHaveBeenCalledWith('cat123def456ghi', {
            name: 'Networking',
            slug: 'networking',
            order: 6,
        });
    });

    it('blocks deleting a category that is still used by courses', async () => {
        const { pb, categories, courses } = createCollectionMock();
        categories.getOne.mockResolvedValue({ id: 'cat123def456ghi' });
        courses.getList.mockResolvedValue({ totalItems: 1 });

        await expect(deleteCategory(pb as never, 'cat123def456ghi')).rejects.toMatchObject({
            code: 'category_in_use',
            status: 409,
        });
        expect(categories.delete).not.toHaveBeenCalled();
    });
});
