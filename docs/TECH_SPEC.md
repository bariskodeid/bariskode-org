# TECH_SPEC.md
## Platform Pembelajaran Pemrograman & Cybersecurity Open Source

---

| Field           | Detail                                         |
|-----------------|------------------------------------------------|
| **Document ID** | TECH-SPEC-001                                  |
| **Version**     | 1.0.0                                          |
| **Status**      | Draft                                          |
| **Author**      | Apin                                           |
| **Relates To**  | PRD-001                                        |
| **Stack**       | Astro.js + Tailwind CSS + PocketBase           |
| **Created**     | 2025                                           |

---

## Table of Contents

**Overview**
1. [Tech Stack](#1-tech-stack)
2. [System Architecture](#2-system-architecture)
3. [Project Structure](#3-project-structure)

**Frontend**
4. [Astro.js Setup](#4-astrojs-setup)
5. [Routing Strategy](#5-routing-strategy)
6. [State Management](#6-state-management)
7. [Component Design](#7-component-design)

**Backend**
8. [PocketBase Config](#8-pocketbase-config)
9. [Data Schema](#9-data-schema)
10. [API Design](#10-api-design)
11. [Auth & RBAC](#11-auth--rbac)

**Features**
12. [Code Playground](#12-code-playground)
13. [Quiz Engine](#13-quiz-engine)
14. [Gamification System](#14-gamification-system)
15. [Certificate System](#15-certificate-system)
16. [CTF Module](#16-ctf-module)
17. [Search](#17-search)

**Infrastructure**
18. [Docker Setup](#18-docker-setup)
19. [Deployment](#19-deployment)
20. [Security](#20-security)
21. [Performance](#21-performance)
22. [PWA Configuration](#22-pwa-configuration)

---

## 1. Tech Stack

| Layer | Technology | Version | Role | Priority |
|-------|-----------|---------|------|----------|
| Frontend Framework | **Astro.js** | ^4.x | SSR/Static pages, islands architecture | P0 |
| UI Components | **React** | ^18.x | Interactive islands (quiz, editor, dashboard) | P0 |
| Styling | **Tailwind CSS** | ^3.x | Utility-first styling, dark mode | P0 |
| Backend / DB | **PocketBase** | ^0.22.x | All-in-one: auth, DB (SQLite), REST API, file storage | P0 |
| Code Execution | **Judge0 CE** | latest | Sandboxed multi-language code runner | P0 |
| Code Editor | **Monaco Editor** | ^0.46.x | In-browser IDE (VSCode engine) | P0 |
| Search Engine | **Meilisearch** | ^1.x | Full-text search, self-hosted | P1 |
| PDF Generation | **@react-pdf/renderer** | ^3.x | Certificate PDF generation | P0 |
| File Storage | **Cloudflare R2** | — | S3-compatible, media & file assets | P1 |
| Email | **Resend / Brevo** | — | Transactional email via PocketBase SMTP hooks | P1 |
| Containerization | **Docker + Compose** | ^26.x | Judge0, Meilisearch, PocketBase orchestration | P0 |
| Content Format | **MDX** | ^3.x | Lesson content dengan JSX components | P0 |

---

## 2. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                           │
│                                                                 │
│   Astro.js Pages (SSR + Static)                                │
│   ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌─────────────┐  │
│   │  /learn  │  │  /quiz   │  │/playground│  │  /dashboard │  │
│   │ MDX+SSR  │  │  React   │  │   React   │  │    React    │  │
│   │  Static  │  │  Island  │  │   Island  │  │    Island   │  │
│   └────┬─────┘  └────┬─────┘  └─────┬─────┘  └──────┬──────┘  │
└────────┼─────────────┼──────────────┼────────────────┼─────────┘
         │  PocketBase SDK (JS)        │                │
         ▼             ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    POCKETBASE (Port 8090)                        │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌─────────────┐   │
│  │   Auth   │  │   REST   │  │ Realtime  │  │  File Store │   │
│  │  JWT/    │  │   API    │  │ Subscript │  │  (local/R2) │   │
│  │  OAuth2  │  │ /api/    │  │ WebSocket │  │             │   │
│  └──────────┘  └──────────┘  └───────────┘  └─────────────┘   │
│                    SQLite (WAL mode)                             │
│              Hooks → SMTP Email / Webhooks                      │
└────────────────────┬────────────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│  Judge0 CE       │  │  Meilisearch     │
│  (Docker :2358)  │  │  (Docker :7700)  │
│  Code Execution  │  │  Full-text Search│
│  Sandboxed       │  │  Index Sync      │
└──────────────────┘  └──────────────────┘
```

### Data Flow: Lesson Completion

```
User reads lesson
  → Click "Mark Complete"
  → POST /api/progress
  → PocketBase upsert user_progress
  → Recalculate XP/level
  → Check badge triggers
  → Return updated state
```

---

## 3. Project Structure

```
/platform
├── apps/
│   ├── web/                        # Astro.js frontend
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   ├── courses/
│   │   │   │   │   ├── index.astro
│   │   │   │   │   └── [slug].astro
│   │   │   │   ├── learn/
│   │   │   │   │   └── [lesson].astro
│   │   │   │   ├── quiz/
│   │   │   │   │   └── [id].astro
│   │   │   │   ├── playground/
│   │   │   │   │   └── index.astro
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── index.astro
│   │   │   │   ├── ctf/
│   │   │   │   │   ├── index.astro
│   │   │   │   │   └── [id].astro
│   │   │   │   ├── verify/
│   │   │   │   │   └── [certId].astro   # Public cert verify
│   │   │   │   └── admin/
│   │   │   │       └── index.astro
│   │   │   ├── components/
│   │   │   │   ├── ui/                  # Reusable Astro components
│   │   │   │   └── react/               # React Islands
│   │   │   │       ├── CodeEditor/      # Monaco + Judge0
│   │   │   │       ├── Quiz/
│   │   │   │       ├── Dashboard/
│   │   │   │       └── CTF/
│   │   │   ├── layouts/
│   │   │   ├── content/
│   │   │   │   └── courses/             # MDX lesson files
│   │   │   ├── lib/
│   │   │   │   ├── pocketbase.ts
│   │   │   │   ├── judge0.ts
│   │   │   │   ├── search.ts
│   │   │   │   └── certificate.ts
│   │   │   ├── stores/                  # Nanostores
│   │   │   ├── types/
│   │   │   └── middleware.ts
│   │   ├── public/
│   │   ├── astro.config.mjs
│   │   └── package.json
│   │
│   └── pocketbase/
│       ├── pb_migrations/
│       ├── pb_hooks/
│       └── pb_data/                     # gitignored
│
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── judge0/
│       └── judge0.conf
│
├── docs/
└── .github/
    └── workflows/
```

---

## 4. Astro.js Setup

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react    from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx      from '@astrojs/mdx';
import node     from '@astrojs/node';
import sitemap  from '@astrojs/sitemap';

export default defineConfig({
  output: 'server',        // SSR mode
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), tailwind(), mdx(), sitemap()],
  vite: {
    optimizeDeps: { include: ['monaco-editor'] }
  },
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: true }
  }
});
```

### Key Dependencies

```json
{
  "dependencies": {
    "astro":                  "^4.15.0",
    "@astrojs/react":         "^3.6.0",
    "@astrojs/tailwind":      "^5.1.0",
    "@astrojs/mdx":           "^3.1.0",
    "@astrojs/node":          "^8.3.0",
    "pocketbase":             "^0.22.0",
    "@monaco-editor/react":   "^4.6.0",
    "@react-pdf/renderer":    "^3.4.0",
    "meilisearch":            "^0.44.0",
    "nanostores":             "^0.11.0",
    "@nanostores/react":      "^0.7.0",
    "qrcode":                 "^1.5.3",
    "date-fns":               "^3.6.0",
    "zod":                    "^3.23.0"
  }
}
```

---

## 5. Routing Strategy

| Route | Rendering | Auth | Role | Notes |
|-------|-----------|------|------|-------|
| `/` | Static | — | Public | Landing page, SEO critical |
| `/courses` | SSR | — | Public | Course catalog dengan filter |
| `/courses/[slug]` | SSR | — | Public | Course detail page |
| `/learn/[lesson]` | SSR + MDX | ✓ | Student+ | Lesson reader, progress tracking |
| `/quiz/[id]` | SSR + React Island | ✓ | Student+ | Interactive quiz engine |
| `/playground` | SSR + React Island | Optional | Public | Monaco + Judge0, demo tanpa login |
| `/dashboard` | SSR + React Island | ✓ | Student+ | Progress, XP, enrolled courses |
| `/ctf` | SSR + React Island | ✓ | Student+ | CTF listing + scoreboard |
| `/verify/[certId]` | SSR | — | Public | Certificate verification via trusted server-side fetch; PDF download tetap owner/admin only |
| `/admin` | React Island (SPA) | ✓ | Admin only | Analytics, user management |
| `/api/*` | Astro API Routes | Varies | Varies | Server-side logic |

### Auth Middleware

```ts
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { pb } from './lib/pocketbase';

const PROTECTED_ROUTES = ['/dashboard', '/learn', '/quiz', '/ctf', '/admin'];

export const onRequest = defineMiddleware(async ({ locals, request, redirect }, next) => {
  const url          = new URL(request.url);
  const cookieHeader = request.headers.get('cookie') ?? '';

  pb.authStore.loadFromCookie(cookieHeader);

  if (pb.authStore.isValid) {
    locals.user  = pb.authStore.model;
    locals.token = pb.authStore.token;
  }

  const isProtected = PROTECTED_ROUTES.some(r => url.pathname.startsWith(r));
  if (isProtected && !pb.authStore.isValid) {
    return redirect(`/login?redirect=${url.pathname}`);
  }

  if (url.pathname.startsWith('/admin') && locals.user?.role !== 'admin') {
    return redirect('/403');
  }

  return next();
});
```

---

## 6. State Management

Menggunakan **Nanostores** — lightweight, kompatibel dengan Astro islands.

```ts
// src/stores/auth.ts
import { atom, computed } from 'nanostores';
import { pb } from '../lib/pocketbase';

export const $user      = atom(pb.authStore.model);
export const $isLoggedIn = computed($user, u => u !== null);
export const $isAdmin    = computed($user, u => u?.role === 'admin');

pb.authStore.onChange((token, model) => { $user.set(model); });
```

```ts
// src/stores/progress.ts
import { map } from 'nanostores';

export const $userProgress = map({
  completedLessons: [] as string[],
  xp:              0,
  level:           1,
  streak:          0,
  activeCourses:   [] as string[],
});
```

> **Note:** Gunakan Astro SSR untuk initial data load. Nanostore hanya untuk state yang perlu di-share antar React islands dalam satu halaman.

---

## 7. Component Design

### Hydration Strategy

```astro
<CodeEditor client:visible starterCode={lesson.starter_code} />
<Quiz       client:idle    quizData={questions} />
<Dashboard  client:only="react" userData={user} />
```

| Directive | Behavior | Use Case |
|-----------|----------|----------|
| `client:load` | Hydrate immediately | Critical interactive UI |
| `client:idle` | Hydrate saat browser idle | Quiz, non-urgent UI |
| `client:visible` | Hydrate saat masuk viewport | Code editor, below-fold |
| `client:only` | Skip SSR, client-only | Dashboard, user-specific content |

---

## 8. PocketBase Config

```ts
// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.PUBLIC_POCKETBASE_URL ?? 'http://localhost:8090';

export const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);  // Disable untuk SSR

export const collections = {
  users:        () => pb.collection('users'),
  courses:      () => pb.collection('courses'),
  modules:      () => pb.collection('modules'),
  lessons:      () => pb.collection('lessons'),
  progress:     () => pb.collection('user_progress'),
  certificates: () => pb.collection('certificates'),
  ctf:          () => pb.collection('ctf_challenges'),
  badges:       () => pb.collection('badges'),
  userBadges:   () => pb.collection('user_badges'),
  comments:     () => pb.collection('comments'),
};
```

### PocketBase Hook: XP on Lesson Complete

```js
// pb_hooks/on_progress_create.pb.js
onRecordAfterCreateRequest((e) => {
  const record = e.record;
  if (record.get('status') !== 'completed') return;

  const userId   = record.get('user');
  const lessonId = record.get('lesson');

  const lesson   = $app.dao().findRecordById('lessons', lessonId);
  const xpReward = lesson.get('xp_reward');

  const user  = $app.dao().findRecordById('users', userId);
  const newXP = user.get('xp') + xpReward;
  user.set('xp', newXP);
  user.set('level', calculateLevel(newXP));
  $app.dao().saveRecord(user);

  checkCourseCompletion($app, userId, lessonId);

}, 'user_progress');
```

---

## 9. Data Schema

| Collection | Key Fields | Relations | Notes |
|-----------|-----------|----------|-------|
| `users` | email, username, role, xp, level, streak_current, last_active | — | Extend PB auth |
| `courses` | title, slug, difficulty, status, estimated_hours, tags | instructor→users | slug unique index |
| `modules` | title, order, description | course→courses | Ordered by `order` |
| `lessons` | title, slug, type, content, video_url, starter_code, xp_reward, order | module→modules | type: reading/video/quiz/coding |
| `quiz_questions` | question, type, options (JSON), explanation, order | lesson→lessons | options: [{text, is_correct}] |
| `user_progress` | status, score, attempts, completed_at | user→users, lesson→lessons | Unique: (user, lesson) |
| `certificates` | issued_at, file, is_valid | user→users, course→courses | id = UUID cert |
| `badges` | name, description, icon, trigger_type, trigger_value | — | |
| `user_badges` | earned_at | user→users, badge→badges | Unique: (user, badge) |
| `ctf_challenges` | title, category, difficulty, points, flag_hash, hints (JSON) | — | flag = bcrypt hash |
| `ctf_solves` | points_earned, hints_used, solved_at | user→users, challenge→ctf_challenges | Unique: (user, challenge) |
| `comments` | content, is_hidden | user→users, lesson→lessons, parent→comments | Nested max 2 levels |

> Security note: `badges` remains public-readable, while `badges` writes and all privileged
> `user_badges` operations are intended to go through trusted backend / PocketBase admin context,
> not raw client-authenticated `users.role = 'admin'` access.
>
> `ctf_solves` also now follows trusted-backend writes for create/update/delete. Its authenticated
> list access is intentionally retained for leaderboard/community ranking use, while single-record
> views remain restricted to owner/admin.
>
> `comments` keeps self-service create/update/delete for the owner, but admin/instructor moderation
> now goes through a trusted backend admin route using PocketBase admin/superuser context rather
> than raw collection-rule bypass on `users.role = 'admin'`.
>
> PocketBase hook-level field protection is required so comment owners cannot mutate moderation or
> ownership fields (`is_hidden`, `user`, `lesson`, `parent`) through normal self-service updates.
> The same hook also enforces published lesson/course targets, same-lesson replies, max 2-level
> nesting, and blocks replies to hidden comments.

### TypeScript Types

```ts
// src/types/index.ts
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'student' | 'instructor' | 'admin';
  xp: number;
  level: number;
  streak_current: number;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published';
  estimated_hours: number;
  expand?: { instructor: User; modules: Module[] };
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  type: 'reading' | 'video' | 'quiz' | 'coding';
  content: string;
  xp_reward: number;
  starter_code?: string;
}

export interface Certificate {
  id: string;  // UUID — used as cert ID
  user: string;
  course: string;
  issued_at: string;
  is_valid: boolean;
  expand?: { user: User; course: Course };
}
```

---

## 10. API Design

### Route Conventions

```
GET    /api/courses                → list published courses
GET    /api/courses/[slug]         → course detail + modules
GET    /api/lessons/[id]           → lesson content
POST   /api/progress               → mark lesson complete
GET    /api/progress/[courseId]    → user progress for course
POST   /api/quiz/[id]/submit       → submit quiz answers
POST   /api/certificates/generate  → generate cert setelah course selesai
GET    /api/ctf/challenges         → list active CTF challenges
POST   /api/ctf/[id]/submit        → submit CTF flag
POST   /api/ctf/[id]/hint          → buy hint (deduct points)
GET    /api/leaderboard            → XP leaderboard
```

### Response Format

```ts
// Success
{ data: T, meta?: { total, page, perPage } }

// Error
{ error: { code: string, message: string }, status: number }
```

---

## 11. Auth & RBAC

### Roles & Permissions

| Permission | Student | Instructor | Admin |
|-----------|:-------:|:----------:|:-----:|
| View published courses | ✓ | ✓ | ✓ |
| Mark lesson complete | ✓ | ✓ | ✓ |
| Submit quiz | ✓ | ✓ | ✓ |
| Submit CTF flag | ✓ | ✓ | ✓ |
| Create/edit courses | — | ✓ | ✓ |
| View course analytics | — | Own only | ✓ |
| Manage users | — | — | ✓ |
| Moderate comments | — | Trusted backend only | Trusted backend only |
| Create CTF challenges | — | — | ✓ |

### OAuth Flow

```
User clicks "Login with GitHub"
  → Redirect ke PocketBase OAuth endpoint
  → PocketBase redirect ke GitHub
  → User authorize
  → GitHub callback → PocketBase
  → PocketBase create/update user record
  → JWT token set sebagai HTTP-only cookie
  → Redirect ke /dashboard
```

---

## 12. Code Playground

### Monaco Editor Component

```tsx
// src/components/react/CodeEditor/CodeEditor.tsx
import Editor from '@monaco-editor/react';
import { useState } from 'react';
import { executeCode } from '../../../lib/judge0';

export default function CodeEditor({ starterCode = '', language = 'python' }) {
  const [code, setCode]         = useState(starterCode);
  const [output, setOutput]     = useState('');
  const [isRunning, setRunning] = useState(false);

  const handleRun = async () => {
    setRunning(true);
    setOutput('Running...');
    try {
      const result = await executeCode({ code, language });
      setOutput(result.stdout || result.stderr || result.compile_output || 'No output');
    } catch {
      setOutput('Error: Failed to execute code');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="border-2 border-black">
      <Editor
        height="300px"
        language={language}
        value={code}
        onChange={(v) => setCode(v ?? '')}
        theme="vs-dark"
        options={{ minimap: { enabled: false }, fontSize: 13 }}
      />
      <div className="border-t-2 border-black p-3 bg-black">
        <button onClick={handleRun} disabled={isRunning}
          className="border border-white text-white px-4 py-1 text-xs font-mono">
          {isRunning ? '▶ RUNNING...' : '▶ RUN'}
        </button>
      </div>
      <pre className="bg-gray-900 text-green-400 p-4 font-mono text-xs min-h-16">
        {output}
      </pre>
    </div>
  );
}
```

### Judge0 API Client

```ts
// src/lib/judge0.ts
const JUDGE0_URL = import.meta.env.JUDGE0_URL ?? 'http://localhost:2358';

export const LANGUAGE_IDS: Record<string, number> = {
  python:     71,
  javascript: 63,
  bash:       46,
  c:          50,
  cpp:        54,
  php:        68,
};

export async function executeCode({ code, language }: { code: string; language: string }) {
  const res = await fetch(`${JUDGE0_URL}/submissions?wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language_id:    LANGUAGE_IDS[language] ?? 71,
      source_code:    btoa(code),
      cpu_time_limit: 5,
      memory_limit:   262144,
    })
  });
  const result = await res.json();
  return {
    stdout:         result.stdout         ? atob(result.stdout)         : null,
    stderr:         result.stderr         ? atob(result.stderr)         : null,
    compile_output: result.compile_output ? atob(result.compile_output) : null,
    status:         result.status?.description,
  };
}
```

---

## 13. Quiz Engine

### Quiz State Machine

```
IDLE ──► LOADING ──► IN_PROGRESS
                          │
              ┌───────────┤
              │           │
              ▼           ▼
         SUBMITTED     TIMEOUT
              │
       ┌──────┴──────┐
       ▼             ▼
    PASSED        FAILED
  (score≥min)   (score<min)
       │             │
       ▼         Retry?
 XP + Badge     Yes → IDLE
  check         No  → LOCKED
```

### Quiz Submit API

```ts
// src/pages/api/quiz/[id]/submit.ts
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ params, locals, request }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });

  const { answers } = await request.json();
  const lessonId    = params.id!;

  // Fetch correct answers server-side (never expose to client)
  const questions = await pb.collection('quiz_questions')
    .getList(1, 100, { filter: `lesson = '${lessonId}'` });

  let correct = 0;
  const results = questions.items.map((q, i) => {
    const options    = q.options as { text: string; is_correct: boolean }[];
    const correctIdx = options.findIndex(o => o.is_correct);
    const isCorrect  = answers[i] === correctIdx;
    if (isCorrect) correct++;
    return { questionId: q.id, isCorrect, correctIndex: correctIdx };
  });

  const score  = Math.round((correct / questions.totalItems) * 100);
  const passed = score >= 70;

  await pb.collection('user_progress').create({
    user:   locals.user.id,
    lesson: lessonId,
    status: passed ? 'completed' : 'started',
    score,
  });

  return new Response(JSON.stringify({ score, passed, results }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

---

## 14. Gamification System

### XP & Level Config

```ts
// src/lib/gamification.ts
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500,
  10000, 13000, 16500, 20500, 25000, 30000, 36000, 43000, 51000, 60000
];

export const RANK_NAMES = [
  'Script Kiddie',    'Script Kiddie',    'Script Kiddie',
  'Code Apprentice',  'Code Apprentice',  'Code Apprentice',
  'Junior Hacker',    'Junior Hacker',    'Junior Hacker',    'Junior Hacker',
  'Senior Developer', 'Senior Developer', 'Senior Developer', 'Senior Developer',
  'Security Analyst', 'Security Analyst', 'Security Analyst',
  'Elite Pentester',  'Elite Pentester',  'Elite Pentester',
];

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export const XP_REWARDS = {
  LESSON_COMPLETE:  10,
  QUIZ_PASS:        25,
  QUIZ_PERFECT:     50,
  COURSE_COMPLETE: 100,
  CTF_EASY:         50,
  CTF_MEDIUM:      100,
  CTF_HARD:        200,
  CTF_INSANE:      400,
  DAILY_STREAK:      5,
};
```

### Level & Rank Table

| Level | XP Range | Rank Name |
|-------|---------|-----------|
| 1–3 | 0–499 | Script Kiddie |
| 4–6 | 500–2.749 | Code Apprentice |
| 7–10 | 2.750–9.999 | Junior Hacker |
| 11–14 | 10.000–24.999 | Senior Developer |
| 15–17 | 25.000–42.999 | Security Analyst |
| 18–20 | 43.000+ | Elite Pentester |

### Badge System

| Badge | Trigger Type | Trigger Value | XP Bonus |
|-------|-------------|--------------|---------|
| First Step | lesson_complete | 1 | +10 |
| Quick Learner | lesson_complete | 10 | +50 |
| Quiz Master | quiz_perfect | 5 | +100 |
| On Fire 🔥 | streak | 7 | +50 |
| Course Graduate | course_complete | 1 | +100 |
| Flag Planter | ctf_solve | 1 | +25 |
| CTF Legend | ctf_solve | 10 | +200 |
| XP Hoarder | xp_milestone | 1000 | +50 |

---

## 15. Certificate System

### Generation Flow

```
All lessons completed
  → All quizzes passed
  → POST /api/certificates/generate
  → Generate UUID cert_id
  → Render PDF via @react-pdf/renderer
  → Embed QR code (link ke /verify/[cert_id])
  → Upload ke R2 storage
  → Save record ke PocketBase
  → Send email ke user
```

### Certificate Generator

```ts
// src/lib/certificate.ts
import { pdf }         from '@react-pdf/renderer';
import QRCode          from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { CertificateTemplate } from '../components/react/Certificate/Template';

export async function generateCertificate({ userId, courseId, userName, courseName }) {
  const certId    = uuidv4();
  const verifyUrl = `https://yourplatform.com/verify/${certId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl);

  const pdfDoc    = pdf(CertificateTemplate({
    certId, userName, courseName,
    issuedDate: new Date().toLocaleDateString('id-ID'),
    qrDataUrl,
  }));

  const pdfBuffer = await pdfDoc.toBuffer();
  // upload pdfBuffer ke R2 / PocketBase...

  return certId;
}
```

### Verification Page

```astro
---
// src/pages/verify/[certId].astro
import { pb } from '../../lib/pocketbase';
const { certId } = Astro.params;
let certificate  = null;

try {
  certificate = await pb.collection('certificates').getOne(certId!, {
    expand: 'user,course'
  });
} catch (_) {}
---
<Layout>
  {certificate?.is_valid
    ? <CertificateValid cert={certificate} />
    : <CertificateInvalid />
  }
</Layout>
```

---

## 16. CTF Module

> ⚠️ **Security Critical:** Flag **tidak pernah** dikirim ke client. Semua validasi dilakukan server-side. Flag disimpan sebagai bcrypt hash.

### Flag Submission API

```ts
// src/pages/api/ctf/[id]/submit.ts
import bcrypt from 'bcryptjs';

const limiter = new RateLimiter({ windowMs: 60000, max: 10 });

export const POST: APIRoute = async ({ params, locals, request, clientAddress }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });

  const key = `${clientAddress}:${locals.user.id}`;
  if (!limiter.check(key)) {
    return new Response(JSON.stringify({ error: 'Too many attempts' }), { status: 429 });
  }

  const { flag }  = await request.json();
  const challenge = await pb.collection('ctf_challenges').getOne(params.id!);

  // Validate server-side ONLY — flag never sent to client
  const isCorrect = await bcrypt.compare(flag.trim().toLowerCase(), challenge.flag_hash);

  if (isCorrect) {
    await pb.collection('ctf_solves').create({
      user:          locals.user.id,
      challenge:     params.id,
      points_earned: challenge.points,
    });
    return new Response(JSON.stringify({ correct: true, points: challenge.points }));
  }

  return new Response(JSON.stringify({ correct: false }));
};
```

### CTF Category Matrix

| Category | Skills Covered | Tool Stack | Difficulty |
|----------|---------------|-----------|----------|
| Web Exploitation | SQLi, XSS, SSRF, IDOR, CSRF | Burp Suite, curl | Easy → Hard |
| Reverse Engineering | Disassembly, decompilation, patching | Ghidra, IDA Free, radare2 | Medium → Insane |
| Binary Exploitation | Buffer overflow, ROP, heap | pwntools, GDB, pwndbg | Hard → Insane |
| Cryptography | Classic ciphers, RSA, AES attacks | Python, CyberChef | Easy → Hard |
| Forensics | File carving, steganography, memory | Wireshark, binwalk, Volatility | Easy → Hard |
| OSINT | Reconnaissance, metadata, geolocation | OSINT Framework, Sherlock | Easy → Medium |

---

## 17. Search

```ts
// src/lib/search.ts
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host:   import.meta.env.MEILISEARCH_URL ?? 'http://localhost:7700',
  apiKey: import.meta.env.MEILISEARCH_KEY,
});

export const searchIndex = client.index('content');

export async function indexContent(doc: {
  id: string; type: 'course' | 'lesson';
  title: string; description: string; tags: string[];
}) {
  await searchIndex.addDocuments([doc]);
}

export async function search(query: string, filters?: string) {
  return searchIndex.search(query, {
    filter:                  filters,
    attributesToHighlight:   ['title', 'description'],
    limit:                   20,
  });
}
```

---

## 18. Docker Setup

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    ports: ["8090:8090"]
    volumes:
      - ./apps/pocketbase/pb_data:/pb_data
      - ./apps/pocketbase/pb_hooks:/pb_hooks
      - ./apps/pocketbase/pb_migrations:/pb_migrations
    restart: unless-stopped

  judge0-server:
    image: judge0/judge0:latest
    ports: ["2358:2358"]
    environment:
      REDIS_HOST:        judge0-redis
      POSTGRES_HOST:     judge0-db
      POSTGRES_DB:       judge0
      POSTGRES_USER:     judge0
      POSTGRES_PASSWORD: "${JUDGE0_DB_PASSWORD}"
    depends_on: [judge0-db, judge0-redis]
    privileged: true
    restart: unless-stopped

  judge0-worker:
    image: judge0/judge0:latest
    command: ["./scripts/workers"]
    environment:
      REDIS_HOST:    judge0-redis
      POSTGRES_HOST: judge0-db
    depends_on: [judge0-db, judge0-redis]
    privileged: true
    restart: unless-stopped

  judge0-db:
    image: postgres:13
    environment:
      POSTGRES_DB:       judge0
      POSTGRES_USER:     judge0
      POSTGRES_PASSWORD: "${JUDGE0_DB_PASSWORD}"
    volumes: [judge0-db-data:/var/lib/postgresql/data]

  judge0-redis:
    image: redis:6-alpine

  meilisearch:
    image: getmeili/meilisearch:latest
    ports: ["7700:7700"]
    environment:
      MEILI_MASTER_KEY: "${MEILISEARCH_MASTER_KEY}"
      MEILI_ENV:        production
    volumes: [meilisearch-data:/meili_data]
    restart: unless-stopped

volumes:
  judge0-db-data:
  meilisearch-data:
```

---

## 19. Deployment

### Environment Variables

```bash
# .env
PUBLIC_POCKETBASE_URL=https://pb.yourplatform.com
JUDGE0_URL=http://localhost:2358
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_KEY=your_master_key
JUDGE0_DB_PASSWORD=strong_password

# OAuth
PB_GITHUB_CLIENT_ID=xxx
PB_GITHUB_CLIENT_SECRET=xxx
PB_GOOGLE_CLIENT_ID=xxx
PB_GOOGLE_CLIENT_SECRET=xxx

# Storage
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY=xxx
R2_SECRET_KEY=xxx
R2_BUCKET=platform-assets
```

### Deployment Options

| Option | Stack | Cost | Notes |
|--------|-------|------|-------|
| VPS (Recommended) | Debian/Ubuntu + Docker | ~$10–20/bln | Full control, self-hosted |
| Railway | Docker Compose | ~$20/bln | Managed, mudah setup |
| Render | Docker + managed PG | ~$15/bln | Free tier terbatas |
| Coolify | Self-hosted PaaS | VPS cost only | Open source Heroku alternative |

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl;
    server_name yourplatform.com;

    location / {
        proxy_pass http://localhost:4321;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/pb/ {
        proxy_pass http://localhost:8090/;
        proxy_set_header Host $host;
    }
}
```

---

## 20. Security

| Area | Threat | Mitigation | Implementation |
|------|--------|-----------|---------------|
| Authentication | Session hijacking | HTTP-only cookies, short JWT expiry | PocketBase: Secure + HttpOnly cookie |
| CTF Flags | DB leak exposes all flags | bcrypt hash, never plaintext | bcryptjs, salt rounds: 12 |
| Code Execution | RCE via playground | Isolated Docker sandbox, resource limits | Judge0: cpu=5s, mem=256MB, no network |
| CTF Brute Force | Automated flag guessing | Rate limit per user+IP | 10 attempts/minute |
| XSS | Script injection via comments | Sanitize HTML server-side | DOMPurify di API route |
| File Upload | Malicious file execution | MIME validation, size limit | PocketBase rules, max 50MB |
| CORS | Unauthorized API access | Strict origin allowlist | PocketBase CORS: frontend domain only |
| SQL Injection | Filter injection | Jangan interpolate raw input | Parameterized filters PocketBase SDK |

### Security Headers

```ts
// src/middleware.ts — security headers
const securityHeaders = {
  'X-Frame-Options':        'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy':        'strict-origin-when-cross-origin',
  'Permissions-Policy':     'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",  // Monaco requires unsafe-inline
    "img-src 'self' data: blob:",
    "connect-src 'self' https://api.yourplatform.com",
  ].join('; '),
};
```

---

## 21. Performance

### Core Web Vitals Targets

| Metric | Target | Strategy |
|--------|--------|---------|
| LCP | < 2.5s | Astro static + image optimization |
| FID | < 100ms | Islands architecture, minimal JS upfront |
| CLS | < 0.1 | Reserve space untuk images |
| Time to Interactive | < 3.5s | Lazy hydrate React islands |
| API Response (PocketBase) | < 200ms | SQLite WAL mode, indexed queries |

### Critical Database Indexes

```sql
CREATE INDEX idx_progress_user_lesson ON user_progress(user, lesson);
CREATE INDEX idx_lessons_module_order ON lessons(module, order);
CREATE INDEX idx_ctf_solves_user      ON ctf_solves(user);
CREATE INDEX idx_comments_lesson      ON comments(lesson);
```

---

## 22. PWA Configuration

```json
// public/manifest.json
{
  "name":             "Platform Belajar — Coding & Cybersecurity",
  "short_name":       "LearnCode",
  "start_url":        "/",
  "display":          "standalone",
  "background_color": "#ffffff",
  "theme_color":      "#000000",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker: Caching Strategy

| Resource Type | Strategy | Duration |
|--------------|---------|---------|
| Static assets (JS, CSS, fonts) | Cache First | 30 hari |
| Lesson MDX content | Stale While Revalidate | 7 hari |
| Course listings | Network First | 1 jam |
| API responses (progress, quiz) | Network Only | — |
| Images / thumbnails | Cache First | 7 hari |

---

> Dokumen ini adalah bagian dari seri dokumentasi.
> Lihat juga: **PRD-001.md** · **SCHEMA.md** · **SETUP.md** · **CONTRIBUTING.md**

---

**TECH-SPEC-001 v1.0.0** | Platform Pembelajaran Pemrograman & Cybersecurity Open Source
