# Agentic Contributor Instructions

This repository is documentation-first and is planned to host a monorepo stack built with Astro 4, React 18, Tailwind, and PocketBase 0.22. The key directories are intended to live under `apps/web`, `apps/pocketbase`, and `docker` once the scaffold exists. Your mission as an agent is to keep documentation, codemaps, and scaffolds aligned with the references found in `docs/` while validating assumptions against real config files once they land.

## 1. Quick Orientation

- **Stack in flight:** Astro + React + Tailwind UI for the frontend, PocketBase for the backend/DB service, Docker Compose for orchestration.
- **Current doc sources:** `docs/IMPLEMENTATION.md`, `docs/TECH_SPEC.md`, `docs/SCHEMA.md`, `docs/PRD.md`. Treat these as the source of truth until code appears.
- **Directory targets:** expect `apps/web/` for Astro, `apps/pocketbase/` for PB binaries/migrations, and `docker/` for Compose artifacts.
- **Environment hints:** `.env.example` is expected to appear in the scaffold; until it exists, note any env variables referenced in docs for later verification.

## 2. Build, Lint & Test Commands

**Hard state gate (read before running commands):**

- Only run commands in this section when the related scaffold files/directories exist (for example: `apps/web/package.json`, `apps/pocketbase/`, `docker/docker-compose.yml`).
- If the repo is still docs-only, **do not execute runtime/infrastructure commands**; document that commands were skipped because scaffolding is not present yet.
- Treat command examples below as expected targets, then reconcile against real scripts/configs once they appear.

| Purpose | Command | Notes |
| --- | --- | --- |
| Start frontend dev server | `npm --prefix apps/web run dev` | Infer from Astro conventions; confirm script after `package.json` appears. |
| Build production frontend | `npm --prefix apps/web run build` | Astro referenced in docs; validate build script name once available. |
| Run linting (Astro/TS) | `npm --prefix apps/web run lint` | Assumes lint script; check actual tooling (ESLint, etc.). |
| Run entire test suite | `npm --prefix apps/web run test` | Placeholder; adapt to testing framework (Vitest, Jest). |
| Run PocketBase migrations | `./apps/pocketbase/pocketbase migrate up` | Docs cite `./pocketbase migrate up`; map binary path under `apps/pocketbase`. |
| Start Docker stack | `docker compose -f docker/docker-compose.yml up -d` | Documented command; always bring down with `docker compose down` after experiments. |

**Single test execution:**

- Use the underlying test command with a pattern argument, for example `npm --prefix apps/web run test -- --testNamePattern "User flow"`. Adjust flags for the chosen runner (Vitest/Jest). Document the exact flag once the tooling is confirmed.

> ⚠️ **Validation reminder:** Every scripted command listed here is inferred from docs and common Astro/PocketBase conventions. Once `package.json` scripts exist in `apps/web` or other packages, verify and update the commands so they match the actual configuration.

## 3. Code Style Guidelines

### Imports & Module Resolution

- Prefer path aliases defined in `tsconfig.json` (e.g., `@/`, `@components/`, `@lib/`, `@types/`).
- Keep imports grouped: third-party modules first, then aliases, then relative imports.
- Avoid deep relative chains (`../../..`) when an alias is available.

### Formatting & Tooling

- Use Prettier/ESLint defaults once configured. Keep max line length around 100 characters for readability.
- Trailing commas in objects/arrays and semicolons are acceptable if consistent with the lint config; adopt what `eslint --fix` produces.
- Prefer `const` unless reassignment is needed; use `let` sparingly.

### Types & Typing Practices

- TypeScript strict mode is assumed; always annotate public exports (props, utility functions) with explicit types.
- Favor `interface` for structured objects and `type` for unions/aliases. Use generics thoughtfully to maintain inference.
- Avoid `any` unless there's a compelling short-lived reason; document why the relaxation exists.

### Naming Conventions

- Components/live routes: PascalCase (e.g., `CourseCard`, `DashboardLayout`).
- Utility functions: camelCase and descriptive verbs (`fetchUserProgress`).
- Files: mirror exported component/function names when feasible (e.g., `CourseCard.tsx`).
- PocketBase collections/migrations: use snake_case names consistent with docs (e.g., `user_progress`).

### Error Handling & Feedback

