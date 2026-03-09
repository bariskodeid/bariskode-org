# IMPLEMENTATION.md
## Status Implementasi MVP & Rencana Production-Ready

---

| Field | Detail |
|---|---|
| **Document ID** | IMPL-001 |
| **Version** | 2.2.0 |
| **Status** | Updated after repository audit |
| **Author** | Apin + AI implementation review |
| **Relates To** | PRD-001 · TECH-SPEC-001 · SCHEMA-001 |
| **Current Stack (repo actual)** | Astro 5 + React 19 + Tailwind 4 + PocketBase 0.22 |
| **Last Updated** | 2026-03-09 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Repository Snapshot](#2-current-repository-snapshot)
3. [MVP Completion Assessment](#3-mvp-completion-assessment)
4. [Gap Analysis vs Phase 1 MVP](#4-gap-analysis-vs-phase-1-mvp)
5. [Verdict: Is MVP Finished?](#5-verdict-is-mvp-finished)
6. [Readiness Checklist Snapshot](#6-readiness-checklist-snapshot)
7. [Production-Ready Implementation Principles](#7-production-ready-implementation-principles)
8. [Production-Ready Roadmap](#8-production-ready-roadmap)
9. [Detailed Workstreams](#9-detailed-workstreams)
10. [Suggested 90-Day Rollout](#10-suggested-90-day-rollout)
11. [Definition of Done — Production Ready](#11-definition-of-done--production-ready)
12. [Immediate Next Actions](#12-immediate-next-actions)

---

## 1. Executive Summary

Berdasarkan audit repository saat ini, implementasi **Phase 1 MVP belum selesai**.

Repository sudah memiliki pondasi yang cukup kuat untuk alur belajar inti:

- scaffold monorepo sudah ada,
- Astro frontend sudah berjalan secara struktur,
- PocketBase migrations dan hooks sudah tersedia,
- auth dasar, course catalog, lesson reader, quiz, dashboard, dan certificate verification sudah mulai terimplementasi.

Namun, ada beberapa deliverable MVP yang masih **partial** atau **missing**, terutama:

- automated test baseline sudah mulai ada, tetapi coverage masih dangkal dan belum cukup untuk menyatakan flow utama tervalidasi penuh,
- staging/production deployment belum siap,
- flow auth belum lengkap (email verification + reset confirmation),
- certificate flow belum sepenuhnya sesuai scope,
- ada perbedaan antara dokumen rencana awal dan implementasi aktual.

Karena itu, fokus berikutnya sebaiknya **bukan langsung feature expansion**, melainkan:

1. menutup gap MVP yang tersisa,
2. merapikan drift antara docs dan code,
3. mengerjakan hardening menuju environment production.

---

## 2. Current Repository Snapshot

### 2.1 Struktur yang sudah ada

Path penting yang terverifikasi saat audit:

```text
apps/web/
apps/pocketbase/
docker/
docs/
.env.example
docker-compose.yml
docker/docker-compose.yml
```

### 2.2 Implementasi yang sudah ditemukan

#### Frontend / Astro

- `apps/web/package.json`
- `apps/web/astro.config.mjs`
- `apps/web/tsconfig.json`
- `apps/web/src/layouts/BaseLayout.astro`
- `apps/web/src/styles/global.css`

#### Auth & session

- `apps/web/src/lib/pocketbase.ts`
- `apps/web/src/middleware.ts`
- `apps/web/src/pages/login.astro`
- `apps/web/src/pages/register.astro`
- `apps/web/src/pages/forgot-password.astro`
- `apps/web/src/pages/api/auth/logout.ts`
- `apps/web/src/pages/api/auth/oauth/[provider].ts`
- `apps/web/src/pages/api/auth/oauth/callback.ts`

#### Learning flow

- `apps/web/src/pages/courses/index.astro`
- `apps/web/src/pages/courses/[slug].astro`
- `apps/web/src/pages/learn/[lessonId].astro`
- `apps/web/src/pages/quiz/[lessonId].astro`
- `apps/web/src/components/CourseCard.astro`
- `apps/web/src/components/react/QuizEngine.tsx`

#### Progress, dashboard, certificate

- `apps/web/src/pages/api/progress/complete.ts`
- `apps/web/src/pages/dashboard/index.astro`
- `apps/web/src/lib/certificate.ts`
- `apps/web/src/pages/api/certificates/generate.ts`
- `apps/web/src/components/react/CertificateTemplate.tsx`
- `apps/web/src/pages/verify/[certId].astro`

#### PocketBase

- `apps/pocketbase/pb_migrations/`
- `apps/pocketbase/pb_hooks/on_progress_complete.pb.js`

---

## 3. MVP Completion Assessment

Status berikut menilai implementasi aktual terhadap target **Phase 1 MVP**.

| Area MVP | Status | Catatan |
|---|---|---|
| Project scaffold & infrastructure | **Partial** | Struktur utama sudah ada, tapi belum rapi/kanonis untuk deploy production. |
| PocketBase schema & migrations | **Partial** | Migrations tersedia, tetapi belum ada bukti kuat seluruh setup MVP tervalidasi end-to-end. |
| Email/password auth | **Partial** | Login/register tersedia dan sekarang memeriksa status verifikasi email, namun validasi operasional SMTP masih perlu diuji di environment. |
| OAuth GitHub/Google | **Partial** | Route initiate + callback tersedia, tetapi konfigurasi provider dan validasi end-to-end environment belum terverifikasi dari repository. |
| Email verification | **Partial** | Halaman `verify-email` + resend tersedia, login/register sudah redirect untuk akun unverified, namun uji end-to-end email provider belum tervalidasi. |
| Password reset | **Partial** | Request reset dan halaman `reset-password` (confirm token) tersedia, namun uji end-to-end via email provider belum tervalidasi. |
| Route guard & RBAC | **Partial** | Middleware dan admin guard ada, perlu uji lebih lanjut untuk edge cases. |
| Course catalog | **Complete** | Halaman katalog tersedia. |
| Course detail | **Complete** | Halaman detail tersedia. |
| Lesson reader | **Partial** | Reader sudah ada, tetapi implementasi aktual berbasis Markdown string dari PocketBase, bukan MDX workflow seperti rencana awal. |
| Mark complete / progress | **Complete** | API progress completion tersedia. |
| Quiz basic | **Complete** | Quiz page, question endpoint, submit endpoint, dan React engine tersedia. |
| Dashboard basic | **Partial** | Sudah ada XP/progress/recent activity dan last accessed lesson, namun enrolled model formal masih belum eksplisit. |
| Certificate PDF | **Partial** | Generate, upload, dan QR code sudah ada; perlu validasi operasional end-to-end dan hardening idempotency penuh di level schema. |
| Public certificate verification | **Complete** | Halaman verify tersedia. |
| QR code on certificate | **Complete** | QR code sudah ditambahkan pada template certificate PDF. |
| Auto-generate certificate on completion | **Partial** | Sudah terhubung dari progress complete dan quiz submit, namun masih butuh uji E2E dengan data nyata. |
| Error pages | **Complete** | `403`, `404`, `500` tersedia. |
| Testing (unit/integration/e2e/manual evidence) | **Partial** | Harness Playwright dasar + script `test`/`test:e2e` sudah tersedia dan smoke tests lulus; unit/integration tests belum ada. |
| Staging deploy | **Missing** | Belum ada setup deploy yang lengkap dan tervalidasi. |

---

## 4. Gap Analysis vs Phase 1 MVP

### 4.1 Gap fungsional

#### A. Auth belum benar-benar lengkap

Target MVP awal mencakup:

- register/login,
- OAuth,
- email verification,
- password reset.

Kondisi aktual:

- register/login ada,
- OAuth ada,
- forgot password request page ada,
- verify-email + resend sudah ada,
- reset-password confirm (token) sudah ada,
- validasi end-to-end email provider masih perlu dibuktikan di staging.

#### B. Certificate system belum full sesuai scope

Target MVP awal mencakup:

- auto-generate PDF saat course selesai,
- URL verifikasi unik,
- download PDF,
- QR code.

Kondisi aktual:

- generate endpoint ada,
- verify page ada,
- PDF dapat diunduh,
- QR code sudah ditambahkan di template PDF,
- generation sudah di-trigger dari progress/quiz flow,
- masih perlu penguatan idempotency dan validasi E2E data nyata.

#### C. Testing masih awal (belum lengkap)

MVP plan mengharuskan flow utama tervalidasi. Kondisi terkini:

- sudah ada setup Playwright (`apps/web/playwright.config.ts`),
- sudah ada spec dasar di `apps/web/tests/e2e/`,
- script `test` dan `test:e2e` sudah ada di `apps/web/package.json`,
- `npm run test:e2e` lulus untuk smoke checks,
- unit/integration tests masih belum tersedia.

#### D. Deploy staging belum selesai

Target MVP awal menuntut staging deployment. Saat audit:

- ada Docker Compose dasar,
- belum ada production/staging deployment flow yang lengkap,
- belum ada bukti Nginx/runtime/deploy automation yang siap digunakan.

### 4.2 Gap dokumentasi vs implementasi

Beberapa drift yang perlu dicatat:

| Item | Dokumen lama | Implementasi aktual |
|---|---|---|
| Astro | v4 | v5 (`apps/web/package.json`) |
| React | v18 | v19 |
| Tailwind | v3-style integration | v4 stack |
| Login/register API | direncanakan via `pages/api/auth/*.ts` | implementasi login/register dilakukan langsung di page form handler `.astro` |
| Certificate template path | `components/react/Certificate/Template.tsx` | `components/react/CertificateTemplate.tsx` |
| Lesson content strategy | MDX-heavy | lebih dekat ke Markdown string dari PocketBase |

### 4.3 Gap operasional

Beberapa risiko operasional yang terlihat dari file yang diaudit sebelum production:

- belum ada CI/CD,
- belum ada konfigurasi observability yang terlihat di repository,
- belum ada health checks aplikasi web yang jelas,
- belum ada backup/restore strategy,
- belum ada rate limiting pada endpoint sensitif,
- belum ada standard validation envelope di semua API route,
- ada potensi duplikasi logic XP antara API route dan PocketBase hook.

---

## 5. Verdict: Is MVP Finished?

**Jawaban singkat: belum.**

### Alasan utama

MVP bisa dianggap selesai hanya jika alur end-to-end utama sudah:

1. lengkap secara fungsional,
2. tervalidasi,
3. dapat dideploy ke staging secara realistis.

Saat ini, repository baru mencapai kondisi:

- **core product mostly implemented**, tetapi
- **belum memenuhi definition of done MVP secara penuh**.

### Status keseluruhan

```text
MVP status: core learning flows mostly implemented; auth/certificate/testing sudah maju,
namun validasi operasional end-to-end dan deploy readiness masih belum complete.
Production readiness: early stage.
```

---

## 6. Readiness Checklist Snapshot

Status di bawah ini memisahkan dengan tegas antara:

- **MVP done**: fitur inti lengkap, tervalidasi, dan siap diuji/deploy ke staging secara realistis.
- **Production-ready**: sistem sudah punya quality gate, security, operasional, observability, dan release process yang memadai.

### 6.1 MVP completion checklist snapshot

| Area | Status | Catatan repo saat ini |
|---|---|---|
| Auth dasar (login/register) | **Done** | Route dan form handler tersedia dan aktif. |
| Email verification end-to-end | **Partial** | UI verify/resend sudah ada, tetapi validasi SMTP/provider nyata belum dibuktikan. |
| Password reset end-to-end | **Partial** | Request + confirm page sudah ada, tetapi belum tervalidasi via email provider nyata. |
| OAuth end-to-end | **Partial** | Start/callback route ada, tetapi provider config dan uji environment nyata belum terbukti. |
| Browse course & course detail | **Done** | Catalog dan detail course tersedia. |
| Lesson reader | **Done** | Reader sudah berjalan, meski strategi konten aktual berbeda dari rencana awal MDX-heavy. |
| Mark complete / progress tracking | **Done** | API progress complete tersedia dan terhubung ke flow belajar. |
| Quiz basic | **Done** | Question endpoint, submit endpoint, dan React quiz engine tersedia. |
| Dashboard basic | **Partial** | Progress, XP, recent activity, dan last accessed lesson ada; model enroll formal masih belum eksplisit. |
| Certificate generate/download | **Partial** | Flow dasar ada, tetapi hardening idempotency dan validasi data nyata belum final. |
| Certificate QR + public verify | **Done** | QR code sudah ada di PDF dan verify page publik tersedia. |
| Auto certificate on completion | **Partial** | Sudah di-trigger dari progress/quiz flow, tetapi belum tervalidasi E2E dengan data nyata. |
| Error pages | **Done** | `403`, `404`, `500` tersedia. |
| Minimal automated validation | **Partial** | Build dan Playwright smoke tests lulus, tetapi typecheck belum hijau dan test coverage masih dangkal. |
| Staging runnable baseline | **Missing** | Belum ada staging flow yang tervalidasi dan repeatable. |

### 6.2 Production-ready checklist snapshot

| Area | Status | Catatan repo saat ini |
|---|---|---|
| Build gate | **Done** | `npm --prefix apps/web run build` sudah tervalidasi berhasil. |
| Typecheck gate | **Partial** | Script `typecheck` sudah ada, tetapi saat audit masih gagal karena baseline typing issue. |
| Lint gate | **Missing** | Belum ada script lint terverifikasi di `apps/web/package.json`. |
| Unit tests | **Missing** | Belum ditemukan harness/unit spec. |
| Integration tests | **Missing** | Belum ditemukan harness/integration spec. |
| E2E critical journeys | **Partial** | Baru ada smoke tests dasar; flow login nyata, lesson, quiz, dan certificate belum komprehensif. |
| CI pipeline | **Missing** | Belum ada `.github/workflows/` atau pipeline otomatis lain di repo. |
| Staging deploy automation | **Missing** | Belum ada workflow deploy staging tervalidasi. |
| Production deploy workflow | **Missing** | Belum ada approval/release/rollback workflow tervalidasi. |
| Security hardening baseline | **Partial** | Sudah ada beberapa perbaikan validasi/redirect/error handling, tetapi CSRF, rate limiting, dan security headers belum lengkap. |
| Authorization audit | **Partial** | Middleware/admin guard ada, tetapi edge-case audit belum lengkap. |
| Certificate data integrity | **Partial** | Service sudah ada, tetapi unique constraint/idempotency di level schema belum final. |
| XP/progress source of truth | **Partial** | Masih ada risiko logic ganda antara route dan hook. |
| Structured logging & monitoring | **Missing** | Belum ada observability baseline yang terlihat. |
| Health/readiness checks | **Missing** | Belum ada endpoint/monitoring health yang jelas. |
| Backup/restore procedure | **Missing** | Belum ada strategi dan bukti uji restore. |
| Runbooks/ops docs | **Missing** | Belum ada runbook deploy, incident, atau recovery yang jelas. |
| Docs sync with actual repo | **Partial** | Sudah jauh lebih baik, tetapi status readiness masih perlu terus dijaga sinkron saat implementasi berubah. |

### 6.3 Practical verdict

#### MVP

**Belum selesai**, tetapi sudah mendekati kondisi “core feature-complete”. Blocker utamanya adalah:

1. validasi auth end-to-end,
2. hardening + validasi certificate flow,
3. testing minimum untuk journey utama,
4. staging baseline yang benar-benar runnable.

#### Production-ready

**Masih early stage**. Area yang paling tertinggal bukan lagi fitur utama, melainkan engineering dan operasi:

- CI/CD,
- type safety/lint gates,
- test depth,
- security hardening,
- observability,
- backup/recovery,
- deploy automation.

---

## 7. Production-Ready Implementation Principles

Sebelum memperluas fitur Phase 2/3, gunakan prinsip berikut:

1. **Minimal diff, maximum stability**  
   Prioritaskan hardening dan reliability, bukan redesign besar.

2. **One source of truth**  
   Pastikan docs, runtime config, dan deployment path sinkron.

3. **Security by default**  
   Semua endpoint sensitif wajib tervalidasi, rate-limited, dan terobservasi.

4. **Automate before scale**  
   Tambahkan lint, test, CI, deploy, backup, restore sebelum trafik naik.

5. **Keep self-hostable**  
   Tetap konsisten dengan nilai open source dan self-hosted stack.

6. **Operational readiness > feature breadth**  
   Setelah MVP, yang paling penting adalah kualitas operasional.

---

## 8. Production-Ready Roadmap

Roadmap berikut dibagi per fase agar eksekusi lebih realistis.

| Phase | Focus | Priority | Outcome |
|---|---|---|---|
| 0 | Reconcile docs vs code | P0 | Satu baseline teknis yang konsisten |
| 1 | Close remaining MVP gaps | P0 | MVP benar-benar selesai |
| 2 | Security hardening | P0 | Surface area lebih aman untuk user nyata |
| 3 | Testing foundation | P0 | Ada confidence gate sebelum release |
| 4 | CI/CD & release engineering | P0 | Deploy repeatable ke staging/production |
| 5 | Observability & operations | P1 | Error, logs, health, alerts terlihat |
| 6 | Deployment, backup, DR | P1 | Recovery dan rollback siap |
| 7 | Content ops & governance | P1 | Workflow publish/moderasi lebih aman |
| 8 | Performance & scale readiness | P2 | Siap tumbuh tanpa redesign prematur |

---

## 9. Detailed Workstreams

## Phase 0 — Reconcile Baseline

**Goal:** menyamakan implementasi aktual dengan dokumen teknis.

### Tasks

1. Update seluruh docs agar mencerminkan stack aktual:
   - Astro 5
   - React 19
   - Tailwind 4
2. Tentukan deployment path kanonis:
   - saat audit, terdapat `docker-compose.yml` di root dan `docker/docker-compose.yml`,
   - pilih satu file sebagai source of truth,
   - tandai file lainnya sebagai legacy, limited-scope, atau hapus jika tidak dipakai.
3. Review target file structure agar sesuai implementasi riil.
4. Tambahkan section “known drift” pada docs arsitektur.

### Acceptance Criteria

- Tidak ada kontradiksi besar antara docs dan repo.
- Tim punya satu jalur deploy dan satu baseline arsitektur.

---

## Phase 1 — Close Remaining MVP Gaps

**Goal:** menutup sisa gap agar MVP benar-benar selesai.

### Work items

#### 1. Lengkapi auth flows

- Tambahkan email verification flow end-to-end.
- Tambahkan confirm/reset password flow end-to-end.
- Uji callback OAuth untuk success + failure path.

#### 2. Rapikan certificate flow

- Pastikan certificate dibuat otomatis saat course completion valid.
- Tambahkan QR code ke PDF certificate.
- Tambahkan idempotency supaya certificate tidak tergenerate ganda.

#### 3. Samakan dashboard dengan requirement MVP

- tampilkan last accessed lesson,
- pastikan enrolled/active course logic konsisten,
- audit completion percentage calculation.

#### 4. Validasi lesson/content strategy

Pilih salah satu:

- tetap menggunakan content di PocketBase sebagai Markdown string, atau
- kembali ke workflow MDX seperti rencana awal.

Keputusan ini harus dipertegas sebelum production hardening lebih lanjut.

### Acceptance Criteria

- Semua flow MVP utama dapat dijalankan end-to-end.
- Certificate flow sesuai definisi MVP.
- Auth flow tidak punya blind spot utama.

---

## Phase 2 — Security Hardening

**Goal:** membuat platform cukup aman untuk dipublikasikan.

### Tasks

1. Tambahkan env validation berbasis Zod.
2. Standardisasi API validation dan error contract:
   - response berbentuk `{ error: string; code?: string }`
3. Tambahkan rate limiting untuk:
   - login,
   - register,
   - forgot password,
   - OAuth initiate/callback jika diperlukan,
   - quiz submit,
   - certificate generate,
   - public certificate verification bila rawan enumeration.
4. Tambahkan CSP, HSTS, dan header keamanan tambahan.
5. Tambahkan CSRF/session hardening:
   - `Secure`, `HttpOnly`, `SameSite` policy,
   - session expiry/rotation,
   - logout invalidation behavior.
6. Audit PocketBase access rules terhadap route yang ada.
7. Pastikan frontend/server tidak memakai kredensial PocketBase yang terlalu istimewa.
8. Hilangkan potensi double-XP antara API route dan hook.
9. Tambahkan audit logging untuk action sensitif.
10. Tambahkan secret hygiene dan dependency scanning:
   - secret rotation,
   - log redaction,
   - `npm audit --audit-level=high`,
   - secret scanning di CI.
11. Tegaskan sanitization policy untuk Markdown/HTML rendering dan file upload/storage controls.

### Dependencies

- Phase 0 selesai,
- keputusan ownership logic XP harus jelas.

### Acceptance Criteria

- Semua endpoint sensitif tervalidasi.
- Tidak ada side effect bisnis yang dobel.
- Security baseline memadai untuk staging publik.
- Cookie/session policy, CSRF protection, dan secret hygiene terdokumentasi dan diterapkan.

---

## Phase 3 — Testing Foundation

**Goal:** membuat perubahan bisa diverifikasi sebelum rilis.

### Tasks

1. Tambahkan script:
   - `lint`
   - `typecheck`
   - `test`
2. Tambahkan unit tests untuk utility inti:
   - config/env,
   - certificate completion logic,
   - auth helpers.
3. Tambahkan integration tests untuk API route utama:
   - progress complete,
   - quiz submit,
   - certificate generate.
4. Tambahkan E2E tests untuk core journey:
   - register/login/logout,
   - browse course,
   - lesson complete,
   - quiz pass/fail,
   - certificate verify.

### Acceptance Criteria

- Semua critical flows memiliki coverage otomatis.
- Build pipeline dapat gagal jika regressions muncul.

---

## Phase 4 — CI/CD & Release Engineering

**Goal:** mengubah deploy dari manual menjadi repeatable dan aman.

### Tasks

1. Tambahkan GitHub Actions untuk PR checks.
2. Jalankan lint, typecheck, tests, dan build di CI.
3. Buat staging deployment workflow.
4. Tambahkan smoke test pasca deploy.
5. Tambahkan production promotion workflow dengan approval.
6. Tambahkan migration safety checks pada pipeline.

### Acceptance Criteria

- Merge ke branch utama melewati gate otomatis.
- Staging deploy bisa dilakukan konsisten.
- Production release punya approval dan rollback path.

---

## Phase 5 — Observability & Operations

**Goal:** kegagalan dapat dideteksi dan diinvestigasi dengan cepat.

### Tasks

1. Structured logging dengan request ID.
2. Error monitoring untuk SSR + API routes.
3. Health/readiness checks.
4. Dashboard metrics dasar:
   - 5xx rate,
   - auth failure,
   - quiz failure,
   - certificate generation failure,
   - latency.
5. Incident runbook untuk kasus utama.

### Acceptance Criteria

- Tim bisa mendeteksi error produksi tanpa inspeksi manual server.
- Ada runbook minimal untuk outage umum.

---

## Phase 6 — Deployment, Backup, Disaster Recovery

**Goal:** sistem bisa dipulihkan saat ada masalah.

### Tasks

1. Pisahkan config local/staging/production.
2. Harden reverse proxy dan TLS setup.
3. Tambahkan backup strategy untuk:
   - SQLite PocketBase,
   - uploaded files,
   - migrations.
4. Amankan backup dengan encryption, access control, dan retention policy.
5. Uji restore procedure ke staging.
6. Tambahkan rollback automation atau runbook yang jelas.

### Acceptance Criteria

- Backup berjalan terjadwal.
- Restore pernah diuji, bukan sekadar direncanakan.
- Deploy gagal bisa di-rollback dengan cepat.
- Backup data dan file memiliki kontrol kerahasiaan yang memadai.

---

## Phase 7 — Content Operations & Governance

**Goal:** content publishing aman saat jumlah course bertambah.

### Tasks

1. Formalisasi lifecycle content:
   - draft,
   - review,
   - published,
   - archived.
2. Tambahkan publish validation:
   - metadata lengkap,
   - urutan lesson valid,
   - quiz siap,
   - certificate eligibility konsisten.
3. Tambahkan moderation workflow untuk comments jika diaktifkan nanti.
4. Tambahkan certificate revoke/reissue flow.

### Acceptance Criteria

- Instructor/admin punya workflow publish yang aman.
- Certificate punya governance dasar.

---

## Phase 8 — Performance & Scale Readiness

**Goal:** memperpanjang umur arsitektur saat usage naik.

### Tasks

1. Audit query dan index PocketBase.
2. Kurangi `getFullList` pada hot path yang berisiko mahal.
3. Tambahkan caching untuk halaman publik.
4. Siapkan storage abstraction untuk offload file bila perlu.
5. Definisikan threshold kapan perlu:
   - object storage eksternal,
   - search service,
   - refactor arsitektur lebih besar.

### Acceptance Criteria

- Hot path teridentifikasi dan dioptimasi.
- Ada batas yang jelas kapan harus scale out.

---

## 10. Suggested 90-Day Rollout

### Hari 1–30

- Phase 0 — Reconcile baseline
- Phase 1 — Close MVP gaps
- Phase 2 — Security hardening

### Hari 31–60

- Phase 3 — Testing foundation
- Phase 4 — CI/CD
- Phase 5 — Observability

### Hari 61–90

- Phase 6 — Deployment/backup/DR
- Phase 7 — Content operations
- Phase 8 — Performance readiness

---

## 11. Definition of Done — Production Ready

Platform dapat dianggap production-ready jika seluruh poin berikut terpenuhi:

- [ ] Semua flow MVP selesai dan tervalidasi end-to-end
- [ ] Docs sinkron dengan implementasi aktual
- [ ] Lint, typecheck, build, dan test berjalan di CI
- [ ] Staging deploy otomatis dan stabil
- [ ] Production deploy memiliki approval + rollback path
- [ ] Endpoint sensitif tervalidasi dan rate-limited
- [ ] Security headers production sudah aktif
- [ ] Backup dan restore sudah diuji
- [ ] Error monitoring dan structured logs tersedia
- [ ] Certificate issuance dan verification reliable
- [ ] Tidak ada known blocker P0 yang tersisa

---

## 12. Immediate Next Actions

Urutan kerja yang paling disarankan dari kondisi repo saat ini:

1. **Tutup blocker yang masih menghalangi status MVP done**
   - validasi email verification end-to-end,
   - validasi password reset end-to-end,
   - validasi OAuth provider nyata,
   - validasi auto-certificate dengan data nyata,
   - rapikan dashboard/enrollment model jika memang dibutuhkan untuk definisi MVP.

2. **Jadikan readiness gate minimum benar-benar executable**
   - selesaikan baseline `typecheck`,
   - tambah E2E journey utama,
   - definisikan lint/type/build/test sebagai gate yang konsisten.

3. **Hilangkan risiko logic ganda pada XP**
   - pilih satu sumber kebenaran antara API route dan PocketBase hook.

4. **Siapkan CI dan staging baseline**
   - tambahkan workflow CI,
   - siapkan deploy staging minimal,
   - jalankan smoke test pasca deploy.

5. **Lanjutkan hardening production-ready**
   - CSRF/origin protection,
   - rate limiting,
   - health checks,
   - observability,
   - backup/restore.

---

## Appendix — Audit Notes

### Verified examples from repo

- Auth middleware: `apps/web/src/middleware.ts`
- OAuth start: `apps/web/src/pages/api/auth/oauth/[provider].ts`
- OAuth callback: `apps/web/src/pages/api/auth/oauth/callback.ts`
- Dashboard: `apps/web/src/pages/dashboard/index.astro`
- Lesson reader: `apps/web/src/pages/learn/[lessonId].astro`
- Certificate generate: `apps/web/src/pages/api/certificates/generate.ts`
- Certificate verify: `apps/web/src/pages/verify/[certId].astro`

### Verification notes

- `apps/web/package.json` kini sudah memiliki script `test`/`test:e2e`.
- Build sudah tervalidasi (`npm run build` berhasil).
- Playwright smoke tests sudah tervalidasi (`npm run test:e2e` berhasil).
- Dokumen ini menggantikan implementasi plan MVP lama dengan status audit aktual + roadmap production-ready.
