# PRODUCTION_EPICS.md
## Epic Backlog (Siap jadi GitHub Issues)

---

| Field | Detail |
|---|---|
| **Document ID** | EPIC-PRD-READY-001 |
| **Version** | 1.0.0 |
| **Status** | Active Backlog |
| **Relates To** | `docs/PRODUCTION_PLAN.md`, `docs/IMPLEMENTATION.md` |
| **Last Updated** | 2026-04-22 |

---

## Epic 1 — Infra Canonicalization & CI Foundation

- **Priority:** P0
- **Outcome:** Setup/deploy konsisten, PR gate otomatis aktif.
- **Scope:** compose canonical, PocketBase reproducible bootstrap, CI baseline, branch protection.
- **Child Issues:** PI-01, PI-02, PI-03, PI-05

## Epic 2 — Security Baseline Hardening

- **Priority:** P0
- **Outcome:** Endpoint sensitif terlindungi dan abuse risk turun.
- **Scope:** API guard standar, rate limiting, security checks di CI.
- **Child Issues:** SEC-01, SEC-02, SEC-03

## Epic 3 — Data Reliability & PocketBase Governance

- **Priority:** P0/P1
- **Outcome:** Schema/recovery dapat diandalkan di staging/prod.
- **Scope:** governance migration, access rules audit, backup/restore drill.
- **Child Issues:** DB-01, DB-02, DB-03

## Epic 4 — Test Maturity Upgrade

- **Priority:** P0/P1
- **Outcome:** Critical journeys tervalidasi otomatis sebelum release.
- **Scope:** lint gate, typecheck stability, integration test route kritikal, E2E journey lengkap.
- **Child Issues:** AQ-01, AQ-02, AQ-03, AQ-04

## Epic 5 — Staging CD & Observability Baseline

- **Priority:** P1
- **Outcome:** Deploy staging repeatable dan insiden cepat terdeteksi.
- **Scope:** staging CD + smoke, health/readiness, structured logs, alerting baseline.
- **Child Issues:** PI-04, OBS-01, OBS-02, OBS-03

## Epic 6 — Documentation & Release Process Sync

- **Priority:** P0/P1
- **Outcome:** Semua keputusan go-live berbasis dokumen dan checklist yang akurat.
- **Scope:** sinkronisasi docs inti, readiness snapshot, runbook release/incident.
- **Child Issues:** DOC-01, DOC-02, DOC-03

---

## Template Issue (Copy-Paste)

```md
Title: [P0][PI-01] Kanonisasi Docker Compose source of truth

## Context
Saat ini ada lebih dari satu compose file dengan cakupan berbeda, memicu ambiguity command dan environment drift.

## Scope
- Tetapkan compose resmi
- Update docs command
- Tandai compose non-canonical sebagai legacy/scope terbatas

## Definition of Done
- [ ] Satu compose resmi ditetapkan
- [ ] Dokumentasi command konsisten lintas docs
- [ ] Tim bisa bootstrap stack tanpa ambiguity

## Dependency
- none

## Risk jika ditunda
Deploy ambiguity, setup tidak konsisten antar environment.
```