- Wrap asynchronous operations in `try/catch` blocks and log actionable but sanitized context (for example: `console.error('pb auth refresh failed', { code: err?.code })`). Avoid dumping raw error/request/user/session objects in production logs.
- Surface user-friendly error messages through UI components (status banners, tooltips). Errors should never leak internal stack traces to users.
- For HTTP/API layers, return JSON with `{ error: string; code?: string }` when possible.

### Validation, Sanitization & Security

- Validate external input using schema validation (e.g., Zod) where APIs or PocketBase hooks touch user data.
- Normalize strings (`trim`, `toLowerCase`) before searching or comparing.
- Escape or encode dynamic HTML/data to prevent XSS when rendering lesson content. Prefers MDX sanitizers where the markdown may include HTML.

### Folder & File Conventions

- Keep UI components under `apps/web/src/components/` and shared hooks under `apps/web/src/hooks/`.
- Put lib clients (PocketBase, Supabase, APIs) under `apps/web/src/lib/`.
- Store global assets/styles under `apps/web/src/styles/` or `apps/web/src/assets/`.
- Place PocketBase migrations/seeds under `apps/pocketbase/pb_migrations/` and hooks under `apps/pocketbase/pb_hooks/` as documented.

## 4. Security Defaults

- Never hardcode secrets (API keys, tokens, passwords, private keys) in source, tests, or docs.
- Commit `.env.example` only. Never commit `.env`, `credentials.json`, service-account keys, or similar secret-bearing files.
- Redact secrets/PII in logs and traces. In production, log minimal metadata rather than full payloads or raw objects.
- Enforce authentication **and** authorization checks on all protected routes/actions.
- Add rate limiting/throttling for sensitive endpoints (auth flows, token/session actions, password reset, expensive search/write APIs).
- Once a Node workspace exists, run dependency vulnerability checks with `npm audit --audit-level=high` (or workspace equivalent) and document remediation/accepted risk.

## 5. Cursor/Copilot Rules

- **Current state:** No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` exist.
- **Guidance:** Do not invent rules for Cursor or GitHub Copilot. If these files are added later, grab the official instructions and strictly follow them before generating code or documentation.
- **Future-proofing:** Log a note if a new Cursor/Copilot instructions file appears, and rerun any agentic checks to ensure compliance.

## 6. Documentation & Codemap Expectations

- Always tie architecture notes to actual files or directories referenced in docs. If a codemap mentions `apps/web/src/app/`, confirm the path exists before updating.
- When updating READMEs or codemaps, include the **Last Updated** timestamp and list of entry points to keep freshness obvious.
- Link related sections together, but only to files that actually exist (e.g., README links to current docs entry points such as `docs/IMPLEMENTATION.md` or another verified index).
- If you regenerate docs (via scripts or manually), check for broken hyperlinks and inaccurate command references.

## 7. Pre-Flight Checklist

Before touching code/docs, run through this checklist:

1. Confirm the task scope by referencing the relevant `docs/*.md` files.
2. For runtime/infrastructure tasks, run `ls` or `glob` to ensure referenced directories/files exist (`apps/web`, `apps/pocketbase`, `docker`). For docs-only tasks, note that scaffold checks are not required.
3. Identify and note any TODOs or placeholders in codemaps that may conflict with planned updates.
4. Review existing docs for required terminology (e.g., `Certificate`, `PocketBase`) to maintain consistency.
5. Open `docs/IMPLEMENTATION.md` to verify the planned command (Docker Compose, PocketBase migrations) matches your implementation before writing instructions.

## 8. Change Verification Checklist

After making modifications, verify the following:

1. Run every relevant script from Section 2 **only when required files/scripts exist**; otherwise explicitly record the skip reason (for example: docs-only change, missing scaffold, missing `package.json` script).
2. Validate documentation links by previewing Markdown or using a link checker if available.
3. Ensure code style linting passes (or document why specific rules were bypassed).
4. Confirm updated READMEs or codemaps include accurate entry points, commands, and last-updated dates.
5. Perform a quick `git status` (once repo is initialized) to ensure no unintended files (like `pb_data/`) are staged.

## 9. Notes & Future Validation

- When the actual monorepo is scaffolded, update this file with real command outputs from `package.json` scripts and any added Cursor/Copilot rules.
- Any inferred instruction (e.g., running `astro build` or `docker compose up`) should be cross-checked with the new `package.json` and `docker-compose` files before committing.
- Keep this doc under 200 lines so agents can quickly scan for actionable guidance.
