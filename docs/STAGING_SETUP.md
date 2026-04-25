# STAGING_SETUP.md

**Last Updated:** 2026-04-25  
**Scope:** Wiring PI-04 (Staging CD + Smoke) via GitHub Actions

## 1) Prasyarat

- Workflow tersedia: `.github/workflows/staging-cd.yml`
- Smoke spec tersedia: `apps/web/tests/e2e/smoke-staging.spec.ts`
- Branch target: `main`

## 2) GitHub Environment yang wajib

Buat environment bernama **`staging`** pada repository settings, lalu isi:

### Variables

- `STAGING_BASE_URL` (contoh: `https://staging.bariskode.org`)
- `STAGING_ENFORCE_SEC02` (opsional, set `1` untuk enforce aktivasi SEC-02)
- `STAGING_RATE_LIMIT_BACKEND` (set `upstash` saat SEC-02 enforced)
- `STAGING_TRUST_PROXY_HEADERS` (set `true` jika proxy overwrite forwarded headers)
- `STAGING_EDGE_BODY_LIMIT_ENABLED` (set `1` jika body limit edge sudah aktif)

### Secrets

- `STAGING_DEPLOY_WEBHOOK_URL` (webhook deploy target staging)
- `STAGING_UPSTASH_REDIS_REST_URL` (wajib saat SEC-02 enforced)
- `STAGING_UPSTASH_REDIS_REST_TOKEN` (wajib saat SEC-02 enforced)

Lihat detail langkah aktivasi security hardening: `docs/SEC02_STAGING_ACTIVATION.md`.

> Catatan: jika `STAGING_DEPLOY_WEBHOOK_URL` belum ada, step deploy akan di-skip, tetapi smoke check tetap berjalan terhadap `STAGING_BASE_URL`.

## 3) Trigger workflow

Opsi A — otomatis setelah push ke `main`  
Opsi B — manual `workflow_dispatch` dari tab Actions

## 4) Kriteria sukses PI-04 baseline

1. Job `deploy-staging` hijau.
2. Deploy webhook dipanggil sukses (atau di-skip secara eksplisit bila belum tersedia).
3. Smoke checks `@smoke-staging` lulus:
   - homepage reachable
   - guest redirect dari `/dashboard` ke `/login`
   - route `/forgot-password` sehat

## 5) Troubleshooting cepat

- `Missing STAGING_BASE_URL` → isi variable environment `staging`.
- `curl failed` pada trigger deploy → cek endpoint webhook, auth, dan allowlist IP runner.
- Smoke gagal timeout → verifikasi DNS/TLS staging dan kesiapan aplikasi setelah deploy.
