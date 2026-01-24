# ESLint 9 + Flat Config Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate from ESLint 8 + legacy config to ESLint 9 + flat config, aligning eslint-config-next with Next.js 16.1.4.

**Architecture:** Update the shared ESLint config package (`@repo/eslint-config`) to ESLint 9 flat config format, then update each app/package to use the new configs. Remove all `ESLINT_USE_FLAT_CONFIG=false` hacks. Add a simple `/healthz` endpoint to the admin app.

**Tech Stack:** ESLint 9, eslint-config-next@16.1.4, TypeScript, Next.js 16.1.4

---

## Prerequisites

- Working directory: `/mnt/c/VelikiBukovec_web`
- Node.js 20+, pnpm 9+

---

### Task 1: Update ESLint Dependencies in Tooling Package

**Files:**
- Modify: `tooling/eslint/package.json`

**Step 1: Update package.json with new versions**

Replace the contents of `tooling/eslint/package.json`:

```json
{
  "name": "@repo/eslint-config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./base": "./base.mjs",
    "./nextjs": "./nextjs.mjs",
    "./library": "./library.mjs"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^8.32.0",
    "@typescript-eslint/parser": "^8.32.0",
    "eslint": "^9.28.0",
    "eslint-config-next": "^16.1.4",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-import": "^2.31.0",
    "globals": "^16.2.0",
    "typescript-eslint": "^8.32.0"
  }
}
```

**Step 2: Install updated dependencies**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm install
```

**Step 3: Commit**

```bash
git add tooling/eslint/package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
chore(eslint): upgrade to ESLint 9 and eslint-config-next 16.1.4

- ESLint 8.57 → 9.28
- eslint-config-next 15.5.9 → 16.1.4 (matches Next.js version)
- Add typescript-eslint for flat config support
- Add globals package for environment definitions

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Create Base Flat Config

**Files:**
- Create: `tooling/eslint/base.mjs`
- Delete: `tooling/eslint/base.js`

**Step 1: Create base.mjs**

Create `tooling/eslint/base.mjs`:

```javascript
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettierConfig,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
      ],
    },
  },
  {
    ignores: ['dist/**', '.next/**', 'out/**', 'node_modules/**', '*.config.js', '*.config.ts', '*.config.mjs'],
  },
];
```

**Step 2: Delete old base.js**

```bash
rm /mnt/c/VelikiBukovec_web/tooling/eslint/base.js
```

**Step 3: Commit**

```bash
git add tooling/eslint/base.mjs
git rm tooling/eslint/base.js
git commit -m "$(cat <<'EOF'
refactor(eslint): convert base config to flat config

- Create base.mjs with ESLint 9 flat config format
- Use typescript-eslint for type-checked rules
- Maintain same rules (no-unused-vars, no-explicit-any, import/order)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Create Next.js Flat Config

**Files:**
- Create: `tooling/eslint/nextjs.mjs`
- Delete: `tooling/eslint/nextjs.js`

**Step 1: Create nextjs.mjs**

Create `tooling/eslint/nextjs.mjs`:

```javascript
import { FlatCompat } from '@eslint/eslintrc';
import baseConfig from './base.mjs';

const compat = new FlatCompat();

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];
```

**Step 2: Add @eslint/eslintrc dependency**

```bash
cd /mnt/c/VelikiBukovec_web/tooling/eslint && pnpm add -D @eslint/eslintrc
```

**Step 3: Delete old nextjs.js**

```bash
rm /mnt/c/VelikiBukovec_web/tooling/eslint/nextjs.js
```

**Step 4: Commit**

```bash
git add tooling/eslint/nextjs.mjs tooling/eslint/package.json pnpm-lock.yaml
git rm tooling/eslint/nextjs.js
git commit -m "$(cat <<'EOF'
refactor(eslint): convert Next.js config to flat config

- Create nextjs.mjs extending base config
- Use FlatCompat for next/core-web-vitals compatibility
- Maintain @next/next/no-html-link-for-pages off rule

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Create Library Flat Config

**Files:**
- Create: `tooling/eslint/library.mjs`
- Delete: `tooling/eslint/library.js`

**Step 1: Create library.mjs**

Create `tooling/eslint/library.mjs`:

```javascript
import globals from 'globals';
import baseConfig from './base.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
```

**Step 2: Delete old library.js**

```bash
rm /mnt/c/VelikiBukovec_web/tooling/eslint/library.js
```

**Step 3: Commit**

