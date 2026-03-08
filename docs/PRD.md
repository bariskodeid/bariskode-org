# Product Requirements Document (PRD)
## Platform Pembelajaran Pemrograman & Cybersecurity Open Source

---

| Field            | Detail                                       |
|------------------|----------------------------------------------|
| **Document ID**  | PRD-001                                      |
| **Version**      | 1.0.0                                        |
| **Status**       | Draft                                        |
| **Author**       | Apin                                         |
| **Created**      | 2025                                         |
| **Last Updated** | 2025                                         |
| **Stack**        | Astro.js + Tailwind CSS + PocketBase         |

---

## Change History

| Version | Date    | Author | Description              |
|---------|---------|--------|--------------------------|
| 1.0.0   | 2025    | Apin   | Initial draft            |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Target Personas](#4-target-personas)
5. [User Stories & Use Cases](#5-user-stories--use-cases)
6. [Features & Requirements](#6-features--requirements)
7. [Features Out of Scope (v1)](#7-features-out-of-scope-v1)
8. [Technical Architecture](#8-technical-architecture)
9. [Design & UX Considerations](#9-design--ux-considerations)
10. [Data Schema Overview](#10-data-schema-overview)
11. [Integrations & Dependencies](#11-integrations--dependencies)
12. [Security & Compliance](#12-security--compliance)
13. [Milestones & Roadmap](#13-milestones--roadmap)
14. [Risks & Mitigations](#14-risks--mitigations)
15. [Open Questions](#15-open-questions)

---

## 1. Executive Summary

Platform ini adalah **sistem pembelajaran pemrograman dan cybersecurity berbasis web yang sepenuhnya open source**, dibangun di atas Astro.js, Tailwind CSS, dan PocketBase. Platform ini menyediakan pengalaman belajar terstruktur mulai dari dasar pemrograman hingga teknik-teknik offensive/defensive security, dilengkapi dengan interactive code playground, CTF (Capture The Flag) challenges, sistem sertifikasi terverifikasi, dan gamifikasi untuk meningkatkan engagement.

**Tagline:** *"Learn. Hack. Certify. Open Source."*

**Differentiator utama:**
- Sepenuhnya open source dan self-hostable
- CTF module terintegrasi untuk belajar cybersecurity secara hands-on
- Certificate dengan URL verifikasi unik
- Tidak memerlukan biaya lisensi — dapat di-fork, dikembangkan, dan di-deploy oleh komunitas

---

## 2. Problem Statement

### Konteks
Saat ini, banyak platform pembelajaran pemrograman dan cybersecurity yang:
1. **Berbayar** dengan model subscription yang tidak terjangkau oleh pelajar Indonesia
2. **Closed source** sehingga tidak bisa dikustomisasi oleh institusi atau komunitas lokal
3. **Tidak ada jalur cybersecurity yang hands-on** — kebanyakan hanya teori tanpa lab interaktif
4. **Certificate tidak dapat diverifikasi** secara independen

### Pain Points User
- Pelajar/mahasiswa tidak mampu membayar platform seperti Coursera, Hack The Box, atau TryHackMe secara konsisten
- Instruktur & komunitas tidak bisa membangun kursus mereka sendiri di platform yang fleksibel dan gratis
- Tidak ada platform lokal (Indonesia) yang menggabungkan coding + cybersecurity dalam satu ekosistem
- Progress belajar tidak tertracking dengan baik, menyebabkan dropout yang tinggi

---

## 3. Goals & Success Metrics

### Primary Goals
| Goal | Metric | Target (6 bulan) |
|------|--------|-----------------|
| User adoption | Registered users | 1.000 users |
| Learning completion | Course completion rate | ≥ 40% |
| Engagement | DAU/MAU ratio | ≥ 20% |
| Community | GitHub stars | ≥ 500 stars |
| Certification | Certificates issued | ≥ 200 |

### Secondary Goals
- Menjadi referensi open source learning platform untuk komunitas developer Indonesia
- Digunakan oleh minimal 3 institusi/komunitas sebagai platform belajar internal
- Kontribusi eksternal: ≥ 10 pull requests dari kontributor luar dalam 6 bulan pertama

---

## 4. Target Personas

### Persona 1: Budi — "The Curious Beginner"
- **Demografi:** Mahasiswa, 19 tahun, Surabaya
- **Goals:** Belajar coding dari nol untuk persiapan magang
- **Pain Points:** Tidak punya budget untuk platform berbayar, bingung mulai dari mana
- **Platform Usage:** Belajar melalui jalur terstruktur, mengerjakan quiz, mengumpulkan XP
- **Device:** Smartphone + laptop kampus

### Persona 2: Rini — "The Career Switcher"
- **Demografi:** Fresh graduate non-IT, 23 tahun
- **Goals:** Pivot ke web development, butuh bukti skill berupa certificate
- **Pain Points:** Butuh bukti terverifikasi untuk portfolio/LinkedIn
- **Platform Usage:** Fokus pada kursus web dev, kejar certificate untuk dipajang di LinkedIn
- **Device:** Laptop pribadi

### Persona 3: Dito — "The CTF Enthusiast"
- **Demografi:** Mahasiswa IT, 21 tahun, anggota komunitas keamanan siber
- **Goals:** Latihan CTF, belajar teknik offensive security secara legal dan etis
- **Pain Points:** Platform CTF berbayar, tidak ada lab yang bisa diakses kapan saja
- **Platform Usage:** CTF challenges, exploit labs, leaderboard komunitas
- **Device:** Laptop dengan Linux

### Persona 4: Pak Wahyu — "The Educator / Instructor"
- **Demografi:** Dosen/instruktur coding bootcamp, 35 tahun
- **Goals:** Membuat kursus untuk mahasiswanya di platform yang bisa dikontrol sendiri
- **Pain Points:** LMS yang ada terlalu mahal atau tidak fleksibel
- **Platform Usage:** Admin panel untuk membuat konten, memantau progress mahasiswa
- **Device:** Laptop, akses admin

---

## 5. User Stories & Use Cases

### Epic 1: Authentication & User Management
- **US-01:** Sebagai user baru, aku ingin mendaftar dengan email & password agar bisa mengakses konten
- **US-02:** Sebagai user, aku ingin login dengan Google/GitHub OAuth agar proses masuk lebih cepat
- **US-03:** Sebagai user, aku ingin mengedit profil (bio, avatar, social links) agar profilku terlihat profesional
- **US-04:** Sebagai user, aku ingin reset password via email jika lupa password

### Epic 2: Course & Content
- **US-05:** Sebagai learner, aku ingin menelusuri katalog kursus berdasarkan kategori dan difficulty
- **US-06:** Sebagai learner, aku ingin membaca konten pelajaran berbasis MDX/Markdown
- **US-07:** Sebagai learner, aku ingin menonton video tutorial yang embeddable (YouTube/self-hosted)
- **US-08:** Sebagai learner, aku ingin menandai pelajaran sebagai selesai agar progress tertracking
- **US-09:** Sebagai instructor, aku ingin membuat dan mengedit kursus melalui admin panel
- **US-10:** Sebagai instructor, aku ingin mengatur urutan modul dan lesson dalam kursus

### Epic 3: Interactive Code Playground
- **US-11:** Sebagai learner, aku ingin menulis dan menjalankan kode langsung di browser tanpa setup apapun
- **US-12:** Sebagai learner, aku ingin melihat output dari kode yang aku tulis secara real-time
- **US-13:** Sebagai learner, aku ingin code editor yang memiliki syntax highlighting dan autocomplete
- **US-14:** Sebagai instructor, aku ingin menyematkan code playground ke dalam konten lesson

### Epic 4: Quiz & Assessment
- **US-15:** Sebagai learner, aku ingin mengerjakan quiz di akhir setiap modul untuk menguji pemahaman
- **US-16:** Sebagai learner, aku ingin melihat score dan jawaban yang benar setelah submit quiz
- **US-17:** Sebagai learner, aku ingin retry quiz jika belum lulus (dengan minimum score)
- **US-18:** Sebagai instructor, aku ingin membuat quiz dengan tipe soal multiple choice, true/false, dan code output

### Epic 5: Gamification
- **US-19:** Sebagai learner, aku ingin mendapatkan XP setiap kali menyelesaikan lesson/quiz
- **US-20:** Sebagai learner, aku ingin melihat level dan rank-ku dibandingkan user lain
- **US-21:** Sebagai learner, aku ingin mendapatkan badge ketika mencapai milestone tertentu
- **US-22:** Sebagai learner, aku ingin mempertahankan streak harian belajarku
- **US-23:** Sebagai learner, aku ingin melihat leaderboard mingguan/bulanan

### Epic 6: Learning Progress
- **US-24:** Sebagai learner, aku ingin melihat dashboard progress-ku: kursus aktif, completion rate, XP total
- **US-25:** Sebagai learner, aku ingin melanjutkan dari pelajaran terakhir yang aku baca
- **US-26:** Sebagai learner, aku ingin melihat persentase penyelesaian setiap kursus yang aku ikuti

### Epic 7: Certificate
- **US-27:** Sebagai learner, aku ingin mendapatkan certificate PDF setelah menyelesaikan kursus
- **US-28:** Sebagai learner, aku ingin certificate-ku memiliki URL verifikasi unik yang bisa dicek siapapun
- **US-29:** Sebagai learner, aku ingin share certificate-ku langsung ke LinkedIn
- **US-30:** Sebagai verifier (HRD/recruiter), aku ingin memverifikasi keaslian certificate melalui URL

### Epic 8: CTF Module
- **US-31:** Sebagai CTF player, aku ingin melihat daftar challenge berdasarkan kategori dan difficulty
- **US-32:** Sebagai CTF player, aku ingin submit flag untuk menyelesaikan challenge
- **US-33:** Sebagai CTF player, aku ingin mendapatkan hint dengan konsekuensi pengurangan point
- **US-34:** Sebagai CTF player, aku ingin melihat scoreboard real-time
- **US-35:** Sebagai admin, aku ingin membuat challenge baru dengan deskripsi, file attachment, dan flag

### Epic 9: Discussion & Community
- **US-36:** Sebagai learner, aku ingin berkomentar dan bertanya di setiap lesson
- **US-37:** Sebagai learner, aku ingin membalas komentar orang lain (threaded discussion)
- **US-38:** Sebagai instructor/admin, aku ingin memoderasi komentar yang melanggar aturan

### Epic 10: Search & Discovery
- **US-39:** Sebagai user, aku ingin mencari kursus, lesson, atau topik tertentu dengan cepat
- **US-40:** Sebagai user, aku ingin memfilter konten berdasarkan kategori, difficulty, dan teknologi

### Epic 11: Notification & Reminder
- **US-41:** Sebagai learner, aku ingin mendapat email reminder jika streakku akan putus
- **US-42:** Sebagai learner, aku ingin notifikasi ketika ada kursus baru yang relevan dengan minatku
- **US-43:** Sebagai learner, aku ingin notifikasi ketika komentar/pertanyaanku dibalas

### Epic 12: Admin & Analytics
- **US-44:** Sebagai admin, aku ingin melihat dashboard: total user, course views, completion rate
- **US-45:** Sebagai admin, aku ingin mengelola user (ban, role assignment)
- **US-46:** Sebagai instructor, aku ingin melihat analytics kursus: enrollment, drop-off point, avg score

---

## 6. Features & Requirements

### F-01: Authentication & Authorization
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-01.1 | Email/password registration & login | P0 | Via PocketBase auth |
| F-01.2 | OAuth: Google & GitHub | P0 | PocketBase OAuth2 support |
| F-01.3 | Email verification | P0 | PocketBase built-in |
| F-01.4 | Password reset via email | P0 | PocketBase built-in |
| F-01.5 | Role-based access: `student`, `instructor`, `admin` | P0 | PocketBase roles |
| F-01.6 | Session management & JWT | P0 | PocketBase built-in |

### F-02: Course & Content Management
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-02.1 | Hierarchi konten: Course → Module → Lesson | P0 | - |
| F-02.2 | Lesson content: MDX/Markdown dengan rich formatting | P0 | Astro MDX integration |
| F-02.3 | Embed video (YouTube/Vimeo iframe atau self-hosted) | P1 | - |
| F-02.4 | Lesson type: reading, video, quiz, coding challenge | P1 | Enum field di PocketBase |
| F-02.5 | Draft/publish system untuk konten | P0 | Status field |
| F-02.6 | Tag dan kategori untuk kursus | P0 | - |
| F-02.7 | Difficulty level: Beginner, Intermediate, Advanced | P0 | - |
| F-02.8 | Estimated duration per lesson/course | P1 | - |
| F-02.9 | Prerequisite course/module | P2 | - |

### F-03: Interactive Code Playground
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-03.1 | Monaco Editor integration | P0 | React Island di Astro |
| F-03.2 | Syntax highlighting untuk Python, JS, HTML/CSS, Bash | P0 | Monaco built-in |
| F-03.3 | Code execution via Judge0 API (self-hosted) | P0 | Docker deployment |
| F-03.4 | HTML/CSS/JS live preview (iframe sandbox) | P1 | CodePen-like experience |
| F-03.5 | Starter code template per lesson | P1 | Field di lesson schema |
| F-03.6 | Test cases untuk validasi output kode | P2 | Judge0 expected output |

### F-04: Quiz & Assessment
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-04.1 | Quiz tipe: multiple choice, true/false | P0 | - |
| F-04.2 | Minimum passing score configurable per quiz | P0 | Default: 70% |
| F-04.3 | Tampilkan hasil dan jawaban benar setelah submit | P0 | - |
| F-04.4 | Retry limit configurable (unlimited/terbatas) | P1 | - |
| F-04.5 | Timer per quiz (opsional) | P2 | - |
| F-04.6 | Soal tipe: code output selection | P2 | - |

### F-05: Gamification
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-05.1 | XP system: XP diberikan per lesson selesai, quiz passed | P0 | Configurable per item |
| F-05.2 | Level system berbasis XP total | P0 | Level 1–20 dengan nama rank |
| F-05.3 | Streak tracking: harian consecutive login/learning | P1 | - |
| F-05.4 | Badge system: milestone-based achievements | P1 | - |
| F-05.5 | Leaderboard: global, weekly, per kursus | P1 | - |
| F-05.6 | XP multiplier untuk streak aktif | P2 | - |

**Level & Rank System (Contoh):**
| Level | XP Range | Rank Name |
|-------|----------|-----------|
| 1–3 | 0–500 | Script Kiddie |
| 4–6 | 501–2.000 | Code Apprentice |
| 7–10 | 2.001–5.000 | Junior Hacker |
| 11–14 | 5.001–10.000 | Senior Developer |
| 15–17 | 10.001–20.000 | Security Analyst |
| 18–20 | 20.001+ | Elite Pentester |

### F-06: Learning Progress Tracking
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-06.1 | Track lesson completion per user | P0 | `user_progress` table |
| F-06.2 | Persentase completion per course | P0 | Computed dari lessons selesai |
| F-06.3 | Resume dari lesson terakhir | P0 | `last_accessed_lesson` field |
| F-06.4 | Dashboard: enrolled courses + progress | P0 | - |
| F-06.5 | Activity history / learning log | P1 | - |

### F-07: Certificate System
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-07.1 | Generate certificate PDF otomatis saat course selesai | P0 | Via Puppeteer/html-pdf |
| F-07.2 | Unique certificate ID (UUID) per certificate | P0 | - |
| F-07.3 | Public verification page: `/verify/[cert-id]` | P0 | SSR page di Astro |
| F-07.4 | Certificate berisi: nama, kursus, tanggal, QR code | P0 | QR code link ke verify page |
| F-07.5 | Download certificate sebagai PDF | P0 | - |
| F-07.6 | Share to LinkedIn button | P1 | LinkedIn Certificate URL scheme |
| F-07.7 | Certificate template yang dapat dikustomisasi admin | P2 | - |

### F-08: CTF Module
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-08.1 | Daftar challenge: kategori, difficulty, point value | P1 | - |
| F-08.2 | Flag submission & validasi | P1 | Case-insensitive, trimmed |
| F-08.3 | Hint system dengan point deduction | P1 | - |
| F-08.4 | Scoreboard real-time per event/global | P1 | - |
| F-08.5 | Challenge attachment: file download | P1 | PocketBase file storage |
| F-08.6 | Docker-based isolated lab environment | P2 | High complexity — v2 |
| F-08.7 | Write-up system setelah challenge solved | P2 | - |

**CTF Kategori:**
- Web Exploitation
- Reverse Engineering
- Binary Exploitation (Pwn)
- Cryptography
- Forensics
- OSINT
- Misc

### F-09: Discussion & Community
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-09.1 | Comment thread per lesson | P1 | Nested max 2 levels |
| F-09.2 | Upvote/like komentar | P2 | - |
| F-09.3 | Moderasi komentar (delete, hide) oleh instructor/admin | P1 | - |
| F-09.4 | Mention user (`@username`) di komentar | P2 | - |

### F-10: Search & Discovery
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-10.1 | Full-text search untuk kursus dan lesson | P1 | Meilisearch (self-hosted) |
| F-10.2 | Filter by: kategori, difficulty, tag, bahasa | P1 | - |
| F-10.3 | Search suggestions / autocomplete | P2 | - |

### F-11: Notification & Reminder
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-11.1 | Email: welcome email saat register | P1 | PocketBase SMTP hooks |
| F-11.2 | Email: certificate issued notification | P1 | - |
| F-11.3 | Email: streak reminder (D-1 sebelum putus) | P2 | PocketBase cron hooks |
| F-11.4 | In-app notification bell | P2 | - |

### F-12: Admin Panel & Analytics
| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| F-12.1 | PocketBase Admin UI untuk CRUD semua entitas | P0 | Built-in PocketBase |
| F-12.2 | Dashboard: total users, active courses, completions | P1 | Custom admin page |
| F-12.3 | Per-course analytics: enrollment, completion, avg score | P1 | - |
| F-12.4 | User management: role assignment, ban | P1 | - |
| F-12.5 | Content moderation queue | P2 | - |

---

## 7. Features Out of Scope (v1)

| Feature | Alasan |
|---------|--------|
| Mobile native app (iOS/Android) | PWA sudah cukup untuk v1 |
| Live coding sessions / video call | Kompleksitas tinggi, butuh infra terpisah |
| Marketplace untuk instructor menjual kursus | Membutuhkan payment gateway, diluar MVP |
| AI-powered personalized learning path | Butuh ML pipeline, roadmap v3 |
| Docker-based isolated CTF labs | High infra cost & complexity, roadmap v2 |
| Multi-language i18n (selain Indonesia/English) | Roadmap v2 |
| Peer code review system | Roadmap v2 |

---

## 8. Technical Architecture

### 8.1 Tech Stack

| Layer | Technology | Justifikasi |
|-------|-----------|-------------|
| Frontend Framework | **Astro.js v4+** (SSR mode) | Fast, SEO-friendly, islands architecture |
| UI Framework | **React** (untuk interactive islands) | Komponen quiz, editor, dashboard |
| Styling | **Tailwind CSS v3** | Utility-first, konsisten, dark mode ready |
| Backend / Database | **PocketBase** | All-in-one: DB, auth, file storage, REST API |
| Code Execution | **Judge0** (self-hosted Docker) | Open source, multi-language support |
| Search | **Meilisearch** (self-hosted Docker) | Open source, fast, typo-tolerant |
| File Storage | **Cloudflare R2** / PocketBase local | S3-compatible, gratis 10GB |
| PDF Generation | **Puppeteer** atau **@react-pdf/renderer** | Certificate generation |
| Email | **SMTP** via PocketBase hooks | Nodemailer-compatible |

### 8.2 High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                  BROWSER / CLIENT                │
│  Astro Pages (SSR/Static) + React Islands       │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │  /learn  │ │  /quiz   │ │  /playground     │ │
│  │ (Static) │ │ (React)  │ │  (React+Monaco)  │ │
│  └──────────┘ └──────────┘ └──────────────────┘ │
└─────────────┬───────────────────────────────────┘
              │ REST API / SDK
┌─────────────▼───────────────────────────────────┐
│                  POCKETBASE                      │
│  Auth │ Collections │ File Storage │ Realtime   │
│  Hooks (SMTP email) │ Admin UI                  │
└──────────┬───────────────┬─────────────────────┘
           │               │
┌──────────▼──────┐ ┌──────▼──────────────────┐
│   Judge0        │ │  Meilisearch            │
│  (Docker)       │ │  (Docker)               │
│  Code Execution │ │  Full-text Search       │
└─────────────────┘ └─────────────────────────┘
```

### 8.3 Astro Rendering Strategy

| Route | Rendering | Alasan |
|-------|-----------|--------|
| `/` (landing) | Static | SEO, no auth needed |
| `/courses` | SSR | Dynamic filter, search |
| `/courses/[slug]` | SSR | Real-time enrollment data |
| `/learn/[lesson]` | SSR | Auth-gated, progress tracking |
| `/quiz/[id]` | React Island | Full client interactivity |
| `/playground` | React Island | Monaco editor, real-time |
| `/dashboard` | React Island | SPA-like, user-specific data |
| `/ctf` | SSR + React | Leaderboard realtime |
| `/verify/[id]` | SSR | Public, SEO-friendly |
| `/admin/*` | React Island | Auth-gated, admin only |

---

## 9. Design & UX Considerations

### 9.1 Design Principles
1. **Clarity First** — Navigasi yang jelas, tidak membingungkan learner pemula
2. **Progressive Disclosure** — Tampilkan fitur sesuai level user (beginner tidak langsung lihat CTF)
3. **Dark Mode by Default** — Cybersecurity audience sangat prefer dark theme
4. **Mobile-First** — Banyak user akses dari mobile, pastikan quiz & reading nyaman di kecil
5. **Fast & Lightweight** — Astro memastikan load time minimal, hindari bloat

### 9.2 Key UX Flows

**Flow 1: New User Onboarding**
```
Register → Email Verify → Interest Selection → Recommended Path → First Lesson
```

**Flow 2: Learning a Lesson**
```
Dashboard → Course → Module → Lesson (read/watch) → Mark Complete → XP earned → Next Lesson
```

**Flow 3: Quiz Flow**
```
Lesson selesai → Start Quiz → Jawab soal → Submit → Lihat hasil → 
  [Pass: XP + badge check] → [Fail: Review jawaban → Retry]
```

**Flow 4: Get Certificate**
```
Semua lesson selesai → Semua quiz passed → Generate Certificate → 
Download PDF → Verify URL aktif → Share LinkedIn
```

**Flow 5: CTF Challenge**
```
CTF Listing → Pilih challenge → Baca deskripsi → Submit flag / Beli hint → 
  [Correct: Point earned + badge] → [Wrong: Coba lagi]
```

### 9.3 Accessibility
- WCAG 2.1 AA compliance minimum
- Keyboard navigation support
- Sufficient color contrast (≥ 4.5:1)
- Alt text untuk semua gambar konten

### 9.4 PWA Requirements
- Service Worker untuk offline reading (lesson content yang sudah dibuka)
- App manifest untuk "Add to Home Screen"
- Background sync untuk progress tracking

---

## 10. Data Schema Overview

### PocketBase Collections

#### `users` (extend built-in auth)
```
- id, email, username, avatar
- role: enum [student, instructor, admin]
- bio: text
- github_url: url
- xp: number (total XP)
- level: number
- streak_current: number
- streak_longest: number
- last_active: datetime
```

#### `courses`
```
- id, title, slug, description
- instructor: relation(users)
- category: relation(categories)
- difficulty: enum [beginner, intermediate, advanced]
- tags: json array
- thumbnail: file
- status: enum [draft, published]
- estimated_hours: number
- created, updated
```

#### `modules`
```
- id, title, course: relation(courses)
- order: number
- description: text
```

#### `lessons`
```
- id, title, slug, module: relation(modules)
- type: enum [reading, video, quiz, coding]
- content: text (MDX)
- video_url: url
- starter_code: text
- xp_reward: number
- order: number
- status: enum [draft, published]
- estimated_minutes: number
```

#### `quiz_questions`
```
- id, lesson: relation(lessons)
- question: text
- type: enum [multiple_choice, true_false]
- options: json array [{text, is_correct}]
- explanation: text
- order: number
```

#### `user_progress`
```
- id
- user: relation(users)
- lesson: relation(lessons)
- status: enum [started, completed]
- score: number (for quiz lessons)
- attempts: number
- completed_at: datetime
```

#### `certificates`
```
- id (UUID — used as cert ID)
- user: relation(users)
- course: relation(courses)
- issued_at: datetime
- file: file (PDF)
- is_valid: bool
```

#### `badges`
```
- id, name, description
- icon: file
- trigger_type: enum [xp_milestone, course_complete, streak, ctf_solve]
- trigger_value: number
```

#### `user_badges`
```
- id
- user: relation(users)
- badge: relation(badges)
- earned_at: datetime
```

#### `ctf_challenges`
```
- id, title, description
- category: enum [web, rev, pwn, crypto, forensics, osint, misc]
- difficulty: enum [easy, medium, hard, insane]
- points: number
- flag: text (hashed, bcrypt)
- attachment: file
- hints: json array [{text, cost}]
- is_active: bool
- solve_count: number
```

#### `ctf_solves`
```
- id
- user: relation(users)
- challenge: relation(ctf_challenges)
- points_earned: number
- hints_used: number
- solved_at: datetime
```

#### `comments`
```
- id
- user: relation(users)
- lesson: relation(lessons)
- parent: relation(comments) (nullable, untuk reply)
- content: text
- is_hidden: bool
- created, updated
```

---

## 11. Integrations & Dependencies

| Service | Usage | Hosting | Cost |
|---------|-------|---------|------|
| PocketBase | Backend, auth, DB, storage | Self-hosted VPS | Free |
| Judge0 CE | Code execution engine | Self-hosted Docker | Free |
| Meilisearch | Full-text search | Self-hosted Docker | Free |
| Cloudflare R2 | File & media storage | Cloudflare | Free up to 10GB |
| Cloudflare Pages/VPS | Frontend hosting | CF Pages / VPS | Free/murah |
| SMTP Provider | Email (welcome, cert, reminder) | Resend / Brevo | Free tier |
| GitHub OAuth | Social login | GitHub | Free |
| Google OAuth | Social login | Google Cloud | Free |

### External Libraries (NPM)
```json
{
  "astro": "^4.x",
  "@astrojs/react": "latest",
  "@astrojs/tailwind": "latest",
  "pocketbase": "^0.21.x",
  "@monaco-editor/react": "latest",
  "react-pdf": "latest",
  "qrcode": "latest",
  "meilisearch": "latest",
  "date-fns": "latest",
  "zod": "latest"
}
```

---

## 12. Security & Compliance

### 12.1 Authentication & Authorization
- Semua API call ke PocketBase harus include valid JWT token
- Role check di setiap endpoint: `student` tidak bisa akses admin routes
- Rate limiting pada quiz submission (anti-brute force flag CTF)

### 12.2 CTF Security
- Flag disimpan sebagai **bcrypt hash** di database, bukan plaintext
- Verifikasi flag dilakukan server-side
- Rate limit flag submission: max 10 attempt/menit per user
- Prevent flag sharing detection: log timestamp & IP per solve

### 12.3 Code Execution Security
- Judge0 berjalan di **isolated Docker container**
- Sandbox: tidak ada akses network, filesystem terbatas
- Resource limits: max CPU 5 detik, max memory 256MB per eksekusi
- Whitelist bahasa yang diizinkan (tidak semua bahasa Judge0 diaktifkan)

### 12.4 Content Security
- XSS prevention: sanitize semua user-generated content (komentar)
- File upload: validasi MIME type, max size 50MB
- HTTPS everywhere (TLS via Cloudflare atau Let's Encrypt)
- CSP headers untuk mencegah code injection

### 12.5 Data Privacy
- Password di-hash oleh PocketBase (bcrypt)
- Tidak menyimpan data sensitif di luar yang diperlukan
- User dapat request delete akun (GDPR consideration)
- Cookie consent untuk analytics (jika digunakan)

---

## 13. Milestones & Roadmap

### Phase 1 — MVP Core (Bulan 1–2)
**Goal:** Platform bisa digunakan untuk belajar end-to-end

- [ ] Setup project Astro.js + PocketBase + Docker
- [ ] Auth system (email + OAuth)
- [ ] Course/Module/Lesson CRUD (admin)
- [ ] Lesson reader (MDX rendering)
- [ ] Quiz basic (multiple choice)
- [ ] Progress tracking (mark complete)
- [ ] Certificate generation & verification URL
- [ ] Deploy ke VPS (staging)

### Phase 2 — Enhanced Learning (Bulan 3)
**Goal:** Pengalaman belajar yang engaging

- [ ] Monaco Editor integration
- [ ] Judge0 code execution
- [ ] Gamification: XP, level, streak
- [ ] Badge system (5 badge pertama)
- [ ] Leaderboard (global)
- [ ] Comment/discussion per lesson
- [ ] Email notifications (welcome, certificate)
- [ ] PWA support

### Phase 3 — CTF & Community (Bulan 4)
**Goal:** Differentiation via CTF module

- [ ] CTF challenge listing & submission
- [ ] Flag validation system
- [ ] CTF scoreboard real-time
- [ ] Hint system
- [ ] Meilisearch integration
- [ ] Admin analytics dashboard
- [ ] User profile publik

### Phase 4 — Polish & Open Source (Bulan 5–6)
**Goal:** Siap dirilis sebagai open source project

- [ ] Comprehensive documentation (README, CONTRIBUTING, Wiki)
- [ ] Docker Compose untuk self-hosting mudah
- [ ] One-click deploy ke Railway/Render
- [ ] Demo instance publik
- [ ] GitHub Actions CI/CD
- [ ] Accessibility audit & fixes
- [ ] Performance optimization
- [ ] Public launch & community announcement

---

## 14. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| PocketBase SQLite bottleneck di scale besar | Medium | High | Monitor aktif, enable WAL, siapkan migration plan ke PostgreSQL |
| Judge0 server di-abuse untuk crypto mining | Medium | High | Resource limits ketat, rate limiting, IP blacklist |
| CTF flag leaking via side-channel | Low | High | Hash flag, log setiap attempt, honeypot flags |
| Konten kursus kosong saat launch | High | High | Buat minimal 3 kursus lengkap sebelum launch publik |
| Low contributor engagement (open source) | Medium | Medium | Buat CONTRIBUTING.md yang baik, label issue "good first issue" |
| Cloudflare R2 cost overrun | Low | Low | Monitoring usage, set budget alerts |
| SMTP delivery rate rendah | Medium | Medium | Gunakan reputable provider (Resend/Brevo), setup SPF/DKIM |

---

## 15. Open Questions

| # | Pertanyaan | Owner | Deadline |
|---|-----------|-------|---------|
| Q1 | Apakah platform akan support bahasa Indonesia & Inggris di konten, atau salah satu saja? | Apin | Phase 1 |
| Q2 | Bagaimana mekanisme onboarding instructor? Self-register atau invite-only? | Apin | Phase 2 |
| Q3 | Apakah CTF challenges akan di-reset periodik (event-based) atau persistent? | Apin | Phase 3 |
| Q4 | Pilihan license: MIT atau AGPL? | Apin | Before launch |
| Q5 | Apakah ada rencana monetisasi (donasi, sponsorship) atau murni free? | Apin | Phase 4 |
| Q6 | Hosting utama: VPS sendiri atau managed platform (Railway, Render)? | Apin | Phase 1 |
| Q7 | Nama platform / branding? | Apin | Phase 1 |

---

## Appendix

### A. Referensi Platform Kompetitor
| Platform | Kelebihan | Kekurangan |
|---------|-----------|-----------|
| freeCodeCamp | Gratis, komunitas besar | Tidak ada CTF |
| TryHackMe | CTF bagus, gamified | Berbayar |
| Hack The Box | Professional level | Sangat teknis, berbayar |
| Codecademy | UX bagus | Berbayar, closed source |
| The Odin Project | Open source, gratis | Tidak ada certif, tidak ada CTF |

### B. Glossary
| Term | Definisi |
|------|---------|
| CTF | Capture The Flag — kompetisi cybersecurity |
| XP | Experience Points — sistem reward belajar |
| MDX | Markdown + JSX — format konten kaya |
| PWA | Progressive Web App |
| SSR | Server-Side Rendering |
| Islands Architecture | Pola arsitektur Astro: static HTML dengan interactive component terisolasi |
| Judge0 | Open source online code execution system |
| Meilisearch | Open source search engine yang fast dan typo-tolerant |

---

*Dokumen ini bersifat living document — akan diperbarui seiring perkembangan proyek.*

---
**PRD-001 v1.0.0** | Platform Pembelajaran Pemrograman & Cybersecurity Open Source
