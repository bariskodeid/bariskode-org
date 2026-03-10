import { describe, expect, it } from 'vitest';

import {
    normalizeCourseInput,
    normalizeCourseTags,
    slugifyCourseTitle,
    validateCourseInput,
} from './courseForm';

describe('slugifyCourseTitle', () => {
    it('slugifies course titles safely', () => {
        expect(slugifyCourseTitle('Web Security Basics')).toBe('web-security-basics');
        expect(slugifyCourseTitle('  Linux   & Bash  ')).toBe('linux-bash');
    });
});

describe('normalizeCourseTags', () => {
    it('normalizes comma-separated tags', () => {
        expect(normalizeCourseTags(' web ,  auth, , xss ')).toEqual(['web', 'auth', 'xss']);
    });
});

describe('normalizeCourseInput', () => {
    it('trims values, auto-generates slug, and parses tags/numbers', () => {
        expect(
            normalizeCourseInput({
                title: '  Web Security Basics  ',
                slug: '',
                description: '  Intro ke auth, XSS, dan CSRF.  ',
                instructor: 'use123def456ghi',
                category: 'cat123def456ghi',
                difficulty: 'beginner',
                status: 'draft',
                tags: ' web , auth, xss ',
                estimated_hours: '12',
            }),
        ).toEqual({
            title: 'Web Security Basics',
            slug: 'web-security-basics',
            description: 'Intro ke auth, XSS, dan CSRF.',
            instructor: 'use123def456ghi',
            category: 'cat123def456ghi',
            difficulty: 'beginner',
            status: 'draft',
            tags: ['web', 'auth', 'xss'],
            estimated_hours: 12,
        });
    });
});

describe('validateCourseInput', () => {
    it('accepts valid payloads', () => {
        const result = validateCourseInput({
            title: 'Web Security Basics',
            slug: 'web-security-basics',
            description: 'Belajar dasar-dasar keamanan web.',
            instructor: 'use123def456ghi',
            category: 'cat123def456ghi',
            difficulty: 'intermediate',
            status: 'published',
            tags: 'web,security',
            estimated_hours: 8,
        });

        expect(result.success).toBe(true);
    });

    it('rejects invalid payloads', () => {
        const result = validateCourseInput({
            title: '   ',
            slug: '!!!',
            description: '   ',
            instructor: '',
            category: '',
            difficulty: 'expert',
            status: 'private',
            estimated_hours: -1,
        });

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected validation to fail');
        }

        const errors = result.error.flatten().fieldErrors;
        expect(errors.title?.[0]).toContain('wajib diisi');
        expect(errors.slug?.[0]).toContain('Slug');
        expect(errors.description?.[0]).toContain('wajib diisi');
        expect(errors.instructor?.[0]).toContain('Instructor');
        expect(errors.category?.[0]).toContain('Kategori');
        expect(errors.difficulty?.[0]).toContain('Difficulty');
        expect(errors.status?.[0]).toContain('Status');
        expect(errors.estimated_hours?.[0]).toContain('minimal 0');
    });
});
