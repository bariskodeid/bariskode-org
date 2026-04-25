# PRODUCTION_PLAN.md
## Implementation Plan Menuju Production-Ready (90 Hari)

---

| Field | Detail |
|---|---|
| **Document ID** | PLAN-PRD-READY-001 |
| **Version** | 1.2.0 |
| **Status** | Active Plan |
| **Owner** | Engineering |
| **Relates To** | `docs/IMPLEMENTATION.md`, `docs/TECH_SPEC.md`, `docs/SCHEMA.md`, `docs/PRD.md` |
| **Last Updated** | 2026-04-25 |

---

## 0) Execution Snapshot (Update)

Status update untuk eksekusi fase awal:

- ✅ **AQ-01 (P0)** selesai — lint gate aktif (`apps/web/package.json`, `apps/web/eslint.config.mjs`)
- ✅ **PI-03 (P0) baseline** selesai sebagian inti — CI workflow baseline tersedia (`.github/workflows/ci.yml`)
- ✅ **AQ-04 (P0) authenticated critical journey** tervalidasi di environment docker lokal (auth → learn → quiz → certificate)
- ✅ **SEC-01 (P0) baseline** selesai — same-origin guard diterapkan pada endpoint mutasi learner (`progress/complete`, `quiz/*/submit`, `certificates/generate`, `auth/logout`) lewat `apps/web/src/lib/requestSecurity.ts`
- ✅ **SEC-02 (P0) baseline parsial** dimulai — rate limiting in-memory + payload size guard ditambahkan pada endpoint sensitif learner, dengan catatan hardening infra/distributed limiter masih lanjutan
- ✅ **SEC-02 (P0) follow-up parsial** — adapter backend limiter ditambahkan (`memory` + opsi `upstash`), trust proxy gate dikontrol env, dan kontrak body-limit edge didokumentasikan
- ✅ **DB-01 (P0) baseline parsial** — governance migration lifecycle ditetapkan via `apps/pocketbase/README.md` + CI gate `.github/workflows/pocketbase-migration-check.yml`
- ✅ **DB-01 (P0) operational follow-up parsial** — approval ownership (`.github/CODEOWNERS`) + runbook backup/rollback coupling (`docs/DB01_MIGRATION_RUNBOOK.md`) ditambahkan
- ✅ **PI-04 (P1) baseline parsial** — workflow staging CD + smoke disiapkan (`.github/workflows/staging-cd.yml`, `apps/web/tests/e2e/smoke-staging.spec.ts`) dan checklist wiring didokumentasikan di `docs/STAGING_SETUP.md`; menunggu secret/env staging + run bukti Actions
- ✅ Verifikasi lokal lolos: `lint`, `typecheck`, `test:unit`, `build`
- ✅ Verifikasi E2E AQ-04 lolos (`npm --prefix apps/web run test:e2e -- tests/e2e/critical-journeys.spec.ts`) dengan env test yang sesuai
- ⏳ Sisa PI-03: perlu validasi run di GitHub Actions setelah PR/push berikutnya
- ⏳ Pekerjaan berikutnya: SEC-02 lanjutan (aktivasi backend distributed limiter + enforcement body-limit di ingress/CDN, checklist `docs/SEC02_STAGING_ACTIVATION.md`), DB-01 lanjutan (validasi operasional runbook via run migration nyata + evidence backup metadata), PI-04 lanjutan (wiring deploy target nyata + smoke auth data)

---

## 1) Tujuan

Membawa repository dari **MVP functional** ke **production-ready** dengan fokus pada:

1. reliability operasional,
2. quality gates otomatis,
3. hardening security,
4. reproducibility backend,
5. sinkronisasi dokumentasi.

> Prinsip: **minimal diff, no over-engineering**.

---

## 2) Timeline 30-60-90 Hari

## Hari 0–30 — Foundation Stabilization

- Kanonisasi Docker Compose (single source of truth).
- Tetapkan strategi PocketBase reproducible (version pin + bootstrap).
- Aktifkan CI PR baseline (`typecheck`, `test:unit`, `build`).
- Tambahkan lint gate (script + config).
- Terapkan security guard dasar endpoint sensitif.
- Sinkronkan docs yang drift.

**Outcome terukur:**
- Satu jalur setup/deploy lokal/staging yang konsisten.
- PR checks minimal wajib hijau sebelum merge.
- Dokumen inti tidak bertentangan dengan repo aktual.

## Hari 31–60 — Quality & Reliability

- Perluas E2E dari smoke ke critical journeys.
- Tambah CD staging + smoke test pasca deploy.
- Audit access rules PocketBase collection sensitif.
- Jalankan backup/restore drill pertama.
- Aktifkan observability baseline (health, structured logs, alert minimum).

**Outcome terukur:**
- E2E critical flow stabil (target flakiness <5%).
- Staging deploy repeatable.
- Restore tervalidasi.

## Hari 61–90 — Go-Live Readiness

- Production release workflow (manual approval + rollback).
- Security scans di CI (dependency + secret scan).
- SLO awal + runbook incident/deploy/recovery.
- 2 release candidate beruntun lolos semua gate tanpa blocker P0.

---

## 3) Workstreams

