# SEC02_STAGING_ACTIVATION.md

**Last Updated:** 2026-04-25  
**Scope:** Aktivasi lanjutan SEC-02 di environment staging

## Tujuan

Mengaktifkan hardening SEC-02 pada staging secara nyata:

1. distributed limiter backend (`upstash`) aktif,
2. trust proxy policy dikontrol eksplisit,
3. body-size hard limit ditegakkan di edge/ingress,
4. validasi otomatis lewat workflow staging.

## 1) Environment values yang dibutuhkan (GitHub Environment: `staging`)

### Variables

- `STAGING_BASE_URL` = URL staging (mis. `https://staging.bariskode.org`)
- `STAGING_ENFORCE_SEC02` = `1` untuk enforce hard fail preflight
- `STAGING_RATE_LIMIT_BACKEND` = `upstash`
- `STAGING_TRUST_PROXY_HEADERS` = `true` (hanya jika proxy terpercaya overwrite forwarded headers)
- `STAGING_EDGE_BODY_LIMIT_ENABLED` = `1`

### Secrets

- `STAGING_DEPLOY_WEBHOOK_URL`
- `STAGING_UPSTASH_REDIS_REST_URL`
- `STAGING_UPSTASH_REDIS_REST_TOKEN`

## 2) Runtime target yang harus dipasang di server staging

Pastikan deployment target mengekspor env berikut:

- `RATE_LIMIT_BACKEND=upstash`
- `UPSTASH_REDIS_REST_URL=<from secret>`
- `UPSTASH_REDIS_REST_TOKEN=<from secret>`
- `TRUST_PROXY_HEADERS=true` (hanya bila reverse proxy overwrite header client IP)
- optional tuning:
  - `RATE_LIMIT_BACKEND_TIMEOUT_MS=1500`
  - `RATE_LIMIT_BACKEND_MAX_RETRIES=1`

## 3) Edge / ingress policy minimum

Tetapkan request body max size di ingress/CDN (contoh endpoint mutasi):

- `/api/quiz/*/submit`
- `/api/progress/complete`
- `/api/certificates/generate`
- `/api/auth/logout`

> App-layer sudah memiliki guard payload size, namun edge limit adalah proteksi primer anti DoS.

## 4) Verifikasi

1. Jalankan workflow `Staging CD`.
2. Pastikan preflight tidak gagal pada blok SEC-02.
3. Pastikan smoke test `@smoke-staging` lulus.

> Untuk run berbasis `push` ke `main`, workflow sekarang fail-closed bila:
> - `STAGING_ENFORCE_SEC02 != 1`,
> - deploy webhook staging tidak tersedia,
> - konfigurasi `upstash`/edge limit tidak lengkap.

## 5) Exit criteria SEC-02 (staging)

- `STAGING_ENFORCE_SEC02=1` aktif.
- Backend limiter staging benar-benar `upstash`.
- Secret Upstash terpasang.
- Edge body limit aktif dan terdokumentasi.
- Workflow staging hijau minimal 1 run setelah aktivasi.
