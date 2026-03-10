import { describe, expect, it } from 'vitest';

import { normalizeLessonInput, slugifyLessonTitle, validateLessonInput } from './lessonForm';

describe('slugifyLessonTitle', () => {
    it('slugifies lesson titles safely', () => {
        expect(slugifyLessonTitle('Intro to XSS')).toBe('intro-to-xss');
        expect(slugifyLessonTitle('  Linux   & Bash  ')).toBe('linux-bash');
    });
});

describe('normalizeLessonInput', () => {
    it('trims values, auto-generates slug, and parses numbers', () => {
        expect(
            normalizeLessonInput({
                title: '  Intro to XSS  ',
                slug: '',
                module: 'mod123def456ghi',
                type: 'reading',
                content: '  Halo dunia  ',
                video_url: '  https://example.com/video  ',
                starter_code: '  const a = 1;  ',
                expected_output: '  done  ',
                xp_reward: '25',
                order: '3',
                status: 'published',
                estimated_minutes: '15',
                passing_score: '80',
                max_attempts: '0',
            }),
        ).toEqual({
            title: 'Intro to XSS',
            slug: 'intro-to-xss',
            module: 'mod123def456ghi',
            type: 'reading',
            content: 'Halo dunia',
            video_url: 'https://example.com/video',
            starter_code: 'const a = 1;',
            expected_output: 'done',
            xp_reward: 25,
            order: 3,
            status: 'published',
            estimated_minutes: 15,
            passing_score: 80,
            max_attempts: 0,
        });
    });

    it('converts blank optional fields to undefined', () => {
        expect(
            normalizeLessonInput({
                title: 'Quiz 1',
                slug: 'quiz-1',
                module: 'mod123def456ghi',
                type: 'quiz',
                content: '   ',
                video_url: '   ',
                starter_code: '   ',
                expected_output: '   ',
                xp_reward: '10',
                order: '0',
                status: 'draft',
                estimated_minutes: '',
                passing_score: '',
                max_attempts: '',
            }),
        ).toEqual({
            title: 'Quiz 1',
            slug: 'quiz-1',
            module: 'mod123def456ghi',
            type: 'quiz',
            content: undefined,
            video_url: undefined,
            starter_code: undefined,
            expected_output: undefined,
            xp_reward: 10,
            order: 0,
            status: 'draft',
            estimated_minutes: undefined,
            passing_score: undefined,
            max_attempts: undefined,
        });
    });
});

describe('validateLessonInput', () => {
    it('accepts valid payloads', () => {
        const result = validateLessonInput({
            title: 'Intro to XSS',
            slug: '',
            module: 'mod123def456ghi',
            type: 'reading',
            content: 'Materi',
            xp_reward: 25,
            order: 0,
            status: 'draft',
            estimated_minutes: 10,
        });

        expect(result.success).toBe(true);
    });

    it('rejects published reading lessons without content', () => {
        const result = validateLessonInput({
            title: 'Intro to XSS',
            slug: 'intro-to-xss',
            module: 'mod123def456ghi',
            type: 'reading',
            xp_reward: 25,
            order: 0,
            status: 'published',
        });

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected validation to fail');
        }

        expect(result.error.flatten().fieldErrors.content?.[0]).toContain('published wajib memiliki konten');
    });

    it('rejects published video lessons without video url', () => {
        const result = validateLessonInput({
            title: 'Video Lesson',
            slug: 'video-lesson',
            module: 'mod123def456ghi',
            type: 'video',
            xp_reward: 10,
            order: 0,
            status: 'published',
        });

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected validation to fail');
        }

        expect(result.error.flatten().fieldErrors.video_url?.[0]).toContain('published wajib memiliki URL video');
    });

    it('rejects published coding lessons without starter code and expected output', () => {
        const result = validateLessonInput({
            title: 'Coding Lesson',
            slug: 'coding-lesson',
            module: 'mod123def456ghi',
            type: 'coding',
            xp_reward: 30,
            order: 0,
            status: 'published',
        });

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected validation to fail');
        }

        const errors = result.error.flatten().fieldErrors;
        expect(errors.starter_code?.[0]).toContain('published wajib memiliki starter code');
        expect(errors.expected_output?.[0]).toContain('published wajib memiliki expected output');
    });

    it('rejects published quiz lessons in this phase', () => {
        const result = validateLessonInput({
            title: 'Quiz Lesson',
            slug: 'quiz-lesson',
            module: 'mod123def456ghi',
            type: 'quiz',
            xp_reward: 20,
            order: 0,
            status: 'published',
        });

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected validation to fail');
        }

        expect(result.error.flatten().fieldErrors.status?.[0]).toContain('quiz belum bisa dipublish');
    });

    it('accepts published video lessons with safe url', () => {
        const result = validateLessonInput({
            title: 'Video Lesson',
            slug: 'video-lesson',
            module: 'mod123def456ghi',
            type: 'video',
            video_url: 'https://example.com/embed/123',
            xp_reward: 20,
            order: 0,
            status: 'published',
        });

        expect(result.success).toBe(true);
    });

    it('accepts published coding lessons with required fields', () => {
        const result = validateLessonInput({
            title: 'Coding Lesson',
            slug: 'coding-lesson',
            module: 'mod123def456ghi',
            type: 'coding',
            starter_code: 'console.log("hello")',
            expected_output: 'hello',
            xp_reward: 30,
            order: 1,
            status: 'published',
        });

        expect(result.success).toBe(true);
    });

    it('rejects invalid payloads', () => {
        const result = validateLessonInput({
            title: '   ',
            slug: '!!!',
            module: '',
            type: 'invalid',
            video_url: 'not-a-url',
            xp_reward: -1,
            order: 1.5,
            status: 'broken',
            estimated_minutes: -1,
            passing_score: 101,
            max_attempts: -1,
        });

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected validation to fail');
        }

        const errors = result.error.flatten().fieldErrors;
        expect(errors.title?.[0]).toContain('Judul');
        expect(errors.slug?.[0]).toContain('Slug');
        expect(errors.module?.[0]).toContain('Module');
        expect(errors.type?.[0]).toContain('Tipe');
        expect(errors.video_url?.[0]).toContain('URL');
        expect(errors.xp_reward?.[0]).toContain('minimal 0');
        expect(errors.order?.[0]).toContain('bilangan bulat');
        expect(errors.status?.[0]).toContain('Status');
        expect(errors.estimated_minutes?.[0]).toContain('minimal 0');
        expect(errors.passing_score?.[0]).toContain('maksimal 100');
        expect(errors.max_attempts?.[0]).toContain('minimal 0');
    });

    it('rejects unsafe video url schemes', () => {
        const result = validateLessonInput({
            title: 'Video Lesson',
            slug: 'video-lesson',
            module: 'mod123def456ghi',
            type: 'video',
            video_url: 'javascript:alert(1)',
            xp_reward: 10,
            order: 0,
            status: 'published',
        });

        expect(result.success).toBe(false);
        if (result.success) {
            throw new Error('Expected validation to fail');
        }

        expect(result.error.flatten().fieldErrors.video_url?.[0]).toContain('http atau https');
    });
});