Legenda: **Priority** = P0/P1/P2, **Effort** = S/M/L

### A. Platform / Infra

| ID | Item | Priority | Effort | Dependency | Definition of Done | Risk jika ditunda |
|---|---|---:|---:|---|---|---|
| PI-01 | Kanonisasi compose | P0 | S | - | Satu compose resmi + docs command konsisten | Drift environment/deploy ambiguity |
| PI-02 | PocketBase reproducible bootstrap | P0 | M | PI-01 | Fresh setup deterministik | Setup antar mesin tidak konsisten |
| PI-03 | CI PR baseline | P0 | M | PI-01 | PR checks mandatory | Regression masuk `main` |
| PI-04 | CD staging + smoke | P1 | M | PI-03 | Deploy staging repeatable | Isu integrasi telat terdeteksi |
| PI-05 | Branch protection + release tagging | P1 | S | PI-03 | Required checks + release process aktif | Human error saat merge/deploy |

### B. App Quality

| ID | Item | Priority | Effort | Dependency | Definition of Done | Risk jika ditunda |
|---|---|---:|---:|---|---|---|
| AQ-01 | Tambah lint gate | P0 | S | - | `lint` ada dan dijalankan di CI | Debt code style naik |
| AQ-02 | Stabilkan typecheck | P0 | M | AQ-01 | `typecheck` konsisten hijau | Type regression lolos |
| AQ-03 | Tambah integration tests API kritikal | P1 | M | AQ-02 | Coverage route sensitif meningkat | Perubahan rawan bug |
| AQ-04 | E2E critical journeys | P0 | M | PI-03 | Auth→Learn→Quiz→Certificate tervalidasi | Bug user-facing lolos |

### C. Security

| ID | Item | Priority | Effort | Dependency | Definition of Done | Risk jika ditunda |
|---|---|---:|---:|---|---|---|
| SEC-01 | API security guard standar | P0 | M | AQ-02 | Endpoint sensitif terlindungi konsisten | Abuse request/invalid input |
| SEC-02 | Rate limiting endpoint sensitif | P0 | M | SEC-01 | Throttling aktif + abuse test | Brute force/spam/DoS |
| SEC-03 | Security checks di CI | P1 | S | PI-03 | Dependency+secret scan aktif | Vulnerability lolos release |

### D. Data / Backend (PocketBase)

| ID | Item | Priority | Effort | Dependency | Definition of Done | Risk jika ditunda |
|---|---|---:|---:|---|---|---|
| DB-01 | Governance migration lifecycle | P0 | M | PI-02 | Migrate/seed reproducible | Schema drift |
| DB-02 | Audit access rules collection sensitif | P0 | M | DB-01 | Rule audit + unauthorized test pass | Data exposure |
| DB-03 | Backup/restore drill | P0 | M | PI-04 | Drill restore berhasil | Data loss saat incident |

### E. Observability

| ID | Item | Priority | Effort | Dependency | Definition of Done | Risk jika ditunda |
|---|---|---:|---:|---|---|---|
| OBS-01 | Health/readiness checks | P0 | S | PI-01 | Endpoint health aktif | False-success deploy |
| OBS-02 | Structured logging + request ID | P1 | M | AQ-02 | Log bisa ditrace end-to-end | Investigasi lambat |
| OBS-03 | Uptime/error alerting minimum | P1 | M | OBS-01 | Alert aktif ke channel tim | Downtime terlambat diketahui |

### F. Documentation & Process

| ID | Item | Priority | Effort | Dependency | Definition of Done | Risk jika ditunda |
|---|---|---:|---:|---|---|---|
| DOC-01 | Sinkronisasi docs inti | P0 | M | PI-01, DB-01 | Dokumen akurat terhadap repo | Onboarding salah arah |
| DOC-02 | Readiness snapshot berkala | P0 | S | DOC-01 | Status Done/Partial/Missing mutakhir | Keputusan tanpa data aktual |
| DOC-03 | Runbook deploy/rollback/incident/restore | P1 | M | PI-04, DB-03 | Simulasi incident minimal 1x | Response incident kacau |

---

## 4) Quality Gates Wajib Sebelum Go-Live

1. `lint`, `typecheck`, `build` lulus di CI.
2. Unit + integration tests lulus.
3. E2E critical journeys lulus stabil.
4. Security baseline aktif (validation, CSRF/origin policy, rate limiting).
5. Dependency & secret scan tanpa temuan high/critical yang belum ditangani.
6. Migration/seed reproducible + backup/restore drill berhasil.
7. Health/readiness + alerting minimum aktif.
8. Runbook deploy/rollback/incident tersedia dan diuji.

---

## 5) Exit Criteria Production-Ready

- [ ] Jalur runtime/deploy sudah kanonis dan terdokumentasi.
- [ ] CI/CD staging aktif dengan gating yang konsisten.
- [ ] Quality gates mandatory aktif di protected branch.
- [ ] Security baseline + scans aktif.
- [ ] Data recovery tervalidasi (RPO/RTO ditentukan dan diuji).
- [ ] Observability baseline aktif.
- [ ] Dokumen inti sinkron dengan implementasi aktual.
- [ ] 2 release candidate beruntun lolos tanpa blocker P0.
