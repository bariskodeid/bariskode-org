# IMPLEMENTATION.md
## Phase 1 MVP — Detailed Implementation Plan
### Platform Pembelajaran Pemrograman & Cybersecurity Open Source

---

| Field           | Detail                                         |
|-----------------|------------------------------------------------|
| **Document ID** | IMPL-001                                       |
| **Version**     | 1.0.0                                          |
| **Phase**       | Phase 1 — MVP Core                             |
| **Status**      | Draft                                          |
| **Author**      | Apin                                           |
| **Relates To**  | PRD-001 · TECH-SPEC-001 · SCHEMA-001           |
| **Stack**       | Astro.js 4 + React 18 + Tailwind CSS + PocketBase 0.22 |
| **Duration**    | 8 minggu (2 bulan)                             |

---

## Table of Contents

1. [Scope Phase 1](#1-scope-phase-1)
2. [Dependency Tree](#2-dependency-tree)
3. [Sprint Breakdown](#3-sprint-breakdown)
4. [Task Details per Sprint](#4-task-details-per-sprint)
   - [Sprint 1 — Project Setup & Infrastructure](#sprint-1--project-setup--infrastructure-minggu-1)
   - [Sprint 2 — Auth System](#sprint-2--auth-system-minggu-2)
   - [Sprint 3 — Course & Content](#sprint-3--course--content-minggu-3-4)
   - [Sprint 4 — Progress Tracking & Quiz](#sprint-4--progress-tracking--quiz-minggu-5)
   - [Sprint 5 — Certificate System](#sprint-5--certificate-system-minggu-6)
   - [Sprint 6 — Polish, Testing & Deploy](#sprint-6--polish-testing--deploy-minggu-7-8)
5. [File Structure Target](#5-file-structure-target)
6. [Critical Implementation Notes](#6-critical-implementation-notes)
7. [Definition of Done — Phase 1](#7-definition-of-done--phase-1)
8. [Known Risks & Blockers](#8-known-risks--blockers)

---

## 1. Scope Phase 1

Phase 1 MVP mencakup fitur **minimum yang dibutuhkan** agar platform bisa digunakan end-to-end: user bisa mendaftar, belajar kursus, dan mendapatkan certificate yang bisa diverifikasi.

### In Scope

| Feature Group | Items |
|--------------|-------|
| **Infrastructure** | Project scaffold, Docker Compose, PocketBase setup, migration apply |
| **Auth** | Email/password register & login, OAuth (Google + GitHub), email verify, password reset, middleware route guard |
| **Course & Content** | Katalog kursus, course detail, module/lesson reader (MDX), mark complete, progress per course |
| **Quiz Basic** | Multiple choice quiz engine, submit & score, retry logic, passing score |
| **Dashboard** | Enrolled courses, completion %, last accessed lesson, total XP (display only) |
| **Certificate** | Auto-generate PDF saat course selesai, unique URL `/verify/[id]`, download PDF, QR code |
| **Deploy** | VPS staging deploy, Nginx reverse proxy, env config |

### Out of Scope (Phase 1)

| Feature | Dijadwalkan Di |
|---------|---------------|
| Monaco Editor / Code Playground | Phase 2 |
| Gamification (XP, Level, Badge) | Phase 2 |
| CTF Module | Phase 3 |
| Discussion / Comments | Phase 2 |
| Meilisearch / Full-text search | Phase 3 |
| Email notifications | Phase 2 |
| Admin analytics dashboard | Phase 3 |
| PWA / Service Worker | Phase 4 |

---

## 2. Dependency Tree

Urutan implementasi berdasarkan hard dependency — item bawah **tidak bisa dimulai** sebelum item atasnya selesai.

```
[1] Project Scaffold & PocketBase Running
        │
        ▼
[2] PocketBase Schema (migrations apply)
        │
        ├──► [3a] Auth System (register/login/OAuth)
        │           │
        │           ▼
        │    [3b] Middleware (route guard)
        │           │
        │           ▼
        │    [4] Course Catalog + Detail Page
        │           │
        │           ▼
        │    [5] Lesson Reader (MDX)
        │           │
        │           ├──► [6a] Mark Complete + user_progress
        │           │           │
        │           │           ▼
        │           │    [6b] Dashboard (progress display)
        │           │
        │           └──► [7a] Quiz Engine (UI + submit)
        │                       │
        │                       ▼
        │                [7b] Quiz API route (server-side scoring)
        │                       │
        │                       ▼
        │                [8] Course Completion Check
        │                       │
        │                       ▼
        │                [9] Certificate Generation
        │                       │
        │                       ▼
        │                [10] /verify/[certId] page
        │
        └──► [PARALLEL] Tailwind UI components (Layout, Nav, Card)
                         bisa dikerjakan paralel dengan [3a] ke atas
```

**Catatan penting:**
- Task [3a] Auth bisa dimulai segera setelah [2] schema apply
- UI components **bisa dikerjakan paralel** — tidak block task lain
- Task [9] Certificate bergantung pada [7b] dan [8] — ini yang paling akhir

---

## 3. Sprint Breakdown

| Sprint | Minggu | Focus | Output Deliverable |
|--------|--------|-------|-------------------|
| **S1** | 1 | Project setup + infrastructure | Repo jalan, PocketBase up, Docker Compose, migrations applied |
| **S2** | 2 | Auth system lengkap | Register/login/OAuth berfungsi, route guard aktif |
| **S3** | 3–4 | Course catalog + lesson reader | Kursus bisa dibuat admin, dibaca user |
| **S4** | 5 | Progress tracking + quiz | Mark complete, quiz submit, dashboard basic |
| **S5** | 6 | Certificate system | PDF generated, `/verify` page live |
| **S6** | 7–8 | Polish, testing, staging deploy | Platform live di VPS staging, semua flow E2E tested |

**Total: 8 minggu** untuk MVP yang fully functional dan deployed.

---

## 4. Task Details per Sprint

---

### Sprint 1 — Project Setup & Infrastructure (Minggu 1)

**Goal:** Semua service running locally, basis proyek siap untuk development.

#### T1.1 — Init Monorepo & Astro Project

```
Priority: P0 | Estimasi: 2 jam | Blocker untuk: semua
```

**Steps:**
1. Buat struktur direktori monorepo
2. Init Astro project dengan Node adapter (SSR mode)
3. Setup Tailwind CSS, React integration, MDX
4. Konfigurasi TypeScript strict mode + path aliases
5. Setup `.env.example` dengan semua variabel yang dibutuhkan
6. Init git + `.gitignore` yang benar (exclude `pb_data/`, `.env`)

**Output files:**
```
/
├── apps/web/           ← Astro project
├── apps/pocketbase/    ← PocketBase binary + migrations
├── docker/             ← Docker Compose
├── .env.example
├── .gitignore
└── README.md
```

**Konfigurasi `astro.config.mjs`:**
```js
import { defineConfig } from 'astro/config';
import react    from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx      from '@astrojs/mdx';
import node     from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), tailwind(), mdx()],
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: true }
  }
});
```

**`tsconfig.json` path aliases:**
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*":         ["src/*"],
      "@lib/*":      ["src/lib/*"],
      "@components/*": ["src/components/*"],
      "@types/*":    ["src/types/*"]
    }
  }
}
```

---

#### T1.2 — Docker Compose Setup

```
Priority: P0 | Estimasi: 3 jam | Blocker untuk: T1.3
```

**Steps:**
1. Buat `docker/docker-compose.yml` untuk local dev (PocketBase only untuk Phase 1)
2. Tambah health check untuk PocketBase
3. Setup volume mounting untuk `pb_data/`, `pb_hooks/`, `pb_migrations/`
4. Test `docker compose up` berhasil, PocketBase accessible di `:8090`

**`docker/docker-compose.yml` (Phase 1 — simplified):**
```yaml
version: '3.8'

services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:0.22.0
    container_name: platform_pocketbase
    ports:
      - "8090:8090"
    volumes:
      - ./apps/pocketbase/pb_data:/pb_data
      - ./apps/pocketbase/pb_hooks:/pb_hooks
      - ./apps/pocketbase/pb_migrations:/pb_migrations
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:8090/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  pb_data:
```

> **Note:** Judge0 dan Meilisearch ditambahkan di Phase 2. Phase 1 cukup PocketBase.

---

#### T1.3 — PocketBase Initial Setup & Migrations

```
Priority: P0 | Estimasi: 4 jam | Blocker untuk: semua feature
```

**Steps:**
1. Download/pull PocketBase binary v0.22.x
2. Buat superadmin pertama via CLI atau Admin UI (`http://localhost:8090/_`)
3. Copy semua migration files dari SCHEMA.md ke `pb_migrations/`
4. Run `./pocketbase migrate up` — pastikan semua 16 migrations applied
5. Verify collections terbuat di Admin UI
6. Test basic CRUD dari Admin UI

**Checklist verifikasi migrations:**
```
✓ categories       (8 default records dari seed)
✓ users            (extended dengan role, xp, level, streak)
✓ courses
✓ modules
✓ lessons
✓ quiz_questions
✓ user_progress    (unique index: user+lesson)
✓ certificates
✓ badges           (14 default records dari seed)
✓ user_badges
✓ ctf_challenges
✓ ctf_solves
✓ comments
```

**Konfigurasi OAuth di PocketBase Admin UI:**
- Settings → Auth providers → Google → masukkan Client ID + Secret
- Settings → Auth providers → GitHub → masukkan Client ID + Secret
- Settings → SMTP → konfigurasikan email provider (Resend/Brevo untuk nanti)

---

#### T1.4 — Base Astro Layout & Design System

```
Priority: P1 | Estimasi: 4 jam | Blocker untuk: semua halaman
```

**Steps:**
1. Buat `BaseLayout.astro` dengan HTML head (meta, OG tags, fonts)
2. Buat `Navbar.astro` — logo, nav links, auth state (login/logout/avatar)
3. Buat `Footer.astro`
4. Setup Tailwind dark mode (`darkMode: 'class'`)
5. Define CSS variables untuk color palette di `globals.css`
6. Buat komponen UI dasar: `Button`, `Card`, `Badge`, `Alert`

**Color palette (cybersecurity theme — dark mode default):**
```css
/* src/styles/globals.css */
:root {
  --color-bg:       #0d0d0d;
  --color-surface:  #1a1a1a;
  --color-border:   #2a2a2a;
  --color-primary:  #00ff88;   /* green terminal */
  --color-accent:   #7c3aed;   /* purple */
  --color-danger:   #ef4444;
  --color-text:     #e5e5e5;
  --color-muted:    #737373;
  --font-mono:      'JetBrains Mono', 'Fira Code', monospace;
}
```

---

### Sprint 2 — Auth System (Minggu 2)

**Goal:** User bisa register, login (email + OAuth), logout, reset password, dengan route guard yang berfungsi.

#### T2.1 — PocketBase Client Setup

```
Priority: P0 | Estimasi: 1 jam | Blocker untuk: semua auth task
```

**`src/lib/pocketbase.ts`:**
```ts
import PocketBase from 'pocketbase';
import type { User } from '@types/index';

const PB_URL = import.meta.env.PUBLIC_POCKETBASE_URL ?? 'http://localhost:8090';

// Singleton — satu instance per request di SSR
export function createPocketBase() {
  const pb = new PocketBase(PB_URL);
  pb.autoCancellation(false); // Wajib untuk SSR
  return pb;
}

// Helper untuk SSR — load auth dari cookie request
export function createPBFromRequest(cookieHeader: string) {
  const pb = createPocketBase();
  pb.authStore.loadFromCookie(cookieHeader);
  return pb;
}

// Type helper
export type PBUser = User & { token: string };
```

**`src/env.d.ts` — extend Astro locals:**
```ts
/// <reference types="astro/client" />
import type PocketBase from 'pocketbase';
import type { User } from './types';

declare namespace App {
  interface Locals {
    pb:    PocketBase;
    user:  User | null;
  }
}
```

---

#### T2.2 — Auth Middleware

```
Priority: P0 | Estimasi: 2 jam | Blocker untuk: semua protected routes
```

**`src/middleware.ts`:**
```ts
import { defineMiddleware } from 'astro:middleware';
import { createPocketBase }  from '@lib/pocketbase';

// Routes yang membutuhkan login
const PROTECTED_ROUTES = ['/dashboard', '/learn', '/quiz', '/admin'];
// Routes yang hanya untuk admin
const ADMIN_ROUTES     = ['/admin'];
// Routes yang redirect ke dashboard jika sudah login
const AUTH_ROUTES      = ['/login', '/register'];

export const onRequest = defineMiddleware(async ({ locals, request, redirect, url }, next) => {
  const pb     = createPocketBase();
  const cookie = request.headers.get('cookie') ?? '';

  // Load auth state dari cookie
  pb.authStore.loadFromCookie(cookie);

  // Refresh token jika valid (extend session)
  if (pb.authStore.isValid) {
    try {
      await pb.collection('users').authRefresh();
    } catch {
      pb.authStore.clear();
    }
  }

  // Set ke locals — tersedia di semua .astro pages
  locals.pb   = pb;
  locals.user = pb.authStore.isValid
    ? (pb.authStore.model as App.Locals['user'])
    : null;

  const path = url.pathname;

  // Redirect unauthenticated user dari protected routes
  const isProtected = PROTECTED_ROUTES.some(r => path.startsWith(r));
  if (isProtected && !locals.user) {
    return redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  // Admin-only check
  const isAdminRoute = ADMIN_ROUTES.some(r => path.startsWith(r));
  if (isAdminRoute && locals.user?.role !== 'admin') {
    return redirect('/403');
  }

  // Redirect user yang sudah login dari /login dan /register
  const isAuthRoute = AUTH_ROUTES.some(r => path.startsWith(r));
  if (isAuthRoute && locals.user) {
    return redirect('/dashboard');
  }

  const response = await next();

  // Update cookie dengan auth state terbaru
  response.headers.append(
    'set-cookie',
    pb.authStore.exportToCookie({ httpOnly: true, secure: true, sameSite: 'lax' })
  );

  return response;
});
```

---

#### T2.3 — Register Page

```
Priority: P0 | Estimasi: 3 jam
```

**`src/pages/register.astro`:**
- Form: username, email, password, konfirmasi password
- Client-side validation (Zod schema)
- Submit → `POST /api/auth/register`
- Success → redirect `/dashboard`
- Error → tampil inline error message

**`src/pages/api/auth/register.ts`:**
```ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals, request, redirect }) => {
  const { email, password, username } = await request.json();

  try {
    // Buat user baru
    await locals.pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      username,
      role: 'student',    // default role
      xp:   0,
      level: 1,
      streak_current: 0,
      streak_longest: 0,
    });

    // Auto login setelah register
    await locals.pb.collection('users').authWithPassword(email, password);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.data?.message ?? 'Registration failed' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

---

#### T2.4 — Login Page

```
Priority: P0 | Estimasi: 2 jam
```

**`src/pages/login.astro`:**
- Form: email, password
- OAuth buttons: Google, GitHub
- "Lupa password?" link
- Submit → `POST /api/auth/login`

**`src/pages/api/auth/login.ts`:**
```ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals, request }) => {
  const { email, password } = await request.json();

  try {
    await locals.pb.collection('users').authWithPassword(email, password);
    return new Response(JSON.stringify({ success: true }));
  } catch {
    return new Response(
      JSON.stringify({ error: 'Email atau password salah' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

---

#### T2.5 — OAuth Flow

```
Priority: P0 | Estimasi: 2 jam
```

PocketBase menangani OAuth redirect secara built-in. Yang perlu dibuat:

**`src/pages/api/auth/oauth.ts`:**
```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals, url, redirect }) => {
  const provider  = url.searchParams.get('provider'); // 'google' | 'github'
  const code      = url.searchParams.get('code');
  const state     = url.searchParams.get('state');

  if (!provider) return redirect('/login');

  try {
    // Exchange code dengan PocketBase OAuth
    const authData = await locals.pb.collection('users').authWithOAuth2Code(
      provider,
      code!,
      url.searchParams.get('codeVerifier') ?? '',
      `${url.origin}/api/auth/oauth?provider=${provider}`
    );

    // Set default fields jika user baru
    if (!authData.record.role) {
      await locals.pb.collection('users').update(authData.record.id, {
        role:           'student',
        xp:             0,
        level:          1,
        streak_current: 0,
        streak_longest: 0,
      });
    }

    return redirect('/dashboard');
  } catch {
    return redirect('/login?error=oauth_failed');
  }
};
```

---

#### T2.6 — Logout & Password Reset

```
Priority: P0 | Estimasi: 1 jam
```

**Logout (API route):**
```ts
// src/pages/api/auth/logout.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals, redirect }) => {
  locals.pb.authStore.clear();
  return redirect('/login');
};
```

**Password reset:** Manfaatkan PocketBase built-in `requestPasswordReset` dan `confirmPasswordReset` — tidak perlu custom logic.

---

### Sprint 3 — Course & Content (Minggu 3–4)

**Goal:** Admin bisa membuat kursus. User bisa browse katalog, buka course detail, dan baca lesson.

#### T3.1 — TypeScript Types

```
Priority: P0 | Estimasi: 1 jam | Blocker untuk: semua Sprint 3
```

**`src/types/index.ts`:**
```ts
export interface User {
  id:             string;
  email:          string;
  username:       string;
  avatar?:        string;
  role:           'student' | 'instructor' | 'admin';
  xp:             number;
  level:          number;
  streak_current: number;
  streak_longest: number;
  last_active?:   string;
  bio?:           string;
  github_url?:    string;
  linkedin_url?:  string;
}

export interface Category {
  id:          string;
  name:        string;
  slug:        string;
  icon?:       string;
  description?: string;
  order:       number;
}

export interface Course {
  id:              string;
  title:           string;
  slug:            string;
  description:     string;
  difficulty:      'beginner' | 'intermediate' | 'advanced';
  status:          'draft' | 'published';
  tags:            string[];
  estimated_hours: number;
  total_lessons:   number;
  enrolled_count:  number;
  thumbnail?:      string;
  expand?: {
    instructor: User;
    category:   Category;
    modules:    Module[];
  };
}

export interface Module {
  id:          string;
  title:       string;
  order:       number;
  description?: string;
  expand?: {
    lessons: Lesson[];
  };
}

export interface Lesson {
  id:                 string;
  title:              string;
  slug:               string;
  type:               'reading' | 'video' | 'quiz' | 'coding';
  content?:           string;
  video_url?:         string;
  starter_code?:      string;
  xp_reward:          number;
  order:              number;
  status:             'draft' | 'published';
  estimated_minutes?: number;
  passing_score?:     number;
  max_attempts?:      number;
}

export interface UserProgress {
  id:           string;
  user:         string;
  lesson:       string;
  status:       'started' | 'completed';
  score?:       number;
  attempts:     number;
  completed_at?: string;
}

export interface Certificate {
  id:        string;
  user:      string;
  course:    string;
  issued_at: string;
  is_valid:  boolean;
  file?:     string;
  expand?: {
    user:   User;
    course: Course;
  };
}

export interface QuizQuestion {
  id:          string;
  lesson:      string;
  question:    string;
  type:        'multiple_choice' | 'true_false';
  options:     { text: string; is_correct: boolean }[];
  explanation?: string;
  order:       number;
}
```

---

#### T3.2 — Course Catalog Page

```
Priority: P0 | Estimasi: 4 jam
```

**`src/pages/courses/index.astro`** (SSR):
- Fetch published courses dari PocketBase dengan `expand=instructor,category`
- Filter UI: kategori, difficulty, search keyword (client-side filter untuk Phase 1)
- Tampilkan grid `CourseCard` component
- Empty state jika tidak ada hasil

**`src/components/ui/CourseCard.astro`:**
```astro
---
import type { Course } from '@types/index';

interface Props {
  course: Course;
  progress?: number; // 0-100
}
const { course, progress } = Astro.props;

const difficultyColor = {
  beginner:     'text-green-400 border-green-400',
  intermediate: 'text-yellow-400 border-yellow-400',
  advanced:     'text-red-400 border-red-400',
};
---

<a href={`/courses/${course.slug}`}
   class="block bg-surface border border-border rounded-lg p-4 hover:border-primary transition-colors">
  {course.thumbnail && (
    <img src={course.thumbnail} alt={course.title}
         class="w-full h-40 object-cover rounded mb-3" />
  )}
  <div class="flex items-center gap-2 mb-2">
    <span class={`text-xs border px-2 py-0.5 rounded font-mono ${difficultyColor[course.difficulty]}`}>
      {course.difficulty}
    </span>
    {course.expand?.category && (
      <span class="text-xs text-muted">{course.expand.category.icon} {course.expand.category.name}</span>
    )}
  </div>
  <h3 class="font-semibold text-text mb-1">{course.title}</h3>
  <p class="text-sm text-muted line-clamp-2">{course.description}</p>
  {progress !== undefined && (
    <div class="mt-3">
      <div class="flex justify-between text-xs text-muted mb-1">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
      <div class="h-1.5 bg-border rounded-full">
        <div class="h-full bg-primary rounded-full" style={`width: ${progress}%`} />
      </div>
    </div>
  )}
</a>
```

---

#### T3.3 — Course Detail Page

```
Priority: P0 | Estimasi: 3 jam
```

**`src/pages/courses/[slug].astro`** (SSR):
- Fetch course by slug + expand modules + lessons
- Tampilkan: deskripsi, instructor, difficulty, estimated hours, lesson list
- Tombol "Mulai Belajar" → redirect ke lesson pertama
- Jika user sudah mulai: tampilkan progress + "Lanjutkan"
- Cek apakah user sudah enrolled (ada `user_progress` record)

**Key logic:**
```ts
const { slug } = Astro.params;
const { pb, user } = Astro.locals;

// Fetch course
const course = await pb.collection('courses').getFirstListItem(
  `slug = '${slug}' && status = 'published'`,
  { expand: 'instructor,category,modules_via_course.lessons_via_module' }
);

// Fetch user progress jika login
let progressMap: Record<string, boolean> = {};
if (user) {
  const allLessonIds = course.expand?.modules_via_course
    ?.flatMap(m => m.expand?.lessons_via_module?.map(l => l.id) ?? []) ?? [];

  if (allLessonIds.length > 0) {
    const progressRecords = await pb.collection('user_progress').getFullList({
      filter: `user = '${user.id}' && lesson IN (${allLessonIds.map(id => `'${id}'`).join(',')}) && status = 'completed'`
    });
    progressMap = Object.fromEntries(progressRecords.map(p => [p.lesson, true]));
  }
}

const totalLessons    = /* count dari semua lessons */;
const completedCount  = Object.keys(progressMap).length;
const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
```

---

#### T3.4 — Lesson Reader Page

```
Priority: P0 | Estimasi: 5 jam | Blocker untuk: Sprint 4
```

**`src/pages/learn/[lessonId].astro`** (SSR + auth-gated):
- Fetch lesson by ID + expand module.course untuk breadcrumb
- Render content berdasarkan `lesson.type`:
  - `reading` → render MDX/Markdown (via `@astrojs/mdx` atau `marked`)
  - `video` → embed iframe YouTube/Vimeo
  - `quiz` → redirect ke `/quiz/[lessonId]`
  - `coding` → Phase 2
- Sidebar navigasi: daftar semua lessons dalam course + completion status
- Tombol "Tandai Selesai" (untuk tipe reading/video)
- "Sebelumnya" / "Selanjutnya" lesson navigation

**Sidebar `LessonNav` component:**
```astro
---
// Tampilkan daftar modules + lessons dengan ikon status
// ✓ = completed, ○ = not started, ► = current
---
```

**Rendering MDX content:**
```ts
// Untuk konten MDX yang disimpan di PocketBase sebagai string
import { marked } from 'marked';
import DOMPurify  from 'isomorphic-dompurify';

const rawHtml    = marked(lesson.content ?? '');
const safeHtml   = DOMPurify.sanitize(rawHtml);
```

> **Note:** Shiki syntax highlighting diintegrasikan via `marked-shiki` atau `rehype-shiki` untuk highlight code blocks.

---

#### T3.5 — PocketBase Admin: Course Management

```
Priority: P0 | Estimasi: 2 jam
```

Untuk Phase 1, instructor/admin membuat konten **langsung via PocketBase Admin UI** (`http://localhost:8090/_`). Tidak perlu custom admin panel dulu.

**Workflow pembuatan konten:**
1. Admin UI → `courses` collection → Create course
2. Admin UI → `modules` collection → Tambah modules untuk course tersebut
3. Admin UI → `lessons` collection → Tambah lessons per module
4. Untuk quiz lessons → `quiz_questions` collection → Tambah soal

**Panduan buat konten sample:**
- Minimal 1 kursus lengkap dengan 2 modules × 3 lessons untuk testing
- 1 quiz lesson dengan minimal 5 soal
- Set `status = 'published'` di course + semua lessons

---

### Sprint 4 — Progress Tracking & Quiz (Minggu 5)

**Goal:** User bisa mark lesson selesai, mengerjakan quiz, dan melihat progress di dashboard.

#### T4.1 — Mark Complete API

```
Priority: P0 | Estimasi: 2 jam | Blocker untuk: T4.3, Sprint 5
```

**`src/pages/api/progress/complete.ts`:**
```ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { lessonId } = await request.json();
  const userId = locals.user.id;

  try {
    // Cek apakah sudah ada progress record
    let existing;
    try {
      existing = await locals.pb.collection('user_progress').getFirstListItem(
        `user = '${userId}' && lesson = '${lessonId}'`
      );
    } catch { /* not found — will create */ }

    if (existing) {
      // Update jika belum completed
      if (existing.status !== 'completed') {
        await locals.pb.collection('user_progress').update(existing.id, {
          status:       'completed',
          completed_at: new Date().toISOString(),
        });
      }
    } else {
      // Buat record baru
      await locals.pb.collection('user_progress').create({
        user:         userId,
        lesson:       lessonId,
        status:       'completed',
        attempts:     1,
        completed_at: new Date().toISOString(),
      });
    }

    // Ambil XP reward dari lesson
    const lesson  = await locals.pb.collection('lessons').getOne(lessonId);
    const xpGain  = lesson.xp_reward ?? 10;

    // Update XP user
    await locals.pb.collection('users').update(userId, {
      'xp+': xpGain,   // PocketBase increment operator
    });

    return new Response(JSON.stringify({ success: true, xpGained: xpGain }));
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? 'Failed to mark complete' }),
      { status: 500 }
    );
  }
};
```

---

#### T4.2 — Quiz Engine

```
Priority: P0 | Estimasi: 6 jam
```

Quiz adalah **React Island** (`client:only="react"`) karena butuh interaktivitas penuh.

**`src/pages/quiz/[lessonId].astro`** (SSR wrapper):
```astro
---
// Hanya fetch metadata lesson — TIDAK fetch quiz_questions
// Questions di-fetch server-side saat submit
const lesson = await Astro.locals.pb.collection('lessons').getOne(lessonId);
---
<Layout>
  <QuizEngine
    client:only="react"
    lessonId={lessonId}
    lessonTitle={lesson.title}
    passingScore={lesson.passing_score ?? 70}
    maxAttempts={lesson.max_attempts ?? 0}
  />
</Layout>
```

**`src/components/react/Quiz/QuizEngine.tsx`:**

State machine quiz:
```
LOADING → READY → IN_PROGRESS → SUBMITTING → RESULT
                                                 │
                                        ┌────────┴────────┐
                                        ▼                  ▼
                                      PASSED            FAILED
                                        │                  │
                                      Done            (retry?) → READY
```

Key implementation points:
- Fetch questions via `GET /api/quiz/[lessonId]/questions` (hanya tampilkan soal, **bukan** jawaban benar)
- User pilih jawaban → simpan di local state
- Submit → `POST /api/quiz/[lessonId]/submit` dengan array answers
- Server returns: `{ score, passed, results: [{questionId, isCorrect, correctIndex}] }`
- Tampilkan review dengan highlight jawaban benar/salah + explanation

**`src/pages/api/quiz/[lessonId]/questions.ts`** — serve questions tanpa `is_correct`:
```ts
export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });

  const questions = await locals.pb.collection('quiz_questions').getFullList({
    filter: `lesson = '${params.lessonId}'`,
    sort:   '+order',
  });

  // STRIP is_correct dari options sebelum kirim ke client
  const safeQuestions = questions.map(q => ({
    id:       q.id,
    question: q.question,
    type:     q.type,
    order:    q.order,
    // options tanpa is_correct!
    options:  (q.options as any[]).map((o: any) => ({ text: o.text })),
  }));

  return new Response(JSON.stringify(safeQuestions));
};
```

**`src/pages/api/quiz/[lessonId]/submit.ts`** — scoring server-side:
```ts
export const POST: APIRoute = async ({ params, locals, request }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });

  const { answers } = await request.json(); // array of selected option indices

  // Fetch FULL questions dengan is_correct — hanya server yang lihat ini
  const questions = await locals.pb.collection('quiz_questions').getFullList({
    filter: `lesson = '${params.lessonId}'`,
    sort:   '+order',
  });

  const lesson     = await locals.pb.collection('lessons').getOne(params.lessonId!);
  const minScore   = lesson.passing_score ?? 70;
  let   correctCount = 0;

  const results = questions.map((q, i) => {
    const opts       = q.options as { text: string; is_correct: boolean }[];
    const correctIdx = opts.findIndex(o => o.is_correct);
    const isCorrect  = Number(answers[i]) === correctIdx;
    if (isCorrect) correctCount++;
    return {
      questionId:    q.id,
      isCorrect,
      correctIndex:  correctIdx,
      explanation:   q.explanation ?? null,
    };
  });

  const score  = Math.round((correctCount / questions.length) * 100);
  const passed = score >= minScore;

  // Upsert progress record
  const existingFilter = `user = '${locals.user.id}' && lesson = '${params.lessonId}'`;
  let existing;
  try { existing = await locals.pb.collection('user_progress').getFirstListItem(existingFilter); }
  catch { /* not found */ }

  const attempts = (existing?.attempts ?? 0) + 1;

  if (existing) {
    await locals.pb.collection('user_progress').update(existing.id, {
      status:       passed ? 'completed' : 'started',
      score,
      attempts,
      completed_at: passed ? new Date().toISOString() : null,
    });
  } else {
    await locals.pb.collection('user_progress').create({
      user:         locals.user.id,
      lesson:       params.lessonId,
      status:       passed ? 'completed' : 'started',
      score,
      attempts,
      completed_at: passed ? new Date().toISOString() : null,
    });
  }

  // Beri XP jika passed
  if (passed) {
    const xpReward = score === 100 ? (lesson.xp_reward ?? 25) * 2 : (lesson.xp_reward ?? 25);
    await locals.pb.collection('users').update(locals.user.id, { 'xp+': xpReward });
  }

  return new Response(JSON.stringify({ score, passed, results, attempts }));
};
```

---

#### T4.3 — Dashboard Page

```
Priority: P0 | Estimasi: 4 jam
```

**`src/pages/dashboard/index.astro`** (SSR + `client:only` untuk interaktif parts):

Data yang dibutuhkan:
```ts
const { pb, user } = Astro.locals;

// 1. Courses yang pernah diakses user (via user_progress)
const progressRecords = await pb.collection('user_progress').getFullList({
  filter:  `user = '${user.id}'`,
  expand:  'lesson.module.course',
});

// 2. Hitung unique courses + completion %
const courseProgressMap = buildCourseProgressMap(progressRecords);

// 3. Rekomendasi kursus (published, belum diakses)
const enrolledCourseIds = Object.keys(courseProgressMap);
const recommended = await pb.collection('courses').getList(1, 6, {
  filter: `status = 'published'`,
  sort:   '-created',
});
```

**Dashboard sections:**
- Header: `Halo, {username}!` + total XP + level badge (sederhana untuk Phase 1)
- **Active Courses**: card per course dengan progress bar + "Lanjutkan" button
- **Recent Activity**: 5 lesson terakhir yang diselesaikan
- **Recommended Courses**: kursus yang belum dimulai (3-4 cards)

---

### Sprint 5 — Certificate System (Minggu 6)

**Goal:** User yang menyelesaikan semua lesson & quiz mendapat certificate PDF dengan URL verifikasi unik.

#### T5.1 — Course Completion Checker

```
Priority: P0 | Estimasi: 2 jam | Blocker untuk: T5.2
```

**`src/lib/certificate.ts` — completion check:**
```ts
import type PocketBase from 'pocketbase';

export async function isCourseCompleted(
  pb: PocketBase,
  userId: string,
  courseId: string
): Promise<boolean> {
  // Ambil semua lesson IDs dalam course (hanya published)
  const lessons = await pb.collection('lessons').getFullList({
    filter: `module.course = '${courseId}' && status = 'published'`,
    fields: 'id,type',
  });

  if (lessons.length === 0) return false;

  const lessonIds = lessons.map(l => l.id);

  // Cek semua lessons sudah completed
  const completedProgress = await pb.collection('user_progress').getFullList({
    filter: `user = '${userId}' && status = 'completed' && lesson IN (${lessonIds.map(id => `'${id}'`).join(',')})`,
    fields: 'lesson',
  });

  return completedProgress.length === lessons.length;
}
```

---

#### T5.2 — Certificate PDF Generator

```
Priority: P0 | Estimasi: 5 jam
```

Gunakan `@react-pdf/renderer` untuk generate PDF server-side via Node.js API route.

**`src/components/react/Certificate/Template.tsx`:**
```tsx
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'JetBrains Mono',
  src: '/fonts/JetBrainsMono-Regular.ttf',
});

const styles = StyleSheet.create({
  page:       { backgroundColor: '#0d0d0d', padding: 60 },
  border:     { position: 'absolute', top: 20, left: 20, right: 20, bottom: 20,
                border: '2px solid #00ff88' },
  header:     { alignItems: 'center', marginBottom: 40 },
  platform:   { fontFamily: 'JetBrains Mono', fontSize: 14, color: '#00ff88',
                letterSpacing: 4, marginBottom: 8 },
  title:      { fontSize: 32, color: '#ffffff', fontWeight: 'bold', textAlign: 'center' },
  body:       { alignItems: 'center', flex: 1, justifyContent: 'center' },
  certLabel:  { color: '#737373', fontSize: 12, marginBottom: 8 },
  name:       { fontSize: 28, color: '#00ff88', fontWeight: 'bold', marginBottom: 16 },
  courseText: { color: '#e5e5e5', fontSize: 16, textAlign: 'center', marginBottom: 24 },
  footer:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  certId:     { fontFamily: 'JetBrains Mono', fontSize: 9, color: '#737373' },
});

interface CertProps {
  certId:     string;
  userName:   string;
  courseName: string;
  issuedDate: string;
  qrDataUrl:  string;
}

export function CertificateTemplate({ certId, userName, courseName, issuedDate, qrDataUrl }: CertProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border} />
        <View style={styles.header}>
          <Text style={styles.platform}>LEARN.HACK.CERTIFY</Text>
          <Text style={styles.title}>Certificate of Completion</Text>
        </View>
        <View style={styles.body}>
          <Text style={styles.certLabel}>This certifies that</Text>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.certLabel}>has successfully completed the course</Text>
          <Text style={styles.courseText}>"{courseName}"</Text>
          <Text style={{ color: '#737373', fontSize: 12 }}>Issued on {issuedDate}</Text>
        </View>
        <View style={styles.footer}>
          <View>
            <Text style={styles.certId}>Certificate ID: {certId}</Text>
            <Text style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: '#737373' }}>
              Verify at: yourplatform.com/verify/{certId}
            </Text>
          </View>
          <Image src={qrDataUrl} style={{ width: 64, height: 64 }} />
        </View>
      </Page>
    </Document>
  );
}
```

**`src/pages/api/certificates/generate.ts`:**
```ts
import type { APIRoute }  from 'astro';
import { renderToBuffer } from '@react-pdf/renderer';
import QRCode             from 'qrcode';
import { v4 as uuidv4 }  from 'uuid';
import { createElement }  from 'react';
import { CertificateTemplate } from '@components/react/Certificate/Template';
import { isCourseCompleted }   from '@lib/certificate';

export const POST: APIRoute = async ({ locals, request }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });

  const { courseId } = await request.json();
  const userId       = locals.user.id;

  // 1. Verifikasi course sudah completed
  const completed = await isCourseCompleted(locals.pb, userId, courseId);
  if (!completed) {
    return new Response(
      JSON.stringify({ error: 'Course belum selesai' }),
      { status: 400 }
    );
  }

  // 2. Cek apakah certificate sudah ada
  try {
    const existing = await locals.pb.collection('certificates').getFirstListItem(
      `user = '${userId}' && course = '${courseId}'`
    );
    return new Response(JSON.stringify({ certId: existing.id }));
  } catch { /* not found — buat baru */ }

  // 3. Generate UUID sebagai cert ID
  const certId     = uuidv4();
  const verifyUrl  = `${new URL(request.url).origin}/verify/${certId}`;
  const qrDataUrl  = await QRCode.toDataURL(verifyUrl, { color: { dark: '#00ff88', light: '#0d0d0d' } });

  // 4. Ambil data untuk certificate
  const course     = await locals.pb.collection('courses').getOne(courseId);
  const issuedDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  // 5. Generate PDF buffer
  const pdfBuffer = await renderToBuffer(
    createElement(CertificateTemplate, {
      certId,
      userName:   locals.user.username ?? locals.user.email,
      courseName: course.title,
      issuedDate,
      qrDataUrl,
    })
  );

  // 6. Upload PDF ke PocketBase file storage
  const formData = new FormData();
  formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), `${certId}.pdf`);
  formData.append('user',      userId);
  formData.append('course',    courseId);
  formData.append('issued_at', new Date().toISOString());
  formData.append('is_valid',  'true');

  // Set custom ID = certId (UUID)
  const cert = await locals.pb.collection('certificates').create(formData, {
    requestKey: certId,
  });

  // Workaround: update ID tidak bisa via SDK, simpan certId sebagai field terpisah
  // Alternatif: gunakan certId sebagai custom ID via PocketBase API langsung
  // Untuk simplicity Phase 1, return cert.id sebagai certId

  return new Response(JSON.stringify({ certId: cert.id }));
};
```

> **⚠️ Catatan:** PocketBase tidak allow custom `id` via SDK secara langsung. Solusinya: simpan `cert_uuid` sebagai field `text` terpisah di collection, dan URL verifikasi menggunakan field ini, bukan `id`. Update SCHEMA.md di Sprint 6 jika perlu.

---

#### T5.3 — Certificate Verification Page

```
Priority: P0 | Estimasi: 2 jam
```

**`src/pages/verify/[certId].astro`** (SSR, public):
```astro
---
const { certId } = Astro.params;
let certificate = null;
let error       = null;

try {
  // Search by cert_uuid field
  certificate = await Astro.locals.pb.collection('certificates')
    .getFirstListItem(`id = '${certId}'`, {
      expand: 'user,course',
    });
} catch {
  error = 'Certificate tidak ditemukan';
}

const isValid = certificate?.is_valid === true;
---
<Layout title={isValid ? 'Certificate Terverifikasi ✓' : 'Certificate Tidak Valid'}>
  {isValid ? (
    <CertificateValidCard
      userName={certificate.expand?.user?.username}
      courseName={certificate.expand?.course?.title}
      issuedAt={certificate.issued_at}
      certId={certId}
    />
  ) : (
    <div class="text-center py-20">
      <div class="text-red-400 text-6xl mb-4">✗</div>
      <h1 class="text-xl font-mono text-red-400">Certificate Tidak Valid</h1>
      <p class="text-muted mt-2">{error ?? 'Certificate telah dicabut atau tidak ditemukan'}</p>
    </div>
  )}
</Layout>
```

---

### Sprint 6 — Polish, Testing & Deploy (Minggu 7–8)

**Goal:** Platform stabil, semua E2E flow berfungsi, deployed ke staging VPS.

#### T6.1 — User Profile Page

```
Priority: P1 | Estimasi: 3 jam
```

**`src/pages/profile/[username].astro`:**
- Avatar, bio, GitHub/LinkedIn links
- Stats: total XP, level, courses completed, streak
- List certificates yang earned (public)

#### T6.2 — Error Pages

```
Priority: P1 | Estimasi: 1 jam
```

- `src/pages/404.astro` — not found
- `src/pages/403.astro` — forbidden
- `src/pages/500.astro` — server error

#### T6.3 — PocketBase Hooks (XP & Course Completion)

```
Priority: P1 | Estimasi: 3 jam
```

**`apps/pocketbase/pb_hooks/on_progress_create.pb.js`:**
```js
// Trigger: setelah user_progress dibuat/diupdate
onRecordAfterCreateRequest((e) => {
  const record = e.record;
  if (record.get('status') !== 'completed') return;

  const userId   = record.get('user');
  const lessonId = record.get('lesson');

  try {
    const lesson   = $app.dao().findRecordById('lessons', lessonId);
    const xpReward = lesson.get('xp_reward') ?? 10;

    const user  = $app.dao().findRecordById('users', userId);
    const newXP = (user.get('xp') ?? 0) + xpReward;

    user.set('xp', newXP);
    user.set('last_active', new Date().toISOString());
    $app.dao().saveRecord(user);

  } catch (err) {
    console.error('XP hook error:', err);
  }
}, 'user_progress');
```

> **Note:** Untuk Phase 1, XP update juga dilakukan di API route sebagai fallback. Hook ini adalah secondary trigger.

#### T6.4 — Security Headers Middleware

```
Priority: P0 | Estimasi: 1 jam
```

Tambahkan ke `src/middleware.ts`:
```ts
// Security headers
const SECURITY_HEADERS = {
  'X-Frame-Options':        'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy':        'strict-origin-when-cross-origin',
  'Permissions-Policy':     'camera=(), microphone=(), geolocation=()',
};

// Di dalam onRequest, setelah next():
for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
  response.headers.set(key, value);
}
```

#### T6.5 — E2E Testing Checklist

```
Priority: P0 | Estimasi: 4 jam (manual testing)
```

**Flow yang harus ditest:**

| # | Flow | Steps | Expected Result |
|---|------|-------|----------------|
| 1 | Register | Buka `/register`, isi form, submit | Redirect `/dashboard`, user terbuat di PB |
| 2 | Login email | Buka `/login`, isi email+pw | Redirect `/dashboard` |
| 3 | OAuth GitHub | Klik "Login with GitHub" | Redirect ke GitHub, balik ke `/dashboard` |
| 4 | Route guard | Buka `/dashboard` tanpa login | Redirect ke `/login` |
| 5 | Browse courses | Buka `/courses` | List kursus tampil |
| 6 | Buka lesson | Klik lesson reading | Konten MDX render dengan benar |
| 7 | Mark complete | Klik "Tandai Selesai" | Progress update, XP bertambah |
| 8 | Quiz basic | Kerjakan quiz 5 soal | Score tampil, XP diberi jika pass |
| 9 | Quiz fail | Submit dengan score < 70% | Tampil "Tidak Lulus", ada tombol retry |
| 10 | Dashboard | Buka `/dashboard` | Active courses + progress % tampil |
| 11 | Certificate | Selesaikan semua lesson+quiz course | PDF ter-generate, email dapat link |
| 12 | Verify cert | Buka `/verify/[certId]` | "Certificate Terverifikasi ✓" tampil |
| 13 | Logout | Klik logout | Session cleared, redirect `/login` |
| 14 | Reset password | Klik "Lupa Password" | Email reset terkirim |

#### T6.6 — VPS Staging Deployment

```
Priority: P0 | Estimasi: 4 jam
```

**Target stack:** Debian 12 VPS + Docker + Nginx + Let's Encrypt

**Steps:**
1. Setup Debian VPS (minimal 2 vCPU, 2GB RAM)
2. Install Docker + Docker Compose + Nginx
3. Clone repo ke `/opt/platform`
4. Copy `.env` production values
5. `docker compose -f docker/docker-compose.yml up -d`
6. Build Astro: `cd apps/web && npm run build`
7. Run Astro dengan PM2: `pm2 start dist/server/entry.mjs --name platform-web`
8. Nginx config:

```nginx
# /etc/nginx/sites-available/platform
server {
    listen 80;
    server_name staging.yourplatform.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name staging.yourplatform.com;

    ssl_certificate     /etc/letsencrypt/live/staging.yourplatform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging.yourplatform.com/privkey.pem;

    # Astro SSR app
    location / {
        proxy_pass         http://localhost:4321;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # PocketBase API
    location /api/pb/ {
        proxy_pass       http://localhost:8090/;
        proxy_set_header Host $host;
    }
}
```

9. `certbot --nginx -d staging.yourplatform.com`
10. Test semua flow dari browser publik

---

## 5. File Structure Target

Struktur file yang harus ada di akhir Phase 1:

```
apps/web/src/
├── pages/
│   ├── index.astro                  ← Landing page (static)
│   ├── 404.astro
│   ├── 403.astro
│   ├── login.astro
│   ├── register.astro
│   ├── dashboard/
│   │   └── index.astro
│   ├── courses/
│   │   ├── index.astro              ← Katalog
│   │   └── [slug].astro             ← Detail
│   ├── learn/
│   │   └── [lessonId].astro
│   ├── quiz/
│   │   └── [lessonId].astro
│   ├── verify/
│   │   └── [certId].astro
│   ├── profile/
│   │   └── [username].astro
│   └── api/
│       ├── auth/
│       │   ├── register.ts
│       │   ├── login.ts
│       │   ├── logout.ts
│       │   └── oauth.ts
│       ├── progress/
│       │   └── complete.ts
│       ├── quiz/
│       │   └── [lessonId]/
│       │       ├── questions.ts
│       │       └── submit.ts
│       └── certificates/
│           └── generate.ts
│
├── components/
│   ├── ui/                          ← Astro components (no hydration)
│   │   ├── Button.astro
│   │   ├── Card.astro
│   │   ├── Badge.astro
│   │   ├── Alert.astro
│   │   ├── CourseCard.astro
│   │   ├── LessonNav.astro
│   │   └── ProgressBar.astro
│   └── react/                       ← React Islands
│       ├── Quiz/
│       │   └── QuizEngine.tsx
│       ├── Certificate/
│       │   └── Template.tsx
│       └── Auth/
│           └── OAuthButtons.tsx
│
├── layouts/
│   ├── BaseLayout.astro
│   └── DashboardLayout.astro
│
├── lib/
│   ├── pocketbase.ts
│   └── certificate.ts
│
├── types/
│   └── index.ts
│
├── styles/
│   └── globals.css
│
└── middleware.ts

apps/pocketbase/
├── pb_migrations/                   ← 16 migration files
└── pb_hooks/
    └── on_progress_create.pb.js
```

---

## 6. Critical Implementation Notes

### 6.1 PocketBase Auth Cookie Pattern

Pattern yang **benar** untuk Astro SSR + PocketBase (berdasarkan official docs):

```ts
// ✓ BENAR — buat PocketBase instance per-request di middleware
export const onRequest = defineMiddleware(async ({ locals, request }, next) => {
  const pb = new PocketBase(PB_URL);
  pb.authStore.loadFromCookie(request.headers.get('cookie') ?? '');

  // Refresh token
  if (pb.authStore.isValid) {
    try { await pb.collection('users').authRefresh(); }
    catch { pb.authStore.clear(); }
  }

  locals.pb   = pb;
  locals.user = pb.authStore.model;

  const response = await next();

  // Update cookie di setiap response
  response.headers.append('set-cookie',
    pb.authStore.exportToCookie({ httpOnly: true, secure: true })
  );
  return response;
});

// ✗ SALAH — jangan gunakan singleton PocketBase di SSR
// const pb = new PocketBase(URL); // Global singleton — akan bocorkan auth antar users!
```

### 6.2 Quiz Security — Jawaban Tidak Boleh Sampai ke Client

```
Quiz questions disimpan di PocketBase dengan is_correct di tiap option.
Access rule quiz_questions: HANYA instructor + admin yang bisa list/view.

Flow yang aman:
Client → GET /api/quiz/[id]/questions  →  Server strip is_correct  →  Client
Client → POST /api/quiz/[id]/submit    →  Server fetch is_correct  →  Server score  →  Client result
                                                  ↑
                                        Ini tidak pernah ke client
```

### 6.3 Certificate ID vs PocketBase ID

PocketBase auto-generate ID 15-char. Untuk certificate verification URL yang lebih clean dan UUID-based:

**Opsi A (recommended):** Tambah field `cert_uuid` (text, unique) di `certificates` collection. URL: `/verify/[cert_uuid]`.

**Opsi B:** Gunakan PocketBase ID langsung. URL: `/verify/[pb_id_15char]`.

Phase 1 → gunakan **Opsi B** untuk simplicity. Bisa di-refactor ke Opsi A di Phase 2.

### 6.4 `@react-pdf/renderer` di Astro SSR

`renderToBuffer` harus dijalankan **server-side only** (di API route, bukan di `.astro` file yang di-render di client). Import harus conditional atau di file yang jelas server-side:

```ts
// ✓ Di pages/api/*.ts — selalu server-side
import { renderToBuffer } from '@react-pdf/renderer';

// Tambahkan di astro.config.mjs untuk avoid SSR issues:
export default defineConfig({
  vite: {
    ssr: {
      noExternal: ['@react-pdf/renderer']
    }
  }
});
```

### 6.5 MDX Content dari PocketBase

Content lesson disimpan sebagai Markdown string di PocketBase (bukan file MDX). Rendering menggunakan `marked` + `isomorphic-dompurify`:

```bash
npm i marked isomorphic-dompurify @types/marked
```

Untuk syntax highlighting di code blocks, tambahkan `marked-shiki`:
```bash
npm i marked-shiki shiki
```

---

## 7. Definition of Done — Phase 1

Phase 1 dianggap **DONE** ketika semua checklist berikut terpenuhi:

### Functional Requirements
- [ ] User bisa register dengan email/password
- [ ] User bisa login dengan Google OAuth
- [ ] User bisa login dengan GitHub OAuth
- [ ] Route guard berfungsi — `/dashboard` redirect ke `/login` tanpa auth
- [ ] User bisa browse katalog kursus
- [ ] User bisa membaca lesson (reading type)
- [ ] User bisa menonton lesson (video type dengan embed)
- [ ] User bisa mark lesson sebagai selesai
- [ ] User bisa mengerjakan quiz dan mendapat score
- [ ] Quiz tidak lulus → user bisa retry
- [ ] Dashboard menampilkan enrolled courses + progress %
- [ ] Setelah semua lesson + quiz selesai → certificate ter-generate
- [ ] Certificate PDF bisa didownload
- [ ] `/verify/[certId]` menampilkan info certificate yang valid
- [ ] QR code di certificate mengarah ke verify page yang benar

### Technical Requirements
- [ ] Tidak ada plaintext password di logs atau response
- [ ] Quiz answers (`is_correct`) tidak pernah dikirim ke client
- [ ] Security headers terpasang (X-Frame-Options, nosniff, dll)
- [ ] PocketBase berjalan via Docker Compose
- [ ] Semua migration applied tanpa error
- [ ] Build Astro berhasil tanpa TypeScript errors
- [ ] Platform deployed dan accessible di staging URL
- [ ] HTTPS aktif dengan Let's Encrypt

### Performance (minimum)
- [ ] Halaman catalog load < 3 detik di staging
- [ ] Lesson reader load < 2 detik
- [ ] Certificate generation < 5 detik

---

## 8. Known Risks & Blockers

| Risk | Dampak | Kemungkinan | Mitigasi |
|------|--------|-------------|---------|
| `@react-pdf/renderer` incompatibility dengan Astro SSR | Certificate generation gagal | Medium | Test early di Sprint 5; fallback ke Puppeteer jika perlu |
| PocketBase `id` tidak bisa di-custom via SDK | Certificate verify URL menggunakan auto-generated ID | Low | Acceptable untuk Phase 1; tambah `cert_uuid` field di Phase 2 |
| OAuth callback URL mismatch di staging | Login OAuth gagal | Medium | Setup callback URL di Google/GitHub Console sebelum deploy |
| MDX content dari PocketBase tidak support JSX components | Rich content terbatas | Low | Untuk Phase 1, cukup Markdown biasa. MDX components di Phase 2 |
| Judge0 belum ada di Phase 1 | Coding lesson tidak bisa dieksekusi | N/A | Sengaja out-of-scope — tampilkan placeholder "Coming Soon" |
| VPS resources kurang untuk semua service | Platform lambat | Low | Phase 1 hanya PocketBase — resource usage minimal |
| Konten kursus kosong saat launch | Tidak ada yang bisa ditest | **High** | **Buat minimal 1 kursus lengkap sebelum S3 testing** |

---

> Dokumen ini adalah bagian dari seri dokumentasi.
> Lihat juga: **PRD-001.md** · **TECH-SPEC-001.md** · **SCHEMA-001.md** · **SETUP.md**

---

**IMPL-001 v1.0.0** | Phase 1 MVP Implementation Plan
