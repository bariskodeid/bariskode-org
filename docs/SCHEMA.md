# SCHEMA.md
## PocketBase Collections Schema & Migrations

---

| Field           | Detail                                         |
|-----------------|------------------------------------------------|
| **Document ID** | SCHEMA-001                                     |
| **Version**     | 1.0.0                                          |
| **Status**      | Draft                                          |
| **Author**      | Apin                                           |
| **Relates To**  | PRD-001 · TECH-SPEC-001                        |
| **PocketBase**  | ^0.22.x                                        |
| **Created**     | 2025                                           |

---

## Table of Contents

1. [Overview](#1-overview)
2. [Collection Map](#2-collection-map)
3. [Collections Detail](#3-collections-detail)
   - [users](#31-users)
   - [categories](#32-categories)
   - [courses](#33-courses)
   - [modules](#34-modules)
   - [lessons](#35-lessons)
   - [quiz_questions](#36-quiz_questions)
   - [user_progress](#37-user_progress)
   - [certificates](#38-certificates)
   - [badges](#39-badges)
   - [user_badges](#310-user_badges)
   - [ctf_challenges](#311-ctf_challenges)
   - [ctf_solves](#312-ctf_solves)
   - [comments](#313-comments)
4. [Access Rules (RBAC)](#4-access-rules-rbac)
5. [Database Indexes](#5-database-indexes)
6. [Migration Files](#6-migration-files)
7. [Seed Data](#7-seed-data)

---

## 1. Overview

Platform ini menggunakan **PocketBase** sebagai backend all-in-one dengan SQLite sebagai database. Semua schema didefinisikan sebagai PocketBase Collections dan di-version control menggunakan migration files di `pb_migrations/`.

### Cara Apply Schema

```bash
# 1. Jalankan PocketBase pertama kali
./pocketbase serve

# 2. Apply semua migration
./pocketbase migrate up

# 3. Untuk generate snapshot migration dari Admin UI
./pocketbase migrate collections

# 4. Sync history setelah cleanup migration files
./pocketbase migrate history-sync
```

### Collection Types

| Type | Keterangan | Digunakan Untuk |
|------|-----------|----------------|
| `auth` | Built-in auth system (email, password, OAuth) | `users` |
| `base` | Regular data collection | Semua collection lainnya |

---

## 2. Collection Map

```
users (auth)
│
├── courses (base)
│   ├── instructor → users
│   ├── category → categories
│   │
│   └── modules (base)
│       ├── course → courses
│       │
│       └── lessons (base)
│           ├── module → modules
│           │
│           ├── quiz_questions (base)
│           │   └── lesson → lessons
│           │
│           ├── user_progress (base)
│           │   ├── user → users
│           │   └── lesson → lessons
│           │
│           └── comments (base)
│               ├── user → users
│               ├── lesson → lessons
│               └── parent → comments (self-ref)
│
├── certificates (base)
│   ├── user → users
│   └── course → courses
│
├── user_badges (base)
│   ├── user → users
│   └── badge → badges
│
├── ctf_challenges (base)
│
└── ctf_solves (base)
    ├── user → users
    └── challenge → ctf_challenges
```

---

## 3. Collections Detail

---

### 3.1 `users`

**Type:** `auth` (extends PocketBase built-in auth)

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | PB built-in |
| `email` | email | ✓ | unique | PB built-in |
| `username` | text | ✓ | unique, min:3, max:50 | PB built-in |
| `avatar` | file | — | max 5MB, types: jpg/png/webp | PB built-in |
| `role` | select | ✓ | values: student, instructor, admin | default: student |
| `bio` | text | — | max: 500 | — |
| `github_url` | url | — | — | — |
| `linkedin_url` | url | — | — | — |
| `xp` | number | ✓ | min: 0 | default: 0 |
| `level` | number | ✓ | min: 1, max: 20 | default: 1 |
| `streak_current` | number | ✓ | min: 0 | default: 0 |
| `streak_longest` | number | ✓ | min: 0 | default: 0 |
| `last_active` | date | — | — | Updated daily |
| `created` | date | ✓ | auto | PB built-in |
| `updated` | date | ✓ | auto | PB built-in |

**Auth Rules:**

```
listRule:   "@request.auth.role = 'admin'"
viewRule:   "id = @request.auth.id || @request.auth.role = 'admin'"
createRule: ""     // public registration
updateRule: "id = @request.auth.id || @request.auth.role = 'admin'"
deleteRule: "@request.auth.role = 'admin'"
```

---

### 3.2 `categories`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | — |
| `name` | text | ✓ | unique, max: 100 | e.g., "Web Development", "Cybersecurity" |
| `slug` | text | ✓ | unique, max: 100 | URL-safe identifier |
| `icon` | text | — | max: 50 | Emoji atau icon name |
| `description` | text | — | max: 500 | — |
| `order` | number | ✓ | min: 0 | default: 0, untuk sorting |

**Access Rules:**

```
listRule:   ""     // public
viewRule:   ""     // public
createRule: "@request.auth.role = 'admin'"
updateRule: "@request.auth.role = 'admin'"
deleteRule: "@request.auth.role = 'admin'"
```

---

### 3.3 `courses`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | — |
| `title` | text | ✓ | max: 200 | — |
| `slug` | text | ✓ | unique, max: 200 | URL-safe, auto-generated |
| `description` | text | ✓ | max: 2000 | — |
| `instructor` | relation | ✓ | → users, single | — |
| `category` | relation | ✓ | → categories, single | — |
| `difficulty` | select | ✓ | beginner, intermediate, advanced | — |
| `tags` | json | — | array of strings | e.g., ["python", "web"] |
| `thumbnail` | file | — | max: 2MB, types: jpg/png/webp | — |
| `status` | select | ✓ | draft, published | default: draft |
| `estimated_hours` | number | — | min: 0 | — |
| `total_lessons` | number | — | min: 0 | Computed/cached |
| `enrolled_count` | number | — | min: 0 | Cached counter |
| `created` | date | ✓ | auto | — |
| `updated` | date | ✓ | auto | — |

**Access Rules:**

```
listRule:   "status = 'published' || @request.auth.role = 'instructor' || @request.auth.role = 'admin'"
viewRule:   "status = 'published' || instructor = @request.auth.id || @request.auth.role = 'admin'"
createRule: "@request.auth.role = 'instructor' || @request.auth.role = 'admin'"
updateRule: "instructor = @request.auth.id || @request.auth.role = 'admin'"
deleteRule: "@request.auth.role = 'admin'"
```

---

### 3.4 `modules`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | — |
| `title` | text | ✓ | max: 200 | — |
| `course` | relation | ✓ | → courses, single | — |
| `order` | number | ✓ | min: 0 | Urutan tampil dalam course |
| `description` | text | — | max: 1000 | — |

**Access Rules:**

```
listRule:   "course.status = 'published' || course.instructor = @request.auth.id || @request.auth.role = 'admin'"
viewRule:   "course.status = 'published' || course.instructor = @request.auth.id || @request.auth.role = 'admin'"
createRule: "course.instructor = @request.auth.id || @request.auth.role = 'admin'"
updateRule: "course.instructor = @request.auth.id || @request.auth.role = 'admin'"
deleteRule: "course.instructor = @request.auth.id || @request.auth.role = 'admin'"
```

---

### 3.5 `lessons`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | — |
| `title` | text | ✓ | max: 200 | — |
| `slug` | text | ✓ | max: 200 | Unique dalam scope module |
| `module` | relation | ✓ | → modules, single | — |
| `type` | select | ✓ | reading, video, quiz, coding | — |
| `content` | text | — | — | MDX/Markdown content |
| `video_url` | url | — | — | YouTube/Vimeo embed URL |
| `starter_code` | text | — | — | Initial code untuk coding lessons |
| `expected_output` | text | — | — | Untuk validasi output kode |
| `xp_reward` | number | ✓ | min: 0 | default: 10 |
| `order` | number | ✓ | min: 0 | Urutan dalam module |
| `status` | select | ✓ | draft, published | default: draft |
| `estimated_minutes` | number | — | min: 0 | — |
| `passing_score` | number | — | min: 0, max: 100 | default: 70, untuk quiz type |
| `max_attempts` | number | — | min: 0 | 0 = unlimited |

**Access Rules:**

```
listRule:   "(status = 'published' && module.course.status = 'published') || module.course.instructor = @request.auth.id || @request.auth.role = 'admin'"
viewRule:   "(status = 'published' && module.course.status = 'published' && @request.auth.id != '') || module.course.instructor = @request.auth.id || @request.auth.role = 'admin'"
createRule: "module.course.instructor = @request.auth.id || @request.auth.role = 'admin'"
updateRule: "module.course.instructor = @request.auth.id || @request.auth.role = 'admin'"
deleteRule: "module.course.instructor = @request.auth.id || @request.auth.role = 'admin'"
```

---

### 3.6 `quiz_questions`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | — |
| `lesson` | relation | ✓ | → lessons, single | Hanya lesson type: quiz |
| `question` | text | ✓ | max: 1000 | Supports Markdown |
| `type` | select | ✓ | multiple_choice, true_false | — |
| `options` | json | ✓ | array | `[{text: string, is_correct: bool}]` |
| `explanation` | text | — | max: 1000 | Penjelasan jawaban benar |
| `order` | number | ✓ | min: 0 | Urutan soal |

**Access Rules:**

```
listRule:   "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'"
viewRule:   "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'"
createRule: "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'"
updateRule: "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'"
deleteRule: "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'"
```

> ⚠️ Quiz answers **tidak pernah** di-expose ke client melalui API rule. Validasi dilakukan server-side via Astro API route.

---

### 3.7 `user_progress`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | — |
| `user` | relation | ✓ | → users, single | — |
| `lesson` | relation | ✓ | → lessons, single | — |
| `status` | select | ✓ | started, completed | — |
| `score` | number | — | min: 0, max: 100 | Untuk quiz lessons |
| `attempts` | number | ✓ | min: 0 | default: 0 |
| `completed_at` | date | — | — | Null jika belum selesai |
| `created` | date | ✓ | auto | — |
| `updated` | date | ✓ | auto | — |

**Unique Constraint:** `(user, lesson)` — satu record per user per lesson.

**Access Rules:**

```
listRule:   "user = @request.auth.id || @request.auth.role = 'admin'"
viewRule:   "user = @request.auth.id || @request.auth.role = 'admin'"
createRule: "@request.auth.id != '' && @request.data.user = @request.auth.id"
updateRule: "user = @request.auth.id"
deleteRule: "@request.auth.role = 'admin'"
```

---

### 3.8 `certificates`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | custom UUID | ID ini yang dipakai sebagai cert ID di URL `/verify/[id]` |
| `user` | relation | ✓ | → users, single | — |
| `course` | relation | ✓ | → courses, single | — |
| `issued_at` | date | ✓ | — | Tanggal terbit |
| `file` | file | — | max: 5MB, type: pdf | Generated PDF |
| `is_valid` | bool | ✓ | — | default: true, bisa di-revoke admin |

**Access Rules:**

```
listRule:   "user = @request.auth.id || @request.auth.role = 'admin'"
viewRule:   "user = @request.auth.id || @request.auth.role = 'admin'"   // public verify dilakukan via trusted server-side fetch, bukan public collection access
createRule: "@request.auth.id != ''"   // via API route only
updateRule: "@request.auth.role = 'admin'"
deleteRule: "@request.auth.role = 'admin'"
```

---

### 3.9 `badges`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | — |
| `name` | text | ✓ | unique, max: 100 | — |
| `description` | text | ✓ | max: 500 | — |
| `icon` | file | — | max: 1MB, types: png/svg/webp | — |
| `trigger_type` | select | ✓ | xp_milestone, course_complete, streak, ctf_solve, lesson_complete, quiz_perfect | — |
| `trigger_value` | number | ✓ | min: 1 | Nilai threshold untuk unlock badge |
| `xp_bonus` | number | ✓ | min: 0 | default: 0, XP bonus saat unlock |

**Access Rules:**

```
listRule:   ""     // public
viewRule:   ""     // public
createRule: "@request.auth.role = 'admin'"
updateRule: "@request.auth.role = 'admin'"
deleteRule: "@request.auth.role = 'admin'"
```

---

### 3.10 `user_badges`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | — |
| `user` | relation | ✓ | → users, single | — |
| `badge` | relation | ✓ | → badges, single | — |
| `earned_at` | date | ✓ | — | Tanggal unlock |

**Unique Constraint:** `(user, badge)` — satu badge hanya bisa di-earn sekali per user.

**Access Rules:**

```
listRule:   "user = @request.auth.id || @request.auth.role = 'admin'"
viewRule:   "user = @request.auth.id || @request.auth.role = 'admin'"
createRule: "@request.auth.role = 'admin'"   // only via pb_hooks
updateRule: "@request.auth.role = 'admin'"
deleteRule: "@request.auth.role = 'admin'"
```

---

### 3.11 `ctf_challenges`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | — |
| `title` | text | ✓ | max: 200 | — |
| `description` | text | ✓ | — | Supports Markdown |
| `category` | select | ✓ | web, rev, pwn, crypto, forensics, osint, misc | — |
| `difficulty` | select | ✓ | easy, medium, hard, insane | — |
| `points` | number | ✓ | min: 1 | Base points |
| `flag_hash` | text | ✓ | — | bcrypt hash dari flag — **tidak pernah di-expose** |
| `attachment` | file | — | max: 50MB | File challenge (zip, etc.) |
| `hints` | json | — | array | `[{text: string, cost: number}]` |
| `is_active` | bool | ✓ | — | default: true |
| `solve_count` | number | ✓ | min: 0 | default: 0, cached counter |
| `author` | relation | — | → users, single | Pembuat challenge |
| `created` | date | ✓ | auto | — |
| `updated` | date | ✓ | auto | — |

**Access Rules:**

```
listRule:   "is_active = true && @request.auth.id != ''"
viewRule:   "is_active = true && @request.auth.id != ''"
createRule: "@request.auth.role = 'admin'"
updateRule: "@request.auth.role = 'admin'"
deleteRule: "@request.auth.role = 'admin'"
```

> ⚠️ `flag_hash` field **tidak pernah** di-include dalam response ke client. Gunakan `@request.auth.role = 'admin'` untuk expose field ini, dan handle validasi hanya di server-side API route.

---

### 3.12 `ctf_solves`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | — |
| `user` | relation | ✓ | → users, single | — |
| `challenge` | relation | ✓ | → ctf_challenges, single | — |
| `points_earned` | number | ✓ | min: 0 | Actual points (setelah hint deduction) |
| `hints_used` | number | ✓ | min: 0 | default: 0 |
| `points_deducted` | number | ✓ | min: 0 | default: 0, total pengurangan dari hints |
| `solved_at` | date | ✓ | auto | — |

**Unique Constraint:** `(user, challenge)` — satu user hanya bisa solve sekali per challenge.

**Access Rules:**

```
listRule:   "@request.auth.id != ''"
viewRule:   "user = @request.auth.id || @request.auth.role = 'admin'"
createRule: "@request.auth.role = 'admin'"   // only via API route
updateRule: "@request.auth.role = 'admin'"
deleteRule: "@request.auth.role = 'admin'"
```

---

### 3.13 `comments`

**Type:** `base`

| Field | Type | Required | Options | Notes |
|-------|------|----------|---------|-------|
| `id` | text | ✓ | auto | — |
| `user` | relation | ✓ | → users, single | — |
| `lesson` | relation | ✓ | → lessons, single | — |
| `parent` | relation | — | → comments, single | Null = top-level comment |
| `content` | text | ✓ | max: 2000 | DOMPurify sanitized sebelum simpan |
| `is_hidden` | bool | ✓ | — | default: false, untuk moderasi |
| `created` | date | ✓ | auto | — |
| `updated` | date | ✓ | auto | — |

**Access Rules:**

```
listRule:   "is_hidden = false && lesson.module.course.status = 'published'"
viewRule:   "is_hidden = false || user = @request.auth.id || @request.auth.role = 'admin'"
createRule: "@request.auth.id != '' && @request.data.user = @request.auth.id"
updateRule: "user = @request.auth.id"
deleteRule: "user = @request.auth.id || @request.auth.role = 'admin'"
```

---

## 4. Access Rules (RBAC)

Summary RBAC matrix antar collection dan role:

| Collection | Public | Student | Instructor | Admin |
|-----------|:------:|:-------:|:----------:|:-----:|
| users | — | Own | Own | All |
| categories | Read | Read | Read | CRUD |
| courses | Published | Published | Own CRUD | All |
| modules | Published | Published | Own CRUD | All |
| lessons | Published* | Published* | Own CRUD | All |
| quiz_questions | — | — | Own | All |
| user_progress | — | Own | — | All |
| certificates | Verify only | Own | — | All |
| badges | Read | Read | Read | CRUD |
| user_badges | — | Own | — | All |
| ctf_challenges | — | Active | — | CRUD |
| ctf_solves | — | Own | — | All |
| comments | Published | CRUD own | Hide own course | All |

> \* Lessons: student harus login untuk akses

---

## 5. Database Indexes

Indexes berikut di-create via migration untuk optimasi query performance:

```sql
-- user_progress: query by user + lesson (unique constraint)
CREATE UNIQUE INDEX idx_user_progress_unique ON user_progress (user, lesson);

-- user_progress: query all progress by user
CREATE INDEX idx_user_progress_user ON user_progress (user);

-- lessons: query lessons dalam sebuah module, sorted by order
CREATE INDEX idx_lessons_module_order ON lessons (module, `order`);

-- courses: lookup by slug
CREATE UNIQUE INDEX idx_courses_slug ON courses (slug);

-- ctf_solves: unique solve per user per challenge
CREATE UNIQUE INDEX idx_ctf_solves_unique ON ctf_solves (user, challenge);

-- ctf_solves: leaderboard query by user
CREATE INDEX idx_ctf_solves_user ON ctf_solves (user);

-- user_badges: unique badge per user
CREATE UNIQUE INDEX idx_user_badges_unique ON user_badges (user, badge);

-- comments: query comments by lesson
CREATE INDEX idx_comments_lesson ON comments (lesson);

-- comments: query replies by parent
CREATE INDEX idx_comments_parent ON comments (parent);

-- modules: query modules dalam course, sorted
CREATE INDEX idx_modules_course_order ON modules (course, `order`);
```

---

## 6. Migration Files

<invoke name="web_fetch"> Format migration file mengacu pada dokumentasi resmi PocketBase JS Migrations.

### File Naming Convention

```
pb_migrations/
├── 1700000001_init_categories.js
├── 1700000002_init_courses.js
├── 1700000003_init_modules.js
├── 1700000004_init_lessons.js
├── 1700000005_init_quiz_questions.js
├── 1700000006_init_user_progress.js
├── 1700000007_init_certificates.js
├── 1700000008_init_badges.js
├── 1700000009_init_user_badges.js
├── 1700000010_init_ctf_challenges.js
├── 1700000011_init_ctf_solves.js
├── 1700000012_init_comments.js
├── 1700000013_extend_users.js
├── 1700000014_create_indexes.js
└── 1700000015_seed_badges.js
```

---

### Migration: Extend Users Collection

```js
// pb_migrations/1700000013_extend_users.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("users");

  // role
  collection.fields.add(new SelectField({
    name: "role",
    required: true,
    values: ["student", "instructor", "admin"],
    maxSelect: 1,
  }));

  // bio
  collection.fields.add(new TextField({
    name: "bio",
    max: 500,
  }));

  // github_url
  collection.fields.add(new URLField({
    name: "github_url",
  }));

  // linkedin_url
  collection.fields.add(new URLField({
    name: "linkedin_url",
  }));

  // xp
  collection.fields.add(new NumberField({
    name: "xp",
    required: true,
    min: 0,
  }));

  // level
  collection.fields.add(new NumberField({
    name: "level",
    required: true,
    min: 1,
    max: 20,
  }));

  // streak_current
  collection.fields.add(new NumberField({
    name: "streak_current",
    required: true,
    min: 0,
  }));

  // streak_longest
  collection.fields.add(new NumberField({
    name: "streak_longest",
    required: true,
    min: 0,
  }));

  // last_active
  collection.fields.add(new DateField({
    name: "last_active",
  }));

  app.save(collection);

}, (app) => {
  // Revert: remove added fields
  const collection = app.findCollectionByNameOrId("users");
  const fields = ["role", "bio", "github_url", "linkedin_url", "xp", "level",
                  "streak_current", "streak_longest", "last_active"];

  for (const name of fields) {
    const field = collection.fields.getByName(name);
    if (field) collection.fields.remove(field);
  }

  app.save(collection);
});
```

---

### Migration: Categories

```js
// pb_migrations/1700000001_init_categories.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "categories",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text",   name: "name",        required: true,  max: 100 },
      { type: "text",   name: "slug",        required: true,  max: 100 },
      { type: "text",   name: "icon",        required: false, max: 50 },
      { type: "text",   name: "description", required: false, max: 500 },
      { type: "number", name: "order",       required: true,  min: 0 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_categories_slug ON categories (slug)",
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("categories");
  app.delete(collection);
});
```

---

### Migration: Courses

```js
// pb_migrations/1700000002_init_courses.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "courses",
    type: "base",
    listRule:   "status = 'published' || @request.auth.role = 'instructor' || @request.auth.role = 'admin'",
    viewRule:   "status = 'published' || instructor = @request.auth.id || @request.auth.role = 'admin'",
    createRule: "@request.auth.role = 'instructor' || @request.auth.role = 'admin'",
    updateRule: "instructor = @request.auth.id || @request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text",     name: "title",           required: true,  max: 200 },
      { type: "text",     name: "slug",             required: true,  max: 200 },
      { type: "text",     name: "description",      required: true,  max: 2000 },
      {
        type: "relation", name: "instructor",
        required: true, collectionId: "_pb_users_auth_", maxSelect: 1,
      },
      {
        type: "relation", name: "category",
        required: true, collectionId: "categories", maxSelect: 1,
      },
      {
        type: "select",   name: "difficulty",
        required: true, values: ["beginner", "intermediate", "advanced"], maxSelect: 1,
      },
      { type: "json",   name: "tags",             required: false },
      { type: "file",   name: "thumbnail",        required: false, maxSize: 2097152, mimeTypes: ["image/jpeg","image/png","image/webp"] },
      {
        type: "select",   name: "status",
        required: true, values: ["draft", "published"], maxSelect: 1,
      },
      { type: "number", name: "estimated_hours",  required: false, min: 0 },
      { type: "number", name: "total_lessons",    required: false, min: 0 },
      { type: "number", name: "enrolled_count",   required: false, min: 0 },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_courses_slug ON courses (slug)",
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("courses");
  app.delete(collection);
});
```

---

### Migration: Modules & Lessons

```js
// pb_migrations/1700000003_init_modules.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "modules",
    type: "base",
    listRule:   "course.status = 'published' || course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    viewRule:   "course.status = 'published' || course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    createRule: "course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    updateRule: "course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    deleteRule: "course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    fields: [
      { type: "text",     name: "title",       required: true,  max: 200 },
      {
        type: "relation", name: "course",
        required: true, collectionId: "courses", maxSelect: 1,
      },
      { type: "number",   name: "order",       required: true,  min: 0 },
      { type: "text",     name: "description", required: false, max: 1000 },
    ],
    indexes: [
      "CREATE INDEX idx_modules_course_order ON modules (course, `order`)",
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("modules");
  app.delete(collection);
});
```

```js
// pb_migrations/1700000004_init_lessons.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "lessons",
    type: "base",
    listRule:   "(status = 'published' && module.course.status = 'published') || module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    viewRule:   "(status = 'published' && module.course.status = 'published' && @request.auth.id != '') || module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    createRule: "module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    updateRule: "module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    deleteRule: "module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    fields: [
      { type: "text",     name: "title",            required: true,  max: 200 },
      { type: "text",     name: "slug",             required: true,  max: 200 },
      {
        type: "relation", name: "module",
        required: true, collectionId: "modules", maxSelect: 1,
      },
      {
        type: "select",   name: "type",
        required: true, values: ["reading", "video", "quiz", "coding"], maxSelect: 1,
      },
      { type: "text",     name: "content",          required: false },
      { type: "url",      name: "video_url",         required: false },
      { type: "text",     name: "starter_code",     required: false },
      { type: "text",     name: "expected_output",  required: false },
      { type: "number",   name: "xp_reward",        required: true,  min: 0 },
      { type: "number",   name: "order",            required: true,  min: 0 },
      {
        type: "select",   name: "status",
        required: true, values: ["draft", "published"], maxSelect: 1,
      },
      { type: "number",   name: "estimated_minutes", required: false, min: 0 },
      { type: "number",   name: "passing_score",    required: false, min: 0, max: 100 },
      { type: "number",   name: "max_attempts",     required: false, min: 0 },
    ],
    indexes: [
      "CREATE INDEX idx_lessons_module_order ON lessons (module, `order`)",
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("lessons");
  app.delete(collection);
});
```

---

### Migration: Quiz Questions

```js
// pb_migrations/1700000005_init_quiz_questions.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "quiz_questions",
    type: "base",
    // No client access — semua via server API route
    listRule:   "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    viewRule:   "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    createRule: "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    updateRule: "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    deleteRule: "lesson.module.course.instructor = @request.auth.id || @request.auth.role = 'admin'",
    fields: [
      {
        type: "relation", name: "lesson",
        required: true, collectionId: "lessons", maxSelect: 1,
      },
      { type: "text",   name: "question",    required: true, max: 1000 },
      {
        type: "select", name: "type",
        required: true, values: ["multiple_choice", "true_false"], maxSelect: 1,
      },
      { type: "json",   name: "options",     required: true  },  // [{text, is_correct}]
      { type: "text",   name: "explanation", required: false, max: 1000 },
      { type: "number", name: "order",       required: true,  min: 0 },
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("quiz_questions");
  app.delete(collection);
});
```

---

### Migration: User Progress

```js
// pb_migrations/1700000006_init_user_progress.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "user_progress",
    type: "base",
    listRule:   "user = @request.auth.id || @request.auth.role = 'admin'",
    viewRule:   "user = @request.auth.id || @request.auth.role = 'admin'",
    createRule: "@request.auth.id != '' && @request.data.user = @request.auth.id",
    updateRule: "user = @request.auth.id",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      {
        type: "relation", name: "user",
        required: true, collectionId: "_pb_users_auth_", maxSelect: 1,
      },
      {
        type: "relation", name: "lesson",
        required: true, collectionId: "lessons", maxSelect: 1,
      },
      {
        type: "select",   name: "status",
        required: true, values: ["started", "completed"], maxSelect: 1,
      },
      { type: "number", name: "score",        required: false, min: 0, max: 100 },
      { type: "number", name: "attempts",     required: true,  min: 0 },
      { type: "date",   name: "completed_at", required: false },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_user_progress_unique ON user_progress (user, lesson)",
      "CREATE INDEX idx_user_progress_user ON user_progress (user)",
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("user_progress");
  app.delete(collection);
});
```

---

### Migration: Certificates

```js
// pb_migrations/1700000007_init_certificates.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "certificates",
    type: "base",
    listRule:   "user = @request.auth.id || @request.auth.role = 'admin'",
    viewRule:   "",   // public — untuk /verify/[id]
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      {
        type: "relation", name: "user",
        required: true, collectionId: "_pb_users_auth_", maxSelect: 1,
      },
      {
        type: "relation", name: "course",
        required: true, collectionId: "courses", maxSelect: 1,
      },
      { type: "date", name: "issued_at", required: true },
      {
        type: "file", name: "file",
        required: false, maxSize: 5242880, mimeTypes: ["application/pdf"],
      },
      { type: "bool", name: "is_valid", required: true },
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("certificates");
  app.delete(collection);
});
```

---

### Migration: Badges & User Badges

```js
// pb_migrations/1700000008_init_badges.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "badges",
    type: "base",
    listRule:   "",
    viewRule:   "",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text",   name: "name",          required: true,  max: 100 },
      { type: "text",   name: "description",   required: true,  max: 500 },
      {
        type: "file",   name: "icon",
        required: false, maxSize: 1048576, mimeTypes: ["image/png","image/svg+xml","image/webp"],
      },
      {
        type: "select", name: "trigger_type",
        required: true,
        values: ["xp_milestone", "course_complete", "streak", "ctf_solve", "lesson_complete", "quiz_perfect"],
        maxSelect: 1,
      },
      { type: "number", name: "trigger_value", required: true, min: 1 },
      { type: "number", name: "xp_bonus",      required: true, min: 0 },
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("badges");
  app.delete(collection);
});
```

```js
// pb_migrations/1700000009_init_user_badges.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "user_badges",
    type: "base",
    listRule:   "user = @request.auth.id || @request.auth.role = 'admin'",
    viewRule:   "user = @request.auth.id || @request.auth.role = 'admin'",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      {
        type: "relation", name: "user",
        required: true, collectionId: "_pb_users_auth_", maxSelect: 1,
      },
      {
        type: "relation", name: "badge",
        required: true, collectionId: "badges", maxSelect: 1,
      },
      { type: "date", name: "earned_at", required: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_user_badges_unique ON user_badges (user, badge)",
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("user_badges");
  app.delete(collection);
});
```

---

### Migration: CTF Challenges & Solves

```js
// pb_migrations/1700000010_init_ctf_challenges.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "ctf_challenges",
    type: "base",
    listRule:   "is_active = true && @request.auth.id != ''",
    viewRule:   "is_active = true && @request.auth.id != ''",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      { type: "text",   name: "title",       required: true, max: 200 },
      { type: "text",   name: "description", required: true },
      {
        type: "select", name: "category",
        required: true, values: ["web", "rev", "pwn", "crypto", "forensics", "osint", "misc"],
        maxSelect: 1,
      },
      {
        type: "select", name: "difficulty",
        required: true, values: ["easy", "medium", "hard", "insane"],
        maxSelect: 1,
      },
      { type: "number", name: "points",      required: true,  min: 1 },
      // flag_hash — hanya bisa diakses admin, validasi via server-side
      { type: "text",   name: "flag_hash",   required: true  },
      {
        type: "file",   name: "attachment",
        required: false, maxSize: 52428800,
      },
      { type: "json",   name: "hints",       required: false }, // [{text, cost}]
      { type: "bool",   name: "is_active",   required: true  },
      { type: "number", name: "solve_count", required: true,  min: 0 },
      {
        type: "relation", name: "author",
        required: false, collectionId: "_pb_users_auth_", maxSelect: 1,
      },
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("ctf_challenges");
  app.delete(collection);
});
```

```js
// pb_migrations/1700000011_init_ctf_solves.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "ctf_solves",
    type: "base",
    listRule:   "@request.auth.id != ''",
    viewRule:   "user = @request.auth.id || @request.auth.role = 'admin'",
    createRule: "@request.auth.role = 'admin'",
    updateRule: "@request.auth.role = 'admin'",
    deleteRule: "@request.auth.role = 'admin'",
    fields: [
      {
        type: "relation", name: "user",
        required: true, collectionId: "_pb_users_auth_", maxSelect: 1,
      },
      {
        type: "relation", name: "challenge",
        required: true, collectionId: "ctf_challenges", maxSelect: 1,
      },
      { type: "number", name: "points_earned",   required: true, min: 0 },
      { type: "number", name: "hints_used",      required: true, min: 0 },
      { type: "number", name: "points_deducted", required: true, min: 0 },
      { type: "date",   name: "solved_at",       required: true },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_ctf_solves_unique ON ctf_solves (user, challenge)",
      "CREATE INDEX idx_ctf_solves_user ON ctf_solves (user)",
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("ctf_solves");
  app.delete(collection);
});
```

---

### Migration: Comments

```js
// pb_migrations/1700000012_init_comments.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "comments",
    type: "base",
    listRule:   "is_hidden = false && lesson.module.course.status = 'published'",
    viewRule:   "is_hidden = false || user = @request.auth.id || @request.auth.role = 'admin'",
    createRule: "@request.auth.id != '' && @request.data.user = @request.auth.id",
    updateRule: "user = @request.auth.id",
    deleteRule: "user = @request.auth.id || @request.auth.role = 'admin'",
    fields: [
      {
        type: "relation", name: "user",
        required: true, collectionId: "_pb_users_auth_", maxSelect: 1,
      },
      {
        type: "relation", name: "lesson",
        required: true, collectionId: "lessons", maxSelect: 1,
      },
      {
        type: "relation", name: "parent",
        required: false, collectionId: "comments", maxSelect: 1,
      },
      { type: "text", name: "content",   required: true, max: 2000 },
      { type: "bool", name: "is_hidden", required: true },
    ],
    indexes: [
      "CREATE INDEX idx_comments_lesson ON comments (lesson)",
      "CREATE INDEX idx_comments_parent ON comments (parent)",
    ],
  });

  app.save(collection);

}, (app) => {
  const collection = app.findCollectionByNameOrId("comments");
  app.delete(collection);
});
```

---

### Migration: Seed Default Badges

```js
// pb_migrations/1700000015_seed_badges.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const badges = app.findCollectionByNameOrId("badges");

  const defaultBadges = [
    { name: "First Step",       description: "Selesaikan lesson pertama",         trigger_type: "lesson_complete", trigger_value: 1,    xp_bonus: 10  },
    { name: "Quick Learner",    description: "Selesaikan 10 lessons",             trigger_type: "lesson_complete", trigger_value: 10,   xp_bonus: 50  },
    { name: "Scholar",          description: "Selesaikan 50 lessons",             trigger_type: "lesson_complete", trigger_value: 50,   xp_bonus: 150 },
    { name: "Quiz Passed",      description: "Lulus quiz pertama",                trigger_type: "quiz_perfect",    trigger_value: 1,    xp_bonus: 25  },
    { name: "Quiz Master",      description: "Raih nilai 100% di 5 quiz",         trigger_type: "quiz_perfect",    trigger_value: 5,    xp_bonus: 100 },
    { name: "On Fire",          description: "Belajar 7 hari berturut-turut",     trigger_type: "streak",          trigger_value: 7,    xp_bonus: 50  },
    { name: "Unstoppable",      description: "Belajar 30 hari berturut-turut",    trigger_type: "streak",          trigger_value: 30,   xp_bonus: 200 },
    { name: "Course Graduate",  description: "Selesaikan 1 kursus",              trigger_type: "course_complete", trigger_value: 1,    xp_bonus: 100 },
    { name: "Multi-Tasker",     description: "Selesaikan 5 kursus",              trigger_type: "course_complete", trigger_value: 5,    xp_bonus: 300 },
    { name: "Flag Planter",     description: "Solve CTF challenge pertama",       trigger_type: "ctf_solve",       trigger_value: 1,    xp_bonus: 25  },
    { name: "CTF Veteran",      description: "Solve 10 CTF challenges",           trigger_type: "ctf_solve",       trigger_value: 10,   xp_bonus: 200 },
    { name: "CTF Legend",       description: "Solve 50 CTF challenges",           trigger_type: "ctf_solve",       trigger_value: 50,   xp_bonus: 500 },
    { name: "XP Rookie",        description: "Kumpulkan 1.000 XP",               trigger_type: "xp_milestone",    trigger_value: 1000, xp_bonus: 50  },
    { name: "XP Hunter",        description: "Kumpulkan 10.000 XP",              trigger_type: "xp_milestone",    trigger_value: 10000,xp_bonus: 200 },
  ];

  for (const data of defaultBadges) {
    const record = new Record(badges);
    record.set("name",          data.name);
    record.set("description",   data.description);
    record.set("trigger_type",  data.trigger_type);
    record.set("trigger_value", data.trigger_value);
    record.set("xp_bonus",      data.xp_bonus);
    app.save(record);
  }

}, (app) => {
  // Revert: remove seeded badges
  const result = app.findAllRecords("badges");
  for (const record of result) {
    app.delete(record);
  }
});
```

---

## 7. Seed Data

### Default Categories

```js
// pb_migrations/1700000016_seed_categories.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const categories = app.findCollectionByNameOrId("categories");

  const defaultCategories = [
    { name: "Web Development",    slug: "web-development",    icon: "🌐", order: 1 },
    { name: "Python",             slug: "python",             icon: "🐍", order: 2 },
    { name: "JavaScript",         slug: "javascript",         icon: "⚡", order: 3 },
    { name: "Cybersecurity",      slug: "cybersecurity",      icon: "🔐", order: 4 },
    { name: "Linux & Bash",       slug: "linux-bash",         icon: "🐧", order: 5 },
    { name: "Networking",         slug: "networking",         icon: "🔗", order: 6 },
    { name: "Database",           slug: "database",           icon: "🗄️", order: 7 },
    { name: "CTF & Pentesting",   slug: "ctf-pentesting",     icon: "🏴", order: 8 },
  ];

  for (const data of defaultCategories) {
    const record = new Record(categories);
    record.set("name",  data.name);
    record.set("slug",  data.slug);
    record.set("icon",  data.icon);
    record.set("order", data.order);
    app.save(record);
  }

}, (app) => {
  const result = app.findAllRecords("categories");
  for (const record of result) {
    app.delete(record);
  }
});
```

---

> Dokumen ini adalah bagian dari seri dokumentasi.
> Lihat juga: **PRD-001.md** · **TECH-SPEC-001.md** · **SETUP.md** · **CONTRIBUTING.md**

---

**SCHEMA-001 v1.0.0** | Platform Pembelajaran Pemrograman & Cybersecurity Open Source
