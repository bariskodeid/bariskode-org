import { describe, expect, it } from 'vitest';

import { normalizeModuleInput, validateModuleInput } from './moduleForm';

describe('normalizeModuleInput', () => {
    it('trims values and parses order', () => {
        expect(
            normalizeModuleInput({
                title: '  Fundamentals  ',
                course: 'cou123def456ghi',
                order: '2',
                description: '  Dasar-dasar topik  ',
            }),
        ).toEqual({
            title: 'Fundamentals',
            course: 'cou123def456ghi',
            order: 2,
            description: 'Dasar-dasar topik',
        });
    });
});

describe('validateModuleInput', () => {
    it('accepts valid payloads', () => {
        const result = validateModuleInput({
            title: 'Fundamentals',
            course: 'cou123def456ghi',
            order: 0,
            description: 'Pengenalan materi',
        });

        expect(result.success).toBe(true);
    });

    it('rejects invalid payloads', () => {
        const result = validateModuleInput({
            title: '   ',
            course: '',
            order: -1,
        });

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected validation to fail');
        }

        const errors = result.error.flatten().fieldErrors;
        expect(errors.title?.[0]).toContain('wajib diisi');
        expect(errors.course?.[0]).toContain('Course');
        expect(errors.order?.[0]).toContain('minimal 0');
    });
});
