# Tooling & Productivity Guide

This repository is a modern TypeScript/React codebase built around the Next.js **App Router** (`src/app`), reusable UI components (`src/components`), and a set of **server actions / domain operations** (`src/lib/actions/*`) that interact with **Supabase** and supporting services (email, enrichment, audit, analytics, etc.).

This guide centralizes the tooling, scripts, automation, and editor configuration that keep day-to-day contribution fast and consistent.

If you’re setting up the project for the first time, also read: **[development-workflow.md](./development-workflow.md)** (environment variables, running the app, branching/PR habits, etc.). This document focuses on productivity tooling and automation.

---

## Required Tooling

> Versions below are “project expectations”. If the repo’s `package.json` or CI enforces stricter versions, follow those.

### Git

- **Why:** source control, PR workflow, hooks.
- **Install:**
  - Windows: install **Git for Windows**
  - macOS: `xcode-select --install` or `brew install git`
  - Linux: use your distro package manager (`apt`, `dnf`, etc.)
- **Notes:** Prefer a Git client that supports hooks and long paths on Windows.

### Node.js (LTS) + npm

- **Why:** runs build/dev tools, tests, linting, scripts, and Next.js.
- **Recommended:** latest Node **LTS**.
- **Install:** use **nvm**/**fnm** (recommended) so you can switch versions easily:
  - macOS/Linux: install `nvm` or `fnm`
  - Windows: use `fnm` or `nvm-windows`
- **Verify:**
  ```bash
  node -v
  npm -v
  ```

### Install package dependencies

- **Why:** installs Next.js, TypeScript, ESLint, test runner, UI libs, etc.
- **Install:**
  ```bash
  npm ci
  ```
  Use `npm install` only when you intend to update the lockfile.

### Supabase tooling (as needed)

- **Why:** local development against Supabase (schema, auth flows, RPC) and troubleshooting.
- **Install (CLI):**
  ```bash
  npm i -g supabase
  supabase --version
  ```
- **What it powers in this repo:**
  - Auth flows under `src/app/api/auth/*`
  - Database types under `src/types/database.ts`
  - Server-side data access in `src/lib/supabase/*` and `src/lib/actions/*`
- **Note:** You may not need the CLI for day-to-day work, but you will always need valid Supabase environment variables (see `development-workflow.md`).

### IDE (VS Code recommended)

- **Why:** TypeScript type checking, ESLint, formatting, and refactors across `src/app`, `src/components`, `src/lib`, and `src/types`.

---

## Recommended Automation

Automation is most effective when it is:
1) runnable locally, 2) fast, and 3) aligned with CI.

### 1) Linting & formatting

Typical workflow (adapt to scripts available in `package.json`):

- **Lint**
  ```bash
  npm run lint
  ```
  Run before pushing to catch common issues early (unused vars, invalid imports, hook rules, etc.).

- **Typecheck**
  ```bash
  npm run typecheck
  ```
  Especially valuable here because many contracts live in `src/types/*` and are reused across server actions and components.

- **Format (if configured)**
  ```bash
  npm run format
  ```
  If formatting is handled by Prettier/ESLint rules, enable auto-format on save (see “IDE / Editor Setup”).

> If you’re unsure which commands exist, inspect `package.json` scripts and mirror what CI runs.

### 2) Tests

This repo contains unit tests (e.g. `src/components/ui/__tests__`, `src/lib/**/__tests__`) and a Jest setup file (`jest.setup.js`).

Common commands:

- **Run tests once**
  ```bash
  npm test
  ```

- **Watch mode**
  ```bash
  npm test -- --watch
  ```

- **Run a single test file**
  ```bash
  npm test -- src/components/ui/__tests__/Label.test.tsx
  ```

> Keep watch mode running while iterating on UI components and pure library logic (`src/lib/*`).

### 3) Pre-commit hooks (highly recommended)

If your team uses pre-commit hooks, a solid baseline is:

- `eslint` on staged files
- formatting on staged files (Prettier or ESLint `--fix`)
- optional: `typecheck` (can be slower; some teams run it in pre-push instead)

**Suggested setup (example):**
- Use **Husky** + **lint-staged**:
  - `lint-staged` runs quick fixes only on staged files
  - Husky wires it into `pre-commit`

**Example `lint-staged` config:**
```json
{
  "*.{ts,tsx,js,jsx}": ["eslint --fix"],
  "*.{md,json,yml,yaml}": ["prettier --write"]
}
```

If hooks are already configured in the repo, prefer the existing conventions rather than introducing new ones.

### 4) Developer scripts (repository `scripts/`)

This repo includes node scripts for debugging and maintenance:

- `scripts/debug/test-new-user.ts`
- `scripts/debug/fix-user.ts`
- `scripts/debug/debug-auth.ts`
- `scripts/debug/cleanup-corrupted-user.ts`

These are typically used for:
- diagnosing authentication flows (OTP/MFA/callbacks)
- repairing user records / onboarding state
- reproducing edge cases in a controlled manner

**How to run (typical patterns):**

- If the repo uses `tsx`:
  ```bash
  npx tsx scripts/debug/debug-auth.ts
  ```

- Or with `ts-node`:
  ```bash
  npx ts-node scripts/debug/debug-auth.ts
  ```

**Safety guidance:** assume scripts may write to the database and/or call third-party APIs. Use a non-production environment and confirm required environment variables before execution (see `development-workflow.md`).

### 5) Watch modes & fast feedback loops

For day-to-day work:

- **Next.js dev server**
  ```bash
  npm run dev
  ```

- **Run tests in watch mode**
  ```bash
  npm test -- --watch
  ```

- **Optional: separate typecheck watch**
  - If configured:
    ```bash
    npm run typecheck -- --watch
    ```
  - Otherwise rely on the editor’s TypeScript server.

---

## IDE / Editor Setup (optional)

Recommended VS Code setup to catch issues early and reduce context switching:

### Extensions

- **ESLint** (Microsoft)
  - inline lint feedback and `--fix` on save
- **Prettier** (if used in this repo)
  - consistent formatting
- **Tailwind CSS IntelliSense** (if Tailwind is used)
  - autocomplete, class validation, sorting hints
- **Jest** / **Jest Runner** (optional)
  - run tests from the editor
- **EditorConfig** (if `.editorconfig` exists)
  - consistent indentation and line endings

### Suggested workspace settings

Create `.vscode/settings.json` (or align with existing repo settings):

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n"
}
```

### TypeScript ergonomics

- Ensure the workspace uses the project TypeScript version (`node_modules/typescript`).
- Use “Go to Definition” heavily across `src/types/*` and `src/lib/*`—many business rules and contracts live there.

---

## Productivity Tips (optional)

### 1) Keep a “two-terminal” workflow

- Terminal A: `npm run dev`
- Terminal B: `npm test -- --watch` (or run targeted tests)

This avoids the “save → wait → discover later” loop.

### 2) Target the right layer when debugging

This codebase is layered; use that to reduce search time:

- UI behavior issues: start in `src/components/*` and `src/app/*`
- Data mutations / domain logic: check `src/lib/actions/*`
- External data quality: check `src/lib/enrichment/*`
- Validation and formatting: check `src/lib/validation/*`, `src/lib/format/*`
- Permission/nav issues: check `src/types/navigation.ts` and related navigation actions

### 3) Use grep/search intentionally

Good search targets:

- Route handlers: `src/app/api/**/route.ts`
- Server actions: `src/lib/actions/*.ts`
- Shared types: `src/types/*.ts`
- Tests: `__tests__`

Example searches:

```bash
# Find where an action is used
rg "acceptInvite\(" -n

# Find all route handlers
rg "export (async )?function (GET|POST|PUT|DELETE)" src/app -n
```

### 4) Prefer small, safe debug scripts for complex flows

For auth/onboarding edge cases, it’s often faster and safer to:

- add minimal logging around `src/lib/auth/*` or `src/lib/actions/onboarding.ts`
- run a purpose-built script under `scripts/` against a dev environment

This avoids repeatedly clicking through UI flows and makes results reproducible.

---

## Related Resources

- [development-workflow.md](./development-workflow.md)