```bash
git add tooling/eslint/library.mjs
git rm tooling/eslint/library.js
git commit -m "$(cat <<'EOF'
refactor(eslint): convert library config to flat config

- Create library.mjs extending base config
- Add Node.js globals for library packages

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Migrate Admin App ESLint Config

**Files:**
- Create: `apps/admin/eslint.config.mjs`
- Delete: `apps/admin/.eslintrc.js`
- Modify: `apps/admin/package.json`

**Step 1: Create eslint.config.mjs**

Create `apps/admin/eslint.config.mjs`:

```javascript
import nextjsConfig from '@repo/eslint-config/nextjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextjsConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: ['e2e/**', 'playwright.config.ts'],
  },
];
```

**Step 2: Delete old .eslintrc.js**

```bash
rm /mnt/c/VelikiBukovec_web/apps/admin/.eslintrc.js
```

**Step 3: Update package.json lint script**

In `apps/admin/package.json`, change:
```json
"lint": "ESLINT_USE_FLAT_CONFIG=false eslint ."
```
to:
```json
"lint": "eslint ."
```

**Step 4: Verify lint works**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin && pnpm lint
```

**Step 5: Commit**

```bash
git add apps/admin/eslint.config.mjs apps/admin/package.json
git rm apps/admin/.eslintrc.js
git commit -m "$(cat <<'EOF'
refactor(admin): migrate to ESLint 9 flat config

- Replace .eslintrc.js with eslint.config.mjs
- Remove ESLINT_USE_FLAT_CONFIG=false hack
- Maintain e2e and playwright.config.ts ignores

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Migrate Web App ESLint Config

**Files:**
- Create: `apps/web/eslint.config.mjs`
- Delete: `apps/web/.eslintrc.js`
- Modify: `apps/web/package.json`

**Step 1: Create eslint.config.mjs**

Create `apps/web/eslint.config.mjs`:

```javascript
import nextjsConfig from '@repo/eslint-config/nextjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextjsConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
```

**Step 2: Delete old .eslintrc.js**

```bash
rm /mnt/c/VelikiBukovec_web/apps/web/.eslintrc.js
```

**Step 3: Update package.json lint script**

In `apps/web/package.json`, change:
```json
"lint": "ESLINT_USE_FLAT_CONFIG=false eslint ."
```
to:
```json
"lint": "eslint ."
```

**Step 4: Verify lint works**

```bash
cd /mnt/c/VelikiBukovec_web/apps/web && pnpm lint
```

**Step 5: Commit**

```bash
git add apps/web/eslint.config.mjs apps/web/package.json
git rm apps/web/.eslintrc.js
git commit -m "$(cat <<'EOF'
refactor(web): migrate to ESLint 9 flat config

- Replace .eslintrc.js with eslint.config.mjs
- Remove ESLINT_USE_FLAT_CONFIG=false hack

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Migrate Shared Package ESLint Config

**Files:**
- Create: `packages/shared/eslint.config.mjs`
- Delete: `packages/shared/.eslintrc.js`
- Modify: `packages/shared/package.json`

**Step 1: Create eslint.config.mjs**

Create `packages/shared/eslint.config.mjs`:

```javascript
import libraryConfig from '@repo/eslint-config/library';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...libraryConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
```

**Step 2: Delete old .eslintrc.js**

```bash
rm /mnt/c/VelikiBukovec_web/packages/shared/.eslintrc.js
```

**Step 3: Update package.json lint script**

In `packages/shared/package.json`, change:
```json
"lint": "ESLINT_USE_FLAT_CONFIG=false eslint src/"
```
to:
```json
"lint": "eslint src/"
```

**Step 4: Verify lint works**

```bash
cd /mnt/c/VelikiBukovec_web/packages/shared && pnpm lint
```

**Step 5: Commit**

```bash
git add packages/shared/eslint.config.mjs packages/shared/package.json
git rm packages/shared/.eslintrc.js
git commit -m "$(cat <<'EOF'
refactor(shared): migrate to ESLint 9 flat config

- Replace .eslintrc.js with eslint.config.mjs
- Remove ESLINT_USE_FLAT_CONFIG=false hack

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Migrate UI Package ESLint Config

**Files:**
- Create: `packages/ui/eslint.config.mjs`
- Delete: `packages/ui/.eslintrc.js`
- Modify: `packages/ui/package.json`

**Step 1: Create eslint.config.mjs**

Create `packages/ui/eslint.config.mjs`:

```javascript
import libraryConfig from '@repo/eslint-config/library';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...libraryConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
```

**Step 2: Delete old .eslintrc.js**

```bash
rm /mnt/c/VelikiBukovec_web/packages/ui/.eslintrc.js
```

**Step 3: Update package.json lint script**

In `packages/ui/package.json`, change:
```json
"lint": "ESLINT_USE_FLAT_CONFIG=false eslint src/"
```
to:
```json
"lint": "eslint src/"
```

**Step 4: Verify lint works**

```bash
cd /mnt/c/VelikiBukovec_web/packages/ui && pnpm lint
```

**Step 5: Commit**

```bash
git add packages/ui/eslint.config.mjs packages/ui/package.json
git rm packages/ui/.eslintrc.js
git commit -m "$(cat <<'EOF'
refactor(ui): migrate to ESLint 9 flat config

- Replace .eslintrc.js with eslint.config.mjs
- Remove ESLINT_USE_FLAT_CONFIG=false hack
- Maintain React version detection setting

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Migrate Database Package ESLint Config

**Files:**
- Create: `packages/database/eslint.config.mjs`
- Delete: `packages/database/.eslintrc.js`
- Modify: `packages/database/package.json`

**Step 1: Create eslint.config.mjs**

Create `packages/database/eslint.config.mjs`:

```javascript
import libraryConfig from '@repo/eslint-config/library';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...libraryConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
```

**Step 2: Delete old .eslintrc.js**

```bash
rm /mnt/c/VelikiBukovec_web/packages/database/.eslintrc.js
```

**Step 3: Add lint script if missing**

Check if `packages/database/package.json` has a lint script. If not, add:
```json
"lint": "eslint src/"
```

**Step 4: Verify lint works**

```bash
cd /mnt/c/VelikiBukovec_web/packages/database && pnpm lint
```

**Step 5: Commit**

```bash
git add packages/database/eslint.config.mjs packages/database/package.json
git rm packages/database/.eslintrc.js
git commit -m "$(cat <<'EOF'
refactor(database): migrate to ESLint 9 flat config

- Replace .eslintrc.js with eslint.config.mjs

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Run Full Lint Check and Fix Issues

**Files:**
- Potentially any file with lint errors

**Step 1: Run monorepo lint**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint
```

**Step 2: Fix any lint errors**

If errors appear, fix them. Common issues might include:
- Import order violations (auto-fixable with `pnpm lint --fix`)
- Type issues exposed by stricter config

**Step 3: Run lint with fix**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint -- --fix
```

**Step 4: Commit fixes if any**

```bash
git add -A
git commit -m "$(cat <<'EOF'
fix: resolve lint errors after ESLint 9 migration

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Add Simple /healthz Endpoint

**Files:**
- Create: `apps/admin/app/api/healthz/route.ts`

**Step 1: Create health check endpoint**

Create `apps/admin/app/api/healthz/route.ts`:

```typescript
import { NextResponse } from 'next/server';

import packageJson from '../../../package.json';

const commitSha = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.CF_PAGES_COMMIT_SHA ?? 'local';

export function GET() {
  return NextResponse.json({
    ok: true,
    version: packageJson.version,
    commitSha: commitSha.slice(0, 7),
    timestamp: new Date().toISOString(),
  });
}
```

**Step 2: Update tsconfig to allow JSON imports**

In `apps/admin/tsconfig.json`, ensure `resolveJsonModule` is true (it should already be from the base config).

**Step 3: Verify endpoint works**

```bash
cd /mnt/c/VelikiBukovec_web/apps/admin && pnpm dev &
sleep 5
curl http://localhost:3001/api/healthz
# Expected: {"ok":true,"version":"0.0.0","commitSha":"local","timestamp":"..."}
```

**Step 4: Commit**

```bash
git add apps/admin/app/api/healthz/route.ts
git commit -m "$(cat <<'EOF'
feat(admin): add /healthz endpoint

Simple health check returning:
- ok: true
- version: from package.json
- commitSha: from env (Vercel/CF Pages) or 'local'
- timestamp: ISO format

No external dependency checks - just proves the app is running.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Verify All Gates Pass

**Files:**
- Modify: `CHANGELOG.md`

**Step 1: Run all gates**

```bash
cd /mnt/c/VelikiBukovec_web && pnpm lint && pnpm type-check && pnpm test && pnpm build
```

All should pass.

**Step 2: Update CHANGELOG.md**

Add under Unreleased:
```markdown
- Migrated to ESLint 9 with flat config (eslint.config.mjs)
- Aligned eslint-config-next@16.1.4 with Next.js 16.1.4
- Added /healthz endpoint to admin app
```

**Step 3: Commit**

```bash
git add CHANGELOG.md
git commit -m "$(cat <<'EOF'
docs: update changelog for ESLint 9 migration

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Verification Checklist

| Check | Command | Expected |
|-------|---------|----------|
| No ESLINT_USE_FLAT_CONFIG | `grep -r "ESLINT_USE_FLAT_CONFIG" .` | No matches (except node_modules) |
| No .eslintrc files | `find . -name ".eslintrc*" -not -path "./node_modules/*"` | No matches |
| All eslint.config.mjs exist | `find . -name "eslint.config.mjs" -not -path "./node_modules/*"` | 5 files |
| Lint passes | `pnpm lint` | No errors |
| Type check passes | `pnpm type-check` | No errors |
| Tests pass | `pnpm test` | All pass |
| Build passes | `pnpm build` | Success |
| Health endpoint | `curl localhost:3001/api/healthz` | JSON with ok:true |

---

## Gate Command

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm build
```
