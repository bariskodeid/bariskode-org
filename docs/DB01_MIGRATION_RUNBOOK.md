# DB01_MIGRATION_RUNBOOK.md

**Last Updated:** 2026-04-25  
**Scope:** Governance approval/rollback + backup coupling untuk PocketBase migrations

## 1) Tujuan

Menetapkan proses operasional migration yang aman dan repeatable di staging/production.

## 2) Change Approval Flow

1. Buat PR migration baru (append-only).
2. CI wajib hijau, termasuk `PocketBase Migration Check`.
3. Minimal 1 approval owner migration/hooks.
4. PR description wajib menyertakan:
   - tujuan perubahan,
   - strategi rollback,
   - risiko data,
   - rencana verifikasi pasca-migration.

### Enforcement settings (GitHub)

Pada branch `main`, aktifkan branch protection berikut:

- Require pull request reviews,
- Require review from Code Owners,
- Require status check `PocketBase Migration Check`.

Simpan bukti konfigurasi (link/screenshot) sebagai bagian dari readiness evidence.

## 3) Pre-Migration Backup Coupling (Wajib)

Sebelum menjalankan migration pada staging/production:

1. Ambil backup snapshot data PocketBase.
2. Catat metadata berikut:
   - timestamp UTC,
   - commit SHA,
   - operator,
   - lokasi backup,
   - checksum/hash backup.
3. Validasi backup file dapat diakses dan tidak korup.

Jika backup gagal atau metadata tidak lengkap → **stop migration**.

## 4) Migration Execution (Canonical)

```bash
docker compose -f docker-compose.yml exec pocketbase /pb/pocketbase migrate up
```

## 5) Post-Migration Verification

- Health endpoint PocketBase normal.
- Endpoint/flow kritikal aplikasi tetap berfungsi.
- Tidak ada error P0 pada logs.
- Untuk migration schema sensitif, lakukan smoke query/read-write terkontrol.

## 6) Rollback Decision Matrix

Lakukan rollback jika:

- layanan tidak sehat pasca migration,
- verifikasi kritikal gagal,
- ditemukan data corruption risk.

Rollback command (sesuai migration design):

```bash
docker compose -f docker-compose.yml exec pocketbase /pb/pocketbase migrate down 1
```

Jika rollback tidak lossless, gunakan prosedur restore dari backup + incident communication.

## 7) Coupling dengan DB-03

Runbook ini menjadi prasyarat untuk drill backup/restore formal pada DB-03.
