# PocketBase Migration Governance

**Last Updated:** 2026-04-25  
**Scope:** `apps/pocketbase/pb_migrations`, `apps/pocketbase/pb_hooks`

## Canonical Runtime

- Canonical stack: root `docker-compose.yml`.
- PocketBase-only compose under `docker/docker-compose.yml` is optional/local-limited path.

## Migration Lifecycle Rules (DB-01)

1. **Append-only migration policy**
   - Existing files in `pb_migrations/` are immutable.
   - New schema/data changes must be added as a new migration file.

2. **Filename convention**
   - Format: `<timestamp>_<description>.js`
   - Example: `1700000030_add_user_last_seen.js`
   - Timestamp prefixes must be unique and non-decreasing.

3. **Rollback expectation**
   - Each migration must include safe rollback in `migrate((app) => { ... }, (app) => { ... })`.
   - If rollback cannot be lossless, document explicit risk in PR.

4. **Seed policy**
   - Deterministic seeds only.
   - Keep idempotent logic where possible.

5. **Approval & ownership policy**
   - Semua perubahan `pb_migrations/` dan `pb_hooks/` wajib melalui PR.
   - Minimal 1 approver owner migration sebelum merge.
   - CODEOWNERS disetel di `.github/CODEOWNERS` untuk area migration/hooks.

6. **Backup coupling policy (pre-migrate)**
   - Untuk environment staging/production, jalankan backup snapshot **sebelum** `migrate up`.
   - Simpan metadata minimal: timestamp, commit SHA, operator, lokasi backup, checksum/hash backup, hasil verifikasi restore terakhir.
   - Jika backup gagal atau metadata tidak lengkap, migration tidak boleh dijalankan.

7. **Rollback decision policy**
   - Jika verifikasi pasca-migration gagal, rollback diputuskan berdasarkan runbook dan status kompatibilitas data.
   - Untuk migration yang tidak lossless rollback, wajib ada catatan risiko pada PR + rencana mitigasi.

## Reproducible Commands

1. Start stack:

```bash
docker compose -f docker-compose.yml up -d
```

2. Run migrations:

```bash
docker compose -f docker-compose.yml exec pocketbase /pb/pocketbase migrate up
```

3. (Optional) seed data from web workspace script:

```bash
node scripts/seed.mjs
```

## CI Governance Check

- CI workflow: `.github/workflows/pocketbase-migration-check.yml`
- Script: `scripts/check-pb-migrations.mjs`
- Validates filename pattern, duplicate timestamp prefix, chronological order, and immutability (non-addition changes blocked).

## DB-01 Operational Checklist (per PR migration)

Gunakan checklist ini di deskripsi PR migration:

- [ ] Migration baru append-only (tidak mengubah file migration lama)
- [ ] Rollback function tersedia dan ditinjau
- [ ] Risiko data loss/non-lossless rollback didokumentasikan
- [ ] Backup snapshot pre-migrate disiapkan (staging/prod)
- [ ] Rencana verifikasi pasca-migrate dicantumkan
