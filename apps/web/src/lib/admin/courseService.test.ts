import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
    createCourse,
    listAdminCourseInstructors,
    listAdminCourses,
    updateCourse,
} from './courseService';

function createCollectionMock() {
    const courses = {
        getFullList: vi.fn(),
        getFirstListItem: vi.fn(),
        create: vi.fn(),
        getOne: vi.fn(),
        update: vi.fn(),
    };

    const categories = {
        getOne: vi.fn(),
    };

    const users = {
        getFullList: vi.fn(),
        getOne: vi.fn(),
    };

    return {
        pb: {
            collection: vi.fn((name: string) => {
                if (name === 'courses') return courses;
                if (name === 'categories') return categories;
                if (name === 'users') return users;
                throw new Error(`Unexpected collection: ${name}`);
            }),
        },
        courses,
        categories,
        users,
    };
}

describe('courseService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('lists courses with category and instructor expansion', async () => {
        const { pb, courses } = createCollectionMock();
        courses.getFullList.mockResolvedValue([{ id: 'cou123def456ghi' }]);

        const result = await listAdminCourses(pb as never);

        expect(courses.getFullList).toHaveBeenCalledWith({
            sort: 'title',
            expand: 'category,instructor',
        });
        expect(result).toEqual([{ id: 'cou123def456ghi' }]);
    });

    it('lists instructor options for admin course forms', async () => {
        const { pb, users } = createCollectionMock();
        users.getFullList.mockResolvedValue([{ id: 'use123def456ghi', role: 'instructor' }]);

        const result = await listAdminCourseInstructors(pb as never);

        expect(users.getFullList).toHaveBeenCalledWith({
            filter: "role = 'instructor' || role = 'admin'",
            sort: 'username',
            fields: 'id,email,username,role',
        });
        expect(result).toEqual([{ id: 'use123def456ghi', role: 'instructor' }]);
    });

    it('rejects duplicate slug on create', async () => {
        const { pb, courses } = createCollectionMock();
        courses.getFirstListItem.mockResolvedValue({ id: 'cou123def456ghi' });

        await expect(
            createCourse(pb as never, {
                title: 'Web Security Basics',
                slug: 'web-security-basics',
                description: 'desc',
                instructor: 'use123def456ghi',
                category: 'cat123def456ghi',
                difficulty: 'beginner',
                status: 'draft',
                tags: ['web'],
            }),
        ).rejects.toMatchObject({ code: 'duplicate_slug', status: 409 });
    });

    it('creates a course after validating relations', async () => {
        const { pb, courses, categories, users } = createCollectionMock();
        courses.getFirstListItem.mockRejectedValue({ status: 404 });
        categories.getOne.mockResolvedValue({ id: 'cat123def456ghi' });
        users.getOne.mockResolvedValue({ id: 'use123def456ghi', role: 'instructor' });
        courses.create.mockResolvedValue({ id: 'cou123def456ghi' });

        await createCourse(pb as never, {
            title: 'Web Security Basics',
            slug: 'web-security-basics',
            description: 'desc',
            instructor: 'use123def456ghi',
            category: 'cat123def456ghi',
            difficulty: 'beginner',
            status: 'draft',
            tags: ['web'],
            estimated_hours: 6,
        });

        expect(courses.create).toHaveBeenCalledWith({
            title: 'Web Security Basics',
            slug: 'web-security-basics',
            description: 'desc',
            instructor: 'use123def456ghi',
            category: 'cat123def456ghi',
            difficulty: 'beginner',
            status: 'draft',
            tags: ['web'],
            estimated_hours: 6,
            total_lessons: 0,
            enrolled_count: 0,
        });
    });

    it('rejects create when category is missing', async () => {
        const { pb, courses, categories } = createCollectionMock();
        courses.getFirstListItem.mockRejectedValue({ status: 404 });
        categories.getOne.mockRejectedValue({ status: 404 });

        await expect(
            createCourse(pb as never, {
                title: 'Web Security Basics',
                slug: 'web-security-basics',
                description: 'desc',
                instructor: 'use123def456ghi',
                category: 'cat123def456ghi',
                difficulty: 'beginner',
                status: 'draft',
                tags: ['web'],
            }),
        ).rejects.toMatchObject({ code: 'category_not_found', status: 404 });
    });

    it('rejects create when instructor is not instructor or admin', async () => {
        const { pb, courses, categories, users } = createCollectionMock();
        courses.getFirstListItem.mockRejectedValue({ status: 404 });
        categories.getOne.mockResolvedValue({ id: 'cat123def456ghi' });
        users.getOne.mockResolvedValue({ id: 'use123def456ghi', role: 'student' });

        await expect(
            createCourse(pb as never, {
                title: 'Web Security Basics',
                slug: 'web-security-basics',
                description: 'desc',
                instructor: 'use123def456ghi',
                category: 'cat123def456ghi',
                difficulty: 'beginner',
                status: 'draft',
                tags: ['web'],
            }),
        ).rejects.toMatchObject({ code: 'instructor_not_found', status: 404 });
    });

    it('rejects update when course is not found', async () => {
        const { pb, courses } = createCollectionMock();
        courses.getOne.mockRejectedValue({ status: 404 });

        await expect(
            updateCourse(pb as never, 'cou123def456ghi', {
                title: 'Web Security Basics',
                slug: 'web-security-basics',
                description: 'desc',
                instructor: 'use123def456ghi',
                category: 'cat123def456ghi',
                difficulty: 'beginner',
                status: 'draft',
                tags: ['web'],
            }),
        ).rejects.toMatchObject({ code: 'course_not_found', status: 404 });
    });

    it('allows update when the slug belongs to the same course', async () => {
        const { pb, courses, categories, users } = createCollectionMock();
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        courses.getFirstListItem.mockResolvedValue({ id: 'cou123def456ghi' });
        categories.getOne.mockResolvedValue({ id: 'cat123def456ghi' });
        users.getOne.mockResolvedValue({ id: 'use123def456ghi', role: 'admin' });
        courses.update.mockResolvedValue({ id: 'cou123def456ghi' });

        await updateCourse(pb as never, 'cou123def456ghi', {
            title: 'Web Security Basics',
            slug: 'web-security-basics',
            description: 'desc',
            instructor: 'use123def456ghi',
            category: 'cat123def456ghi',
            difficulty: 'advanced',
            status: 'published',
            tags: ['web', 'security'],
        });

        expect(courses.update).toHaveBeenCalledWith('cou123def456ghi', {
            title: 'Web Security Basics',
            slug: 'web-security-basics',
            description: 'desc',
            instructor: 'use123def456ghi',
            category: 'cat123def456ghi',
            difficulty: 'advanced',
            status: 'published',
            tags: ['web', 'security'],
        });
    });

    it('rejects update when slug belongs to another course', async () => {
        const { pb, courses } = createCollectionMock();
        courses.getOne.mockResolvedValue({ id: 'cou123def456ghi' });
        courses.getFirstListItem.mockResolvedValue({ id: 'cou999def456ghi' });

        await expect(
            updateCourse(pb as never, 'cou123def456ghi', {
                title: 'Web Security Basics',
                slug: 'web-security-basics',
                description: 'desc',
                instructor: 'use123def456ghi',
                category: 'cat123def456ghi',
                difficulty: 'advanced',
                status: 'published',
                tags: ['web'],
            }),
        ).rejects.toMatchObject({ code: 'duplicate_slug', status: 409 });
    });
});
