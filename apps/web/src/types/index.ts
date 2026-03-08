export interface User {
    id: string;
    email: string;
    username: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'admin';
    xp: number;
    level: number;
    streak_current: number;
    streak_longest: number;
    last_active?: string;
    bio?: string;
    github_url?: string;
    linkedin_url?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    order: number;
}

export interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    status: 'draft' | 'published';
    tags: string[];
    estimated_hours: number;
    total_lessons: number;
    enrolled_count: number;
    thumbnail?: string;
    expand?: {
        instructor: User;
        category: Category;
        modules: Module[];
    };
}

export interface Module {
    id: string;
    title: string;
    order: number;
    description?: string;
    expand?: {
        lessons: Lesson[];
    };
}

export interface Lesson {
    id: string;
    title: string;
    slug: string;
    type: 'reading' | 'video' | 'quiz' | 'coding';
    content?: string;
    video_url?: string;
    starter_code?: string;
    xp_reward: number;
    order: number;
    status: 'draft' | 'published';
    estimated_minutes?: number;
    passing_score?: number;
    max_attempts?: number;
}

export interface UserProgress {
    id: string;
    user: string;
    lesson: string;
    status: 'started' | 'completed';
    score?: number;
    attempts: number;
    completed_at?: string;
}

export interface Certificate {
    id: string;
    user: string;
    course: string;
    issued_at: string;
    is_valid: boolean;
    file?: string;
    expand?: {
        user: User;
        course: Course;
    };
}

export interface QuizQuestion {
    id: string;
    lesson: string;
    question: string;
    type: 'multiple_choice' | 'true_false';
    options: { text: string; is_correct: boolean }[];
    explanation?: string;
    order: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon?: string;
    trigger_type: 'xp_milestone' | 'course_complete' | 'streak' | 'ctf_solve' | 'lesson_complete' | 'quiz_perfect';
    trigger_value: number;
    xp_bonus: number;
}

export interface UserBadge {
    id: string;
    user: string;
    badge: string;
    earned_at: string;
    expand?: {
        badge: Badge;
    };
}

export interface CTFChallenge {
    id: string;
    title: string;
    description: string;
    category: 'web' | 'rev' | 'pwn' | 'crypto' | 'forensics' | 'osint' | 'misc';
    difficulty: 'easy' | 'medium' | 'hard' | 'insane';
    points: number;
    hints?: { text: string; cost: number }[];
    is_active: boolean;
    solve_count: number;
    attachment?: string;
}

export interface Comment {
    id: string;
    user: string;
    lesson: string;
    parent?: string;
    content: string;
    is_hidden: boolean;
    created: string;
    updated: string;
    expand?: {
        user: User;
    };
}
