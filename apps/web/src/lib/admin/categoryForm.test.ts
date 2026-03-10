import { describe, expect, it } from 'vitest';

import {
    normalizeCategoryInput,
    slugifyCategoryName,
    validateCategoryInput,
} from './categoryForm';

describe('slugifyCategoryName', () => {
    it('slugifies names safely', () => {
        expect(slugifyCategoryName('Web Development')).toBe('web-development');
        expect(slugifyCategoryName('  Linux   & Bash  ')).toBe('linux-bash');
    });
});

describe('normalizeCategoryInput', () => {
    it('trims optional values and auto-generates a lowercase slug', () => {
        expect(
            normalizeCategoryInput({
                name: '  Web Development  ',
                slug: '',
                icon: '  🌐  ',
                description: '  Belajar web modern  ',
                order: '4',
            }),
        ).toEqual({
            name: 'Web Development',
            slug: 'web-development',
            icon: '🌐',
            description: 'Belajar web modern',
            order: 4,
        });
    });
});

describe('validateCategoryInput', () => {
    it('accepts valid payloads', () => {
        const result = validateCategoryInput({
            name: 'Networking',
            slug: 'networking',
            icon: '🔗',
            description: 'Belajar jaringan komputer',
            order: 6,
        });

        expect(result.success).toBe(true);
    });

    it('rejects invalid payloads and negative order', () => {
        const result = validateCategoryInput({
            name: '   ',
            slug: '!!!',
            order: -1,
        });

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected validation to fail');
        }

        expect(result.error.flatten().fieldErrors.name?.[0]).toContain('wajib diisi');
        expect(result.error.flatten().fieldErrors.slug?.[0]).toContain('Slug');
        expect(result.error.flatten().fieldErrors.order?.[0]).toContain('minimal 0');
    });
});
